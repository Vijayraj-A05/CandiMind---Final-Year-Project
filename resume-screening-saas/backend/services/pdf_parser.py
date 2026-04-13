import PyPDF2
import io

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts text from a uploaded PDF file.
    """
    try:
        reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        return text.strip()
    except Exception as e:
        print(f"Error parsing PDF: {e}")
        return ""


