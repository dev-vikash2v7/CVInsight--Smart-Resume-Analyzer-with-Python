from flask import Blueprint, request, jsonify, g
from models.user import User
from models.resume import Resume
from models.analysis import Analysis
from middleware.auth import authenticate_token, require_admin
from datetime import datetime, timedelta
import csv
import io

admin_bp = Blueprint('admin', __name__)

@admin_bp.route('/dashboard', methods=['GET'])
@authenticate_token
@require_admin
def dashboard():
    """Admin dashboard stats"""
    try:
        # Get total counts
        total_users = User.objects.count()
        total_resumes = Resume.objects.count()
        total_analyses = Analysis.objects.count()
        
        # Get recent users (last 7 days)
        seven_days_ago = datetime.utcnow() - timedelta(days=7)
        recent_users = User.objects(created_at__gte=seven_days_ago).count()
        
        # Get recent analyses (last 7 days)
        recent_analyses = Analysis.objects(created_at__gte=seven_days_ago).count()
        
        # Get analysis types distribution
        analysis_types = {}
        for analysis in Analysis.objects:
            analysis_type = analysis.analysis_type
            analysis_types[analysis_type] = analysis_types.get(analysis_type, 0) + 1
        
        # Get top job roles
        job_roles = {}
        for resume in Resume.objects:
            role = resume.target_role
            job_roles[role] = job_roles.get(role, 0) + 1
        
        top_job_roles = sorted(job_roles.items(), key=lambda x: x[1], reverse=True)[:10]
        
        # Get average scores
        total_ats_score = 0
        total_overall_score = 0
        analysis_count = 0
        
        for analysis in Analysis.objects:
            if analysis.scores:
                total_ats_score += analysis.scores.get('atsScore', 0)
                total_overall_score += analysis.scores.get('overallScore', 0)
                analysis_count += 1
        
        avg_ats_score = total_ats_score / analysis_count if analysis_count > 0 else 0
        avg_overall_score = total_overall_score / analysis_count if analysis_count > 0 else 0
        
        # Get user activity (last 30 days)
        thirty_days_ago = datetime.utcnow() - timedelta(days=30)
        active_users = User.objects(last_login__gte=thirty_days_ago).count()
        
        return jsonify({
            'success': True,
            'stats': {
                'totalUsers': total_users,
                'totalResumes': total_resumes,
                'totalAnalyses': total_analyses,
                'recentUsers': recent_users,
                'recentAnalyses': recent_analyses,
                'activeUsers': active_users,
                'analysisTypes': analysis_types,
                'topJobRoles': [{'role': role, 'count': count} for role, count in top_job_roles],
                'averageScores': {
                    'avgAtsScore': round(avg_ats_score, 2),
                    'avgOverallScore': round(avg_overall_score, 2)
                }
            }
        })
        
    except Exception as e:
        print(f'Dashboard stats error: {e}')
        return jsonify({'error': 'Error fetching dashboard stats'}), 500

@admin_bp.route('/users', methods=['GET'])
@authenticate_token
@require_admin
def get_users():
    """Get all users"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        search = request.args.get('search', '')
        role = request.args.get('role', '')
        
        # Build query
        query = {}
        if search:
            query['$or'] = [
                {'name__icontains': search},
                {'email__icontains': search}
            ]
        if role:
            query['role'] = role
        
        # Get users with pagination
        skip = (page - 1) * limit
        users = User.objects(**query).skip(skip).limit(limit).order_by('-created_at')
        total = User.objects(**query).count()
        
        return jsonify({
            'success': True,
            'users': [user.to_dict() for user in users],
            'totalPages': (total + limit - 1) // limit,
            'currentPage': page,
            'total': total
        })
        
    except Exception as e:
        print(f'Get users error: {e}')
        return jsonify({'error': 'Error fetching users'}), 500

@admin_bp.route('/users/<user_id>', methods=['PUT'])
@authenticate_token
@require_admin
def update_user(user_id):
    """Update user"""
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        role = data.get('role')
        is_active = data.get('isActive')
        
        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        if name:
            user.name = name
        if email:
            user.email = email.lower()
        if role:
            user.role = role
        if is_active is not None:
            user.is_active = is_active
        
        user.save()
        
        return jsonify({
            'success': True,
            'message': 'User updated successfully',
            'user': user.to_dict()
        })
        
    except Exception as e:
        print(f'Update user error: {e}')
        return jsonify({'error': 'Error updating user'}), 500

@admin_bp.route('/users/<user_id>', methods=['DELETE'])
@authenticate_token
@require_admin
def delete_user(user_id):
    """Delete user"""
    try:
        user = User.objects(id=user_id).first()
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Also delete user's resumes and analyses
        Resume.objects(user_id=user).delete()
        Analysis.objects(user_id=user).delete()
        user.delete()
        
        return jsonify({
            'success': True,
            'message': 'User and associated data deleted successfully'
        })
        
    except Exception as e:
        print(f'Delete user error: {e}')
        return jsonify({'error': 'Error deleting user'}), 500

@admin_bp.route('/analyses', methods=['GET'])
@authenticate_token
@require_admin
def get_analyses():
    """Get all analyses"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        analysis_type = request.args.get('type', '')
        user_id = request.args.get('userId', '')
        
        # Build query
        query = {}
        if analysis_type:
            query['analysis_type'] = analysis_type
        if user_id:
            query['user_id'] = user_id
        
        # Get analyses with pagination
        skip = (page - 1) * limit
        analyses = Analysis.objects(**query).skip(skip).limit(limit).order_by('-created_at')
        total = Analysis.objects(**query).count()
        
        return jsonify({
            'success': True,
            'analyses': [analysis.to_dict() for analysis in analyses],
            'totalPages': (total + limit - 1) // limit,
            'currentPage': page,
            'total': total
        })
        
    except Exception as e:
        print(f'Get analyses error: {e}')
        return jsonify({'error': 'Error fetching analyses'}), 500

