"""
File handling service for creator uploads
Handles PDF, TXT, DOC, DOCX files
"""
import os
import shutil
from datetime import datetime
from typing import Optional
from fastapi import UploadFile, HTTPException

class FileHandler:
    """Service for handling file uploads"""
    
    UPLOAD_BASE_DIR = "uploads"
    CREATOR_CONTENT_DIR = "creator_content"
    ALLOWED_EXTENSIONS = ['.pdf', '.txt', '.doc', '.docx', '.md']
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    def __init__(self):
        self.upload_path = os.path.join(self.UPLOAD_BASE_DIR, self.CREATOR_CONTENT_DIR)
        os.makedirs(self.upload_path, exist_ok=True)
    
    def validate_file(self, file: UploadFile) -> bool:
        """Validate file type and size"""
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Check file extension
        file_ext = os.path.splitext(file.filename or '')[1].lower()
        if file_ext not in self.ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(self.ALLOWED_EXTENSIONS)}"
            )
        
        return True
    
    def save_file(self, file: UploadFile, creator_id: int, category: str) -> str:
        """Save uploaded file to disk"""
        self.validate_file(file)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_ext = os.path.splitext(file.filename or "file.bin")[1].lower()
        safe_filename = f"{creator_id}_{category}_{timestamp}{file_ext}"
        
        # Create subdirectory for category
        category_path = os.path.join(self.upload_path, category)
        os.makedirs(category_path, exist_ok=True)
        
        # Full file path
        file_path = os.path.join(category_path, safe_filename)
        
        try:
            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            
            return file_path
        
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to save file: {str(e)}"
            )
        finally:
            file.file.close()
    
    def delete_file(self, file_path: str) -> bool:
        """Delete a file from disk"""
        try:
            if os.path.exists(file_path):
                os.remove(file_path)
                return True
            return False
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Failed to delete file: {str(e)}"
            )
    
    def get_file_info(self, file_path: str) -> Optional[dict]:
        """Get file information"""
        if not os.path.exists(file_path):
            return None
        
        stat_info = os.stat(file_path)
        
        return {
            "file_path": file_path,
            "file_name": os.path.basename(file_path),
            "file_size": stat_info.st_size,
            "file_size_mb": round(stat_info.st_size / (1024 * 1024), 2),
            "created_at": datetime.fromtimestamp(stat_info.st_ctime),
            "modified_at": datetime.fromtimestamp(stat_info.st_mtime)
        }
    
    def extract_text_from_file(self, file_path: str) -> Optional[str]:
        """Extract text content from file"""
        if not os.path.exists(file_path):
            return None
        
        file_ext = os.path.splitext(file_path)[1].lower()
        
        try:
            if file_ext == '.txt' or file_ext == '.md':
                # Plain text files
                with open(file_path, 'r', encoding='utf-8') as f:
                    return f.read()
            
            elif file_ext == '.pdf':
                # PDF extraction (requires PyPDF2 or pdfplumber)
                try:
                    import PyPDF2  # type: ignore[import-not-found]
                    with open(file_path, 'rb') as f:
                        pdf_reader = PyPDF2.PdfReader(f)
                        text = ""
                        for page in pdf_reader.pages:
                            text += page.extract_text()
                        return text
                except ImportError:
                    return "[PDF text extraction requires PyPDF2 library]"
            
            elif file_ext in ['.doc', '.docx']:
                # Word document extraction (requires python-docx)
                try:
                    from docx import Document  # type: ignore[import-not-found]
                    doc = Document(file_path)
                    text = ""
                    for paragraph in doc.paragraphs:
                        text += paragraph.text + "\n"
                    return text
                except ImportError:
                    return "[Word document extraction requires python-docx library]"
            
            else:
                return None
        
        except Exception as e:
            return f"[Error extracting text: {str(e)}]"


# Global file handler instance
file_handler = FileHandler()

