import algosdk from 'algosdk';

// Simple Algorand configuration
const ALGOD_TOKEN = '';
const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
const ALGOD_PORT = '';

// Simple payment function
export async function sendAlgo(
  sender: string, 
  recipient: string, 
  amount: number,
  signer: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>
) {
  console.log('sendAlgo called with:', { sender, recipient, amount });
  
  // Validate addresses
  if (!sender || !recipient) {
    console.error('Address validation failed:', { sender, recipient });
    throw new Error('Address must not be null or undefined');
  }
  
  if (!algosdk.isValidAddress(sender) || !algosdk.isValidAddress(recipient)) {
    console.error('Invalid Algorand address:', { sender, recipient });
    throw new Error('Invalid Algorand address');
  }

  // Initialize Algod client
  const algod = new algosdk.Algodv2(ALGOD_TOKEN, ALGOD_SERVER, ALGOD_PORT);
  
  // Get transaction parameters
  const params = await algod.getTransactionParams().do();
  
  // Create payment transaction
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender,
    to: recipient,
    amount: Math.floor(amount * 1_000_000), // Convert ALGO to microAlgos
    suggestedParams: params
  } as any);
  
  // Sign transaction
  const signedTxns = await signer([txn]);
  
  if (!signedTxns || signedTxns.length === 0) {
    throw new Error('Transaction not signed');
  }
  
  // Send transaction
  const txid = await algod.sendRawTransaction(signedTxns[0]).do();
  
  // Wait for confirmation
  await algosdk.waitForConfirmation(algod, txid.txid, 4);
  
  return txid.txid;
}

