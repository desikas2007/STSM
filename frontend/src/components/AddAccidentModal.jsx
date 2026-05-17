import { useState } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { accidents } from "../services/api";
import { incrementAccidentOnChain } from "../services/blockchainService";

export default function AddAccidentModal({ open, onClose, onSuccess, label }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title: "",
    description: "",
    peopleInvolved: 1,
    injuriesReported: false,
    dateTime: new Date().toISOString().slice(0, 16),
    imageUrl: "",
  });
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    let blockchainTxHash = "";
    try {
      if (user?.walletAddress) {
        blockchainTxHash = await incrementAccidentOnChain(user.walletAddress);
      }
      await accidents.createAccident({
        ...form,
        dateTime: new Date(form.dateTime),
        blockchainTxHash,
      });
      toast.success(
        blockchainTxHash
          ? `Accident reported! Tx: ${blockchainTxHash.slice(0, 10)}...`
          : "Accident reported successfully"
      );
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to report accident");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
          <h3 className="orbitron">{label || "Report Accident"}</h3>
          <button type="button" onClick={onClose} style={{ background: "none", color: "#9ca3af" }}>
            <X size={22} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <label className="form-label">Title</label>
          <input className="form-input" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={{ marginBottom: 12 }} />
          <label className="form-label">Description</label>
          <textarea className="form-input" required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ marginBottom: 12 }} />
          <label className="form-label">People Involved</label>
          <input type="number" min={0} className="form-input" value={form.peopleInvolved} onChange={(e) => setForm({ ...form, peopleInvolved: Number(e.target.value) })} style={{ marginBottom: 12 }} />
          <label className="form-label">Injuries Reported</label>
          <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
            <button type="button" className={form.injuriesReported ? "btn-primary" : "btn-outline"} style={{ flex: 1 }} onClick={() => setForm({ ...form, injuriesReported: true })}>Yes</button>
            <button type="button" className={!form.injuriesReported ? "btn-primary" : "btn-outline"} style={{ flex: 1 }} onClick={() => setForm({ ...form, injuriesReported: false })}>No</button>
          </div>
          <label className="form-label">Date & Time</label>
          <input type="datetime-local" className="form-input" value={form.dateTime} onChange={(e) => setForm({ ...form, dateTime: e.target.value })} style={{ marginBottom: 12 }} />
          <label className="form-label">Location</label>
          <input className="form-input" value={user?.location || ""} disabled style={{ marginBottom: 12, opacity: 0.7 }} />
          <label className="form-label">Image URL (optional)</label>
          <input className="form-input" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} style={{ marginBottom: 12 }} />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Submitting..." : "Submit & Log to Blockchain"}
          </button>
        </form>
      </div>
    </div>
  );
}
