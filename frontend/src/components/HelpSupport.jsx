import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ai } from "../services/api";
import { getUserCoordinates, checkGeoFence } from "../services/geoService";
import { getDigitalID, hasDigitalID, connectMetaMask } from "../services/blockchainService";

const EMERGENCY = [
  { label: "Tourist Police", number: "1363" },
  { label: "Ambulance", number: "108" },
  { label: "Fire", number: "101" },
  { label: "Women Helpline", number: "1091" },
  { label: "Disaster Mgmt", number: "1078" },
];

const QUICK_QUESTIONS = [
  "What are common trekking risks?",
  "What to do in flash floods?",
  "Wildlife encounter safety tips?",
];

export default function HelpSupport() {
  const { user } = useAuth();
  const [geoStatus, setGeoStatus] = useState(null);
  const [blockchainStatus, setBlockchainStatus] = useState(null);
  const [chatReply, setChatReply] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const coords = await getUserCoordinates();
      if (coords && user?.location) {
        setGeoStatus(checkGeoFence(coords.lat, coords.lng, user.location));
      }
      const wallet = user?.walletAddress;
      if (wallet) {
        try {
          const id = await getDigitalID(wallet);
          setBlockchainStatus(hasDigitalID(id) ? id : null);
        } catch {
          setBlockchainStatus(null);
        }
      }
    })();
  }, [user]);

  const askQuick = async (q) => {
    setChatLoading(true);
    setChatReply("");
    try {
      const { data } = await ai.chat(q, user?.location);
      setChatReply(data.reply);
    } catch {
      setChatReply("Could not reach SafeBot. Please try again.");
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div>
      <h2 className="orbitron" style={{ fontSize: "1.1rem", marginBottom: 16 }}>
        Help & Support
      </h2>

      <section className="card">
        <h3 style={{ marginBottom: 12, color: "#EF4444" }}>Emergency Contacts</h3>
        <div style={{ display: "grid", gap: 8 }}>
          {EMERGENCY.map((e) => (
            <a
              key={e.number}
              href={`tel:${e.number}`}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "12px 14px",
                background: "rgba(239,68,68,0.1)",
                borderRadius: 8,
                color: "#fff",
                minHeight: 48,
                alignItems: "center",
              }}
            >
              <span>{e.label}</span>
              <strong style={{ color: "#00D4FF", fontSize: "1.1rem" }}>{e.number}</strong>
            </a>
          ))}
        </div>
      </section>

      <section className="card" style={{ marginTop: 12 }}>
        <h3 style={{ marginBottom: 12, color: "#00D4FF" }}>SafeBot Quick Chat</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {QUICK_QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              className="btn-outline"
              style={{ width: "100%", textAlign: "left", fontSize: "0.85rem" }}
              onClick={() => askQuick(q)}
              disabled={chatLoading}
            >
              {q}
            </button>
          ))}
        </div>
        {chatLoading && <p style={{ marginTop: 8, color: "#9ca3af" }}>SafeBot is typing...</p>}
        {chatReply && (
          <p style={{ marginTop: 12, fontSize: "0.9rem", padding: 12, background: "rgba(0,0,0,0.3)", borderRadius: 8 }}>
            {chatReply}
          </p>
        )}
      </section>

      <section className="card" style={{ marginTop: 12 }}>
        <h3 style={{ marginBottom: 8 }}>Geo-Fencing Status</h3>
        {!geoStatus ? (
          <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>Enable location to see zone status.</p>
        ) : geoStatus.insideZone ? (
          <p style={{ color: "#10B981" }}>Inside {geoStatus.zoneName} safe zone</p>
        ) : (
          <p style={{ color: "#F59E0B" }}>
            {geoStatus.distanceKm?.toFixed(1)} km from {geoStatus.zoneName} center
          </p>
        )}
      </section>

      <section className="card" style={{ marginTop: 12 }}>
        <h3 style={{ marginBottom: 8 }}>Blockchain ID Status</h3>
        {!user?.walletAddress ? (
          <button type="button" className="btn-outline" style={{ width: "100%" }} onClick={connectMetaMask}>
            Connect wallet to check ID
          </button>
        ) : blockchainStatus ? (
          <p style={{ color: "#10B981", fontSize: "0.9rem" }}>
            ID issued · {blockchainStatus.isVerified ? "Verified" : "Pending verification"}
          </p>
        ) : (
          <p style={{ color: "#F59E0B" }}>No blockchain ID issued yet</p>
        )}
      </section>
    </div>
  );
}
