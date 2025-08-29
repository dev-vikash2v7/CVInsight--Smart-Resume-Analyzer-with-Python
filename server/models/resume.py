from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from datetime import datetime
from app import db

class Resume(db.Model):
    __tablename__ = 'resumes'
    
    id = Column(Integer, primary_key=True)
    personal_info = Column(JSON, nullable=False)
    summary = Column(Text)
    target_role = Column(String(255), nullable=False, index=True)
    target_category = Column(String(255), nullable=False, index=True)
    education = Column(JSON)  # List of education objects
    experience = Column(JSON)  # List of experience objects
    projects = Column(JSON)  # List of project objects
    skills = Column(JSON)  # Skills object
    template = Column(String(255))
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False, index=True)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    analyses = db.relationship('Analysis', backref='resume', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        """Convert resume to dictionary"""
        return {
            'id': self.id,
            'personal_info': self.personal_info,
            'summary': self.summary,
            'target_role': self.target_role,
            'target_category': self.target_category,
            'education': self.education,
            'experience': self.experience,
            'projects': self.projects,
            'skills': self.skills,
            'template': self.template,
            'user_id': self.user_id,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }
