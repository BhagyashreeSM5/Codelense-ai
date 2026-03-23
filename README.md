#  CodeLens AI

> Cloud-native codebase intelligence platform powered by RAG + LLMs

CodeLens AI helps developers — especially freshers — understand large legacy codebases instantly using AI. Upload any codebase and get an interactive visualization, dependency heatmap, and an AI assistant that answers questions about your code.

##  Features

1.Multi-language Support — Python, JavaScript, Java
2.Interactive AST Graph** — Visualize function relationships with D3.js
3.Color-coded nodes show critical functions
4.RAG-powered Chat** — Ask questions, get answers grounded in your actual code
5.ChromaDB for semantic code search

## AI/LLM Architecture
```
User uploads code
      ↓
AST Parser (tree-sitter) extracts functions & relationships
      ↓
Chunking → ChromaDB stores vector embeddings
      ↓
User asks question → Semantic search retrieves relevant chunks
      ↓
Gemini 2.0 Flash answers with grounded context (RAG)
```

## Tech Stack

| Layer | Technology |
|---|---|
| LLM | Google Gemini 2.0 Flash |
| RAG / Vector DB | ChromaDB |
| AST Parsing | tree-sitter (Python, JS, Java) |
| Backend | FastAPI + Python |
| Frontend | React + Vite + D3.js |
| Cloud | Firebase (Firestore, Storage, Hosting) |

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Add your GEMINI_API_KEY
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables
```
GEMINI_API_KEY=your_gemini_api_key
```

## Screenshots

*Coming soon*

## 🧪 RAG Implementation Details

- **Chunking strategy:** 50-line overlapping chunks per file
- **Embedding model:** ChromaDB built-in (all-MiniLM-L6-v2)
- **Retrieval:** Cosine similarity top-5 chunks
- **Context window:** Last 6 messages for conversation memory
- **Prompt engineering:** Role-based system prompt with explicit grounding instructions

## 👩‍💻 Author

Bhagyashree — Computer Science Student
```

