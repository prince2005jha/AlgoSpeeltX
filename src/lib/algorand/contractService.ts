import algosdk from 'algosdk';
import { ALGORAND_CONFIG, CLAIM_APP_ID, CLAIM_APP_ADDRESS, USDC_ASSET_ID } from './config';

export interface PaymentContract {
  appId: number;
  appAddress: string;
}

export interface PaymentContractState {
  receiver: string;
  totalAmount: number;
  participants: number;
  collected: number;
  contributorCount: number;
  status: 'active' | 'completed';
}

export class ContractService {
  private algod: algosdk.Algodv2;
  private network: 'testnet' | 'mainnet';

  constructor() {
    this.network = (ALGORAND_CONFIG.network as 'testnet' | 'mainnet') || 'testnet';
    const config = ALGORAND_CONFIG[this.network];
    
    this.algod = new algosdk.Algodv2(
      '',
      config.algodServer,
      ''
    );
  }

  /**
   * Deploy the PaymentSplit smart contract
   */
  async deployContract(
    deployerAddress: string,
    signer: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>
  ): Promise<PaymentContract> {
    // Note: In production, you would compile the Python contract to TEAL
    // and deploy it. For now, this is a placeholder structure.
    // The actual deployment should be done via the Python deployment script.
    
    throw new Error(
      'Contract deployment should be done via Python script. ' +
      'See contracts/deploy.py. After deployment, use setContractAppId() to configure the app ID.'
    );
  }

  /**
   * Set the deployed contract application ID
   */
  setContractAppId(appId: number): PaymentContract {
    const appAddress = algosdk.getApplicationAddress(appId);
    return {
      appId,
      appAddress,
    };
  }

  /**
   * Create a payment split via smart contract
   * Note: This requires the contract to be compiled and deployed first
   * The ABI encoding will be generated from the compiled contract
   */
  async createPayment(
    contract: PaymentContract,
    receiverAddress: string,
    totalAmount: number,
    participants: number,
    title: string,
    description: string,
    senderAddress: string,
    signer: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>
  ): Promise<string> {
    try {
      const suggestedParams = await this.algod.getTransactionParams().do();

      // Method selector for create_payment
      // This will be generated from the compiled contract ABI
      // For now, using a simple approach with method name encoding
      const methodName = 'create_payment';
      const methodSelector = algosdk.stringToBytes(methodName).slice(0, 4);

      // Encode arguments manually
      // Note: In production, use the generated ABI from the compiled contract
      const receiverBytes = algosdk.decodeAddress(receiverAddress).publicKey;
      const totalAmountMicroAlgos = BigInt(Math.floor(totalAmount * 1_000_000));
      const participantsBigInt = BigInt(participants);
      const titleBytes = new TextEncoder().encode(title);
      const descriptionBytes = new TextEncoder().encode(description);

      // Simple encoding (in production, use proper ABI encoding from compiled contract)
      const appArgs = [
        methodSelector,
        receiverBytes,
        algosdk.encodeUint64(totalAmountMicroAlgos),
        algosdk.encodeUint64(participantsBigInt),
        algosdk.encodeUint64(BigInt(titleBytes.length)),
        ...titleBytes,
        algosdk.encodeUint64(BigInt(descriptionBytes.length)),
        ...descriptionBytes,
      ];

      // Create app call transaction
      const txn = algosdk.makeApplicationCallTxnFromObject({
        from: senderAddress,
        appIndex: contract.appId,
        appArgs: appArgs,
        suggestedParams,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
      });

      // Sign and send
      const signedTxns = await signer([txn]);
      if (!signedTxns || signedTxns.length === 0) {
        throw new Error('Transaction not signed');
      }

      const response = await this.algod.sendRawTransaction(signedTxns[0]).do();
      await algosdk.waitForConfirmation(this.algod, response.txid, 4);

      // The payment ID is the transaction ID
      return response.txid;
    } catch (error) {
      console.error('Error creating payment via contract:', error);
      throw error;
    }
  }

  /**
   * Contribute to a payment split via smart contract
   * Note: This requires the contract to be compiled and deployed first
   */
  async contribute(
    contract: PaymentContract,
    paymentId: string,
    amount: number,
    senderAddress: string,
    signer: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>
  ): Promise<string> {
    try {
      const suggestedParams = await this.algod.getTransactionParams().do();

      // Method selector for contribute
      const methodName = 'contribute';
      const methodSelector = algosdk.stringToBytes(methodName).slice(0, 4);

      // Convert payment ID (txid) to uint64 (first 8 bytes)
      // Use browser-compatible hex conversion instead of Buffer
      const hexToBytes = (hex: string): Uint8Array => {
        const bytes = new Uint8Array(hex.length / 2);
        for (let i = 0; i < hex.length; i += 2) {
          bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
        }
        return bytes;
      };
      
      const bytesToHex = (bytes: Uint8Array): string => {
        return Array.from(bytes)
          .map(b => b.toString(16).padStart(2, '0'))
          .join('');
      };
      
      const paymentIdBytes = hexToBytes(paymentId).slice(0, 8);
      const paymentIdUint64 = BigInt('0x' + bytesToHex(paymentIdBytes));
      const amountMicroAlgos = BigInt(Math.floor(amount * 1_000_000));

      // Encode arguments
      const appArgs = [
        methodSelector,
        algosdk.encodeUint64(paymentIdUint64),
        algosdk.encodeUint64(amountMicroAlgos),
      ];

      // Create app call transaction
      const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
        from: senderAddress,
        appIndex: contract.appId,
        appArgs: appArgs,
        suggestedParams,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
      });

