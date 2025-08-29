from flask import Blueprint, request, jsonify, g
from models.analysis import Analysis
from models.resume import Resume
from models.user import User
from middleware.auth import authenticate_token, optional_auth
from utils.file_parser import extract_text_from_file
from utils.resume_analyzer import analyze_resume_standard, analyze_resume_ai
import os
from werkzeug.utils import secure_filename
import uuid

analysis_bp = Blueprint('analysis', __name__)

# File upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'docx', 'doc'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def convert_resume_to_text(resume):
    """Convert resume data to text for analysis"""
    text = ''
    
    # Personal info
    if resume.personal_info:
        text += f"{resume.personal_info.get('name', '')}\n"
        text += f"{resume.personal_info.get('email', '')}\n"
        if resume.personal_info.get('phone'):
            text += f"{resume.personal_info['phone']}\n"
        if resume.personal_info.get('location'):
            text += f"{resume.personal_info['location']}\n"
        if resume.personal_info.get('linkedin'):
            text += f"{resume.personal_info['linkedin']}\n"
        if resume.personal_info.get('github'):
            text += f"{resume.personal_info['github']}\n"
        if resume.personal_info.get('portfolio'):
            text += f"{resume.personal_info['portfolio']}\n"
    
    text += '\n'
    
    # Summary
    if resume.summary:
        text += f"SUMMARY\n{resume.summary}\n\n"
    
    # Experience
    if resume.experience:
        text += 'EXPERIENCE\n'
        for exp in resume.experience:
            text += f"{exp.get('position', '')} at {exp.get('company', '')}\n"
            text += f"{exp.get('startDate', '')} - {exp.get('endDate', '')}\n"
            if exp.get('description'):
                text += f"{exp['description']}\n"
            if exp.get('responsibilities'):
                for resp in exp['responsibilities']:
                    text += f"• {resp}\n"
            if exp.get('achievements'):
                for ach in exp['achievements']:
                    text += f"• {ach}\n"
            text += '\n'
    
    # Education
    if resume.education:
        text += 'EDUCATION\n'
        for edu in resume.education:
            text += f"{edu.get('degree', '')} in {edu.get('field', '')}\n"
            text += f"{edu.get('school', '')}\n"
            if edu.get('graduationDate'):
                text += f"Graduated: {edu['graduationDate']}\n"
            if edu.get('gpa'):
                text += f"GPA: {edu['gpa']}\n"
            if edu.get('achievements'):
                for ach in edu['achievements']:
                    text += f"• {ach}\n"
            text += '\n'
    
    # Skills
    if resume.skills:
        text += 'SKILLS\n'
        if resume.skills.get('technical'):
            text += f"Technical: {', '.join(resume.skills['technical'])}\n"
        if resume.skills.get('soft'):
            text += f"Soft Skills: {', '.join(resume.skills['soft'])}\n"
        if resume.skills.get('languages'):
            text += f"Languages: {', '.join(resume.skills['languages'])}\n"
        if resume.skills.get('tools'):
            text += f"Tools: {', '.join(resume.skills['tools'])}\n"
    
    return text

