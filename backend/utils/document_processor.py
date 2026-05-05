import os
import fitz  # PyMuPDF
from PIL import Image
import io

def get_document_content(file_path):
    """
    Returns text if it's a text-based PDF, 
    otherwise returns the file path for multimodal processing.
    """
    ext = os.path.splitext(file_path)[1].lower()
    
    if ext == ".pdf":
        text = ""
        try:
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
            
            # If text is substantial, return it
            if len(text.strip()) > 200:
                return {"type": "text", "content": text}
        except Exception as e:
            print(f"Error reading PDF text: {e}")
            
        # Fallback to multimodal for scanned PDFs
        return {"type": "file", "content": file_path, "mime_type": "application/pdf"}
    
    elif ext in [".jpg", ".jpeg", ".png"]:
        return {"type": "file", "content": file_path, "mime_type": f"image/{ext[1:]}"}
    
    return None
