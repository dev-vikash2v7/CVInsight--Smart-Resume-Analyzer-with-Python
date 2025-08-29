#!/usr/bin/env python3
"""
Startup script for the Python Flask Resume Analyzer
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def main():
    """Start the Flask server"""
    print("🚀 Starting Smart AI Resume Analyzer - Python Flask Version")
    print("=" * 60)
    
    # Check if required environment variables are set
    required_vars = ['MONGODB_URI', 'JWT_SECRET']
    missing_vars = [var for var in required_vars if not os.getenv(var)]
    
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        print("Please create a .env file with the required variables.")
        print("See README_PYTHON.md for details.")
        sys.exit(1)
    
    # Set default values
    port = int(os.getenv('PORT', 5000))
    debug = os.getenv('FLASK_ENV', 'development') == 'development'
    
    print(f"📡 Server will start on port {port}")
    print(f"🔧 Debug mode: {'enabled' if debug else 'disabled'}")
    print(f"🗄️  Database: {os.getenv('MONGODB_URI', 'mongodb://localhost:27017/resume-analyzer')}")
    print("=" * 60)
    
    try:
        # Import and run the Flask app
        from app import app
        
        print("✅ Flask application loaded successfully")
        print("🌐 Starting server...")
        print("📝 Press Ctrl+C to stop the server")
        print("=" * 60)
        
        app.run(
            host='0.0.0.0',
            port=port,
            debug=debug,
            use_reloader=debug
        )
        
    except ImportError as e:
        print(f"❌ Error importing Flask application: {e}")
        print("Please make sure all dependencies are installed:")
        print("pip install -r requirements.txt")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