@admin_bp.route('/resumes', methods=['GET'])
@authenticate_token
@require_admin
def get_resumes():
    """Get all resumes"""
    try:
        page = int(request.args.get('page', 1))
        limit = int(request.args.get('limit', 10))
        category = request.args.get('category', '')
        user_id = request.args.get('userId', '')
        
        # Build query
        query = {}
        if category:
            query['target_category'] = category
        if user_id:
            query['user_id'] = user_id
        
        # Get resumes with pagination
        skip = (page - 1) * limit
        resumes = Resume.objects(**query).skip(skip).limit(limit).order_by('-created_at')
        total = Resume.objects(**query).count()
        
        return jsonify({
            'success': True,
            'resumes': [resume.to_dict() for resume in resumes],
            'totalPages': (total + limit - 1) // limit,
            'currentPage': page,
            'total': total
        })
        
    except Exception as e:
        print(f'Get resumes error: {e}')
        return jsonify({'error': 'Error fetching resumes'}), 500

@admin_bp.route('/analytics', methods=['GET'])
@authenticate_token
@require_admin
def get_analytics():
    """Get detailed analytics"""
    try:
        period = int(request.args.get('period', 30))
        days_ago = datetime.utcnow() - timedelta(days=period)
        
        # User registration trend
        user_trend = {}
        for user in User.objects(created_at__gte=days_ago):
            date_str = user.created_at.strftime('%Y-%m-%d')
            user_trend[date_str] = user_trend.get(date_str, 0) + 1
        
        # Analysis trend
        analysis_trend = {}
        for analysis in Analysis.objects(created_at__gte=days_ago):
            date_str = analysis.created_at.strftime('%Y-%m-%d')
            analysis_trend[date_str] = analysis_trend.get(date_str, 0) + 1
        
        # Score distribution
        score_distribution = {'0-39': 0, '40-59': 0, '60-79': 0, '80-100': 0}
        for analysis in Analysis.objects:
            score = analysis.scores.get('overallScore', 0) if analysis.scores else 0
            if score >= 80:
                score_distribution['80-100'] += 1
            elif score >= 60:
                score_distribution['60-79'] += 1
            elif score >= 40:
                score_distribution['40-59'] += 1
            else:
                score_distribution['0-39'] += 1
        
        # Job category distribution
        job_category_distribution = {}
        for resume in Resume.objects:
            category = resume.target_category
            job_category_distribution[category] = job_category_distribution.get(category, 0) + 1
        
        return jsonify({
            'success': True,
            'analytics': {
                'userTrend': [{'date': date, 'count': count} for date, count in user_trend.items()],
                'analysisTrend': [{'date': date, 'count': count} for date, count in analysis_trend.items()],
                'scoreDistribution': [{'range': range_name, 'count': count} for range_name, count in score_distribution.items()],
                'jobCategoryDistribution': [{'category': category, 'count': count} for category, count in job_category_distribution.items()]
            }
        })
        
    except Exception as e:
        print(f'Analytics error: {e}')
        return jsonify({'error': 'Error fetching analytics'}), 500

@admin_bp.route('/export-data', methods=['POST'])
@authenticate_token
@require_admin
def export_data():
    """Export data"""
    try:
        data = request.get_json()
        data_type = data.get('dataType')
        export_format = data.get('format', 'json')
        
        if data_type == 'users':
            data_list = [user.to_dict() for user in User.objects]
        elif data_type == 'resumes':
            data_list = [resume.to_dict() for resume in Resume.objects]
        elif data_type == 'analyses':
            data_list = [analysis.to_dict() for analysis in Analysis.objects]
        else:
            return jsonify({'error': 'Invalid data type'}), 400
        
        if export_format == 'csv':
            # Convert to CSV format
            if not data_list:
                return jsonify({'error': 'No data to export'}), 400
            
            # Create CSV
            output = io.StringIO()
            writer = csv.DictWriter(output, fieldnames=data_list[0].keys())
            writer.writeheader()
            writer.writerows(data_list)
            
            csv_data = output.getvalue()
            output.close()
            
            return csv_data, 200, {
                'Content-Type': 'text/csv',
                'Content-Disposition': f'attachment; filename={data_type}-{datetime.now().strftime("%Y%m%d-%H%M%S")}.csv'
            }
        else:
            return jsonify({
                'success': True,
                'data': data_list
            })
        
    except Exception as e:
        print(f'Export data error: {e}')
        return jsonify({'error': 'Error exporting data'}), 500
