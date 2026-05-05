from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import os

from utils.document_processor import get_document_content
from utils.text_cleaner import clean_text
from extraction.bidder_extractor import extract_bidder_info
from extraction.tender_extractor import extract_tender_criteria
from evaluation.evaluator import evaluate_bidder
from evaluation.explanation_engine import generate_final_output

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# Mount the uploads directory to serve files
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

@app.post("/analyze")
async def evaluate(tender: UploadFile = File(...), bidder: UploadFile = File(...)):
    try:
        tender_path = os.path.join(UPLOAD_DIR, tender.filename)
        bidder_path = os.path.join(UPLOAD_DIR, bidder.filename)

        # Save files
        with open(tender_path, "wb") as buffer:
            shutil.copyfileobj(tender.file, buffer)

        with open(bidder_path, "wb") as buffer:
            shutil.copyfileobj(bidder.file, buffer)

        # 🔹 Tender processing
        tender_doc = get_document_content(tender_path)
        if tender_doc["type"] == "text":
            tender_doc["content"] = clean_text(tender_doc["content"])
        
        tender_criteria = extract_tender_criteria(tender_doc) or {}

        # 🔹 Bidder processing
        bidder_doc = get_document_content(bidder_path)
        if bidder_doc["type"] == "text":
            bidder_doc["content"] = clean_text(bidder_doc["content"])
            
        bidder_info = extract_bidder_info(bidder_doc) or {}
        
        # Ensure company_name is at top level for backward compatibility if needed
        bidder_name = bidder_info.get("company_name", "Unknown Bidder")

        # 🔹 Evaluation
        results = evaluate_bidder(bidder_info, tender_criteria)

        final_output = generate_final_output(
            bidder_name=bidder_name,
            results=results
        )

        # Calculate confidence (simplified)
        confidence = {
            "financial": 0.9 if bidder_info.get("financial", {}).get("avg_turnover") else 0.5,
            "technical": 0.9 if bidder_info.get("technical", {}).get("projects_completed") else 0.5,
            "compliance": 1.0 if bidder_info.get("compliance", {}).get("gst_number") else 0.0
        }

        summary = f"""
        Bidder {bidder_name} has been evaluated.
        - Financial Status: {final_decision_category(results.get('financial', {}))}
        - Technical Status: {final_decision_category(results.get('technical', {}))}
        - Overall Decision: {final_output['final_status']}
        """

        return {
            "criteria": tender_criteria,
            "bidder": bidder_info,
            "result": final_output,
            "confidence": confidence,
            "summary": summary,
            "files": {
                "tender": tender.filename,
                "bidder": bidder.filename
            }
        }
    except Exception as e:
        import traceback
        print(f"Error during analysis: {str(e)}")
        print(traceback.format_exc())
        return JSONResponse(status_code=500, content={"error": str(e), "status": "error"})

def final_decision_category(category_results):
    if not category_results: return "N/A"
    statuses = [v["status"] for v in category_results.values()]
    if "Not Eligible" in statuses: return "Not Eligible"
    if "Needs Review" in statuses: return "Needs Review"
    return "Eligible"