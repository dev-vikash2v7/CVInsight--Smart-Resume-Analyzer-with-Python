import PyPDF2
from docx import Document
import os

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ''
            for page in pdf_reader.pages:
                text += page.extract_text()
            return text
    except Exception as e:
        print(f'PDF parsing error: {e}')
        raise Exception('Failed to parse PDF file')

def extract_text_from_docx(file_path):
    """Extract text from DOCX file"""
    try:
        doc = Document(file_path)
        text = ''
        for paragraph in doc.paragraphs:
            text += paragraph.text + '\n'
        return text
    except Exception as e:
        print(f'DOCX parsing error: {e}')
        raise Exception('Failed to parse DOCX file')

def extract_text_from_file(file_path, file_type):
    """Extract text from file based on file type"""
    try:
        if file_type.lower() == 'pdf':
            return extract_text_from_pdf(file_path)
        elif file_type.lower() in ['docx', 'doc']:
            return extract_text_from_docx(file_path)
        else:
            raise Exception('Unsupported file type')
    except Exception as e:
        print(f'File parsing error: {e}')
        raise e
