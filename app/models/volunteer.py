import uuid
from app.extensions import db
from sqlalchemy import func
from sqlalchemy.dialects.postgresql import UUID


class VolunteerApplication(db.Model):
    __tablename__ = "volunteer_applications"

    application_id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id        = db.Column(UUID(as_uuid=True), db.ForeignKey("users.user_id", ondelete="CASCADE"), nullable=False)
    ngo_id         = db.Column(UUID(as_uuid=True), db.ForeignKey("ngos.ngo_id", ondelete="CASCADE"), nullable=False)
    ngo_name       = db.Column(db.String(255), nullable=False)
    skill_needed   = db.Column(db.Text, nullable=False)
    skill_provided = db.Column(db.Text, nullable=False)
    status         = db.Column(db.String(20), nullable=True, default=None)
    applied_at     = db.Column(db.DateTime(timezone=True), server_default=func.now())

    user = db.relationship("User", backref=db.backref("volunteer_applications", lazy="dynamic", passive_deletes=True))
    ngo  = db.relationship("NGO",  backref=db.backref("volunteer_applications", lazy="dynamic", passive_deletes=True))

    __table_args__ = (
        db.CheckConstraint("status IN ('accepted', 'rejected')", name="check_status"),
    )