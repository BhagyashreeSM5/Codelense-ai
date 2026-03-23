from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uuid
import os
from dotenv import load_dotenv

load_dotenv()

# Import our custom modules
from parser.code_parser import parse_multiple_files
from rag.rag_engine import embed_codebase, chat_with_code, delete_codebase

# 🧠 WHY: FastAPI() creates our application instance
# Think of it like turning on the restaurant — now it can accept orders
app = FastAPI(title="CodeLens AI", version="1.0.0")

# 🧠 WHY CORS?
# Browser security blocks frontend (port 5173) from talking to backend (port 8000)
# CORS middleware tells the backend "yes, allow requests from these origins"
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🧠 WHY in-memory storage?
# We store codebase data in memory for now
# Later we'll move this to Firestore (cloud database)
codebases = {}


# ── Request/Response Models ──
# 🧠 WHY Pydantic models?
# They validate incoming data automatically
# If frontend sends wrong data type, FastAPI rejects it with clear error
class ChatRequest(BaseModel):
    codebase_id: str
    question: str
    chat_history: Optional[List[dict]] = []

class ChatResponse(BaseModel):
    answer: str
    codebase_id: str

class GraphResponse(BaseModel):
    nodes: list
    edges: list
    file_map: dict
    languages: list


# ── Routes ──

@app.get("/")
def root():
    """
    🧠 Health check endpoint
    Visit http://localhost:8000 to verify server is running
    """
    return {"message": "CodeLens AI is running!", "status": "ok"}


@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    """
    🧠 HOW IT WORKS:
    1. Receive uploaded files from frontend
    2. Read file contents
    3. Parse with AST parser → get nodes & edges
    4. Store in ChromaDB via RAG engine
    5. Return unique codebase_id + graph data

    Frontend sends files → We return graph to visualize
    """
    # Generate unique ID for this codebase
    # 🧠 uuid4() generates a random unique ID like "a3f2c1d4-..."
    codebase_id = str(uuid.uuid4())[:8]

    # Read all uploaded files
    file_list = []
    supported_extensions = {".py", ".js", ".jsx", ".java"}

    for file in files:
        # 🧠 WHY check extension?
        # We only support certain languages
        # Skip README.md, images, etc.
        _, ext = os.path.splitext(file.filename.lower())
        if ext not in supported_extensions:
            continue

        content = await file.read()
        try:
            # 🧠 decode() converts bytes → string
            # errors="ignore" skips unreadable characters
            text = content.decode("utf-8", errors="ignore")
            file_list.append({
                "path": file.filename,
                "content": text
            })
        except Exception:
            continue

    if not file_list:
        raise HTTPException(
            status_code=400,
            detail="No supported files found. Please upload .py, .js, .jsx, or .java files"
        )

    # Parse files with AST parser
    graph_data = parse_multiple_files(file_list)

    # Store in ChromaDB for RAG
    try:
        chunks_stored = embed_codebase(codebase_id, file_list)
    except Exception as e:
        chunks_stored = 0
        print(f"RAG embedding error: {e}")

    # Store codebase info in memory
    codebases[codebase_id] = {
        "files": [f["path"] for f in file_list],
        "graph": graph_data,
        "chunks": chunks_stored
    }

    # Get unique languages detected
    languages = list(set([
        info["language"]
        for info in graph_data["file_map"].values()
    ]))

    return {
        "codebase_id": codebase_id,
        "files_processed": len(file_list),
        "chunks_stored": chunks_stored,
        "nodes": graph_data["nodes"],
        "edges": graph_data["edges"],
        "file_map": graph_data["file_map"],
        "languages": languages,
        "message": f"Successfully analyzed {len(file_list)} files!"
    }


@app.get("/graph/{codebase_id}")
def get_graph(codebase_id: str):
    """
    🧠 WHY: Frontend can fetch graph data anytime using codebase_id
    This is used when sharing a codebase link with teammates
    """
    if codebase_id not in codebases:
        raise HTTPException(status_code=404, detail="Codebase not found")

    graph = codebases[codebase_id]["graph"]
    languages = list(set([
        info["language"]
        for info in graph["file_map"].values()
    ]))

    return {
        "nodes": graph["nodes"],
        "edges": graph["edges"],
        "file_map": graph["file_map"],
        "languages": languages
    }


@app.post("/chat")
async def chat(request: ChatRequest):
    """
    🧠 HOW IT WORKS:
    1. Receive question + codebase_id from frontend
    2. Search ChromaDB for relevant code chunks
    3. Send chunks + question to Gemini
    4. Return AI answer

    This is the full RAG pipeline in one endpoint!
    """
    if request.codebase_id not in codebases:
        raise HTTPException(status_code=404, detail="Codebase not found")

    try:
        answer = chat_with_code(
            codebase_id=request.codebase_id,
            question=request.question,
            chat_history=request.chat_history
        )
        return ChatResponse(
            answer=answer,
            codebase_id=request.codebase_id
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/codebase/{codebase_id}/info")
def get_codebase_info(codebase_id: str):
    """
    🧠 WHY: Returns metadata about a codebase
    Used by frontend to show file list, language stats etc.
    """
    if codebase_id not in codebases:
        raise HTTPException(status_code=404, detail="Codebase not found")

    info = codebases[codebase_id]
    return {
        "codebase_id": codebase_id,
        "files": info["files"],
        "total_functions": len(info["graph"]["nodes"]),
        "total_relationships": len(info["graph"]["edges"]),
        "chunks_stored": info["chunks"]
    }


@app.delete("/codebase/{codebase_id}")
def delete_codebase_endpoint(codebase_id: str):
    """
    🧠 WHY: Clean up when user is done
    Removes from memory AND from ChromaDB
    """
    if codebase_id not in codebases:
        raise HTTPException(status_code=404, detail="Codebase not found")

    delete_codebase(codebase_id)
    del codebases[codebase_id]
    return {"message": f"Codebase {codebase_id} deleted successfully"}