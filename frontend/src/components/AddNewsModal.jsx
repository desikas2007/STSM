import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { news, ai } from "../services/api";

export default function AddNewsModal({ open, onClose, onSuccess }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    headline: "",
    body: "",
    source: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handlePreview = async () => {
    try {
      const { data } = await ai.summarizeNews({ headline: form.headline, body: form.body });
      setPreview(data);
    } catch {
      toast.error("AI preview failed");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await news.createNews({ ...form, date: new Date(form.date) });
      toast.success("News published");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to publish");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 className="orbitron">Post News</h3>
          <button type="button" onClick={onClose} style={{ background: "none", color: "#9ca3af" }}>
            <X size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="form-label">Headline</label>
          <input className="form-input" required value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} style={{ marginBottom: 12 }} />
          <label className="form-label">Body</label>
          <textarea className="form-input" required rows={5} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} style={{ marginBottom: 12 }} />
          <label className="form-label">Source</label>
          <input className="form-input" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={{ marginBottom: 12 }} />
          <label className="form-label">Date</label>
          <input type="date" className="form-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} style={{ marginBottom: 12 }} />
          <label className="form-label">Location</label>
          <input className="form-input" value={user?.location || ""} disabled style={{ marginBottom: 12, opacity: 0.7 }} />
          <button type="button" className="btn-outline" style={{ width: "100%", marginBottom: 12 }} onClick={handlePreview}>
            Get AI Summary Preview
          </button>
          {preview && (
            <div className="card" style={{ marginBottom: 12, fontSize: "0.85rem" }}>
              <p>{preview.summary}</p>
              <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                {preview.tips?.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Publishing..." : "Publish"}
          </button>
        </form>
      </div>
    </div>
  );
}
