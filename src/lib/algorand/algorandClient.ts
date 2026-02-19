import algosdk from 'algosdk';
import { ALGORAND_CONFIG, USDC_ASSET_ID } from './config';

export class AlgorandClient {
  private client: algosdk.Algodv2;
  private indexer: algosdk.Indexer;
  private network: 'testnet' | 'mainnet';

  constructor() {
    this.network = ALGORAND_CONFIG.network as 'testnet' | 'mainnet';
    const config = ALGORAND_CONFIG[this.network];
    
    this.client = new algosdk.Algodv2(
      '',
      config.algodServer,
      ''
    );
    
    this.indexer = new algosdk.Indexer(
      '',
      config.indexerServer,
      ''
    );
  }

  async getAccountInfo(address: string) {
    try {
      const accountInfo = await this.client.accountInformation(address).do();
      return accountInfo;
    } catch (error) {
      console.error('Error fetching account info:', error);
      throw error;
    }
  }

  async getAssetBalance(address: string, assetId: number) {
    try {
      const accountInfo = await this.getAccountInfo(address);
      const asset = accountInfo.assets?.find((a: any) => a['asset-id'] === assetId);
      return asset ? asset.amount : 0;
    } catch (error) {
      console.error('Error fetching asset balance:', error);
      return 0;
    }
  }

  async getUSDCBalance(address: string) {
    const assetId = USDC_ASSET_ID[this.network];
    return await this.getAssetBalance(address, assetId);
  }

  async getAccountBalance(address: string) {
    try {
      const accountInfo = await this.getAccountInfo(address);
      return accountInfo.amount;
    } catch (error) {
      console.error('Error fetching balance:', error);
      return 0;
    }
  }

  async isOnline() {
    try {
      await this.client.healthCheck().do();
      return true;
    } catch {
      return false;
    }
  }

  async getTransactionParams() {
    const params = await this.client.getTransactionParams().do();
    return params;
  }

  async waitForConfirmation(txId: string, timeout = 1000) {
    try {
      const confirmedTxn = await algosdk.waitForConfirmation(
        this.client,
        txId,
        timeout
      );
      return confirmedTxn;
    } catch (error) {
      console.error('Error waiting for confirmation:', error);
      throw error;
    }
  }

  async fetchTransaction(txId: string) {
    try {
      const transaction = await this.client.pendingTransactionInformation(txId).do();
      return transaction;
    } catch (error) {
      console.error('Error fetching transaction:', error);
      throw error;
    }
  }

  getNetwork() {
    return this.network;
  }
}

export const algorandClient = new AlgorandClient();

