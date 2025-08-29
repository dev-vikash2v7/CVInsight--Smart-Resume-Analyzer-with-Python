import google.generativeai as genai
import os
import re

# Initialize Google Generative AI
genai.configure(api_key=os.getenv('GOOGLE_API_KEY', 'your-api-key'))

# Job roles and skills data (simplified version)
JOB_ROLES = {
    'Software Development': {
        'Frontend Developer': {
            'description': 'Develops user-facing web applications',
            'required_skills': ['JavaScript', 'React', 'HTML', 'CSS', 'TypeScript', 'Vue.js', 'Angular']
        },
        'Backend Developer': {
            'description': 'Develops server-side applications and APIs',
            'required_skills': ['Node.js', 'Python', 'Java', 'C#', 'SQL', 'MongoDB', 'Express.js']
        },
        'Full Stack Developer': {
            'description': 'Develops both frontend and backend applications',
            'required_skills': ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'MongoDB', 'Express.js']
        }
    },
    'Data Science': {
        'Data Scientist': {
            'description': 'Analyzes data to extract insights and build models',
            'required_skills': ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'Pandas', 'NumPy']
        },
        'Data Analyst': {
            'description': 'Analyzes data to provide business insights',
            'required_skills': ['SQL', 'Excel', 'Python', 'Tableau', 'Power BI', 'Statistics']
        }
    },
    'DevOps': {
        'DevOps Engineer': {
            'description': 'Manages infrastructure and deployment processes',
            'required_skills': ['Docker', 'Kubernetes', 'AWS', 'Linux', 'CI/CD', 'Jenkins', 'Terraform']
        }
    }
}

def analyze_resume_standard(resume_text, job_role, job_category):
    """Standard resume analysis"""
    try:
        # Extract basic information
        extracted_info = extract_basic_info(resume_text)
        
        # Get required skills for the job role
        role_info = JOB_ROLES.get(job_category, {}).get(job_role)
        if not role_info:
            raise Exception('Invalid job role or category')
        
        required_skills = role_info['required_skills']
        
        # Analyze skills match
        skills_match = analyze_skills_match(resume_text, required_skills)
        
        # Analyze format and sections
        format_analysis = analyze_format(resume_text)
        
        # Calculate scores
        ats_score = calculate_ats_score(resume_text, format_analysis)
        keyword_match_score = skills_match['score']
        format_score = format_analysis['score']
        section_score = format_analysis['section_score']
        
        # Generate suggestions
        suggestions = generate_suggestions(extracted_info, skills_match, format_analysis, role_info)
        
        return {
            'name': extracted_info['name'],
            'email': extracted_info['email'],
            'phone': extracted_info['phone'],
            'linkedin': extracted_info['linkedin'],
            'github': extracted_info['github'],
            'portfolio': extracted_info['portfolio'],
            'summary': extracted_info['summary'],
            'education': extracted_info['education'],
            'experience': extracted_info['experience'],
            'projects': extracted_info['projects'],
            'skills': extracted_info['skills'],
            'ats_score': ats_score,
            'keyword_match': skills_match,
            'format_score': format_score,
            'section_score': section_score,
            'contact_suggestions': suggestions['contact'],
            'summary_suggestions': suggestions['summary'],
            'skills_suggestions': suggestions['skills'],
            'experience_suggestions': suggestions['experience'],
            'education_suggestions': suggestions['education'],
            'format_suggestions': suggestions['format'],
            'document_type': 'resume'
        }
        
    except Exception as e:
        print(f'Standard analysis error: {e}')
        raise e

def analyze_resume_ai(resume_text, job_role, job_category, job_description='', ai_model='Google Gemini'):
    """AI-powered resume analysis"""
    try:
        model = genai.GenerativeModel('gemini-pro')
        
        # Create the prompt for AI analysis
        prompt = create_ai_analysis_prompt(resume_text, job_role, job_category, job_description)
        
        # Generate AI response
        response = model.generate_content(prompt)
        ai_analysis = response.text
        
        # Parse AI response
        parsed_analysis = parse_ai_response(ai_analysis)
        
        # Combine with standard analysis
        standard_analysis = analyze_resume_standard(resume_text, job_role, job_category)
        
        return {
            **standard_analysis,
            'analysis': ai_analysis,
            'resume_score': parsed_analysis.get('resume_score', standard_analysis['ats_score']),
            'ats_score': parsed_analysis.get('ats_score', standard_analysis['ats_score']),
            'strengths': parsed_analysis.get('strengths', []),
            'weaknesses': parsed_analysis.get('weaknesses', []),
            'recommendations': parsed_analysis.get('recommendations', []),
            'model_used': ai_model
        }
        
    except Exception as e:
        print(f'AI analysis error: {e}')
        # Fallback to standard analysis if AI fails
        return analyze_resume_standard(resume_text, job_role, job_category)

def extract_basic_info(text):
    """Extract basic information from resume text"""
    info = {
        'name': '',
        'email': '',
        'phone': '',
        'linkedin': '',
        'github': '',
        'portfolio': '',
        'summary': '',
        'education': [],
        'experience': [],
        'projects': [],
        'skills': []
    }
    
    # Extract email
    email_regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    email_match = re.search(email_regex, text)
    if email_match:
        info['email'] = email_match.group()
    
    # Extract phone
    phone_regex = r'(\+?1?[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})'
    phone_match = re.search(phone_regex, text)
    if phone_match:
        info['phone'] = phone_match.group()
    
    # Extract LinkedIn
    linkedin_regex = r'linkedin\.com/in/[a-zA-Z0-9-]+'
    linkedin_match = re.search(linkedin_regex, text, re.IGNORECASE)
    if linkedin_match:
        info['linkedin'] = linkedin_match.group()
    
    # Extract GitHub
    github_regex = r'github\.com/[a-zA-Z0-9-]+'
    github_match = re.search(github_regex, text, re.IGNORECASE)
    if github_match:
        info['github'] = github_match.group()
    
    # Extract name (first line that's not empty and doesn't contain email/phone)
    lines = [line.strip() for line in text.split('\n') if line.strip()]
    for line in lines:
        if not line.find('@') and not re.search(phone_regex, line) and 'linkedin' not in line.lower() and 'github' not in line.lower():
            info['name'] = line
            break
    
    return info