@analysis_bp.route('/standard', methods=['POST'])
@optional_auth
def standard_analysis():
    """Standard resume analysis"""
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        job_role = request.form.get('jobRole')
        job_category = request.form.get('jobCategory')
        
        if not job_role or not job_category:
            return jsonify({'error': 'Job role and category are required'}), 400
        
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
            
            if not resume_text.strip():
                return jsonify({'error': 'Could not extract text from the uploaded file'}), 400
            
            # Perform standard analysis
            analysis_result = analyze_resume_standard(resume_text, job_role, job_category)
            
            # Save analysis to database if user is authenticated
            analysis_id = None
            if hasattr(g, 'user'):
                analysis = Analysis(
                    user_id=User.objects(id=g.user['id']).first(),
                    analysis_type='standard',
                    scores={
                        'atsScore': analysis_result.get('ats_score', 0),
                        'keywordMatchScore': analysis_result.get('keyword_match', {}).get('score', 0),
                        'formatScore': analysis_result.get('format_score', 0),
                        'sectionScore': analysis_result.get('section_score', 0),
                        'overallScore': round((analysis_result.get('ats_score', 0) + 
                                             analysis_result.get('keyword_match', {}).get('score', 0) + 
                                             analysis_result.get('format_score', 0) + 
                                             analysis_result.get('section_score', 0)) / 4)
                    },
                    keyword_match={
                        'score': analysis_result.get('keyword_match', {}).get('score', 0),
                        'matchedSkills': analysis_result.get('keyword_match', {}).get('matched_skills', []),
                        'missingSkills': analysis_result.get('keyword_match', {}).get('missing_skills', [])
                    },
                    suggestions={
                        'contact': analysis_result.get('contact_suggestions', []),
                        'summary': analysis_result.get('summary_suggestions', []),
                        'skills': analysis_result.get('skills_suggestions', []),
                        'experience': analysis_result.get('experience_suggestions', []),
                        'education': analysis_result.get('education_suggestions', []),
                        'format': analysis_result.get('format_suggestions', [])
                    }
                )
                analysis.save()
                analysis_id = str(analysis.id)
            
            return jsonify({
                'success': True,
                'analysis': analysis_result,
                'analysisId': analysis_id
            })
            
        finally:
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
        
    except Exception as e:
        print(f'Standard analysis error: {e}')
        return jsonify({'error': 'Error performing analysis'}), 500

@analysis_bp.route('/ai', methods=['POST'])
@optional_auth
def ai_analysis():
    """AI-powered resume analysis"""
    try:
        if 'resume' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400
        
        file = request.files['resume']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        job_role = request.form.get('jobRole')
        job_category = request.form.get('jobCategory')
        job_description = request.form.get('jobDescription', '')
        ai_model = request.form.get('aiModel', 'Google Gemini')
        
        if not job_role or not job_category:
            return jsonify({'error': 'Job role and category are required'}), 400
        
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
            
            if not resume_text.strip():
                return jsonify({'error': 'Could not extract text from the uploaded file'}), 400
            
            # Perform AI analysis
            analysis_result = analyze_resume_ai(resume_text, job_role, job_category, job_description, ai_model)
            
            # Save analysis to database if user is authenticated
            analysis_id = None
            if hasattr(g, 'user'):
                analysis = Analysis(
                    user_id=User.objects(id=g.user['id']).first(),
                    analysis_type='ai',
                    scores={
                        'atsScore': analysis_result.get('ats_score', 0),
                        'keywordMatchScore': analysis_result.get('keyword_match', {}).get('score', 0),
                        'formatScore': analysis_result.get('format_score', 0),
                        'sectionScore': analysis_result.get('section_score', 0),
                        'overallScore': analysis_result.get('resume_score', 0)
                    },
                    keyword_match={
                        'score': analysis_result.get('keyword_match', {}).get('score', 0),
                        'matchedSkills': analysis_result.get('keyword_match', {}).get('matched_skills', []),
                        'missingSkills': analysis_result.get('keyword_match', {}).get('missing_skills', [])
                    },
                    suggestions={
                        'contact': analysis_result.get('contact_suggestions', []),
                        'summary': analysis_result.get('summary_suggestions', []),
                        'skills': analysis_result.get('skills_suggestions', []),
                        'experience': analysis_result.get('experience_suggestions', []),
                        'education': analysis_result.get('education_suggestions', []),
                        'format': analysis_result.get('format_suggestions', [])
                    },
                    ai_analysis={
                        'model': ai_model,
                        'fullResponse': analysis_result.get('analysis', ''),
                        'strengths': analysis_result.get('strengths', []),
                        'weaknesses': analysis_result.get('weaknesses', []),
                        'recommendations': analysis_result.get('recommendations', [])
                    },
                    job_description=job_description
                )
                analysis.save()
                analysis_id = str(analysis.id)
            
            return jsonify({
                'success': True,
                'analysis': analysis_result,
                'analysisId': analysis_id
            })
            
        finally:
            # Clean up uploaded file
            if os.path.exists(filepath):
                os.remove(filepath)
        
    except Exception as e:
        print(f'AI analysis error: {e}')
        return jsonify({'error': 'Error performing AI analysis'}), 500

