import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { users } from "../services/api";
import BlockchainID from "../components/BlockchainID";

const LOCATIONS = ["Kodaikanal", "Ooty", "Munnar", "Coorg", "Shimla"];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    location: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    users.getProfile().then(({ data }) => {
      setProfile(data);
      setForm({
        name: data.name,
        mobile: data.mobile,
        location: data.location,
        password: "",
        confirmPassword: "",
      });
    });
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        mobile: form.mobile,
        location: form.location,
      };
      if (form.password) payload.password = form.password;
      const { data } = await users.updateProfile(payload);
      updateUser({ ...user, ...data, id: data._id });
      toast.success("Profile updated — geo-zone updated to " + data.location);
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100dvh", padding: "12px 12px 24px" }}>
      <Link to="/home" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginBottom: 16, minHeight: 44 }}>
        <ArrowLeft size={20} /> Back
      </Link>
      <h1 className="orbitron" style={{ fontSize: "1.25rem", marginBottom: 20 }}>
        Profile
      </h1>

      <div className="profile-grid">
        <section className="glass-panel" style={{ padding: 16 }}>
          <BlockchainID inline />
        </section>

        <section className="glass-panel" style={{ padding: 16 }}>
          <h2 className="orbitron" style={{ fontSize: "1rem", marginBottom: 16 }}>Edit Profile</h2>
          <form onSubmit={handleSave}>
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ marginBottom: 12 }} />

            <label className="form-label">Mobile</label>
            <input className="form-input" maxLength={10} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })} style={{ marginBottom: 12 }} />

            <label className="form-label">New Password</label>
            <input type="password" className="form-input" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} style={{ marginBottom: 12 }} />

            <label className="form-label">Confirm Password</label>
            <input type="password" className="form-input" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} style={{ marginBottom: 12 }} />

            <label className="form-label">Location</label>
            <select className="form-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={{ marginBottom: 16 }}>
              {LOCATIONS.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>

            <div style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: 16, lineHeight: 1.8 }}>
              <p><strong>Email:</strong> {profile?.email}</p>
              <p><strong>Role:</strong> {profile?.role}</p>
              <p><strong>Wallet:</strong> {profile?.walletAddress || "Not connected"}</p>
              <p><strong>Member since:</strong> {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "—"}</p>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </section>
      </div>

      <style>{`
        .profile-grid {
          display: grid;
          gap: 16px;
          max-width: 900px;
          margin: 0 auto;
        }
        @media (min-width: 768px) {
          .profile-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
