import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Shield, Eye, EyeOff, Link2 } from "lucide-react";
import { toast } from "react-toastify";
import { auth } from "../services/api";
import { connectMetaMask, issueDigitalID } from "../services/blockchainService";

const LOCATIONS = ["Kodaikanal", "Ooty", "Munnar", "Coorg", "Shimla"];

function passwordStrength(pw) {
  if (pw.length < 6) return { label: "Weak", pct: 33, color: "#EF4444" };
  if (pw.length < 10 || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw))
    return { label: "Medium", pct: 66, color: "#F59E0B" };
  return { label: "Strong", pct: 100, color: "#10B981" };
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    role: "tourist",
    location: "Kodaikanal",
    walletAddress: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const strength = passwordStrength(form.password);

  const connectWallet = async () => {
    try {
      const account = await connectMetaMask();
      setForm((f) => ({ ...f, walletAddress: account }));
      toast.success("Wallet connected");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (form.mobile.length !== 10) {
      toast.error("Mobile must be 10 digits");
      return;
    }
    setLoading(true);
    try {
      const { data } = await auth.register({
        name: form.name,
        email: form.email,
        mobile: form.mobile,
        password: form.password,
        role: form.role,
        location: form.location,
        walletAddress: form.walletAddress || undefined,
      });

      if (form.walletAddress) {
        try {
          const role = form.role === "data_provider" ? "data_provider" : "tourist";
          await issueDigitalID(data.userId, form.name, form.location, role);
          toast.success("Account created! Your Blockchain ID has been issued.");
        } catch {
          toast.success("Account created! Connect wallet later to issue Blockchain ID.");
        }
      } else {
        toast.success("Account created successfully!");
      }
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout register-page">
      <div
        className="auth-hero"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.65), rgba(0,0,0,0.8)), url(https://images.unsplash.com/photo-1590523277543-a94d2e247eb1?w=1200&q=80)`,
        }}
      >
        <div className="auth-hero-inner">
          <h1 className="orbitron">Join STSM</h1>
          <p className="auth-sub">Secured travel monitoring for India&apos;s hill stations</p>
        </div>
      </div>

      <div className="auth-form-panel glass-panel register-scroll">
        <Shield size={28} color="#00D4FF" style={{ marginBottom: 8 }} />
        <h2 className="orbitron">Create Your Account</h2>
        <p style={{ display: "flex", alignItems: "center", gap: 6, color: "#F4C430", fontSize: "0.85rem", marginBottom: 20 }}>
          <Link2 size={16} /> Secured by Blockchain Digital ID
        </p>

        <form onSubmit={handleSubmit}>
          <label className="form-label">Full Name</label>
          <input className="form-input" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={{ marginBottom: 12 }} />

          <label className="form-label">Email</label>
          <input type="email" className="form-input" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ marginBottom: 12 }} />

          <label className="form-label">Mobile (10 digits)</label>
          <input className="form-input" required maxLength={10} value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "") })} style={{ marginBottom: 12 }} />

          <label className="form-label">Password</label>
          <div style={{ position: "relative", marginBottom: 6 }}>
            <input
              type={showPass ? "text" : "password"}
              className="form-input"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: 14, background: "none", color: "#9ca3af" }}>
              {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div style={{ height: 4, background: "#1f2937", borderRadius: 4, marginBottom: 4 }}>
            <div style={{ width: `${strength.pct}%`, height: "100%", background: strength.color, borderRadius: 4, transition: "width 0.3s" }} />
          </div>
          <p style={{ fontSize: "0.75rem", color: strength.color, marginBottom: 12 }}>{strength.label}</p>

          <label className="form-label">Confirm Password</label>
          <input type="password" className="form-input" required value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} style={{ marginBottom: 12 }} />

          <label className="form-label">Role</label>
          <select className="form-input" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ marginBottom: 12 }}>
            <option value="tourist">Tourist</option>
            <option value="data_provider">Data Provider</option>
          </select>

          <label className="form-label">Location</label>
          <select className="form-input" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={{ marginBottom: 12 }}>
            {LOCATIONS.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>

          <label className="form-label">Wallet Address (optional)</label>
          <input className="form-input" placeholder="0x..." value={form.walletAddress} onChange={(e) => setForm({ ...form, walletAddress: e.target.value })} style={{ marginBottom: 8 }} />
          <p style={{ fontSize: "0.75rem", color: "#9ca3af", marginBottom: 8 }}>Connect MetaMask to auto-fill</p>
          <button type="button" className="btn-outline" style={{ width: "100%", marginBottom: 16 }} onClick={connectWallet}>
            Connect MetaMask
          </button>

          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating..." : "Create Account & Issue Blockchain ID"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 16 }}>
          <Link to="/login">Already have an account? Login</Link>
        </p>
      </div>

      <style>{`
        .register-page { min-height: 100dvh; display: flex; flex-direction: column; }
        .register-page .auth-hero { min-height: 20vh; padding: 24px; background-size: cover; }
        .register-scroll { flex: 1; margin: -16px 12px 12px; padding: 20px; overflow-y: auto; max-height: none; }
        @media (min-width: 768px) {
          .register-page { flex-direction: row; }
          .register-page .auth-hero { flex: 1; min-height: 100dvh; display: flex; align-items: center; }
          .register-scroll { flex: 0 0 480px; margin: 0; max-height: 100dvh; }
        }
      `}</style>
    </div>
  );
}
