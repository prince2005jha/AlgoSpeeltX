import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@txnlab/use-wallet-react';
import algosdk from 'algosdk';
import { supabase, isSupabaseReady } from '@/lib/supabase/config';
import { escrowClaimService } from '@/lib/algorand/contractService';
import { CLAIM_APP_ID, CLAIM_APP_ADDRESS } from '@/lib/algorand/config';
import toast from 'react-hot-toast';

export interface ClaimLink {
  id: string;
  senderAddress: string;
  receiverAddress?: string; // Optional - if empty, anyone can claim
  amount: number;
  currency: string;
  createdAt: Date;
  expiryDate?: Date;
  claimed: boolean;
  claimedAt?: Date;
  claimedBy?: string;
  status: 'active' | 'claimed' | 'expired' | 'cancelled';
  txHash?: string;
  claimTxHash?: string;
  contractAppId?: number;
  contractAddress?: string;
}

interface ClaimLinkContextType {
  claimLinks: ClaimLink[];
  createClaimLink: (claimLink: Omit<ClaimLink, 'id' | 'createdAt' | 'claimed' | 'status'>) => Promise<string>;
  getClaimLink: (id: string) => ClaimLink | undefined;
  fetchClaimLinkFromSupabase: (id: string) => Promise<ClaimLink | undefined>;
  claimLink: (id: string, claimerAddress?: string) => Promise<string>;
  cancelClaimLink: (id: string) => Promise<void>;
}

const ClaimLinkContext = createContext<ClaimLinkContextType | undefined>(undefined);

