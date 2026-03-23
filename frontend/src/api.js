import axios from "axios";

// 🧠 Base URL of our FastAPI backend
const BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000, // 30 seconds — parsing large codebases takes time
});

// Upload files to backend
export const uploadFiles = async (files) => {
  const formData = new FormData();
  // 🧠 FormData is used for file uploads
  // We append each file with the key "files"
  files.forEach((file) => formData.append("files", file));

  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Get graph data for a codebase
export const getGraph = async (codebaseId) => {
  const response = await api.get(`/graph/${codebaseId}`);
  return response.data;
};

// Chat with AI about the codebase
export const chatWithCode = async (codebaseId, question, chatHistory = []) => {
  const response = await api.post("/chat", {
    codebase_id: codebaseId,
    question,
    chat_history: chatHistory,
  });
  return response.data;
};

// Get codebase info
export const getCodebaseInfo = async (codebaseId) => {
  const response = await api.get(`/codebase/${codebaseId}/info`);
  return response.data;
};




// All API calls in one place — if backend URL changes, we only update one file!