# TenderAI

TenderAI is an **AI Tender Evaluation Platform** designed to automate and streamline the evaluation of bidder proposals against official tender documents. It leverages Generative AI and OCR (via PyMuPDF, Pillow, and Google Generative AI) to parse documents, extract relevant technical and financial criteria, and generate actionable insights and confidence scores for procurement officers.

## Features

- **Automated Document Analysis**: Upload tender notices and bidder proposals (PDF or images) to automatically extract requirements and qualifications.
- **AI-Powered Evaluation**: Automatically compares bidder capabilities against tender criteria (financial turnover, technical projects, compliance).
- **Interactive Dashboard**: View a summary of evaluated bidders, overall confidence scores, and items needing manual review.
- **Side-by-side Document Preview**: Compare original tender documents and bidder proposals directly in the browser.
- **Analytics & Comparison**: Visual charts and side-by-side comparison tables to evaluate multiple bidders simultaneously.

## Tech Stack

- **Backend**: FastAPI, Python 3, Uvicorn, Google Generative AI API (Gemini), PyMuPDF (fitz), Pillow.
- **Frontend**: Vanilla HTML5, CSS3, JavaScript, Chart.js (for analytics), Lucide Icons.

## Project Structure

```
TenderAI/
├── backend/               # FastAPI backend
│   ├── evaluation/        # AI evaluation logic
│   ├── extraction/        # Document data extraction logic
│   ├── ocr/               # OCR utilities
│   ├── utils/             # Document processing helpers
│   ├── uploads/           # Temporarily stores uploaded documents
│   ├── main.py            # FastAPI application entry point
│   └── .env               # Environment variables (API keys)
├── frontend/              # Web application interface
│   ├── index.html         # Main UI
│   ├── script.js          # Client-side logic and API integration
│   └── style.css          # Styling
├── data/                  # Sample data/documents
└── requirements.txt       # Python dependencies
```

## Getting Started

### Prerequisites

- Python 3.8+
- Node.js (optional, for serving frontend via `http-server` or `live-server`)
- A Google Gemini API Key

### Backend Setup

1. Open a terminal and navigate to the `backend` directory (or project root, depending on your setup).
2. Create and activate a virtual environment:
   ```bash
   python -m venv .venv
   # On Windows:
   .\.venv\Scripts\activate
   # On macOS/Linux:
   source .venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Create a `.env` file in the `backend` directory (if not already present) and add your Gemini API Key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
5. Start the FastAPI server:
   ```bash
   cd backend
   uvicorn main:app --reload --port 8000
   ```
   The backend will be available at `http://localhost:8000`. You can test the API via Swagger UI at `http://localhost:8000/docs`.

### Frontend Setup

The frontend is built with pure HTML, CSS, and JS, so it doesn't require a build step.

1. Navigate to the `frontend` directory.
2. Start a simple local server to avoid CORS issues. You can use Python's built-in server:
   ```bash
   cd frontend
   python -m http.server 3000
   ```
3. Open your browser and navigate to `http://localhost:3000`.



## Usage
<img width="1600" height="828" alt="image" src="https://github.com/user-attachments/assets/f9a6ebd1-0810-43cf-8809-05ee124be07a" />
![Uploading image.png…]()
![Uploading image.png…]()



1. Open the **Dashboard** in the web app.
2. Under the "Action Cards" section, upload a **Tender Document** and a **Bidder Document**.
3. Click **Run AI Evaluation**.
4. The system will process the documents, perform extraction and evaluation, and append the results to the "Bidder Evaluation Results" table.
5. Click **View Details** on any bidder to open the Detailed Analysis Modal and review AI summaries, confidence metrics, criteria verifications, and document previews.

## License

This project is licensed under the MIT License.
