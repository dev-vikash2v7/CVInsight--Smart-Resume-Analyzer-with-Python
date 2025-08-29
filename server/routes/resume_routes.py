from flask import Blueprint, request, jsonify, g
from models.resume import Resume
from models.user import User
from middleware.auth import authenticate_token, optional_auth
from utils.file_parser import extract_text_from_file
import os
from werkzeug.utils import secure_filename
import uuid

resume_bp = Blueprint('resume', __name__)

# File upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@resume_bp.route('/upload', methods=['POST'])
def upload_resume():
    """Upload and parse resume file"""
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Only PDF and DOCX files are allowed'}), 400
        
        # Create upload directory if it doesn't exist
        if not os.path.exists(UPLOAD_FOLDER):
            os.makedirs(UPLOAD_FOLDER)
        
        # Save file temporarily
        filename = secure_filename(f"{uuid.uuid4()}_{file.filename}")
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        try:
            # Extract text based on file type
            file_extension = file.filename.rsplit('.', 1)[1].lower()
            resume_text = extract_text_from_file(filepath, file_extension)
            
            return jsonify({
                'success': True,
                'text': resume_text,
                'filename': file.filename
            })
            
        finally:
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
        
    except Exception as e:
        print(f'File upload error: {e}')
        return jsonify({'error': 'Error processing file'}), 500

@resume_bp.route('/', methods=['POST'])
@authenticate_token
def create_resume():
    """Create new resume"""
    try:
        data = request.get_json()
        data['user_id'] = User.objects(id=g.user['id']).first()
        
        resume = Resume(**data)
        resume.save()
        
        return jsonify({
            'success': True,
            'resume': resume.to_dict()
        }), 201
        
    except Exception as e:
        print(f'Create resume error: {e}')
        return jsonify({'error': 'Error creating resume'}), 500

@resume_bp.route('/', methods=['GET'])
@authenticate_token
def get_resumes():
    """Get all resumes for user"""
    try:
        resumes = Resume.objects(user_id=g.user['id']).order_by('-created_at')
        
        return jsonify({
            'success': True,
            'resumes': [resume.to_dict() for resume in resumes]
        })
        
    except Exception as e:
        print(f'Get resumes error: {e}')
        return jsonify({'error': 'Error fetching resumes'}), 500

@resume_bp.route('/<resume_id>', methods=['GET'])
@authenticate_token
def get_resume(resume_id):
    """Get specific resume"""
    try:
        resume = Resume.objects(id=resume_id, user_id=g.user['id']).first()
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        return jsonify({
            'success': True,
            'resume': resume.to_dict()
        })
        
    except Exception as e:
        print(f'Get resume error: {e}')
        return jsonify({'error': 'Error fetching resume'}), 500

@resume_bp.route('/<resume_id>', methods=['PUT'])
@authenticate_token
def update_resume(resume_id):
    """Update resume"""
    try:
        data = request.get_json()
        
        resume = Resume.objects(id=resume_id, user_id=g.user['id']).first()
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        # Update fields
        for key, value in data.items():
            if hasattr(resume, key):
                setattr(resume, key, value)
        
        resume.save()
        
        return jsonify({
            'success': True,
            'resume': resume.to_dict()
        })
        
    except Exception as e:
        print(f'Update resume error: {e}')
        return jsonify({'error': 'Error updating resume'}), 500

@resume_bp.route('/<resume_id>', methods=['DELETE'])
@authenticate_token
def delete_resume(resume_id):
    """Delete resume"""
    try:
        resume = Resume.objects(id=resume_id, user_id=g.user['id']).first()
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        resume.delete()
        
        return jsonify({
            'success': True,
            'message': 'Resume deleted successfully'
        })
        
    except Exception as e:
        print(f'Delete resume error: {e}')
        return jsonify({'error': 'Error deleting resume'}), 500

@resume_bp.route('/<resume_id>/duplicate', methods=['POST'])
@authenticate_token
def duplicate_resume(resume_id):
    """Duplicate resume"""
    try:
        original_resume = Resume.objects(id=resume_id, user_id=g.user['id']).first()
        
        if not original_resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        # Create a copy
        resume_data = original_resume.to_dict()
        del resume_data['id']
        del resume_data['created_at']
        del resume_data['updated_at']
        
        # Update name to indicate it's a copy
        if 'personal_info' in resume_data and 'name' in resume_data['personal_info']:
            resume_data['personal_info']['name'] = f"{resume_data['personal_info']['name']} (Copy)"
        
        resume_data['user_id'] = User.objects(id=g.user['id']).first()
        
        new_resume = Resume(**resume_data)
        new_resume.save()
        
        return jsonify({
            'success': True,
            'resume': new_resume.to_dict()
        }), 201
        
    except Exception as e:
        print(f'Duplicate resume error: {e}')
        return jsonify({'error': 'Error duplicating resume'}), 500
