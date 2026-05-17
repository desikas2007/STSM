import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { ai } from "../services/api";

export default function AIAssistant({ open, onClose }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          text: `Hello! I'm SafeBot, your AI safety assistant. I can help with safety advice, emergency info, and local tips for ${user?.location || "your area"}. How can I help?`,
        },
      ]);
    }
  }, [open, user?.location]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const send = async (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", text: msg }]);
    setTyping(true);
    try {
      const { data } = await ai.chat(msg, user?.location);
      setMessages((m) => [...m, { role: "assistant", text: data.reply }]);
    } catch (error) {
      let errorMsg = "Sorry, I could not reach the safety server. Try again.";
      if (error.response?.status === 500) {
        const details = error.response.data?.details || error.response.data?.error;
        errorMsg = details 
          ? `Server error: ${error.response.data.message}. ${details}`
          : "Server error: Unable to process request. Please contact support.";
      } else if (error.response?.status === 400) {
        errorMsg = error.response.data?.message || "Invalid request. Please check your input.";
      }
      setMessages((m) => [
        ...m,
        { role: "assistant", text: errorMsg },
      ]);
    } finally {
      setTyping(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.5)",
              zIndex: 900,
            }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28 }}
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "min(100%, 380px)",
              height: "100dvh",
              background: "#111827",
              borderLeft: "1px solid rgba(0,212,255,0.2)",
              zIndex: 901,
              display: "flex",
              flexDirection: "column",
              paddingBottom: "env(safe-area-inset-bottom)",
            }}
          >
            <header
              style={{
                padding: "16px",
                borderBottom: "1px solid rgba(0,212,255,0.15)",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h3 className="orbitron" style={{ fontSize: "0.95rem", color: "#00D4FF" }}>
                SafeBot — AI Safety Assistant
              </h3>
              <button type="button" onClick={onClose} style={{ background: "none", color: "#9ca3af" }}>
                <X size={22} />
              </button>
            </header>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    padding: "10px 14px",
                    borderRadius: 12,
                    background:
                      m.role === "user"
                        ? "rgba(0, 212, 255, 0.2)"
                        : "rgba(0, 0, 0, 0.35)",
                    border:
                      m.role === "user"
                        ? "1px solid rgba(0,212,255,0.3)"
                        : "1px solid rgba(255,255,255,0.08)",
                    fontSize: "0.9rem",
                  }}
                >
                  {m.text}
                </div>
              ))}
              {typing && (
                <div className="typing-dots" style={{ alignSelf: "flex-start" }}>
                  <span /><span /><span />
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            <footer
              style={{
                padding: 12,
                borderTop: "1px solid rgba(0,212,255,0.15)",
                display: "flex",
                gap: 8,
              }}
            >
              <input
                className="form-input"
                style={{ flex: 1, margin: 0 }}
                placeholder="Ask SafeBot..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
              />
              <button
                type="button"
                onClick={() => send()}
                style={{
                  background: "#00D4FF",
                  color: "#0A0F1E",
                  borderRadius: 12,
                  padding: "0 14px",
                  minWidth: 48,
                  minHeight: 48,
                }}
              >
                <Send size={20} />
              </button>
            </footer>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
