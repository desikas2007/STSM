import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserCoordinates, checkGeoFence } from "../services/geoService";

export default function GeoFenceAlert() {
  const { user } = useAuth();
  const [status, setStatus] = useState({ type: "loading" });

  const refresh = async () => {
    if (!user?.location) return;
    const coords = await getUserCoordinates();
    if (!coords) {
      setStatus({ type: "denied" });
      return;
    }
    const result = checkGeoFence(coords.lat, coords.lng, user.location);
    if (result.insideZone) {
      setStatus({ type: "inside", zone: result.zoneName });
    } else {
      setStatus({
        type: "outside",
        zone: result.zoneName,
        distance: result.distanceKm?.toFixed(1),
      });
    }
  };

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 30000);
    return () => clearInterval(interval);
  }, [user?.location]);

  if (!user) return null;

  const base = {
    padding: "10px 16px",
    fontSize: "0.85rem",
    textAlign: "center",
    width: "100%",
  };

  if (status.type === "loading") {
    return (
      <div style={{ ...base, background: "rgba(0, 212, 255, 0.1)", color: "#00D4FF" }}>
        Checking geo-fence status...
      </div>
    );
  }

  if (status.type === "denied") {
    return (
      <div style={{ ...base, background: "rgba(0, 212, 255, 0.1)", color: "#00D4FF", borderBottom: "1px solid rgba(0,212,255,0.2)" }}>
        Enable location for real-time geo-fence alerts
      </div>
    );
  }

  if (status.type === "inside") {
    return (
      <div style={{ ...base, background: "rgba(16, 185, 129, 0.15)", color: "#10B981", borderBottom: "1px solid rgba(16,185,129,0.3)" }}>
        You are inside {status.zone} safe zone
      </div>
    );
  }

  return (
    <div style={{ ...base, background: "rgba(245, 158, 11, 0.15)", color: "#F59E0B", borderBottom: "1px solid rgba(245,158,11,0.3)" }}>
      You are {status.distance} km away from {status.zone}. Safety data shown is for your registered location.
    </div>
  );
}
