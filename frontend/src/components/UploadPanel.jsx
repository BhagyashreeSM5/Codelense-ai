import { useState } from "react";
import { uploadFiles } from "../api";

function UploadPanel({ onUploadSuccess }) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFiles = async (files) => {
    if (!files.length) return;
    setLoading(true);
    setError(null);

    try {
      const result = await uploadFiles(Array.from(files));
      onUploadSuccess(result);
    } catch (err) {
      setError(err.response?.data?.detail || "Upload failed. Try again.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      minHeight: "100vh", padding: "20px"
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px" }}>
        <h1 style={{
          fontSize: "36px", fontWeight: "700",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: "8px"
        }}>
          🔍 CodeLens AI
        </h1>
        <p style={{ color: "#8080a0", fontSize: "15px" }}>
          Upload your codebase — AI will analyze, visualize and explain it
        </p>
        <div style={{
          display: "flex", gap: "10px",
          justifyContent: "center", marginTop: "12px",
          flexWrap: "wrap"
        }}>
          {["Python", "JavaScript", "Java"].map((lang) => (
            <span key={lang} style={{
              fontSize: "12px", padding: "3px 10px",
              background: "#1a1a2e", border: "1px solid #764ba2",
              borderRadius: "20px", color: "#764ba2"
            }}>
              {lang}
            </span>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        style={{
          width: "100%", maxWidth: "500px",
          border: `2px dashed ${dragging ? "#764ba2" : "#3a3a6a"}`,
          borderRadius: "16px", padding: "48px 24px",
          textAlign: "center", cursor: "pointer",
          background: dragging ? "#1a1a2e" : "transparent",
          transition: "all 0.2s"
        }}
        onClick={() => document.getElementById("file-input").click()}
      >
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📁</div>
        <div style={{ fontSize: "16px", color: "#e0e0ff", marginBottom: "8px" }}>
          {loading ? "Analyzing your code..." : "Drop files here or click to upload"}
        </div>
        <div style={{ fontSize: "13px", color: "#8080a0" }}>
          Supports .py, .js, .jsx, .java files
        </div>
        {loading && (
          <div style={{
            marginTop: "16px", color: "#764ba2",
            fontSize: "13px"
          }}>
            ⚙️ Parsing AST, building graph, embedding vectors...
          </div>
        )}
        <input
          id="file-input"
          type="file"
          multiple
          accept=".py,.js,.jsx,.java"
          style={{ display: "none" }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {error && (
        <div style={{
          marginTop: "16px", color: "#ff4444",
          fontSize: "13px", textAlign: "center"
        }}>
          ⚠️ {error}
        </div>
      )}
    </div>
  );
}

export default UploadPanel;