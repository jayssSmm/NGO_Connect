import uuid

from app.extensions import db
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID


class NGO(db.Model):
    __tablename__ = "ngos"

    ngo_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(200), unique=True, nullable=False)
    category = db.Column(db.String(80), nullable=False)
    location = db.Column(db.String(120), nullable=False)
    address = db.Column(db.Text, nullable=False)
    contact = db.Column(db.String(30), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    focus = db.Column(db.Text, nullable=False)
    established_year = db.Column(db.Integer, nullable=False)
    latitude = db.Column(db.Float, nullable=True)
    longitude = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), server_default=func.now())

    def to_dict(self):
        return {
            "ngo_id": str(self.ngo_id),
            "name": self.name,
            "category": self.category,
            "location": self.location,
            "address": self.address,
            "contact": self.contact,
            "email": self.email,
            "focus": self.focus,
            "established_year": self.established_year,
            "latitude": self.latitude,
            "longitude": self.longitude,
        }
