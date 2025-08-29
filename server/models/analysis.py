from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, JSON
from sqlalchemy.sql import func
from datetime import datetime
from app import db

class Analysis(db.Model):
    __tablename__ = 'analyses'
    
    id = Column(Integer, primary_key=True)
    resume_id = Column(Integer, ForeignKey('resumes.id'), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=True, index=True)
    analysis_type = Column(String(50), nullable=False, index=True)  # 'standard' or 'ai'
    scores = Column(JSON)  # Dictionary of scores
    keyword_match = Column(JSON)  # Dictionary of keyword match data
    suggestions = Column(JSON)  # Dictionary of suggestions
    ai_analysis = Column(JSON)  # AI-specific analysis data
    job_description = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    def to_dict(self):
        """Convert analysis to dictionary"""
        return {
            'id': self.id,
            'resume_id': self.resume_id,
            'user_id': self.user_id,
            'analysis_type': self.analysis_type,
            'scores': self.scores,
            'keyword_match': self.keyword_match,
            'suggestions': self.suggestions,
            'ai_analysis': self.ai_analysis,
            'job_description': self.job_description,
            'created_at': self.created_at.isoformat()
        }
