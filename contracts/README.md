# AlgoSplit Smart Contracts

Smart contracts for AlgoSplit payment splitting platform using PuyaPy (Algorand Python).

## Setup

1. Install Python 3.10+ and pip
2. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Install PuyaPy compiler:
```bash
pip install puya
```

## Contract Structure

- `payment_split.py`: Main smart contract for managing split payments
- `deploy.py`: Deployment script

## Deployment

Set environment variables:
```bash
export ALGORAND_NETWORK=testnet
export ALGOD_URL=https://testnet-api.algonode.cloud
export ALGOD_TOKEN=
export DEPLOYER_MNEMONIC="your mnemonic here"
```

Run deployment:
```bash
python deploy.py
```

## Contract Methods

### create_payment
Creates a new payment split with specified parameters.

### contribute
Allows a user to contribute their share to a payment split.

### get_payment_info
Retrieves payment information including status and collected amount.

### has_contributed
Checks if a specific account has already contributed.









