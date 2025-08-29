from flask import Blueprint, request, jsonify, g
from models.user import User
from middleware.auth import authenticate_token
from datetime import datetime
from app import db

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """User registration"""
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        
        # Validate input
        if not name or not email or not password:
            return jsonify({'error': 'All fields are required'}), 400
        
        if len(password) < 6:
            return jsonify({'error': 'Password must be at least 6 characters long'}), 400
        
        # Check if user already exists
        existing_user = User.query.filter_by(email=email.lower()).first()
        if existing_user:
            return jsonify({'error': 'User with this email already exists'}), 400
        
        # Create new user
        user = User(
            name=name,
            email=email.lower(),
            password=password
        )
        db.session.add(user)
        db.session.commit()
        
        # Generate JWT token
        token = user.generate_token()
        
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'token': token,
            'user': user.to_dict()
        }), 201
        
    except Exception as e:
        db.session.rollback()
        print(f'Registration error: {e}')
        return jsonify({'error': 'Error registering user'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        # Validate input
        if not email or not password:
            return jsonify({'error': 'Email and password are required'}), 400
        
        # Find user
        user = User.query.filter_by(email=email.lower()).first()
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Check if user is active
        if not user.is_active:
            return jsonify({'error': 'Account is deactivated'}), 401
        
        # Verify password
        if not user.compare_password(password):
            return jsonify({'error': 'Invalid credentials'}), 401
        
        # Update last login
        user.last_login = datetime.utcnow()
        db.session.commit()
        
        # Generate JWT token
        token = user.generate_token()
        
        return jsonify({
            'success': True,
            'message': 'Login successful',
            'token': token,
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        print(f'Login error: {e}')
        return jsonify({'error': 'Error during login'}), 500

@auth_bp.route('/profile', methods=['GET'])
@authenticate_token
def get_profile():
    """Get user profile"""
    try:
        user = User.query.get(g.user['id'])
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
        
    except Exception as e:
        print(f'Get profile error: {e}')
        return jsonify({'error': 'Error fetching profile'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@authenticate_token
def update_profile():
    """Update user profile"""
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        
        # Validate input
        if not name or not email:
            return jsonify({'error': 'Name and email are required'}), 400
        
        # Check if email is already taken by another user
        existing_user = User.query.filter(
            User.email == email.lower(),
            User.id != g.user['id']
        ).first()
        if existing_user:
            return jsonify({'error': 'Email is already taken'}), 400
        
        # Update user
        user = User.query.get(g.user['id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        user.name = name
        user.email = email.lower()
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Profile updated successfully',
            'user': user.to_dict()
        })
        
    except Exception as e:
        db.session.rollback()
        print(f'Update profile error: {e}')
        return jsonify({'error': 'Error updating profile'}), 500

@auth_bp.route('/change-password', methods=['PUT'])
@authenticate_token
def change_password():
    """Change password"""
    try:
        data = request.get_json()
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')
        
        # Validate input
        if not current_password or not new_password:
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'New password must be at least 6 characters long'}), 400
        
        # Get user
        user = User.query.get(g.user['id'])
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Verify current password
        if not user.compare_password(current_password):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Update password
        user.set_password(new_password)
        db.session.commit()
        
        return jsonify({
            'success': True,
            'message': 'Password changed successfully'
        })
        
    except Exception as e:
        db.session.rollback()
        print(f'Change password error: {e}')
        return jsonify({'error': 'Error changing password'}), 500

@auth_bp.route('/verify-token', methods=['POST'])
@authenticate_token
def verify_token():
    """Verify JWT token"""
    try:
        user = User.query.get(g.user['id'])
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'success': True,
            'user': user.to_dict()
        })
        
    except Exception as e:
        print(f'Verify token error: {e}')
        return jsonify({'error': 'Error verifying token'}), 500

@auth_bp.route('/logout', methods=['POST'])
@authenticate_token
def logout():
    """Logout (client-side token removal)"""
    try:
        # In a stateless JWT setup, logout is handled client-side
        # But we can log the logout action if needed
        return jsonify({
            'success': True,
            'message': 'Logout successful'
        })
        
    except Exception as e:
        print(f'Logout error: {e}')
        return jsonify({'error': 'Error during logout'}), 500
