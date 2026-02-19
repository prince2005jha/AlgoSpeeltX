
# 🚀 AlgoSplit

AlgoSplit is a decentralized payment splitting and escrow-based funding application built on the Algorand blockchain.

It allows users to:

- Split bills among multiple participants  
- Create secure escrow-based claim links  
- Send & receive ALGO or USDCa (ASA) tokens  
- Track payments in real-time  

All transactions are executed via smart contracts, ensuring security, transparency, and automation.

🌐 Live App: https://algosplit.vercel.app/

---

# ✨ Key Features

## 💰 Payment Splitting
Split a total amount equally between multiple participants. Each participant pays their exact share, and the system automatically completes once the target is reached.

## 🔐 Escrow-Based Claim Links
Create one-time claim links backed by a smart contract escrow. Funds are securely held until the intended recipient claims them.

## 🪙 Multi-Token Support
Supports:
- ALGO  
- USDCa (Algorand Standard Asset)

## 🔗 Wallet Integration
Compatible with:
- Pera Wallet  
- Defly Wallet  
- Lute Wallet  

## 📊 Real-Time Tracking
Track:
- Created payments  
- Contributions  
- Claim link status  
- Completion history  

## 🎨 Modern UI
Responsive, clean interface built with React and Tailwind CSS.

---

# 🛠 How It Works

## Payment Split Flow

1. Create a payment link with:
   - Total amount  
   - Number of participants  
   - Receiver address  
2. Share the link.  
3. Participants connect wallet and pay their share.  
4. Once all shares are paid, the payment is automatically marked complete.

### Example

If you create a payment of **100 ALGO split among 5 people**:

- Each pays exactly 20 ALGO  
- After 5 contributions, the payment closes  
- Funds go directly to the receiver  

---

## Claim Link (Escrow Flow)

1. Sender creates a claim link.  
2. Smart contract escrow holds the funds.  
3. Receiver opens the link and claims.  
4. Contract releases funds securely.

Optional:
- Expiry date  
- Restricted receiver  
- Cancel/refund option  

---

# 🧱 System Architecture

AlgoSplit follows a hybrid decentralized architecture:

Frontend (React + Vite)  
↓  
Smart Contracts (Algorand Blockchain)  
↓  
Supabase (Metadata & history storage)

---

# 🛠 Tech Stack

## Frontend
- React 18 + TypeScript  
- Vite  
- Tailwind CSS + shadcn/ui  
- React Router v6  
- Context API  

## Blockchain
- Algorand  
- algosdk  
- PuyaPy (Smart contracts)  

## Backend
- Supabase (PostgreSQL)  
- Row Level Security (RLS)  

---

# 📦 Installation

## Prerequisites

- Node.js 18+  
- Python 3.10+  
- Algorand wallet  
- Supabase account  

---

## Frontend Setup

```bash
git clone <repository-url>
cd algo-split-link-main
npm install
npm run dev
```

---

## Smart Contract Setup

```bash
cd contracts
python -m venv venv
venv\Scripts\activate   # Windows
pip install -r requirements.txt
pip install puya
```

---

# ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
# Supabase
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key

# Network
VITE_ALGORAND_NETWORK=testnet

# Claim Contract (auto-generated after deploy)
VITE_CLAIM_APP_ID=
VITE_CLAIM_APP_ADDRESS=
```

---

# 🚀 Deploying Smart Contracts

## Escrow Claim Contract

```bash
cd contracts
python deploy_teal_escrow.py
```

This script will:
- Deploy contract to Algorand TestNet  
- Generate Application ID  
- Generate Contract Address  
- Automatically update `.env`  

After deployment:

```bash
npm run dev
```

---

# 🔎 Contract Verification

After deployment, verify on Lora Explorer:

https://lora.algokit.io/testnet/application/<APP_ID>

---

# 🔐 Security

- All transactions are wallet-signed  
- No private keys stored  
- Duplicate contribution prevention  
- Expiry enforcement  
- Balance validation  
- RLS enabled in Supabase  

---

# 🧠 Edge Cases Handled

- Duplicate payments prevented  
- Expired links rejected  
- Exact share validation  
- Insufficient balance detection  
- Auto-completion on target reach  
- Wallet disconnect handling  

---

# 🌐 Deployment

Frontend deployed on Vercel:

https://algosplit.vercel.app/

### Vercel Environment Variables

Set the following in Vercel:

- VITE_SUPABASE_URL  
- VITE_SUPABASE_ANON_KEY  
- VITE_ALGORAND_NETWORK  
- VITE_CLAIM_APP_ID  
- VITE_CLAIM_APP_ADDRESS  

---

# 📁 Project Structure

```
algo-split-link-main/
├── src/
│   ├── components/
│   ├── contexts/
│   ├── lib/
│   └── pages/
├── contracts/
└── supabase-schema.sql
```

---

# 📜 License

MIT License

---

# ❤️ Built on Algorand

AlgoSplit demonstrates how decentralized finance tools can simplify real-world payment coordination using secure smart contract escrow systems.
