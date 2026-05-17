import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Eye, EyeOff, Wifi } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { auth } from "../services/api";

const QUOTES = [
  { text: "Safety is not a gadget but a state of mind.", author: "Eleanor Everet" },
  { text: "Travel smart, travel safe – always know before you go.", author: "STSM" },
  { text: "Your blockchain ID protects your identity wherever you roam.", author: "STSM" },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [quoteIdx, setQuoteIdx] = useState(0);
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/home");
  }, [user, navigate]);

  useEffect(() => {
    const t = setInterval(() => setQuoteIdx((i) => (i + 1) % QUOTES.length), 4000);
    return () => clearInterval(t);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await auth.login({ email, password });
      login(data.token, data.user);
      toast.success("Welcome back!");
      navigate("/home");
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      <div
        className="auth-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.75)), url(https://images.unsplash.com/photo-1590523277543-a94d2e247eb1?w=1200&q=80)`,
        }}
      >
        <div className="auth-hero-inner">
          <h1 className="orbitron">Smart Tourist Safety System</h1>
          <p className="auth-sub">AI · Geo-Fencing · Blockchain</p>
          <AnimatePresence mode="wait">
            <motion.p
              key={quoteIdx}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="auth-quote"
            >
              &ldquo;{QUOTES[quoteIdx].text}&rdquo; – {QUOTES[quoteIdx].author}
            </motion.p>
          </AnimatePresence>
          <div className="system-online">
            <span className="pulse-dot" /> System Online
          </div>
        </div>
      </div>

      <div className="auth-form-panel glass-panel">
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
          <Shield size={28} color="#00D4FF" />
          <Wifi size={18} color="#00D4FF" />
        </div>
        <h2 className="orbitron" style={{ marginBottom: 8 }}>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ marginBottom: 16 }}
          />
          <label className="form-label">Password</label>
          <div style={{ position: "relative", marginBottom: 20 }}>
            <input
              type={showPass ? "text" : "password"}
              className="form-input"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ paddingRight: 48 }}
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              style={{
                position: "absolute",
                right: 12,
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                color: "#9ca3af",
              }}
            >
              {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={{ textAlign: "center", margin: "20px 0", color: "#6b7280", fontSize: "0.85rem" }}>
          ────── OR ──────
        </p>
        <p style={{ textAlign: "center" }}>
          New here? <Link to="/register">Create Account →</Link>
        </p>
      </div>

      <style>{`
        .auth-layout {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
        }
        .auth-hero {
          min-height: 32vh;
          background-size: cover;
          background-position: center;
          padding: 24px;
        }
        .auth-hero-inner {
          max-width: 480px;
        }
        .auth-hero h1 {
          font-size: 1.25rem;
          line-height: 1.3;
          color: #00D4FF;
        }
        .auth-sub {
          color: #9ca3af;
          margin: 8px 0 16px;
          font-size: 0.9rem;
        }
        .auth-quote {
          font-size: 0.85rem;
          color: #e5e7eb;
          min-height: 48px;
        }
        .system-online {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          margin-top: 20px;
          padding: 8px 14px;
          background: rgba(16, 185, 129, 0.15);
          border-radius: 999px;
          color: #10B981;
          font-size: 0.85rem;
        }
        .auth-form-panel {
          flex: 1;
          margin: -24px 16px 16px;
          padding: 24px;
          position: relative;
          z-index: 2;
        }
        @media (min-width: 768px) {
          .auth-layout {
            flex-direction: row;
          }
          .auth-hero {
            flex: 1;
            min-height: 100dvh;
            display: flex;
            align-items: center;
            padding: 48px;
          }
          .auth-hero h1 { font-size: 1.75rem; }
          .auth-form-panel {
            flex: 0 0 420px;
            margin: 0;
            border-radius: 0;
            display: flex;
            flex-direction: column;
            justify-content: center;
            min-height: 100dvh;
          }
        }
      `}</style>
    </div>
  );
}