def analyze_skills_match(text, required_skills):
    """Analyze skills match between resume and required skills"""
    text_lower = text.lower()
    matched_skills = []
    missing_skills = []
    
    for skill in required_skills:
        if skill.lower() in text_lower:
            matched_skills.append(skill)
        else:
            missing_skills.append(skill)
    
    score = round((len(matched_skills) / len(required_skills)) * 100)
    
    return {
        'score': score,
        'matched_skills': matched_skills,
        'missing_skills': missing_skills
    }

def analyze_format(text):
    """Analyze resume format and sections"""
    sections = {
        'contact': False,
        'summary': False,
        'experience': False,
        'education': False,
        'skills': False
    }
    
    text_lower = text.lower()
    
    # Check for sections
    if 'summary' in text_lower or 'objective' in text_lower:
        sections['summary'] = True
    if 'experience' in text_lower or 'work' in text_lower:
        sections['experience'] = True
    if 'education' in text_lower or 'academic' in text_lower:
        sections['education'] = True
    if 'skills' in text_lower or 'technologies' in text_lower:
        sections['skills'] = True
    
    section_score = sum(sections.values()) * 20
    format_score = min(100, section_score + 20)  # Base score + section bonus
    
    return {
        'score': format_score,
        'section_score': section_score,
        'sections': sections
    }

def calculate_ats_score(text, format_analysis):
    """Calculate ATS score"""
    score = format_analysis['score']
    
    # Check for common ATS-friendly elements
    if '@' in text and '.com' in text:
        score += 10  # Has email
    if re.search(r'\d{3}[-.\s]?\d{3}[-.\s]?\d{4}', text):
        score += 10  # Has phone
    if len(text) > 500:
        score += 10  # Sufficient length
    if 'experience' in text or 'work' in text:
        score += 10  # Has experience section
    
    return min(100, score)

def generate_suggestions(info, skills_match, format_analysis, role_info):
    """Generate suggestions for improvement"""
    suggestions = {
        'contact': [],
        'summary': [],
        'skills': [],
        'experience': [],
        'education': [],
        'format': []
    }
    
    # Contact suggestions
    if not info['email']:
        suggestions['contact'].append('Add your email address')
    if not info['phone']:
        suggestions['contact'].append('Add your phone number')
    if not info['linkedin']:
        suggestions['contact'].append('Add your LinkedIn profile')
    
    # Skills suggestions
    if skills_match['missing_skills']:
        suggestions['skills'].append(f"Consider adding these skills: {', '.join(skills_match['missing_skills'])}")
    
    # Format suggestions
    if not format_analysis['sections']['summary']:
        suggestions['format'].append('Add a professional summary section')
    if not format_analysis['sections']['experience']:
        suggestions['format'].append('Add a work experience section')
    if not format_analysis['sections']['education']:
        suggestions['format'].append('Add an education section')
    if not format_analysis['sections']['skills']:
        suggestions['format'].append('Add a skills section')
    
    return suggestions

def create_ai_analysis_prompt(resume_text, job_role, job_category, job_description):
    """Create prompt for AI analysis"""
    return f"""
Analyze this resume for a {job_role} position in {job_category}.

Resume:
{resume_text}

{job_description if job_description else ''}

Please provide a comprehensive analysis including:
1. Overall assessment (1-2 paragraphs)
2. Professional profile analysis
3. Skills analysis and match with job requirements
4. Experience analysis
5. Education analysis
6. Key strengths (bullet points)
7. Areas for improvement (bullet points)
8. ATS optimization assessment
9. Specific recommendations for improvement
10. Overall resume score (0-100)

Format your response with clear sections using ## headers.
"""

def parse_ai_response(ai_response):
    """Parse AI response to extract structured data"""
    try:
        parsed = {
            'resume_score': 0,
            'ats_score': 0,
            'strengths': [],
            'weaknesses': [],
            'recommendations': []
        }
        
        # Extract score (look for numbers 0-100)
        score_match = re.search(r'(?:score|rating|grade)[:\s]*(\d{{1,3}})', ai_response, re.IGNORECASE)
        if score_match:
            parsed['resume_score'] = int(score_match.group(1))
        
        # Extract strengths and weaknesses
        strengths_match = re.search(r'strengths?[:\s]*([\s\S]*?)(?=weaknesses?|areas for improvement|recommendations|$)', ai_response, re.IGNORECASE)
        if strengths_match:
            parsed['strengths'] = [line.strip() for line in strengths_match.group(1).split('\n') if line.strip() and '•' in line]
        
        weaknesses_match = re.search(r'weaknesses?|areas for improvement[:\s]*([\s\S]*?)(?=recommendations|strengths|$)', ai_response, re.IGNORECASE)
        if weaknesses_match:
            parsed['weaknesses'] = [line.strip() for line in weaknesses_match.group(1).split('\n') if line.strip() and '•' in line]
        
        return parsed
    except Exception as e:
        print(f'AI response parsing error: {e}')
        return {
            'resume_score': 0,
            'ats_score': 0,
            'strengths': [],
            'weaknesses': [],
            'recommendations': []
        }
