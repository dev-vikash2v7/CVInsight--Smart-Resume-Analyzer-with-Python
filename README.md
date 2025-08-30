# CVInsight - Smart AI Resume Analyzer 

A modern, AI-powered resume analysis and building platform built with  Python Full stack tools(Python , Flask , React , SQL).

## 🚀 Features

### Core Features
- **AI-Powered Resume Analysis**: Get detailed insights using Google Gemini AI
- **Standard Resume Analysis**: Traditional keyword matching and ATS optimization
- **Resume Builder**: Create professional resumes with multiple templates
- **File Upload Support**: PDF, DOCX, and DOC file formats
- **Real-time Analysis**: Instant feedback and scoring
- **Analysis History**: Track your progress over time

### Technical Features
- **Modern UI/UX**: Beautiful, responsive design with dark theme
- **Authentication**: JWT-based user authentication and authorization
- **Admin Dashboard**: Comprehensive analytics and user management
- **File Processing**: Advanced PDF and DOCX text extraction
- **API Integration**: Google Gemini AI for intelligent analysis
- **Database**: MongoDB with Mongoose ODM
- **Security**: Rate limiting, input validation, and secure file handling

## Tech Stack

- **Backend**: Python Flask
- **Database**: MongoDB with MongoEngine ODM
- **Authentication**: JWT (PyJWT)
- **File Processing**: PyPDF2, python-docx
- **AI Integration**: Google Generative AI
- **Security**: bcrypt for password hashing
- **CORS**: Flask-CORS
- **Rate Limiting**: Flask-Limiter
- **Compression**: Flask-Compress

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd server
   ```

2. **Create a virtual environment**
   ```bash


   python -m venv venv
   
   # On Windows
   venv\Scripts\activate
   
   # On macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   # Server Configuration
   PORT=5000
   FLASK_ENV=development
  
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   
   # Client URL (for CORS)
   CLIENT_URL=client_url
   
   # AI API Keys
   GOOGLE_API_KEY=your-google-gemini-api-key
   

   ```
5. **Run the application**
   ```bash
   python app.py
   ```


The server will start on `http://localhost:5000`
