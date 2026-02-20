# AlgoSplit

## 📄 Overview

AlgoSplit is a decentralized payment splitting and funding application built on the Algorand blockchain. It enables users to effortlessly split bills or send & receive payments by creating shareable payment links. Friends and family can contribute or claim their portion using ALGO or USDCa directly through their Algorand wallets with funds automatically distributed to the receiver once the payment target is reached.

The Claim link Function Uses Smart contract escrow which holds the funds sent by the sender and releases when receiver claims !

**Key Features:**
- Split payments between multiple participants
- Create escrow-based claim links for one-time payments
- Support for ALGO and USDCa (ASA) tokens
- Secure smart contract escrow system
- Beautiful, modern UI with wallet integration
- Real-time payment tracking and history

🌐 **Live Application:** ([https://algosplit.vercel.app/](https://algo-speelt-x.vercel.app/))

## Features

-  **ALGO Payments** - Fast and secure blockchain payments
-  **Shareable Links** - Easy payment link sharing across any device
-  **Multi participant Support** - Split bills between any number of people
-  **Secure** - Built on Algorand blockchain with Supabase backend
-  **Beautiful UI** - Modern, responsive design
-  **Multiple Wallets** - Support for Pera, Defly, and Lute wallets
-  **Payment History** - Track your created and contributed payments
-  **Auto Completion** - Payment links stop accepting when target is reached

## How It Works

1. **Create** - Create a payment link with total amount and number of participants
2. **Share** - Send the link to your friends/family
3. **Pay** - Each person clicks and pays their share using their Algorand wallet
4. **Complete** - Payment link stops accepting new contributions when target is reached

## Example

If you create a payment link for 100 ALGO split between 5 people:
- Each participant pays exactly 20 ALGO
- Payment link accepts exactly 5 payments of 20 ALGO each
- After 5 payments, the link stops working (status: completed)
- Funds go directly to the specified receiver address

## ⚙️ Setup & Installation

### Prerequisites

- **Node.js** 18+ 
- **npm** or **yarn**
- **Python** 3.10+ (for smart contract development)
- **Algorand wallet** (Pera, Defly, or Lute)
- **Supabase account** (for backend database)

### Frontend Installation

```bash
# Clone the repository
git clone <repository-url>

# Navigate to the project
cd algo-split-link-main

# Install dependencies
npm install

# Start development server
npm run dev
```

### Smart Contract Setup

For deploying and working with smart contracts:

```bash
# Navigate to contracts directory
cd contracts

# Create virtual environment (Windows)
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Install PuyaPy compiler
pip install puya
```

### Environment Configuration

Create a `.env` file in the project root:

```env
# Supabase Configuration (REQUIRED)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Algorand Network (REQUIRED)
VITE_ALGORAND_NETWORK=testnet

# Smart Contract Configuration (OPTIONAL - only if using Claim Links)
# These are automatically set when you run: python contracts/deploy_teal_escrow.py
# Or manually add them after deploying:
VITE_CLAIM_APP_ID=12345678                    # Numeric ID from deployment (e.g., 12345678)
VITE_CLAIM_APP_ADDRESS=ABC123...XYZ789       # 58-character Algorand address

# Payment Split Contract (OPTIONAL - for future use)
VITE_PAYMENT_APP_ID=your_payment_contract_app_id
```

**What to enter for each variable:**

| Variable | What to Enter | Example | Required? |
|----------|---------------|---------|-----------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` | ✅ Yes |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase anon/public key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | ✅ Yes |
| `VITE_ALGORAND_NETWORK` | Network name | `testnet` or `mainnet` | ✅ Yes |
| `VITE_CLAIM_APP_ID` | Numeric application ID | `12345678` | ❌ Only for Claim Links |
| `VITE_CLAIM_APP_ADDRESS` | 58-char Algorand address | `ABC123...XYZ789` | ❌ Only for Claim Links |
| `VITE_PAYMENT_APP_ID` | Numeric application ID | `87654321` | ❌ Optional |

> **💡 Tip:** The easiest way to get `VITE_CLAIM_APP_ID` and `VITE_CLAIM_APP_ADDRESS` is to run the deployment script - it will automatically add them to your `.env` file!

**Setting up Supabase:**
1. Sign up at [supabase.com](https://supabase.com)
2. Create a new project
3. Run the SQL from `supabase-schema.sql` in the SQL Editor
4. Get your credentials from Settings → API

**For mainnet production:**
```env
VITE_ALGORAND_NETWORK=mainnet
```

### Getting Testnet Funds

1. Visit [Algorand Testnet Dispenser](https://dispenser.testnet.algorand.network/)
2. Enter your Algorand wallet address
3. Get testnet ALGO

## Usage

### Creating a Payment Link

1. Click "Connect Wallet" in the navbar
2. Select your preferred Algorand wallet
3. Navigate to "Create Payment"
4. Fill in the payment details:
   - Title and description
   - Total amount in ALGO
   - Number of participants
   - Receiver address (automatically filled from your wallet)
   - Optional expiry date
5. Click "Create Payment Link"

### Making a Payment

1. Open the payment link
2. Connect your wallet
3. Click "Pay" to contribute your share
4. Confirm the transaction in your wallet
5. Wait for confirmation (usually 4-5 seconds)

## 🔗 Deployed Smart Contracts

AlgoSplit uses smart contracts deployed on the Algorand TestNet. After deploying your contracts, you can verify them using [Lora Explorer](https://lora.algokit.io/testnet).

### Understanding Contract IDs and Addresses

**What are `VITE_CLAIM_APP_ID` and `VITE_CLAIM_APP_ADDRESS`?**

When you deploy a smart contract to Algorand, it creates an **Application** on the blockchain. This application has:

1. **Application ID (App ID)**: A unique numeric identifier assigned by Algorand (e.g., `12345678`)
   - This is used to call the contract's methods
   - Think of it as the contract's "phone number"

2. **Application Address**: A unique Algorand address derived from the App ID (e.g., `ABC123...XYZ789`)
   - This address can receive ALGO and assets
   - Funds sent here are held in escrow by the smart contract
   - Think of it as the contract's "bank account"

**When do you need these values?**

- ✅ **Required** if you want to use the **Claim Link** feature (escrow-based one-time payments)
- ❌ **Optional** if you only want to use the **Payment Split** feature (multi-participant payments)

### Step-by-Step: Getting Your Contract Values

The deployment script automatically generates and saves these values:

1. **Deploy the contract:**
   ```bash
   cd contracts
   python deploy_teal_escrow.py
   ```

2. **The script will:**
   - Deploy the contract to Algorand TestNet
   - Generate the App ID and Address
   - **Automatically update your `.env` file** with:
     ```
     VITE_CLAIM_APP_ID=12345678
     VITE_CLAIM_APP_ADDRESS=ABC123...XYZ789
     ```
   - Show you the explorer link to verify

3. **Restart your dev server:**
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

### Deploying Contracts

**Escrow Claim Link Contract:**
```bash
cd contracts
python deploy_teal_escrow.py
```

After deployment, the script will output:
- **Application ID** (e.g., `12345678`) → This goes in `VITE_CLAIM_APP_ID`
- **Contract Address** (e.g., `ABC123...XYZ789`) → This goes in `VITE_CLAIM_APP_ADDRESS`
- **Explorer link** (e.g., `https://lora.algokit.io/testnet/application/12345678`)

**Payment Split Contract:**
```bash
cd contracts
python deploy.py  # (if available)
```

### Our Deployed Smart Contracts on Algorand TestNet

[lora.algokit.io/testnet](https://lora.algokit.io/testnet) to show and verify our deployed contract or asset links on the Algorand TestNet.

**Escrow Claim Link Contract:**
- **Application ID:** `749648130`
- **Contract Address:** [View on Lora](https://lora.algokit.io/testnet/account/SPVG6DQRDUJPERURDXWO7HCKVCRDSUABA22NILY5TLJYO27ES2L767AI24)`
- **Lora Explorer:** [View on Lora](https://lora.algokit.io/testnet/application/749648130)

> **Example:** If your `VITE_CLAIM_APP_ID=12345678`, your verification link would be:
> `https://lora.algokit.io/testnet/application/12345678`

### Contract Features

**Escrow Claim Link Contract (`escrow_claim_link.py`):**
- Pre-funded escrow system
- One-time claim links
- Optional receiver restrictions
- Expiry enforcement
- Cancel/refund functionality
- Support for ALGO and ASA tokens

**Payment Split Contract (`payment_split.py`):**
- Multi-participant payment splitting
- Automatic completion when target reached
- Duplicate contribution prevention
- Real-time balance tracking

## 🧠 Architecture & Components

### System Architecture

AlgoSplit follows a **decentralized architecture** with the following components:

```
┌─────────────────┐
│   Frontend      │  React + TypeScript + Vite
│   (Vercel)      │  └─ Wallet Integration (Pera/Defly/Lute)
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐ ┌──▼────────┐
│Algorand│ │ Supabase │
│Blockchain│ │Database │
│         │ │          │
│ Smart  │ │ Payment  │
│Contracts│ │ History │
└─────────┘ └──────────┘
```

### Frontend Components

**Tech Stack:**
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Library**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context API
- **Routing**: React Router v6
- **Wallet Integration**: @txnlab/use-wallet-react
- **Blockchain SDK**: algosdk (Algorand SDK)

**Key Components:**
- `PaymentContext.tsx` - Manages payment splitting logic
- `ClaimLinkContext.tsx` - Handles escrow claim link functionality
- `ConnectWallet.tsx` - Wallet connection interface
- `contractService.ts` - Smart contract interaction layer

### Smart Contracts

**Escrow Claim Link Contract** (`escrow_claim_link.py`):
- Written in PuyaPy (Algorand Python)
- Uses box storage for claim link data
- Methods: `create_claim_link`, `claim`, `cancel`, `get_claim_info`
- Supports both ALGO and ASA (USDCa) tokens

**Payment Split Contract** (`payment_split.py`):
- Manages multi-participant payments
- Tracks contributions and completion status
- Methods: `create_payment`, `contribute`, `get_payment_info`, `has_contributed`

### Backend

**Supabase (PostgreSQL):**
- Stores payment metadata and history
- Row Level Security (RLS) for data protection
- Real-time subscriptions for live updates
- Tables: `payments`, `claim_links`, `contributions`

### Project Structure

```
algo-split-link-main/
├── src/
│   ├── components/        # React UI components
│   │   ├── ui/            # shadcn/ui components
│   │   ├── ConnectWallet.tsx
│   │   ├── Features.tsx
│   │   └── Navbar.tsx
│   ├── contexts/          # State management
│   │   ├── PaymentContext.tsx
│   │   └── ClaimLinkContext.tsx
│   ├── lib/
│   │   ├── algorand/      # Blockchain integration
│   │   │   ├── config.ts
│   │   │   ├── contractService.ts
│   │   │   └── simplePayment.ts
│   │   └── supabase/      # Database integration
│   │       └── config.ts
│   └── pages/             # Route pages
│       ├── Landing.tsx
│       ├── CreatePayment.tsx
│       ├── CreateClaimLink.tsx
│       ├── JoinPayment.tsx
│       ├── ClaimLinkPage.tsx
│       └── MyPayments.tsx
├── contracts/             # Smart contracts
│   ├── escrow_claim_link.py
│   ├── payment_split.py
│   ├── deploy_teal_escrow.py
│   └── requirements.txt
└── supabase-schema.sql    # Database schema
```

## Security

- All transactions are signed by user wallets
- No private keys are stored
- Duplicate payment prevention
- Expiry date enforcement
- Row Level Security (RLS) in Supabase
- Data persistence across devices

## Edge Cases Handled

✅ Duplicate contributions (user can only contribute once)  
✅ Payment expiry  
✅ Exact amount validation  
✅ Balance checks before transaction  
✅ Network connectivity issues  
✅ Wallet disconnection handling  
✅ Insufficient balance handling  

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

MIT

## 🌐 Frontend Deployment

The frontend is deployed on **Vercel** and accessible at:

**🔗 Live Application:** [https://algosplit.vercel.app/](https://algosplit.vercel.app/)

### Deploying to Vercel

Quick deploy:
```bash
npm install -g vercel
vercel
```

Or connect your GitHub repository to Vercel for automatic deployments.

### Environment Variables on Vercel

Make sure to set all environment variables in your Vercel project settings:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_ALGORAND_NETWORK`
- `VITE_PAYMENT_APP_ID` (if using payment split contract)
- `VITE_CLAIM_APP_ID` (if using claim link contract)
- `VITE_CLAIM_APP_ADDRESS` (if using claim link contract)

## Links

- [Algorand Documentation](https://developer.algorand.org/)
- [Pera Wallet](https://perawallet.app/)
- [Defly Wallet](https://defly.app/)
- [Supabase](https://supabase.com/)

## Support

For issues or questions, please open an issue on GitHub.

---

Built with ❤️ on Algorand
