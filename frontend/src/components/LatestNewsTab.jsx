import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { news, ai } from "../services/api";
import AddNewsModal from "./AddNewsModal";

export default function LatestNewsTab() {
  const { user } = useAuth();
  const [list, setList] = useState([]);
  const [summaries, setSummaries] = useState({});
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await news.getNews(user.location);
      setList(data);
      data.forEach(async (item) => {
        if (item.aiSummary) {
          setSummaries((s) => ({
            ...s,
            [item._id]: { summary: item.aiSummary, tips: item.aiTips || [] },
          }));
          return;
        }
        try {
          const { data: sum } = await ai.summarizeNews({
            headline: item.headline,
            body: item.body,
          });
          setSummaries((s) => ({ ...s, [item._id]: sum }));
        } catch {
          setSummaries((s) => ({
            ...s,
            [item._id]: { summary: "Summary unavailable.", tips: [] },
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

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 className="orbitron" style={{ fontSize: "1.1rem" }}>Latest News</h2>
        {user?.role === "data_provider" && (
          <button type="button" className="btn-outline" style={{ width: "auto", display: "flex", gap: 6 }} onClick={() => setModalOpen(true)}>
            <Plus size={18} /> Post News
          </button>
        )}
      </div>

      {loading ? (
        <p style={{ color: "#9ca3af" }}>Loading news...</p>
      ) : list.length === 0 ? (
        <p style={{ color: "#9ca3af" }}>No news for {user?.location}.</p>
      ) : (
        list.map((item) => (
          <article key={item._id} className="card">
            <h3 style={{ fontSize: "1rem", marginBottom: 6 }}>{item.headline}</h3>
            <p style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
              {item.body.length > 160 ? `${item.body.slice(0, 160)}...` : item.body}
            </p>
            <p style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: 8 }}>
              {item.source} · {new Date(item.date || item.createdAt).toLocaleDateString()}
            </p>
            {summaries[item._id] && (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  background: "rgba(0, 212, 255, 0.08)",
                  borderRadius: 8,
                  fontSize: "0.85rem",
                }}
              >
                <p style={{ color: "#00D4FF", marginBottom: 6, fontWeight: 700 }}>AI Summary</p>
                <p>{summaries[item._id].summary}</p>
                <ul style={{ marginTop: 8, paddingLeft: 18 }}>
                  {summaries[item._id].tips?.map((t, i) => (
                    <li key={i}>{t}</li>
                  ))}
                </ul>
              </div>
            )}
          </article>
        ))
      )}

      <AddNewsModal open={modalOpen} onClose={() => setModalOpen(false)} onSuccess={load} />
    </div>
  );
}
