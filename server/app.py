from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_compress import Compress
from models import db
from datetime import datetime
import os

from dotenv import load_dotenv
load_dotenv()

from routes.auth_routes import auth_bp
from routes.resume_routes import resume_bp
from routes.analysis_routes import analysis_bp
from routes.admin_routes import admin_bp


# Initialize Flask app
app = Flask(__name__)

# Configuration
app.config['SECRET_KEY'] = os.getenv('JWT_SECRET')
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'sqlite:///resume_analyzer.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize extensions
db.init_app(app)
CORS(app, origins=[os.getenv('CLIENT_URL', 'http://localhost:3000')], supports_credentials=True)
Compress(app)

# Rate limiting
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["100 per 15 minutes"]
)

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(resume_bp, url_prefix='/api/resume')
app.register_blueprint(analysis_bp, url_prefix='/api/analysis')
app.register_blueprint(admin_bp, url_prefix='/api/admin')

# Health check endpoint
@app.route('/')
def init():
    return jsonify({
        'status': 'OK',
        'message': 'CVInsight API is running',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/health')
def health_check():
    return jsonify({
        'status': 'OK',
        'message': 'Server is running',
        'timestamp': datetime.utcnow().isoformat()
    })

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Route not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        'error': 'Something went wrong!',
        'message': 'Internal server error' if app.config.get('ENV') != 'development' else str(error)
    }), 500

@app.errorhandler(429)
def ratelimit_handler(e):
    return jsonify({'error': 'Rate limit exceeded'}), 429

if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('NODE_ENV', 'development') == 'development'
    app.run(host='0.0.0.0', port=port, debug=debug)
