# NGO_Connect

A full-stack web application that facilitates item and monetary donations to NGOs across India. Built with Flask, PostgreSQL, Redis, and Celery — with Razorpay for payments and Google Maps / Mapbox for location-based NGO discovery.

---

## Table of Contents

- [Features](#features)
- [System Architecture](#system-architecture)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Data Layer](#data-layer)
- [Redis — Caching Strategy](#redis--caching-strategy)
- [Celery — Background Jobs](#celery--background-jobs)
- [Payments — Razorpay](#payments--razorpay)
- [NGO Data — NGO Darpan](#ngo-data--ngo-darpan)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Overview](#api-overview)
- [Running Tests](#running-tests)

---

## Features

- **NGO discovery** — browse all registered NGOs in India, see the total count, and search for a specific NGO by name
- **Nearby NGOs** — grant location permission in the browser and see NGOs sorted by proximity via Maps API
- **Donor accounts** — register, log in, view donation history, and save favourite NGOs to a personal list
- **Item donations** — select items from a categorised checklist and optionally upload a photo of what you're donating
- **Money transfers** — pay via Razorpay (live or test mode); receipt is emailed automatically after payment
- **Redis query caching** — two users querying the same NGO name get the second result instantly from cache
- **JWT authentication** — cookie-based JWT with Redis-backed revocation (logout invalidates the token immediately)

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Client (HTML + JS)                  │
│  NGO listing │ Auth │ Donate items │ Money transfer  │
└──────────────────────┬──────────────────────────────┘
                       │ HTTPS / REST
┌──────────────────────▼──────────────────────────────┐
│         Flask API  (Gunicorn · Blueprint factory)    │
│  auth_bp │ ngo_bp │ donation_bp │ payments_bp        │
└──────────────────────┬──────────────────────────────┘
          ┌────────────┼────────────┐
          ▼            ▼            ▼
     PostgreSQL      Redis      Docker volume
   (permanent data) (cache +    (photo uploads)
                    blocklist)
                       │
┌──────────────────────▼──────────────────────────────┐
│        Celery workers  (Redis as broker)             │
│  send_receipt_email │ refresh_ngo_data (Beat)        │
└──────────────────────┬──────────────────────────────┘
          ┌────────────┼────────────┐
          ▼            ▼            ▼
       Razorpay    Maps API    NGO Darpan dump
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python 3.11, Flask, Flask-SQLAlchemy, Flask-Migrate |
| Auth | JWT (cookie-based), Redis revocation blocklist |
| Database | PostgreSQL |
| Cache / Broker | Redis |
| Async jobs | Celery + Celery Beat |
| Payments | Razorpay (live + test mode) |
| Geolocation | Google Maps API or Mapbox |
| File storage | Docker named volume (`uploads_vol`) |
| Frontend | Plain HTML + vanilla JS |
| Container | Docker + Docker Compose |
| WSGI server | Gunicorn (sync workers) |
| NGO data | NGO Darpan static CSV/JSON dump |

---

## Project Structure

```
.
├── app/
│   ├── __init__.py          # App factory
│   ├── extensions.py        # db, redis, celery instances
│   ├── blueprints/
│   │   ├── auth/            # Register, login, logout — JWT cookies
│   │   ├── ngo/             # Search, count, nearby NGOs
│   │   ├── donation/        # Checklist, photo upload, history
│   │   └── payments/        # Razorpay order, webhook, test mode
│   ├── models/
│   │   ├── donor.py
│   │   ├── ngo.py
│   │   ├── donation.py
│   │   └── money_transfer.py
│   ├── tasks/
│   │   ├── email_tasks.py   # send_receipt_email
│   │   └── ngo_tasks.py     # refresh_ngo_data (Beat)
│   └── utils/
│       ├── cache.py         # Redis cache helpers
│       └── geo.py           # Haversine distance sort
├── seed_ngos.py             # One-time NGO Darpan import
├── docker-compose.yml
├── Dockerfile
├── .env.example
└── requirements.txt
```

---

## Data Layer

### PostgreSQL schema (key tables)

```
donors          — id, name, email, password_hash, created_at
ngos            — id, name, state, city, cause, lat, lng, darpan_id
donations       — id, donor_id, ngo_id, items (JSONB), photo_path, created_at
money_transfers — id, donor_id, ngo_id, amount, razorpay_order_id, status
saved_ngos      — donor_id, ngo_id  (M2M join table)
```

### NGO Darpan data

NGO data is sourced from a static dump exported from [ngodarpan.gov.in](https://ngodarpan.gov.in). To seed the database:

```bash
python seed_ngos.py --file data/ngodarpan_dump.csv
```

This is also run automatically as a Celery Beat task (`refresh_ngo_data`) on a configurable schedule (default: weekly) to keep the data fresh from updated dumps.

---

## Redis — Caching Strategy

Redis serves two distinct purposes:

### 1. NGO query cache

When a donor searches for an NGO by name, the result is cached under a namespaced key. A second user querying the same name hits Redis directly — no Postgres round-trip.

```
Key format : ngo:name:<slugified-name>
TTL        : 3600 seconds (1 hour)
Invalidated: when refresh_ngo_data task re-imports data
```

Cache flow:

```
GET /ngo/search?name=XYZ
        │
        ▼
  Redis lookup: ngo:name:xyz
        │
   HIT ─┴─ MISS
   │           │
   ▼           ▼
Return     Query Postgres
cached     → write result to Redis
result     → return result
```

### 2. JWT revocation blocklist

On logout, the token's JTI (JWT ID) is written to Redis with a TTL equal to the token's remaining lifetime. Every authenticated request checks this blocklist before proceeding.

```
Key format : blocklist:<jti>
TTL        : remaining token lifetime (seconds)
```

---

## Celery — Background Jobs

Two registered tasks, both using Redis as the broker and result backend:

### `send_receipt_email` (triggered)

Fires after a successful Razorpay webhook callback. Sends the donor a payment confirmation email with donation details.

```python
send_receipt_email.delay(donor_id=..., transfer_id=...)
```

### `refresh_ngo_data` (scheduled — Celery Beat)

Runs on a cron schedule. Re-imports an updated NGO Darpan dump into Postgres and invalidates all `ngo:name:*` keys in Redis.

Configure the schedule in `app/extensions.py`:

```python
beat_schedule = {
    "refresh-ngo-data": {
        "task": "app.tasks.ngo_tasks.refresh_ngo_data",
        "schedule": crontab(hour=2, minute=0, day_of_week=1),  # every Monday 2am
    }
}
```

---

## Payments — Razorpay

The payment flow is entirely server-side order creation with a client-side checkout modal:

1. Frontend calls `POST /payments/create-order` with `{ngo_id, amount}`
2. Backend creates a Razorpay order and returns `{order_id, key_id}`
3. Frontend loads `Razorpay.js` and opens the payment modal
4. On success, Razorpay calls `POST /payments/webhook`
5. Webhook verifies the signature, records the transfer, and enqueues `send_receipt_email`

### Test mode

Set the environment variable:

```
RAZORPAY_TEST_MODE=true
```

This swaps in your test API keys (`RAZORPAY_TEST_KEY_ID` / `RAZORPAY_TEST_KEY_SECRET`) with no code changes. A visible "Test Mode" banner is shown in the payment UI when active.

---

## NGO Data — NGO Darpan

The `ngos` table is populated from a static export of NGO Darpan. The seed script expects a CSV/JSON file with at minimum these fields:

```
darpan_id, name, state, city, cause_area, latitude, longitude
```

If `latitude`/`longitude` are missing for some rows, the nearby-NGO feature falls back to city-level matching. PostGIS can be added later for more precise geo queries — the schema is designed to accommodate it.

---

## Getting Started

### Prerequisites

- Docker and Docker Compose
- A Razorpay account (test keys work fine for local dev)
- A Google Maps or Mapbox API key

### 1. Clone and configure

```bash
git clone https://github.com/jayssSmm/NGO_Connect.git
cd NGO_Connect
cp .env.example .env
# Fill in your secrets — see Environment Variables below
```

### 2. Add the NGO Darpan dump

Place your exported CSV/JSON file at:

```
data/ngodarpan_dump.csv
```

### 3. Build and start

```bash
docker compose up --build
```

This starts:
- `web` — Flask app on port 5000
- `worker` — Celery worker
- `beat` — Celery Beat scheduler
- `db` — PostgreSQL
- `redis` — Redis

### 4. Run migrations and seed NGO data

```bash
docker compose exec web flask db upgrade
docker compose exec web python seed_ngos.py --file data/ngodarpan_dump.csv
```

### 5. Open the app

```
http://localhost:5000
```

---

## Environment Variables

```bash
# Flask
SECRET_KEY=your-secret-key
FLASK_ENV=development

# Database
DATABASE_URL=postgresql://user:password@db:5432/ngo_db

# Redis
REDIS_URL=redis://redis:6379/0

# JWT
JWT_SECRET_KEY=your-jwt-secret
JWT_ACCESS_TOKEN_EXPIRES=3600

# Razorpay (live)
RAZORPAY_KEY_ID=rzp_live_...
RAZORPAY_KEY_SECRET=...

# Razorpay (test)
RAZORPAY_TEST_MODE=true
RAZORPAY_TEST_KEY_ID=rzp_test_...
RAZORPAY_TEST_KEY_SECRET=...

# Maps
MAPS_API_KEY=your-google-or-mapbox-key

# Email (for Celery receipt task)
MAIL_SERVER=smtp.example.com
MAIL_USERNAME=...
MAIL_PASSWORD=...
```

---

## API Overview

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/auth/register` | ✗ | Register a new donor |
| `POST` | `/auth/login` | ✗ | Login, set JWT cookie |
| `POST` | `/auth/logout` | ✓ | Logout, revoke token |
| `GET` | `/ngo/search?name=` | ✗ | Search NGO by name (Redis cached) |
| `GET` | `/ngo/count` | ✗ | Total NGO count in India |
| `GET` | `/ngo/nearby?lat=&lng=` | ✗ | NGOs sorted by distance |
| `POST` | `/donation/submit` | ✓ | Submit item checklist + optional photo |
| `GET` | `/donation/history` | ✓ | Donor's past donations |
| `POST` | `/donation/save-ngo` | ✓ | Save an NGO to donor's list |
| `GET` | `/donation/saved-ngos` | ✓ | Fetch donor's saved NGOs |
| `POST` | `/payments/create-order` | ✓ | Create Razorpay order |
| `POST` | `/payments/webhook` | ✗ | Razorpay payment webhook |

---

## Running Tests

```bash
docker compose exec web pytest
```

Test mode payments can be exercised by setting `RAZORPAY_TEST_MODE=true` in your `.env` and using Razorpay's [test card numbers](https://razorpay.com/docs/payments/payments/test-card-upi-details/).

---

## Recommended Build Order

If you're building this from scratch, this sequence minimises blockers:

1. NGO Darpan seed script + `/ngo/search` and `/ngo/count` endpoints (no auth yet)
2. `auth_bp` — register, login, logout, JWT + Redis blocklist
3. `donation_bp` — checklist submission, photo upload, history
4. Redis caching on NGO queries
5. Razorpay integration + test mode
6. Celery receipt emails
7. Nearby NGOs (geolocation — needs clean lat/lng in seed data)

---

## License

MIT