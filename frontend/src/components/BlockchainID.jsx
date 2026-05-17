import { useState, useEffect } from "react";
import { Link2, Shield } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import {
  connectMetaMask,
  getDigitalID,
  issueDigitalID,
  hasDigitalID,
  verifyIDOnChain,
} from "../services/blockchainService";
import { users } from "../services/api";

export default function BlockchainID({ inline = false, onClose }) {
  const { user, updateUser } = useAuth();
  const [wallet, setWallet] = useState(user?.walletAddress || "");
  const [digitalId, setDigitalId] = useState(null);
  const [txHash, setTxHash] = useState("");
  const [loading, setLoading] = useState(false);

  const loadID = async (address) => {
    if (!address) return;
    try {
      const id = await getDigitalID(address);
      if (hasDigitalID(id)) {
        setDigitalId(id);
      } else {
        setDigitalId(null);
      }
    } catch {
      setDigitalId(null);
    }
  };

  useEffect(() => {
    if (wallet) loadID(wallet);
  }, [wallet]);

  const handleConnect = async () => {
    try {
      const account = await connectMetaMask();
      setWallet(account);
      await users.updateBlockchainStatus({ walletAddress: account });
      updateUser({ ...user, walletAddress: account });
    } catch (err) {
      toast.error(err.message || "Failed to connect MetaMask");
    }
  };

  const handleIssue = async () => {
    if (!wallet || !user) return;
    setLoading(true);
    try {
      const role = user.role === "data_provider" ? "data_provider" : "tourist";
      const { txHash: hash } = await issueDigitalID(
        user.id,
        user.name,
        user.location,
        role
      );
      setTxHash(hash);
      await users.updateBlockchainStatus({ walletAddress: wallet, blockchainIDIssued: true });
      updateUser({ ...user, walletAddress: wallet, blockchainIDIssued: true });
      toast.success("Blockchain Digital ID issued!");
      await loadID(wallet);
    } catch (err) {
      toast.error(err.reason || err.message || "Failed to issue ID");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!wallet) return;
    setLoading(true);
    try {
      const hash = await verifyIDOnChain(wallet);
      setTxHash(hash);
      toast.success("Verification submitted (owner only on testnet)");
      await loadID(wallet);
    } catch (err) {
      toast.error(err.reason || err.message || "Verification failed — requires contract owner");
    } finally {
      setLoading(false);
    }
  };

  const shortAddr = (addr) =>
    addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : "—";

  const card = (
    <div className="glass-panel" style={{ padding: 20, maxWidth: inline ? "100%" : 400 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "#F4C430" }}>
        <Link2 size={20} />
        <span className="orbitron" style={{ fontSize: "0.9rem" }}>BLOCKCHAIN DIGITAL ID</span>
      </div>
      <hr style={{ borderColor: "rgba(0,212,255,0.2)", marginBottom: 16 }} />

      {!wallet ? (
        <div style={{ textAlign: "center" }}>
          <Shield size={40} color="#00D4FF" style={{ margin: "0 auto 12px" }} />
          <p style={{ marginBottom: 16, color: "#9ca3af" }}>
            Connect MetaMask to view your Blockchain ID
          </p>
          <button type="button" className="btn-primary" onClick={handleConnect}>
            Connect MetaMask
          </button>
        </div>
      ) : !digitalId ? (
        <div style={{ textAlign: "center" }}>
          <p style={{ marginBottom: 16 }}>No Digital ID found for {shortAddr(wallet)}</p>
          <button type="button" className="btn-primary" onClick={handleIssue} disabled={loading}>
            {loading ? "Issuing..." : "Issue Blockchain ID"}
          </button>
        </div>
      ) : (
        <div style={{ fontSize: "0.9rem", lineHeight: 1.8 }}>
          <p><strong>Name:</strong> {digitalId.name}</p>
          <p><strong>Role:</strong> {digitalId.role}</p>
          <p><strong>Location:</strong> {digitalId.location}</p>
          <p><strong>Issued:</strong> {new Date(digitalId.issuedAt * 1000).toLocaleString()}</p>
          <p><strong>Incidents:</strong> {digitalId.incidentsReported}</p>
          <p><strong>Accidents:</strong> {digitalId.accidentsReported}</p>
          <p>
            <strong>Status:</strong>{" "}
            {digitalId.isVerified ? "✅ Verified" : "⏳ Pending verification"}
          </p>
          <p><strong>Wallet:</strong> {shortAddr(wallet)}</p>
          {txHash && <p><strong>TxHash:</strong> {shortAddr(txHash)}</p>}
          {!digitalId.isVerified && (
            <button
              type="button"
              className="btn-outline"
              style={{ marginTop: 12, width: "100%" }}
              onClick={handleVerify}
              disabled={loading}
            >
              Verify My ID
            </button>
          )}
        </div>
      )}

      {onClose && (
        <button
          type="button"
          className="btn-outline"
          style={{ marginTop: 16, width: "100%" }}
          onClick={onClose}
        >
          Close
        </button>
      )}
    </div>
  );

  if (inline) return card;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {card}
      </div>
    </div>
  );
}
