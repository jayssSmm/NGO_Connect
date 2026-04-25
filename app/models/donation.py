import uuid
from app.extensions import db
from sqlalchemy import func, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID


class Donation(db.Model):
    __tablename__ = "donations"

    donation_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id     = db.Column(UUID(as_uuid=True), db.ForeignKey("users.user_id"), nullable=False)
    ngo_id      = db.Column(UUID(as_uuid=True), db.ForeignKey("ngos.ngo_id"), nullable=False)
    amount      = db.Column(db.Numeric(10, 2), nullable=True, default=None)
    item        = db.Column(db.Text, nullable=True, default=None)
    donated_at  = db.Column(db.DateTime(timezone=True), server_default=func.now())

    user = db.relationship("User", backref="donations")
    ngo  = db.relationship("NGO", backref="donations")

    __table_args__ = (
        CheckConstraint(
            "(amount IS NOT NULL AND item IS NULL) OR (amount IS NULL AND item IS NOT NULL)",
            name="one_type_only"
        ),
    )

    def to_dict(self):
        return {
            "donation_id": str(self.donation_id),
            "user_id":     str(self.user_id),
            "ngo_id":      str(self.ngo_id),
            "amount":      float(self.amount) if self.amount else None,
            "item":        self.item,
            "donated_at":  self.donated_at.isoformat(),
        }