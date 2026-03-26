import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000",
});

export const uploadFiles = async (files) => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const response = await API.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getGraph = async (codebaseId) => {
  const response = await API.get(`/graph/${codebaseId}`);
  return response.data;
};

export const getSharedCodebase = async (codebaseId) => {
  const response = await API.get(`/share/${codebaseId}`);
  return response.data;
};

export const sendChat = async (codebaseId, question, chatHistory) => {
  const response = await API.post("/chat", {
    codebase_id: codebaseId,
    question: question,
    chat_history: chatHistory,
  });
  return response.data;
};