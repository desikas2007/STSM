import { AlertTriangle, Car, Newspaper, HelpCircle } from "lucide-react";

const TABS = [
  { id: "incidents", label: "Incidents", icon: AlertTriangle },
  { id: "accidents", label: "Accidents", icon: Car },
  { id: "news", label: "News", icon: Newspaper },
  { id: "help", label: "Help", icon: HelpCircle },
];

export default function Sidebar({ activeTab, onTabChange, collapsed, onToggle }) {
  return (
    <>
      <nav
        className="glass-panel"
        style={{
          display: "flex",
          flexDirection: collapsed ? "row" : "column",
          gap: 4,
          padding: collapsed ? "8px 12px" : "12px 8px",
          position: collapsed ? "fixed" : "relative",
          bottom: collapsed ? 0 : "auto",
          left: collapsed ? 0 : "auto",
          right: collapsed ? 0 : "auto",
          zIndex: 100,
          borderRadius: collapsed ? "12px 12px 0 0" : "12px",
          marginBottom: collapsed ? 0 : 12,
          paddingBottom: collapsed ? "calc(8px + env(safe-area-inset-bottom))" : 12,
        }}
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => onTabChange(id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: collapsed ? "10px 12px" : "12px 14px",
              flex: collapsed ? 1 : "none",
              justifyContent: collapsed ? "center" : "flex-start",
              flexDirection: collapsed ? "column" : "row",
              background: activeTab === id ? "rgba(0, 212, 255, 0.15)" : "transparent",
              color: activeTab === id ? "#00D4FF" : "#9ca3af",
              borderRadius: 10,
              border: activeTab === id ? "1px solid rgba(0,212,255,0.35)" : "1px solid transparent",
              fontSize: collapsed ? "0.65rem" : "0.9rem",
              minHeight: 44,
            }}
          >
            <Icon size={collapsed ? 20 : 18} />
            <span>{collapsed ? label.split(" ")[0] : label}</span>
          </button>
        ))}
      </nav>
    </>
  );
}