      // Sign and send
      const signedTxns = await signer([appCallTxn]);
      if (!signedTxns || signedTxns.length === 0) {
        throw new Error('Transaction not signed');
      }

      const response = await this.algod.sendRawTransaction(signedTxns[0]).do();
      await algosdk.waitForConfirmation(this.algod, response.txid, 4);

      return response.txid;
    } catch (error) {
      console.error('Error contributing via contract:', error);
      throw error;
    }
  }

  /**
   * Get payment information from smart contract
   */
  async getPaymentInfo(
    contract: PaymentContract,
    paymentId: string
  ): Promise<PaymentContractState | null> {
    try {
      // Read application state
      const appInfo = await this.algod.getApplicationByID(contract.appId).do();
      
      // Note: Reading local state requires knowing the account
      // For now, we'll need to query via indexer or store in Supabase
      // This is a placeholder for the contract state reading logic
      
      return null;
    } catch (error) {
      console.error('Error getting payment info from contract:', error);
      return null;
    }
  }

  /**
   * Check if an account has contributed to a payment
   */
  async hasContributed(
    contract: PaymentContract,
    paymentId: string,
    contributorAddress: string
  ): Promise<boolean> {
    try {
      // This would query the contract's local state
      // Implementation depends on how state is stored
      return false;
    } catch (error) {
      console.error('Error checking contribution status:', error);
      return false;
    }
  }
}

export const contractService = new ContractService();

/**
 * Escrow Claim Link Service
 */
export interface ClaimLinkEscrow {
  sender: string;
  receiver: string;
  amount: number;
  assetId: number; // 0 for ALGO, >0 for ASA
  expiryTime: number; // Unix timestamp
  claimed: number; // 0 = unclaimed, 1 = claimed, 2 = cancelled
}

export class EscrowClaimService {
  private algod: algosdk.Algodv2;
  private network: 'testnet' | 'mainnet';
  private appId: number | undefined;
  private appAddress: string | undefined;

  constructor() {
    this.network = (ALGORAND_CONFIG.network as 'testnet' | 'mainnet') || 'testnet';
    const config = ALGORAND_CONFIG[this.network];
    
    this.algod = new algosdk.Algodv2(
      '',
      config.algodServer,
      ''
    );

    this.appId = CLAIM_APP_ID;
    this.appAddress = CLAIM_APP_ADDRESS;
  }

  isConfigured(): boolean {
    const configured = !!this.appId && !!this.appAddress;
    if (!configured) {
      console.warn('EscrowClaimService not configured:', {
        appId: this.appId,
        appAddress: this.appAddress,
        envAppId: import.meta.env.VITE_CLAIM_APP_ID,
        envAppAddress: import.meta.env.VITE_CLAIM_APP_ADDRESS
      });
    } else {
      console.log('✅ EscrowClaimService configured:', {
        appId: this.appId,
        appAddress: this.appAddress
      });
    }
    return configured;
  }

