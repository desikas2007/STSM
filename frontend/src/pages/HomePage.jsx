import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Shield, Bot, Link2, MapPin, ChevronDown } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import GeoFenceAlert from "../components/GeoFenceAlert";
import Sidebar from "../components/Sidebar";
import IncidentTab from "../components/IncidentTab";
import AccidentTab from "../components/AccidentTab";
import LatestNewsTab from "../components/LatestNewsTab";
import HelpSupport from "../components/HelpSupport";
import BlockchainID from "../components/BlockchainID";
import AIAssistant from "../components/AIAssistant";

export default function HomePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("incidents");
  const [showBC, setShowBC] = useState(false);
  const [showAI, setShowAI] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const renderTab = () => {
    switch (activeTab) {
      case "incidents":
        return <IncidentTab />;
      case "accidents":
        return <AccidentTab />;
      case "news":
        return <LatestNewsTab />;
      case "help":
        return <HelpSupport />;
      default:
        return <IncidentTab />;
    }
  };

  return (
    <div className="home-shell">
      <header className="home-navbar glass-panel">
        <div className="nav-left">
          <Shield size={22} color="#00D4FF" />
          <span className="orbitron nav-title">STSM</span>
        </div>
        <div className="nav-center">
          <MapPin size={14} />
          <span>{user?.location}</span>
        </div>
        <div className="nav-right">
          <button type="button" className="nav-icon-btn" onClick={() => setShowAI(true)} aria-label="AI Assistant">
            <Bot size={20} />
          </button>
          <button type="button" className="nav-icon-btn" onClick={() => setShowBC(true)} aria-label="Blockchain ID">
            <Link2 size={20} />
          </button>
          <button
            type="button"
            className="avatar-btn"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="User menu"
          >
            {user?.name?.[0]?.toUpperCase() || "U"}
            <ChevronDown size={14} />
          </button>
          {menuOpen && (
            <div className="user-dropdown glass-panel">
              <Link to="/profile" onClick={() => setMenuOpen(false)}>Profile</Link>
              <button type="button" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </header>

      <GeoFenceAlert />

      <div className="home-body">
        <main className="home-main">{renderTab()}</main>
      </div>

      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} collapsed />

      {showBC && <BlockchainID onClose={() => setShowBC(false)} />}
      <AIAssistant open={showAI} onClose={() => setShowAI(false)} />

      <style>{`
        .home-shell {
          min-height: 100dvh;
          display: flex;
          flex-direction: column;
          padding-bottom: calc(72px + env(safe-area-inset-bottom));
        }
        .home-navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          margin: 8px 8px 0;
          border-radius: 12px;
          position: sticky;
          top: 0;
          z-index: 50;
        }
        .nav-left { display: flex; align-items: center; gap: 8px; }
        .nav-title { font-size: 0.85rem; color: #00D4FF; }
        .nav-center {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          padding: 6px 10px;
          background: rgba(0, 212, 255, 0.12);
          border: 1px solid rgba(0, 212, 255, 0.35);
          border-radius: 999px;
          color: #00D4FF;
          max-width: 110px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .nav-right { display: flex; align-items: center; gap: 6px; position: relative; }
        .nav-icon-btn {
          background: rgba(0, 212, 255, 0.1);
          border: 1px solid rgba(0, 212, 255, 0.25);
          border-radius: 10px;
          padding: 8px;
          color: #00D4FF;
          min-width: 40px;
          min-height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .avatar-btn {
          display: flex;
          align-items: center;
          gap: 4px;
          background: linear-gradient(135deg, #00D4FF, #0099cc);
          color: #0A0F1E;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-weight: 700;
          font-size: 0.9rem;
          justify-content: center;
        }
        .user-dropdown {
          position: absolute;
          top: 48px;
          right: 0;
          min-width: 140px;
          padding: 8px;
          z-index: 60;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .user-dropdown a, .user-dropdown button {
          padding: 12px;
          text-align: left;
          background: none;
          color: #e5e7eb;
          border-radius: 8px;
          font-size: 0.9rem;
          min-height: 44px;
        }
        .user-dropdown button:hover, .user-dropdown a:hover {
          background: rgba(0, 212, 255, 0.1);
        }
        .home-body { flex: 1; padding: 8px 12px 12px; }
        .home-main { max-width: 720px; margin: 0 auto; }
        @media (min-width: 768px) {
          .home-shell { padding-bottom: 24px; }
          .nav-title { font-size: 1rem; }
          .nav-center { max-width: none; font-size: 0.85rem; }
        }
      `}</style>
    </div>
  );
}
