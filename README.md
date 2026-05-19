# Smart Tourist Safety Monitoring & Incident Response System

Production-ready web application using **AI (GPT-4o)**, **Geo-Fencing**, and **Blockchain-based Digital ID** — optimized for **mobile tourists**.

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│              SMART TOURIST SAFETY SYSTEM             │
├──────────────┬──────────────┬───────────────────────┤
│  React.js    │  Node.js     │  Ethereum Blockchain   │
│  Frontend    │  Backend     │  TouristDigitalID.sol  │
│              │  + OpenAI    │                        │
│  Geo-Fence   │  GPT-4o API  │  Hardhat Local / Sepolia│
├──────────────┴──────────────┴───────────────────────┤
│              MongoDB (Tourist Safety DB)             │
└─────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, React Router v6, Axios, Context API, Framer Motion, Lucide, react-toastify, ethers.js |
| Backend | Node.js, Express, Mongoose, JWT, OpenAI SDK |
| Database | MongoDB |
| Blockchain | Hardhat, Solidity 0.8.19, OpenZeppelin Ownable |
| Geo | Browser Geolocation + Haversine |

## Project Structure

```
smart-tourist-safety/
├── frontend/          # React mobile-first UI
├── backend/           # REST API + AI routes
└── blockchain/        # Smart contract + deploy
```

## Setup

### Prerequisites

- Node.js 18+
- MongoDB running locally
- MetaMask browser extension
- OpenAI API key

### Step 1: Install dependencies

```bash
cd backend && npm install
cd ../frontend && npm install
cd ../blockchain && npm install
```

### Step 2: Environment

Copy and edit `backend/.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/touristsafety
JWT_SECRET=smart_tourist_safety_blockchain_2024
OPENAI_API_KEY=your_openai_api_key_here
```

Optional `blockchain/.env` for Sepolia deployment.

### Step 3: Start MongoDB

Ensure MongoDB is running on `localhost:27017`.

### Step 4: Blockchain (local)

Terminal 1:

```bash
cd blockchain
npx hardhat node
```

Terminal 2:

```bash
cd blockchain
npx hardhat compile
npx hardhat run scripts/deploy.js --network localhost
```

This writes `frontend/src/blockchain/TouristDigitalID.json` with address + ABI.

### Step 5: MetaMask

- Add network: `http://127.0.0.1:8545`, Chain ID `31337`
- Import a Hardhat test account private key from the node output

### Step 6: Start backend

```bash
cd backend
npm run dev
```

### Step 7: Start frontend

```bash
cd frontend
npm run dev
```

Open the URL shown (typically `http://localhost:5173`) on your phone or emulator.

## Feature Walkthrough

### Tourist

- Register with location zone (Kodaikanal, Ooty, Munnar, Coorg, Shimla)
- Optional MetaMask → Blockchain Digital ID issued on registration
- View incidents, accidents, and news for your zone
- Report accidents with AI-generated safety alerts
- Geo-fence banner shows if you are inside/outside your registered zone
- SafeBot AI chat drawer + Help quick questions
- Blockchain ID card with on-chain incident/accident counts

### Data Provider

- Post incidents (AI risk analysis stored automatically)
- Post news (AI summary + safety tips)
- Same accident reporting and geo/blockchain features

## How Technologies Connect

| Feature | AI | Geo-Fencing | Blockchain |
|---------|-----|-------------|------------|
| Register | — | Locks user to zone | Issues Digital ID |
| Report Incident | Risk analysis | Zone-tagged data | Increments incident count |
| Report Accident | Safety alert | Location enforced | Increments accident count |
| Post News | Summary + tips | Zone-tagged | — |
| Profile | — | Updates zone | Shows verified ID |
| Help | SafeBot chat | Live zone status | ID verification status |

## API Endpoints

- `POST /api/auth/register` · `POST /api/auth/login`
- `GET/POST /api/incidents` · `GET/POST /api/accidents` · `GET/POST /api/news`
- `GET/PUT /api/users/profile` · `PATCH /api/users/blockchain-status`
- `POST /api/ai/analyze-incident` · `generate-alert` · `summarize-news` · `chat`

## Mobile UX Notes

- Bottom tab navigation on phones
- Touch targets ≥ 44px
- Bottom sheets for modals
- `tel:` links for emergency numbers
- Safe area insets for notched devices

## License

MIT
