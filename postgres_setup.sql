-- PostgreSQL setup for NGO_Connect
-- Run these commands in psql as a superuser

CREATE DATABASE ngoconnect;
CREATE USER ngouser WITH PASSWORD 'ngo_password';
GRANT ALL PRIVILEGES ON DATABASE ngoconnect TO ngouser;
