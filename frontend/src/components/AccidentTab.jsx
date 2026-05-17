import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { accidents, ai } from "../services/api";
import AddAccidentModal from "./AddAccidentModal";

export default function AccidentTab() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [alerts, setAlerts] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await accidents.getAccidents(user.location);
      setList(data);
      data.forEach(async (acc) => {
        if (acc.aiAlert) {
          setAlerts((a) => ({ ...a, [acc._id]: acc.aiAlert }));
          return;
        }
        try {
          const { data: alertData } = await ai.generateAlert({
            title: acc.title,
            description: acc.description,
          });
          setAlerts((a) => ({ ...a, [acc._id]: alertData.alert }));
        } catch {
          setAlerts((a) => ({
            ...a,
            [acc._id]: `⚠️ SAFETY ALERT: Caution near reported accident: ${acc.title}`,
          }));
        }
      });
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.location]);

  const btnLabel =
    user?.role === "tourist" ? "🆘 Report an Accident" : "+ Report Accident";

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 className="orbitron" style={{ fontSize: "1.1rem" }}>Accidents</h2>
        <button type="button" className="btn-outline" style={{ width: "auto", display: "flex", gap: 6 }} onClick={() => setModalOpen(true)}>
          <Plus size={18} /> {btnLabel}
        </button>
      </div>

      {loading ? (
        <p style={{ color: "#9ca3af" }}>Loading accidents...</p>
      ) : list.length === 0 ? (
        <p style={{ color: "#9ca3af" }}>No accidents reported.</p>
      ) : (
        list.map((acc) => (
          <article key={acc._id} className="card">
            {alerts[acc._id] && (
              <div
                style={{
                  background: "rgba(245, 158, 11, 0.15)",
                  color: "#F59E0B",
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 12,
                  fontSize: "0.85rem",
                }}
              >
                {alerts[acc._id]}
              </div>
            )}
            <h3 style={{ fontSize: "1rem", marginBottom: 6 }}>{acc.title}</h3>
            <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>{acc.description}</p>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              <span className="badge" style={{ background: "#374151" }}>
                People: {acc.peopleInvolved}
              </span>
              <span
                className="badge"
                style={{
                  background: acc.injuriesReported ? "rgba(239,68,68,0.2)" : "rgba(16,185,129,0.2)",
                  color: acc.injuriesReported ? "#EF4444" : "#10B981",
                }}
              >
                Injuries: {acc.injuriesReported ? "Yes" : "No"}
              </span>
            </div>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 8 }}>
              {new Date(acc.dateTime || acc.createdAt).toLocaleString()}
            </p>
          </article>
        ))
      )}

      <AddAccidentModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={load}
        label={btnLabel}
      />
    </div>
  );
}
