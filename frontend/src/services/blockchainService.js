import { ethers } from "ethers";
import contractData from "../blockchain/TouristDigitalID.json";

const { address: CONTRACT_ADDRESS, abi: CONTRACT_ABI } = contractData;

export async function connectMetaMask() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }
  const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
  return accounts[0];
}

export async function getContract() {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
}

export async function getReadOnlyContract() {
  if (window.ethereum) {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
  }
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
}

export async function issueDigitalID(userId, name, location, role) {
  const contract = await getContract();
  const tx = await contract.issueID(userId, name, location, role);
  const receipt = await tx.wait();
  return { txHash: receipt.hash };
}

export async function getDigitalID(walletAddress) {
  const contract = await getReadOnlyContract();
  const id = await contract.getID(walletAddress);
  return {
    userId: id.userId,
    name: id.name,
    location: id.location,
    role: id.role,
    issuedAt: Number(id.issuedAt),
    isVerified: id.isVerified,
    incidentsReported: Number(id.incidentsReported),
    accidentsReported: Number(id.accidentsReported),
  };
}

export async function incrementIncidentOnChain(walletAddress) {
  const contract = await getContract();
  const tx = await contract.incrementIncident(walletAddress);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function incrementAccidentOnChain(walletAddress) {
  const contract = await getContract();
  const tx = await contract.incrementAccident(walletAddress);
  const receipt = await tx.wait();
  return receipt.hash;
}

export async function verifyIDOnChain(walletAddress) {
  const contract = await getContract();
  const tx = await contract.verifyID(walletAddress);
  const receipt = await tx.wait();
  return receipt.hash;
}

export function hasDigitalID(id) {
  return id && id.userId && id.userId.length > 0;
}

export { CONTRACT_ADDRESS };
