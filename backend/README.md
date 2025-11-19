# PDF Compliance Checker

A full-stack web application that uses AI (OpenAI GPT-4o-mini) to check PDF documents against custom compliance rules.

![App Screenshot](screenshots/working-ui.png)

## 🎯 Features

- 📄 Upload PDF documents (2-10 pages)
- ✍️ Define 3 custom compliance rules
- 🤖 AI-powered analysis using OpenAI
- ✅ PASS/FAIL results with evidence and reasoning
- 📊 Confidence scores (0-100) for each rule

## 🛠️ Tech Stack

**Frontend:**
- React 18 (via CDN)
- Tailwind CSS
- Vanilla JavaScript

**Backend:**
- Node.js + Express
- pdf-parse for PDF text extraction
- OpenAI API (gpt-4o-mini)
- Axios for HTTP requests

## 📋 Prerequisites

- Node.js 16+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Web browser (Chrome, Firefox, Edge, Safari)

## 🚀 Setup Instructions

### Backend Setup

1. **Navigate to backend folder:**
```bash
   cd backend
```

2. **Install dependencies:**
```bash
   npm install
```

3. **Configure environment variables:**
```bash
   cp .env.example .env
```

4. **Edit `.env` file and add your OpenAI API key:**
```
   OPENAI_API_KEY=sk-proj-your-actual-key-here
   PORT=3000
```

5. **Start the backend server:**
```bash
   npm start
```

   You should see:
```
   🚀 Server running on port 3000
   📝 OpenAI API Key: ✅ Found
```

### Frontend Setup

1. **Navigate to frontend folder:**
```bash
   cd frontend
```

2. **Start a local web server:**
   
   **Option A - Python:**
```bash
   python -m http.server 8000
```

   **Option B - Node.js:**
```bash
   npx http-server -p 8000
```

3. **Open browser:**
```
   http://localhost:8000
```

## 📖 Usage Guide

1. **Upload PDF**: Click the upload area and select a PDF file (2-10 pages recommended)

2. **Enter Rules**: Type compliance rules in the 3 text boxes. Examples:
   - "The document must contain a title"
   - "The document must mention at least one date"
   - "The document must define at least one term"

3. **Check Document**: Click "Check Document" button

4. **View Results**: See pass/fail status with:
   - Evidence from the document
   - AI reasoning
   - Confidence score (0-100%)

## 🎨 Example Rules
```
✅ "The document must have a purpose section"
✅ "The document must mention at least one date"
✅ "The document must define at least one term"
✅ "The document must mention who is responsible"
✅ "The document must list any requirements"
```

## 📡 API Endpoints

### POST `/api/extract-pdf`
Extract text from uploaded PDF

**Request:**
- Body: `FormData` with `pdf` file

**Response:**
```json
{
  "text": "Extracted PDF content..."
}
```

### POST `/api/check-rules`
Check compliance rules against document text

**Request:**
```json
{
  "text": "Document content...",
  "rules": ["Rule 1", "Rule 2", "Rule 3"]
}
```

**Response:**
```json
{
  "results": [
    {
      "rule": "The document must contain a title",
      "status": "pass",
      "evidence": "Found title: 'Annual Report 2024'",
      "reasoning": "Document clearly displays a title at the top",
      "confidence": 95
    }
  ]
}
```

## 🔧 Troubleshooting

### Backend won't start
- Check if Node.js is installed: `node --version`
- Verify dependencies are installed: `npm install`
- Check if port 3000 is available

### "Rate limit exceeded" error
- Add credits to your OpenAI account
- Wait a moment between requests
- The app automatically retries with delays

### PDF upload fails
- Ensure PDF is not password-protected
- Try a different PDF (Google Docs or Word generated)
- Check PDF is under 10 pages

### Blank frontend page
- Check browser console (F12) for errors
- Verify backend is running on port 3000
- Try hard refresh (Ctrl + F5)

## 📁 Project Structure
```
pdf-compliance-checker/
├── backend/
│   ├── server.js              # Express server with API endpoints
│   ├── package.json           # Dependencies
│   ├── .env.example           # Environment template
│   └── README.md
├── frontend/
│   ├── index.html             # Main HTML page
│   ├── app.js                 # React component
│   └── README.md
├── screenshots/
│   └── working-ui.png         # App screenshot
└── README.md                  # This file
```

## 🎯 Design Decisions

1. **Sequential Rule Processing**: Rules are checked one-by-one with 1-second delays to avoid rate limiting

2. **Retry Logic**: Automatic retry (3 attempts) with exponential backoff for rate limit errors

3. **Error Handling**: Comprehensive error messages for common issues (corrupted PDF, rate limits, etc.)

4. **CDN-based Frontend**: No build step required - works immediately in browser

## 📝 License

MIT

## 👤 Author

[Your Name]

## 📧 Contact

For questions or issues, please contact: [your-email@example.com]