@analysis_bp.route('/resume/<resume_id>', methods=['POST'])
@authenticate_token
def analyze_resume(resume_id):
    """Analyze existing resume"""
    try:
        data = request.get_json()
        analysis_type = data.get('analysisType', 'standard')
        job_description = data.get('jobDescription', '')
        ai_model = data.get('aiModel', 'Google Gemini')
        
        resume = Resume.objects(id=resume_id, user_id=g.user['id']).first()
        
        if not resume:
            return jsonify({'error': 'Resume not found'}), 404
        
        # Convert resume data to text for analysis
        resume_text = convert_resume_to_text(resume)
        
        if analysis_type == 'ai':
            analysis_result = analyze_resume_ai(resume_text, resume.target_role, resume.target_category, job_description, ai_model)
        else:
            analysis_result = analyze_resume_standard(resume_text, resume.target_role, resume.target_category)
        
        # Save analysis
        analysis = Analysis(
            resume_id=resume,
            user_id=User.objects(id=g.user['id']).first(),
            analysis_type=analysis_type,
            scores={
                'atsScore': analysis_result.get('ats_score', 0),
                'keywordMatchScore': analysis_result.get('keyword_match', {}).get('score', 0),
                'formatScore': analysis_result.get('format_score', 0),
                'sectionScore': analysis_result.get('section_score', 0),
                'overallScore': analysis_result.get('resume_score', analysis_result.get('ats_score', 0))
            },
            keyword_match={
                'score': analysis_result.get('keyword_match', {}).get('score', 0),
                'matchedSkills': analysis_result.get('keyword_match', {}).get('matched_skills', []),
                'missingSkills': analysis_result.get('keyword_match', {}).get('missing_skills', [])
            },
            suggestions={
                'contact': analysis_result.get('contact_suggestions', []),
                'summary': analysis_result.get('summary_suggestions', []),
                'skills': analysis_result.get('skills_suggestions', []),
                'experience': analysis_result.get('experience_suggestions', []),
                'education': analysis_result.get('education_suggestions', []),
                'format': analysis_result.get('format_suggestions', [])
            },
            ai_analysis=analysis_type == 'ai' and {
                'model': ai_model,
                'fullResponse': analysis_result.get('analysis', ''),
                'strengths': analysis_result.get('strengths', []),
                'weaknesses': analysis_result.get('weaknesses', []),
                'recommendations': analysis_result.get('recommendations', [])
            } or None,
            job_description=job_description
        )
        
        analysis.save()
        
        return jsonify({
            'success': True,
            'analysis': analysis_result,
            'analysisId': str(analysis.id)
        })
        
    except Exception as e:
        print(f'Resume analysis error: {e}')
        return jsonify({'error': 'Error analyzing resume'}), 500

@analysis_bp.route('/', methods=['GET'])
@authenticate_token
def get_analyses():
    """Get user's analysis history"""
    try:
        analyses = Analysis.objects(user_id=g.user['id']).order_by('-created_at')
        
        return jsonify({
            'success': True,
            'analyses': [analysis.to_dict() for analysis in analyses]
        })
        
    except Exception as e:
        print(f'Get analyses error: {e}')
        return jsonify({'error': 'Error fetching analyses'}), 500

@analysis_bp.route('/<analysis_id>', methods=['GET'])
@authenticate_token
def get_analysis(analysis_id):
    """Get specific analysis"""
    try:
        analysis = Analysis.objects(id=analysis_id, user_id=g.user['id']).first()
        
        if not analysis:
            return jsonify({'error': 'Analysis not found'}), 404
        
        return jsonify({
            'success': True,
            'analysis': analysis.to_dict()
        })
        
    except Exception as e:
        print(f'Get analysis error: {e}')
        return jsonify({'error': 'Error fetching analysis'}), 500

@analysis_bp.route('/<analysis_id>', methods=['DELETE'])
@authenticate_token
def delete_analysis(analysis_id):
    """Delete analysis"""
    try:
        analysis = Analysis.objects(id=analysis_id, user_id=g.user['id']).first()
        
        if not analysis:
            return jsonify({'error': 'Analysis not found'}), 404
        
        analysis.delete()
        
        return jsonify({
            'success': True,
            'message': 'Analysis deleted successfully'
        })
        
    except Exception as e:
        print(f'Delete analysis error: {e}')
        return jsonify({'error': 'Error deleting analysis'}), 500
