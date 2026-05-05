import fitz  # PyMuPDF


def extract_text_from_pdf(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""

    for page in doc:
        text += page.get_text()

    return text


def process_pdf(pdf_path):
    print(f"Processing: {pdf_path}")

    text = extract_text_from_pdf(pdf_path)

    # If very little text → likely scanned
    if len(text.strip()) < 100:
        print("WARNING: Low text detected - Possibly scanned PDF")
        return None

    print("SUCCESS: Text successfully extracted")
    return text