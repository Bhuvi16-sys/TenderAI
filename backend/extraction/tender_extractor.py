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


def extract_tender_criteria(doc_data):
    """
    doc_data can be:
    - {"type": "text", "content": "..."}
    - {"type": "file", "content": "path/to/file", "mime_type": "..."}
    """
    
    prompt = """
You are an expert in analyzing Indian government tenders.

Extract the following criteria in STRICT JSON format:

{
  "financial": {
    "turnover_min": null,
    "net_worth_min": null,
    "solvency_min": null
  },
  "technical": {
    "projects_min": null,
    "experience_years_min": null,
    "iso_required": false
  },
  "compliance": {
    "gst_required": false,
    "pan_required": false
  }
}

Rules:
- turnover_min: Extract minimum annual turnover required (in Crore/Lakh)
- net_worth_min: Extract minimum net worth required
- projects_min: Extract minimum number of similar projects required
- experience_years_min: Extract minimum years of experience required
- iso_required: true if ISO certification is mandatory
- Convert values clearly (e.g., Rs 5 Cr → 50000000)
- If a value is not found, return null
- DO NOT use markdown, return only the JSON object.
"""

    model = genai.GenerativeModel('gemini-2.5-flash')
    
    content_parts = [prompt]
    
    if doc_data["type"] == "text":
        content_parts.append(f"TEXT CONTENT:\n{doc_data['content']}")
    else:
        if doc_data["mime_type"].startswith("image/"):
            with open(doc_data["content"], "rb") as f:
                image_data = f.read()
            content_parts.append({"mime_type": doc_data["mime_type"], "data": image_data})
        else:
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
        print("WARNING: Tender JSON parsing failed")
        print("Raw output:\n", content)
    return data