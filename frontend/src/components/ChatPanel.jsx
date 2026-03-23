import { useState } from "react";
import { chatWithCode } from "../api";

function ChatPanel({ codebaseId }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "👋 Hi! I've analyzed your codebase. Ask me anything about the code!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      // 🧠 Send question + chat history so Gemini has context
      const response = await chatWithCode(
        codebaseId,
        input,
        newMessages.slice(-6) // last 6 messages
      );
      setMessages([
        ...newMessages,
        { role: "assistant", content: response.answer },
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "⚠️ Error getting response. Check your Gemini API key.",
        },
      ]);
    }
    setLoading(false);
  };

  return (
    <div style={{
      display: "flex", flexDirection: "column",
      height: "100%", background: "#1a1a2e",
      borderRadius: "12px", overflow: "hidden"
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 16px",
        borderBottom: "1px solid #2a2a4a",
        fontSize: "14px", fontWeight: "500",
        color: "#e0e0ff"
      }}>
        🤖 AI Code Chat
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: "auto",
        padding: "16px", display: "flex",
        flexDirection: "column", gap: "12px"
      }}>
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: "flex",
            justifyContent: msg.role === "user" ? "flex-end" : "flex-start"
          }}>
            <div style={{
              maxWidth: "85%", padding: "10px 14px",
              borderRadius: msg.role === "user"
                ? "16px 16px 4px 16px"
                : "16px 16px 16px 4px",
              background: msg.role === "user" ? "#764ba2" : "#252545",
              color: "#e0e0ff", fontSize: "13px",
              lineHeight: "1.6", whiteSpace: "pre-wrap"
            }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ color: "#764ba2", fontSize: "13px" }}>
            🤔 Thinking...
          </div>
        )}
      </div>

      {/* Input */}
      <div style={{
        padding: "12px", borderTop: "1px solid #2a2a4a",
        display: "flex", gap: "8px"
      }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask about the code..."
          style={{
            flex: 1, padding: "10px 14px",
            background: "#252545", border: "1px solid #3a3a6a",
            borderRadius: "10px", color: "#e0e0ff",
            fontSize: "13px", outline: "none"
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            padding: "10px 16px",
            background: loading ? "#3a3a6a" : "#764ba2",
            color: "white", border: "none",
            borderRadius: "10px", cursor: "pointer",
            fontSize: "13px", fontWeight: "600"
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default ChatPanel;