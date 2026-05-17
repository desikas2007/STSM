import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { incidents, ai } from "../services/api";
import { incrementIncidentOnChain } from "../services/blockchainService";

export default function AddIncidentModal({ open, onClose, onSuccess }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    severity: "Medium",
    dateTime: new Date().toISOString().slice(0, 16),
    imageUrl: "",
  });
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleAnalyze = async () => {
    try {
      const { data } = await ai.analyzeIncident({
        title: form.title,
        description: form.description,
        severity: form.severity,
      });
      setAiResult(data);
    } catch {
      toast.error("AI analysis failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let blockchainTxHash = "";
    try {
      if (user?.walletAddress) {
        blockchainTxHash = await incrementIncidentOnChain(user.walletAddress);
      }
      await incidents.createIncident({
        ...form,
        dateTime: new Date(form.dateTime),
        blockchainTxHash,
      });
      toast.success(
        blockchainTxHash
          ? `Incident logged! Tx: ${blockchainTxHash.slice(0, 10)}...`
          : "Incident submitted successfully"
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit incident");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 className="orbitron">Add Incident</h3>
          <button type="button" onClick={onClose} style={{ background: "none", color: "#9ca3af" }}>
            <X size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="form-label">Title</label>
          <input className="form-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ marginBottom: 12 }} />
          <label className="form-label">Description</label>
          <textarea className="form-input" required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ marginBottom: 12 }} />
          <label className="form-label">Severity</label>
          <select className="form-input" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })} style={{ marginBottom: 12 }}>
            {["Low", "Medium", "High", "Critical"].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <label className="form-label">Date & Time</label>
          <input type="datetime-local" className="form-input" value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })} style={{ marginBottom: 12 }} />
          <label className="form-label">Location</label>
          <input className="form-input" value={user?.location || ""} disabled style={{ marginBottom: 12, opacity: 0.7 }} />
          <label className="form-label">Image URL (optional)</label>
          <input className="form-input" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} style={{ marginBottom: 12 }} />
          <button type="button" className="btn-outline" style={{ width: "100%", marginBottom: 12 }} onClick={handleAnalyze}>
            Analyze with AI
          </button>
          {aiResult && (
            <div className="card" style={{ marginBottom: 12, fontSize: "0.85rem" }}>
              <p><strong>Risk:</strong> {aiResult.riskLevel}</p>
              <p>{aiResult.safetyAdvice}</p>
              <p><strong>Action:</strong> {aiResult.recommendedAction}</p>
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Submitting..." : "Submit & Log to Blockchain"}
          </button>
        </form>
      </div>
    </div>
  );
}
