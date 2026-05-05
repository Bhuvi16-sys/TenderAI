import os
import re
import json
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_KEY"))


def parse_json_response(content):
    content = content.strip()
    if content.startswith("```"):
        content = re.sub(r"^```(?:json)?", "", content, flags=re.IGNORECASE).replace("```", "").strip()

    try:
        return json.loads(content)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", content, flags=re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    return None


def extract_bidder_info(doc_data):
    """
    doc_data can be:
    - {"type": "text", "content": "..."}
    - {"type": "file", "content": "path/to/file", "mime_type": "..."}
    """
    
    prompt = """
You are an expert system extracting structured data from bidder documents.

Extract the following fields STRICTLY in JSON format:

{
  "company_name": "",
  "financial": {
    "avg_turnover": null,
    "net_worth": null,
    "solvency": null
  },
  "technical": {
    "projects_completed": null,
    "years_in_business": null,
    "has_iso": false
  },
  "compliance": {
    "gst_number": "",
    "pan_number": ""
  }
}

Rules:
- company_name: Name of the bidding firm
- financial values: Convert to numbers where possible (e.g., 5 Cr -> 50000000)
- projects_completed: Number of relevant projects mentioned
- years_in_business: Based on date of incorporation or experience
- If not found, return null
- DO NOT use markdown, return only the JSON object.
"""

    model = genai.GenerativeModel('gemini-2.5-flash')
    
    content_parts = [prompt]
    
    if doc_data["type"] == "text":
        content_parts.append(f"TEXT CONTENT:\n{doc_data['content']}")
    else:
        # For files, we need to read the bytes if it's an image, or use the file API
        # For simplicity in this demo, let's use the path if it's a small file, or upload
        # Gemini Python SDK supports passing bytes for images
        if doc_data["mime_type"].startswith("image/"):
            with open(doc_data["content"], "rb") as f:
                image_data = f.read()
            content_parts.append({"mime_type": doc_data["mime_type"], "data": image_data})
        else:
            # For PDFs, we should ideally use the File API if they are large
            # But for 1.5 flash, we can often just pass the bytes if they are reasonable
            with open(doc_data["content"], "rb") as f:
                file_data = f.read()
            content_parts.append({"mime_type": doc_data["mime_type"], "data": file_data})

    response = model.generate_content(
        content_parts,
        generation_config=genai.GenerationConfig(temperature=0)
    )
    content = response.text or ""

    data = parse_json_response(content)
    if data is None:
        print("WARNING: JSON parsing failed")
        print("Raw output:\n", content)
    return data