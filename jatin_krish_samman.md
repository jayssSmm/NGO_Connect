
No real acceptance/rejection from NGOs; just simulated messages.BACKEND NEEDS
Authentication & User Management
User registration and login (currently using sessionStorage, not persistent)
Email verification system
Password reset with OTP (Have UI but no backend)
JWT token-based authentication
Role-based access control (NGO, Donor, Volunteer, Admin)
Google OAuth 2.0 integration (currently simulated)
Session management and timeout
Core API Endpoints Needed

NGO Management:
GET /ngos - List all NGOs with filters
GET /ngos/{id} - NGO details

Donations:
POST /donations - Process donation
GET /donations/history - User's donation history
GET /ngos/{id}/donations - NGO's donations received

Volunteer Management:
GET /volunteer-opportunities - List opportunities
POST /volunteer-applications - Apply for volunteering
GET /volunteer-applications/{id} - Application status

User Profiles:
GET /users/profile - User profile
PUT /users/profile - Update profile
GET /users/dashboard - Dashboard data

Payment Integration
Payment gateway integration (Razorpay, PayPal, Stripe)(Dummy Scanner)
Transaction logging and receipt generation

Search & Filtering
Search NGOs by name, category, location

Notifications & Communication
Email notifications
In-app notifications

Relationships
Users ↔ Donations (One-to-Many)
NGOs ↔ Donations (One-to-Many)
NGOs ↔ VolunteerOpportunities (One-to-Many)
Users ↔ VolunteerApplications (One-to-Many)
NGOs ↔ Reviews (One-to-Many)

FRONTEND LIMITATIONS (Can't Do Without Backend)
Currently Can't Do:
Real Data Persistence - Data disappears on refresh (using sessionStorage)
User Authentication - Not connected to any backend database
Search Functionality - No actual NGO database to search from
Location-based Search - Backend geolocation queries not implemented
Volunteer Matching - No logic to match volunteers with opportunities
Notifications - Can't send real notifications
File Uploads - NGO documents/images need server storage
Reviews & Ratings - No database to store user feedback
Admin Dashboard - No data to display or manage
Real Email Verification - OTP system is simulated
User Profiles - Can't save persistent profile data
Donation History - Can't retrieve past transactions
NGO Verification - No backend logic to verify NGOs
