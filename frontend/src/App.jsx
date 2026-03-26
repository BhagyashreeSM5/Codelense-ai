import { useState, useEffect } from "react";
import Upload from "./components/UploadPanel";
import Graph from "./components/GraphViewer";
import Chat from "./components/ChatPanel";import { getSharedCodebase } from "./api";

function App() {
  const [codebase, setCodebase] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/share\/([a-zA-Z0-9]+)/);
    if (match) {
      const id = match[1];
      const fetchShared = async () => {
        setLoading(true);
        try {
          const data = await getSharedCodebase(id);
          setCodebase(data);
        } catch {
          alert("Shared codebase not found!");
        } finally {
          setLoading(false);
        }
      };
      fetchShared();
    }
  }, []);

  const handleUploadSuccess = (data) => setCodebase(data);

  const handleReset = () => {
    setCodebase(null);
    window.history.pushState({}, "", "/");
  };

  const handleShare = () => {
    const url = `${window.location.origin}/share/${codebase.codebase_id}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center",
        background: "#1a1a2e", color: "white", fontSize: "18px"
      }}>
        🔍 Loading shared codebase...
      </div>
    );
  }

  if (!codebase) {
    return (
      <div style={{ minHeight: "100vh", background: "#1a1a2e" }}>
        <Upload onUploadSuccess={handleUploadSuccess} />
      </div>
    );
  }

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#1a1a2e" }}>
      {/* Header */}
      <div style={{
        padding: "12px 24px", background: "#16213e",
        borderBottom: "1px solid #2a2a4a",
        display: "flex", alignItems: "center", justifyContent: "space-between"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <h1 style={{
            fontSize: "20px", fontWeight: "700", margin: 0,
            background: "linear-gradient(135deg, #667eea, #a78bfa)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
          }}>
            🔍 CodeLens AI
          </h1>
          <span style={{
            fontSize: "12px", background: "#2a2a4a",
            padding: "3px 10px", borderRadius: "20px", color: "#888"
          }}>
            ID: {codebase.codebase_id}
          </span>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <span style={{ fontSize: "13px", color: "#888" }}>
            🔵 {codebase.nodes?.length} functions
          </span>
          <span style={{ fontSize: "13px", color: "#888" }}>
            🔗 {codebase.edges?.length} relationships
          </span>
          {codebase.languages?.map(lang => (
            <span key={lang} style={{
              fontSize: "12px", background: "#2d1b69",
              color: "#a78bfa", padding: "3px 10px",
              borderRadius: "20px", fontWeight: "500"
            }}>
              {lang}
            </span>
          ))}

          <button onClick={handleShare} style={{
            padding: "7px 16px",
            background: copied ? "#4CAF50" : "linear-gradient(135deg, #667eea, #764ba2)",
            color: "white", border: "none",
            borderRadius: "8px", cursor: "pointer",
            fontSize: "12px", fontWeight: "600"
          }}>
            {copied ? "✅ Copied!" : "🔗 Share Link"}
          </button>

          <button onClick={handleReset} style={{
            padding: "7px 14px", background: "#2a2a4a",
            color: "#888", border: "1px solid #3a3a5a",
            borderRadius: "8px", cursor: "pointer", fontSize: "12px"
          }}>
            ← New Upload
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1, display: "flex",
        overflow: "hidden", padding: "16px", gap: "16px"
      }}>
        <div style={{ flex: 1, minHeight: 0 }}>
          <Graph
            nodes={codebase.nodes}
            edges={codebase.edges}
            fileMap={codebase.file_map}
          />
        </div>
        <div style={{ width: "360px", minHeight: 0 }}>
          <Chat codebaseId={codebase.codebase_id} />
        </div>
      </div>
    </div>
  );
}

export default App;