  /**
   * Create a claim link and fund the escrow
   */
  async createClaimLink(
    senderAddress: string,
    amount: number, // In base units (ALGO or USDC)
    currency: 'ALGO' | 'USDC',
    receiverAddress: string | null, // null for "anyone can claim"
    expiryTime: number, // Unix timestamp, 0 for no expiry
    signer: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>
  ): Promise<{ claimId: number; txId: string }> {
    if (!this.isConfigured()) {
      throw new Error('Claim contract not configured. Deploy escrow_claim_link.py first.');
    }

    const params = await this.algod.getTransactionParams().do();
    const txns: algosdk.Transaction[] = [];

    // Determine asset ID
    const assetId = currency === 'ALGO' ? 0 : USDC_ASSET_ID[this.network];
    const amountInBaseUnits = Math.floor(amount * 1_000_000); // Convert to microAlgos/microUSDC

    // Transaction 1: Payment/Asset Transfer to fund escrow
    if (currency === 'ALGO') {
      txns.push(
        algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: senderAddress,
          receiver: this.appAddress!,
          amount: amountInBaseUnits,
          suggestedParams: params,
        })
      );
    } else {
      txns.push(
        algosdk.makeAssetTransferTxnWithSuggestedParamsFromObject({
          sender: senderAddress,
          receiver: this.appAddress!,
          assetIndex: assetId,
          amount: amountInBaseUnits,
          suggestedParams: params,
        })
      );
    }

    // Transaction 2: App call to create_claim_link
    // ABI method signature: create_claim_link(payment,account,uint64)string
    const methodSelector = new Uint8Array([0x00, 0x00, 0x00, 0x00]); // Placeholder - use actual ABI

    // Encode receiver (use zero address if null)
    const receiverBytes = receiverAddress 
      ? algosdk.decodeAddress(receiverAddress).publicKey 
      : new Uint8Array(32);

    // Encode expiry time
    const expiryBytes = new Uint8Array(8);
    new DataView(expiryBytes.buffer).setBigUint64(0, BigInt(expiryTime), false);

    const appArgs = [methodSelector, receiverBytes, expiryBytes];

    // Include box creation fee
    // Box size: 89 bytes, cost: 0.0025 ALGO per byte = ~0.25 ALGO
    const boxFee = 2500 + 400 * 89; // 2500 base + 400 per byte

    txns.push(
      algosdk.makeApplicationCallTxnFromObject({
        sender: senderAddress,
        appIndex: this.appId!,
        onComplete: algosdk.OnApplicationComplete.NoOpOC,
        appArgs,
        suggestedParams: {
          ...params,
          fee: boxFee + 1000, // Include box creation fee + txn fee
          flatFee: true,
        },
      })
    );

    // Group transactions
    algosdk.assignGroupID(txns);

    // Sign transactions
    const signedTxns = await signer(txns);

    // Send transactions
    const { txId } = await this.algod.sendRawTransaction(signedTxns).do();

    // Wait for confirmation
    await algosdk.waitForConfirmation(this.algod, txId, 4);

    // Get claim ID from transaction logs
    const txInfo = await this.algod.pendingTransactionInformation(txId).do();
    
    // Extract claim ID from logs (simplified - actual implementation would parse logs)
    // For now, we'll use a sequential counter approach
    const claimId = Date.now(); // Placeholder - should be extracted from contract logs

    return { claimId, txId };
  }

  /**
   * Claim funds from escrow
   */
  async claim(
    claimId: number,
    claimerAddress: string,
    signer: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Claim contract not configured. Deploy escrow_claim_link.py first.');
    }

    const params = await this.algod.getTransactionParams().do();

    // ABI method signature: claim(uint64)bool
    const methodSelector = new Uint8Array([0x00, 0x00, 0x00, 0x00]); // Placeholder - use actual ABI

    // Encode claim ID
    const claimIdBytes = new Uint8Array(8);
    new DataView(claimIdBytes.buffer).setBigUint64(0, BigInt(claimId), false);

    const appArgs = [methodSelector, claimIdBytes];

    const txn = algosdk.makeApplicationCallTxnFromObject({
      sender: claimerAddress,
      appIndex: this.appId!,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs,
      suggestedParams: {
        ...params,
        fee: 2000, // Cover inner transaction fee
        flatFee: true,
      },
    });

    // Sign transaction
    const signedTxns = await signer([txn]);

    // Send transaction
    const { txId } = await this.algod.sendRawTransaction(signedTxns).do();

    // Wait for confirmation
    await algosdk.waitForConfirmation(this.algod, txId, 4);

    return txId;
  }

  /**
   * Cancel claim link and get refund
   */
  async cancel(
    claimId: number,
    senderAddress: string,
    signer: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>
  ): Promise<string> {
    if (!this.isConfigured()) {
      throw new Error('Claim contract not configured. Deploy escrow_claim_link.py first.');
    }

    const params = await this.algod.getTransactionParams().do();

    // ABI method signature: cancel(uint64)bool
    const methodSelector = new Uint8Array([0x00, 0x00, 0x00, 0x00]); // Placeholder - use actual ABI

    // Encode claim ID
    const claimIdBytes = new Uint8Array(8);
    new DataView(claimIdBytes.buffer).setBigUint64(0, BigInt(claimId), false);

    const appArgs = [methodSelector, claimIdBytes];

    const txn = algosdk.makeApplicationCallTxnFromObject({
      sender: senderAddress,
      appIndex: this.appId!,
      onComplete: algosdk.OnApplicationComplete.NoOpOC,
      appArgs,
      suggestedParams: {
        ...params,
        fee: 2000, // Cover inner transaction fee
        flatFee: true,
      },
    });

    // Sign transaction
    const signedTxns = await signer([txn]);

    // Send transaction
    const { txId } = await this.algod.sendRawTransaction(signedTxns).do();

    // Wait for confirmation
    await algosdk.waitForConfirmation(this.algod, txId, 4);

    return txId;
  }

  /**
   * Get claim link info from contract
   */
  async getClaimInfo(claimId: number): Promise<ClaimLinkEscrow | null> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      // ABI method signature: get_claim_info(uint64)(account,account,uint64,uint64,uint64,uint64)
      // This would use the ABI to call the read-only method
      // For now, this is a placeholder
      
      // In production, use algosdk.ABIContract and call get_claim_info
      return null;
    } catch (error) {
      console.error('Error getting claim info:', error);
      return null;
    }
  }
}

export const escrowClaimService = new EscrowClaimService();