export const ClaimLinkProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { transactionSigner, activeAddress } = useWallet();
  const [claimLinks, setClaimLinks] = useState<ClaimLink[]>([]);

  useEffect(() => {
    loadClaimLinks();
  }, []);

  const loadClaimLinks = async () => {
    try {
      if (!isSupabaseReady) {
        // Fall back to localStorage
        const stored = localStorage.getItem('algoPayMe_claimLinks');
        if (stored) {
          const allClaimLinks = JSON.parse(stored);
          const formattedClaimLinks = Object.values(allClaimLinks).map((details: any) => ({
            id: details.claimLink.id,
            senderAddress: details.claimLink.senderAddress,
            receiverAddress: details.claimLink.receiverAddress,
            amount: details.claimLink.amount,
            currency: details.claimLink.currency,
            createdAt: new Date(details.claimLink.createdAt),
            expiryDate: details.claimLink.expiryDate ? new Date(details.claimLink.expiryDate) : undefined,
            claimed: details.claimed || false,
            claimedAt: details.claimedAt ? new Date(details.claimedAt) : undefined,
            claimedBy: details.claimedBy,
            status: details.status || 'active',
            txHash: details.txHash,
            claimTxHash: details.claimTxHash,
            contractAppId: details.contractAppId || details.claimLink.contractAppId,
            contractAddress: details.contractAddress || details.claimLink.contractAddress,
          }));
          setClaimLinks(formattedClaimLinks);
        }
        return;
      }

      // Load from Supabase
      const { data, error } = await supabase
        .from('claim_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('Error loading claim links from Supabase, falling back to localStorage:', error);
        // Fall back to localStorage
        const stored = localStorage.getItem('algoPayMe_claimLinks');
        if (stored) {
          const allClaimLinks = JSON.parse(stored);
          const formattedClaimLinks = Object.values(allClaimLinks).map((details: any) => ({
            id: details.claimLink.id,
            senderAddress: details.claimLink.senderAddress,
            receiverAddress: details.claimLink.receiverAddress,
            amount: details.claimLink.amount,
            currency: details.claimLink.currency,
            createdAt: new Date(details.claimLink.createdAt),
            expiryDate: details.claimLink.expiryDate ? new Date(details.claimLink.expiryDate) : undefined,
            claimed: details.claimed || false,
            claimedAt: details.claimedAt ? new Date(details.claimedAt) : undefined,
            claimedBy: details.claimedBy,
            status: details.status || 'active',
            txHash: details.txHash,
            claimTxHash: details.claimTxHash,
            contractAppId: details.contractAppId || details.claimLink.contractAppId,
            contractAddress: details.contractAddress || details.claimLink.contractAddress,
          }));
          setClaimLinks(formattedClaimLinks);
        }
        return;
      }

      if (data) {
          const formattedClaimLinks = data.map((claimLink: any) => ({
            id: claimLink.id,
            senderAddress: claimLink.sender_address,
            receiverAddress: claimLink.receiver_address,
            amount: claimLink.amount,
            currency: claimLink.currency,
            createdAt: new Date(claimLink.created_at),
            expiryDate: claimLink.expiry_date ? new Date(claimLink.expiry_date) : undefined,
            claimed: claimLink.claimed || false,
            claimedAt: claimLink.claimed_at ? new Date(claimLink.claimed_at) : undefined,
            claimedBy: claimLink.claimed_by,
            status: claimLink.status || 'active',
            txHash: claimLink.tx_hash,
            claimTxHash: claimLink.claim_tx_hash,
            contractAppId: claimLink.contract_app_id,
            contractAddress: claimLink.contract_address,
          }));
        setClaimLinks(formattedClaimLinks);
      }
    } catch (error) {
      console.error('Error loading claim links:', error);
    }
  };

  const createClaimLink = async (claimLinkData: Omit<ClaimLink, 'id' | 'createdAt' | 'claimed' | 'status'>) => {
    try {
      if (!activeAddress) {
        throw new Error('Please connect your wallet first');
      }

      const id = Math.random().toString(36).substring(2, 15);
      let txHash: string | undefined;
      let contractAppId: number | undefined;
      let contractAddress: string | undefined;

      // Try to use escrow contract if configured
      if (escrowClaimService.isConfigured() && transactionSigner) {
        try {
          // For the simplified contract, just send ALGO directly to contract
          // This is a workaround until full contract is deployed
          const expiryTime = claimLinkData.expiryDate 
            ? Math.floor(claimLinkData.expiryDate.getTime() / 1000) 
            : 0;

          // Send ALGO to contract as escrow
          const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
          const algod = new algosdk.Algodv2('', ALGOD_SERVER, '');
          const suggestedParams = await algod.getTransactionParams().do();
          
          const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
            sender: activeAddress,
            receiver: escrowClaimService['appAddress'] as string,
            amount: Math.floor(claimLinkData.amount * 1_000_000),
            note: new Uint8Array(Buffer.from(`claim_link:${id}`)),
            suggestedParams
          });

          const signedTxns = await transactionSigner([txn], [0]);
          const response = await algod.sendRawTransaction(signedTxns[0]).do();
          await algosdk.waitForConfirmation(algod, response.txid, 4);
          
          txHash = response.txid;
          // Use contract from config (from .env)
          contractAppId = CLAIM_APP_ID;
          contractAddress = CLAIM_APP_ADDRESS;
          
          console.log('✅ Escrow funded:', { txHash, contractAppId, contractAddress });
          toast.success('Claim link created and funds escrowed! 🎉');
        } catch (escrowError: any) {
          console.warn('Escrow contract creation failed:', escrowError);
          toast.error('Escrow failed: ' + (escrowError.message || 'Unknown error'));
          throw escrowError;
        }
      } else {
        console.warn('Escrow contract not configured. Links will require sender approval to claim.');
        toast('⚠️ Escrow not configured. Deploy escrow_claim_link.py first for production use.', {
          icon: '⚠️',
          duration: 4000,
        });
      }
      
      // Try to save to Supabase, but fall back to localStorage if it fails
      if (isSupabaseReady) {
        const insertData = {
          id,
          sender_address: claimLinkData.senderAddress,
          receiver_address: claimLinkData.receiverAddress || null,
          amount: claimLinkData.amount,
          currency: claimLinkData.currency,
          created_at: new Date().toISOString(),
          expiry_date: claimLinkData.expiryDate ? claimLinkData.expiryDate.toISOString() : null,
          claimed: false,
          status: 'active',
          tx_hash: txHash || null,
          contract_app_id: contractAppId || null,
          contract_address: contractAddress || null,
        };

        console.log('Attempting to save claim link to Supabase:', { id, insertData });
        
        const { data, error } = await supabase
          .from('claim_links')
          .insert(insertData)
          .select()
          .single();

        if (error) {
          console.error('Error creating claim link in Supabase:', error);
          console.error('Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
          });
          console.warn('Falling back to localStorage');
          // Fall through to localStorage save
        } else {
          console.log('✅ Claim link successfully saved to Supabase:', data);
          await loadClaimLinks();
          return id;
        }
      } else {
        console.warn('Supabase not ready, saving to localStorage only');
      }

      // Fall back to localStorage
      const stored = localStorage.getItem('algoPayMe_claimLinks');
      const claimLinks = stored ? JSON.parse(stored) : {};
      
      const newClaimLink = {
        claimLink: {
          ...claimLinkData,
          id,
          createdAt: new Date(),
          contractAppId,
          contractAddress,
        },
        claimed: false,
        status: 'active',
        txHash,
        contractAppId,
        contractAddress,
      };
      
      claimLinks[id] = newClaimLink;
      console.log('Saving to localStorage:', { id, contractAppId, contractAddress });
      
      localStorage.setItem('algoPayMe_claimLinks', JSON.stringify(claimLinks));
      await loadClaimLinks();
      return id;
    } catch (error) {
      console.error('Error creating claim link:', error);
      throw error;
    }
  };

  const getClaimLink = (id: string) => {
    const claimLink = claimLinks.find((cl) => cl.id === id);
    if (claimLink) return claimLink;
    
    // Always try localStorage as fallback (even if Supabase is configured but failed to load)
    try {
      const stored = localStorage.getItem('algoPayMe_claimLinks');
      if (stored) {
        const allClaimLinks = JSON.parse(stored);
        const claimLinkData = allClaimLinks[id];
        
        if (claimLinkData) {
          const loadedLink = {
            id: claimLinkData.claimLink.id,
            senderAddress: claimLinkData.claimLink.senderAddress,
            receiverAddress: claimLinkData.claimLink.receiverAddress,
            amount: claimLinkData.claimLink.amount,
            currency: claimLinkData.claimLink.currency,
            createdAt: new Date(claimLinkData.claimLink.createdAt),
            expiryDate: claimLinkData.claimLink.expiryDate ? new Date(claimLinkData.claimLink.expiryDate) : undefined,
            claimed: claimLinkData.claimed || false,
            claimedAt: claimLinkData.claimedAt ? new Date(claimLinkData.claimedAt) : undefined,
            claimedBy: claimLinkData.claimedBy,
            status: claimLinkData.status || 'active',
            txHash: claimLinkData.txHash,
            claimTxHash: claimLinkData.claimTxHash,
            contractAppId: claimLinkData.contractAppId || claimLinkData.claimLink.contractAppId,
            contractAddress: claimLinkData.contractAddress || claimLinkData.claimLink.contractAddress,
          };
          console.log('Loaded from localStorage:', { id, contractAppId: loadedLink.contractAppId });
          return loadedLink;
        }
      }
    } catch (error) {
      console.error('Error loading claim link from localStorage:', error);
    }
    
    return undefined;
  };

  // Async function to fetch a claim link from Supabase if not found in state/localStorage
  const fetchClaimLinkFromSupabase = async (id: string): Promise<ClaimLink | undefined> => {
    if (!isSupabaseReady) {
      return undefined;
    }

    try {
      // Use a regular select + limit(1) so that "no rows" returns 200 with an empty array,
      // instead of 406 with PGRST116 ("Cannot coerce the result to a single JSON object").
      const { data, error } = await supabase
        .from('claim_links')
        .select('*')
        .eq('id', id)
        .limit(1);

      if (error) {
        console.warn('Error fetching claim link from Supabase:', error);
        return undefined;
      }

      if (data && data.length > 0) {
        const row = data[0];

        const formattedClaimLink: ClaimLink = {
          id: row.id,
          senderAddress: row.sender_address,
          receiverAddress: row.receiver_address,
          amount: row.amount,
          currency: row.currency,
          createdAt: new Date(row.created_at),
          expiryDate: row.expiry_date ? new Date(row.expiry_date) : undefined,
          claimed: row.claimed || false,
          claimedAt: row.claimed_at ? new Date(row.claimed_at) : undefined,
          claimedBy: row.claimed_by,
          status: row.status || 'active',
          txHash: row.tx_hash,
          claimTxHash: row.claim_tx_hash,
          contractAppId: row.contract_app_id,
          contractAddress: row.contract_address,
        };

        // Add to state so it's available for future lookups
        setClaimLinks((prev) => {
          // Check if already exists to avoid duplicates
          if (prev.find((cl) => cl.id === id)) {
            return prev;
          }
          return [formattedClaimLink, ...prev];
        });

        return formattedClaimLink;
      }
    } catch (error) {
      console.error('Error fetching claim link from Supabase:', error);
    }

    // No row found or error – treat as "not found" without breaking other flows
    return undefined;
  };

  const claimLink = async (id: string, claimerAddress?: string): Promise<string> => {
    try {
      console.log('claimLink called with:', { id, claimerAddress, activeAddress, transactionSigner: !!transactionSigner });
      
      const claimer = activeAddress || claimerAddress;
      
      if (!claimer) {
        console.error('No claimer address available!', { activeAddress, claimerAddress });
        throw new Error('Please connect your wallet first');
      }
      
      if (!transactionSigner) {
        console.error('No transaction signer available!');
        throw new Error('Wallet not properly connected. Please reconnect your wallet.');
      }
      
      console.log('✅ Claimer address:', claimer);

      const linkData = getClaimLink(id);
      console.log('Found claim link:', linkData);
      
      if (!linkData) {
        throw new Error('Claim link not found');
      }

      if (linkData.claimed || linkData.status === 'claimed') {
        throw new Error('This claim link has already been claimed');
      }

      if (linkData.status !== 'active') {
        throw new Error('This claim link is not active');
      }

      // Check expiry
      if (linkData.expiryDate && new Date(linkData.expiryDate) < new Date()) {
        throw new Error('This claim link has expired');
      }
      console.log('linkData.receiverAddress:', linkData.receiverAddress);
      // Check if receiver is specified
      if (linkData.receiverAddress && linkData.receiverAddress !== claimer) {
        throw new Error('Only the specified receiver can claim this link');
      }

      // Check if sender is trying to claim
      if (linkData.senderAddress === claimer) {
        throw new Error('Sender cannot claim their own link');
      }

      // Debug logging
      console.log('Claim attempt:', {
        isConfigured: escrowClaimService.isConfigured(),
        contractAppId: linkData.contractAppId,
        hasTransactionSigner: !!transactionSigner,
        claimerAddress: claimer
      });

      // Claim from TEAL escrow contract
      if (escrowClaimService.isConfigured() && linkData.contractAppId && transactionSigner) {
        try {
          toast('📡 Processing claim transaction...', { icon: '⏳' });
          
          const ALGOD_SERVER = 'https://testnet-api.algonode.cloud';
          const algod = new algosdk.Algodv2('', ALGOD_SERVER, '');
          const suggestedParams = await algod.getTransactionParams().do();
          
          // Create app call transaction to claim funds
          console.log('Creating claim transaction:', {
            claimer,
            contractAppId: linkData.contractAppId,
            amount: linkData.amount,
            claimerType: typeof claimer,
            claimerLength: claimer?.length
          });
          
          if (!claimer || typeof claimer !== 'string' || claimer.trim() === '') {
            throw new Error('Claimer address is required and must be a valid string');
          }
          
          // Validate address format
          let claimerAddress: string = claimer.trim();
          try {
            // Validate by decoding the address
            algosdk.decodeAddress(claimerAddress);
            console.log('✅ Address validated:', claimerAddress);
          } catch (addrError) {
            console.error('Invalid address format:', claimerAddress, addrError);
            throw new Error('Invalid claimer address format: ' + claimerAddress);
          }
          
          const encoder = new TextEncoder();
          
          console.log('Building transaction with:', {
            sender: claimerAddress,
            appIndex: linkData.contractAppId,
            amount: linkData.amount
          });
          
          // Check contract balance first
          const appInfo = await algod.getApplicationByID(linkData.contractAppId).do();
          const contractAddress = algosdk.getApplicationAddress(linkData.contractAppId);
          const accountInfo = await algod.accountInformation(contractAddress).do();
          // Convert BigInt to number for comparison
          const contractBalance = Number(accountInfo.amount);
          const amountMicroAlgos = Math.floor(linkData.amount * 1_000_000);
          
          console.log('Contract balance:', contractBalance / 1_000_000, 'ALGO');
          console.log('Amount to claim:', amountMicroAlgos / 1_000_000, 'ALGO');
          
          if (contractBalance < amountMicroAlgos) {
            throw new Error(`Contract has insufficient balance. Has ${contractBalance / 1_000_000} ALGO, needs ${amountMicroAlgos / 1_000_000} ALGO`);
          }
          
          // Use makeApplicationCallTxnFromObject instead (more reliable)
          // Convert amount to BigInt for encodeUint64
          const txn = algosdk.makeApplicationCallTxnFromObject({
            sender: claimerAddress,
            appIndex: linkData.contractAppId,
            onComplete: algosdk.OnApplicationComplete.NoOpOC,
            appArgs: [
              encoder.encode('claim'),
              algosdk.encodeUint64(BigInt(amountMicroAlgos))
            ],
            suggestedParams: {
              ...suggestedParams,
              fee: 2000, // Cover inner transaction fee
              flatFee: true
            }
          });
          
          console.log('Transaction created successfully');
          
          // Sign and send
          // transactionSigner from use-wallet-react expects (txns, indexesToSign)
          const signedTxns = await transactionSigner([txn], [0]);
          if (!signedTxns || signedTxns.length === 0 || !signedTxns[0]) {
            throw new Error('Transaction not signed');
          }
          const response = await algod.sendRawTransaction(signedTxns[0]).do();
          
          console.log('Claim transaction sent:', response.txid);
          
          toast('⏳ Confirming transaction...');
          
          // Wait for confirmation
          await algosdk.waitForConfirmation(algod, response.txid, 4);
          
          const claimTxHash = response.txid;
          const explorerUrl = `https://testnet.explorer.perawallet.app/tx/${claimTxHash}`;
          
          // Update claim status
          await updateClaimStatus(id, claimer, claimTxHash);
          
          toast.success(
            `🎉 Successfully claimed! Funds transferred from escrow.\nView on AlgoExplorer: ${explorerUrl}`,
            { 
              duration: 10000,
              icon: '✅'
            }
          );
          
          // Also show in console for easy copy
          console.log('🎉 CLAIM SUCCESSFUL!');
          console.log('Transaction Hash:', claimTxHash);
          console.log('🔗 View on AlgoExplorer:', explorerUrl);
          
          return claimTxHash;
          
        } catch (escrowError: any) {
          console.error('Escrow claim failed:', escrowError);
          toast.error('Claim failed: ' + (escrowError.message || 'Unknown error'));
          throw escrowError;
        }
      }

      // Fallback: Show error if no escrow
      console.error('Cannot claim: Escrow not properly configured', {
        isConfigured: escrowClaimService.isConfigured(),
        contractAppId: linkData.contractAppId,
        hasTransactionSigner: !!transactionSigner
      });
      toast.error('⚠️ Cannot claim: Please restart the dev server to load escrow configuration.');
      throw new Error('Escrow not available - dev server needs restart');
    } catch (error: any) {
      console.error('Error claiming link:', error);
      throw error;
    }
  };

  // Helper function to update claim status
  const updateClaimStatus = async (id: string, claimer: string, claimTxHash: string) => {
    // Update in Supabase
    if (isSupabaseReady) {
      const { error } = await supabase
        .from('claim_links')
        .update({
          claimed: true,
          claimed_at: new Date().toISOString(),
          claimed_by: claimer,
          status: 'claimed',
          claim_tx_hash: claimTxHash,
        })
        .eq('id', id);

      if (error) {
        console.warn('Error updating claim link in Supabase:', error);
      } else {
        await loadClaimLinks();
        return;
      }
    }

    // Fall back to localStorage
    const stored = localStorage.getItem('algoPayMe_claimLinks');
    const claimLinks = stored ? JSON.parse(stored) : {};
    
    if (claimLinks[id]) {
      claimLinks[id].claimed = true;
      claimLinks[id].claimedAt = new Date();
      claimLinks[id].claimedBy = claimer;
      claimLinks[id].status = 'claimed';
      claimLinks[id].claimTxHash = claimTxHash;
      
      localStorage.setItem('algoPayMe_claimLinks', JSON.stringify(claimLinks));
    }

    await loadClaimLinks();
  };

  const cancelClaimLink = async (id: string) => {
    try {
      if (!activeAddress) {
        throw new Error('Please connect your wallet first');
      }

      const claimLink = getClaimLink(id);
      if (!claimLink) {
        throw new Error('Claim link not found');
      }

      if (claimLink.senderAddress !== activeAddress) {
        throw new Error('Only the sender can cancel this claim link');
      }

      if (claimLink.claimed || claimLink.status === 'claimed') {
        throw new Error('Cannot cancel a claimed link');
      }

      // Try to use escrow contract if available
      if (escrowClaimService.isConfigured() && claimLink.contractAppId && transactionSigner) {
        try {
          // Wrap transactionSigner to match expected signature
          const signer = async (txns: algosdk.Transaction[]) => {
            return await transactionSigner(txns, txns.map((_, i) => i));
          };
          
          const cancelTxId = await escrowClaimService.cancel(
            claimLink.contractAppId,
            activeAddress,
            signer
          );

          // Update status in database
          await updateCancelStatus(id);
          
          toast.success('Claim link cancelled and refunded! ✅');
          return;
        } catch (escrowError: any) {
          console.error('Escrow cancel failed:', escrowError);
          toast.error('Escrow cancel failed: ' + (escrowError.message || 'Unknown error'));
          throw escrowError;
        }
      }

      // Fallback: Just mark as cancelled (no refund for non-escrow links)
      console.warn('Escrow not available. Marking link as cancelled.');
      toast('Claim link cancelled (no funds were escrowed).', {
        icon: 'ℹ️',
        duration: 3000,
      });
      await updateCancelStatus(id);
    } catch (error: any) {
      console.error('Error cancelling claim link:', error);
      throw error;
    }
  };

  // Helper function to update cancel status
  const updateCancelStatus = async (id: string) => {
    // Update in Supabase
    if (isSupabaseReady) {
      const { error } = await supabase
        .from('claim_links')
        .update({
          status: 'cancelled',
        })
        .eq('id', id);

      if (error) {
        console.warn('Error cancelling claim link in Supabase:', error);
      } else {
        await loadClaimLinks();
        return;
      }
    }

    // Fall back to localStorage
    const stored = localStorage.getItem('algoPayMe_claimLinks');
    const claimLinks = stored ? JSON.parse(stored) : {};
    
    if (claimLinks[id]) {
      claimLinks[id].status = 'cancelled';
      localStorage.setItem('algoPayMe_claimLinks', JSON.stringify(claimLinks));
    }

    await loadClaimLinks();
  };

  return (
    <ClaimLinkContext.Provider value={{ claimLinks, createClaimLink, getClaimLink, fetchClaimLinkFromSupabase, claimLink, cancelClaimLink }}>
      {children}
    </ClaimLinkContext.Provider>
  );
};

export const useClaimLink = () => {
  const context = useContext(ClaimLinkContext);
  console.log('context:', context);
  if (context === undefined) {
    throw new Error('useClaimLink must be used within a ClaimLinkProvider');
  }
  return context;
};

