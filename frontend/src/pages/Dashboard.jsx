import { useState } from "react";
import GraphViewer from "../components/GraphViewer";
import ChatPanel from "../components/ChatPanel";

function Dashboard({ data, onReset }) {
  const [selectedNode, setSelectedNode] = useState(null);

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "1fr 340px",
      gridTemplateRows: "48px 1fr",
      height: "100vh",
      gap: "0",
      background: "#0f0f1a"
    }}>
      {/* Header */}
      <div style={{
        gridColumn: "1 / -1",
        display: "flex", alignItems: "center",
        justifyContent: "space-between",
        padding: "0 20px",
        background: "#1a1a2e",
        borderBottom: "1px solid #2a2a4a"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{
            fontSize: "16px", fontWeight: "700",
            background: "linear-gradient(135deg, #667eea, #764ba2)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent"
          }}>
            🔍 CodeLens AI
          </span>
          <span style={{
            fontSize: "12px", color: "#8080a0",
            background: "#252545", padding: "3px 10px",
            borderRadius: "20px"
          }}>
            ID: {data.codebase_id}
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
          {[
            { label: "Functions", value: data.nodes?.length || 0 },
            { label: "Relationships", value: data.edges?.length || 0 },
            { label: "Files", value: data.files_processed || 0 },
          ].map((stat) => (
            <div key={stat.label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "16px", fontWeight: "700", color: "#764ba2" }}>
                {stat.value}
              </div>
              <div style={{ fontSize: "10px", color: "#8080a0" }}>{stat.label}</div>
            </div>
          ))}
          <div style={{ display: "flex", gap: "6px" }}>
            {(data.languages || []).map((lang) => (
              <span key={lang} style={{
                fontSize: "11px", padding: "2px 8px",
                background: "#252545", border: "1px solid #764ba2",
                borderRadius: "10px", color: "#764ba2"
              }}>
                {lang}
              </span>
            ))}
          </div>
          <button onClick={onReset} style={{
            padding: "6px 14px", background: "transparent",
            border: "1px solid #3a3a6a", borderRadius: "8px",
            color: "#8080a0", cursor: "pointer", fontSize: "12px"
          }}>
            ← New Upload
          </button>
        </div>
      </div>

      {/* Graph */}
      <div style={{ padding: "16px", overflow: "hidden" }}>
        {/* Legend */}
        <div style={{
          display: "flex", gap: "16px",
          marginBottom: "10px", fontSize: "11px",
          color: "#8080a0"
        }}>
          <span>🟢 Rarely called</span>
          <span>🔴 Most called (critical)</span>
          <span>⚫ Drag to rearrange · Scroll to zoom</span>
        </div>
        <div style={{ height: "calc(100% - 30px)" }}>
          <GraphViewer
            nodes={data.nodes || []}
            edges={data.edges || []}
            fileMap={data.file_map || {}}
            onNodeClick={setSelectedNode}
          />
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        display: "flex", flexDirection: "column",
        gap: "12px", padding: "16px",
        borderLeft: "1px solid #2a2a4a",
        overflow: "hidden"
      }}>
        {/* Selected node info */}
        {selectedNode && (
          <div style={{
            background: "#1a1a2e", borderRadius: "12px",
            padding: "14px", border: "1px solid #764ba2",
            flexShrink: 0
          }}>
            <div style={{
              fontSize: "13px", fontWeight: "600",
              color: "#e0e0ff", marginBottom: "6px"
            }}>
              📌 {selectedNode.id}
            </div>
            <div style={{ fontSize: "12px", color: "#8080a0" }}>
              📁 {selectedNode.file}
            </div>
            <div style={{ fontSize: "12px", color: "#8080a0" }}>
              🔤 {selectedNode.language}
            </div>
          </div>
        )}

        {/* Chat panel */}
        <div style={{ flex: 1, overflow: "hidden" }}>
          <ChatPanel codebaseId={data.codebase_id} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;