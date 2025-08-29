from functools import wraps
from flask import request, jsonify, g
import jwt
import os
from models.user import User

def authenticate_token(f):
    """Decorator to authenticate JWT token"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            auth_header = request.headers.get('Authorization')
            if not auth_header:
                return jsonify({'error': 'Access token required'}), 401
            
            token = auth_header.split(' ')[1] if len(auth_header.split(' ')) > 1 else None
            if not token:
                return jsonify({'error': 'Access token required'}), 401
            
            # Verify token
            payload = jwt.decode(token, os.getenv('JWT_SECRET'), algorithms=['HS256'])
            
            # Check if user still exists
            user = User.query.get(payload['id'])
            if not user:
                return jsonify({'error': 'User not found'}), 401
            
            # Check if user is active
            if not user.is_active:
                return jsonify({'error': 'Account is deactivated'}), 401
            
            # Add user info to request context
            g.user = {
                'id': user.id,
                'email': user.email,
                'role': user.role
            }
            
            return f(*args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
        except Exception as e:
            print(f'Auth middleware error: {e}')
            return jsonify({'error': 'Authentication error'}), 500
    
    return decorated_function

def require_admin(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(g, 'user') or g.user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    return decorated_function

def optional_auth(f):
    """Optional authentication decorator (doesn't fail if no token)"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            auth_header = request.headers.get('Authorization')
            if auth_header:
                token = auth_header.split(' ')[1] if len(auth_header.split(' ')) > 1 else None
                if token:
                    payload = jwt.decode(token, os.getenv('JWT_SECRET', 'your-secret-key'), algorithms=['HS256'])
                    user = User.query.get(payload['id'])
                    
                    if user and user.is_active:
                        g.user = {
                            'id': user.id,
                            'email': user.email,
                            'role': user.role
                        }
        except:
            # Continue without authentication if token is invalid
            pass
        
        return f(*args, **kwargs)
    
    return decorated_function
