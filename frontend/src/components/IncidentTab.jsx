import { useState, useEffect } from "react";
import { ChevronDown, ChevronUp, Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { incidents, ai } from "../services/api";
import AddIncidentModal from "./AddIncidentModal";

const severityClass = {
  Critical: "severity-critical",
  High: "severity-high",
  Medium: "severity-medium",
  Low: "severity-low",
};

export default function IncidentTab() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [aiCache, setAiCache] = useState({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await incidents.getIncidents(user.location);
      setList(data);
    } catch {
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [user?.location]);

  const toggleAI = async (id, incident) => {
    if (expanded[id]) {
      setExpanded((e) => ({ ...e, [id]: false }));
      return;
    }
    setExpanded((e) => ({ ...e, [id]: true }));
    if (aiCache[id] || incident.aiAnalysis?.riskLevel) return;
    try {
      const { data } = await ai.analyzeIncident({
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
      });
      setAiCache((c) => ({ ...c, [id]: data }));
    } catch {
      setAiCache((c) => ({
        ...c,
        [id]: incident.aiAnalysis || { riskLevel: incident.severity, safetyAdvice: "Unavailable" },
      }));
    }
  };

  const analysis = (inc) => aiCache[inc._id] || inc.aiAnalysis;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 className="orbitron" style={{ fontSize: "1.1rem" }}>Incidents</h2>
        {user?.role === "data_provider" && (
          <button type="button" className="btn-outline" style={{ width: "auto", display: "flex", gap: 6, alignItems: "center" }} onClick={() => setModalOpen(true)}>
            <Plus size={18} /> Add Incident
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: "#9ca3af" }}>Loading incidents...</p>
      ) : list.length === 0 ? (
        <p style={{ color: "#9ca3af" }}>No incidents reported for {user?.location}.</p>
      ) : (
        list.map((inc) => (
          <article key={inc._id} className="card">
            <span className={`badge ${severityClass[inc.severity]}`}>{inc.severity}</span>
            <h3 style={{ margin: "8px 0 4px", fontSize: "1rem" }}>{inc.title}</h3>
            <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginBottom: 8 }}>{inc.description}</p>
            <p style={{ fontSize: "0.75rem", color: "#6b7280" }}>
              {new Date(inc.dateTime || inc.createdAt).toLocaleString()}
            </p>
            {inc.reportedBy && (
              <p style={{ fontSize: "0.8rem", marginTop: 6 }}>
                Reporter: {inc.reportedBy.name} ({inc.reportedBy.role})
              </p>
            )}
            <button
              type="button"
              onClick={() => toggleAI(inc._id, inc)}
              style={{
                marginTop: 12,
                background: "rgba(0,212,255,0.1)",
                color: "#00D4FF",
                padding: "8px 12px",
                borderRadius: 8,
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                minHeight: 44,
              }}
            >
              AI Risk Analysis {expanded[inc._id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expanded[inc._id] && analysis(inc) && (
              <div style={{ marginTop: 12, padding: 12, background: "rgba(0,0,0,0.3)", borderRadius: 8, fontSize: "0.85rem" }}>
                <p><strong>Risk:</strong> {analysis(inc).riskLevel}</p>
                <p style={{ marginTop: 6 }}>{analysis(inc).safetyAdvice}</p>
                {analysis(inc).recommendedAction && (
                  <p style={{ marginTop: 6 }}><strong>Action:</strong> {analysis(inc).recommendedAction}</p>
                )}
              </div>
            )}
          </article>
        ))
      )}

      <AddIncidentModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={load} />
    </div>
  );
}
