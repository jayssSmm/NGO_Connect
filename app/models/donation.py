import uuid
from app.extensions import db
from sqlalchemy import func, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID


class Donation(db.Model):
    __tablename__ = "donations"

    donation_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id     = db.Column(UUID(as_uuid=True), db.ForeignKey("users.user_id"), nullable=False)
    ngo_id      = db.Column(UUID(as_uuid=True), db.ForeignKey("ngos.ngo_id"), nullable=False)
    ngo_name    = db.Column(db.String(255), nullable=False)
    amount      = db.Column(db.Numeric(10, 2), nullable=True, default=None)
    item        = db.Column(db.Text, nullable=True, default=None)
    donated_at  = db.Column(db.DateTime(timezone=True), server_default=func.now())

    user = db.relationship("User", backref="donations")
    ngo  = db.relationship("NGO", backref="donations")
