import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useClaimLink } from '@/contexts/ClaimLinkContext';
import { useWallet } from '@txnlab/use-wallet-react';
import { CheckCircle, Clock, Wallet, Loader2, ExternalLink, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { ellipseAddress } from '@/lib/utils';

const ClaimLinkPage = () => {
  const { id } = useParams<{ id: string }>();
  const { getClaimLink, fetchClaimLinkFromSupabase, claimLink } = useClaimLink();
  const { activeAddress } = useWallet();
  const isConnected = !!activeAddress;
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [claimLinkData, setClaimLinkData] = useState(() => getClaimLink(id!));
  
  useEffect(() => {
    const loadClaimLink = async () => {
      // First try to get from state/localStorage
      let data = getClaimLink(id!);
      
      // If not found, try fetching from Supabase
      if (!data) {
        setIsLoading(true);
        data = await fetchClaimLinkFromSupabase(id!);
      }
      
      if (data) {
        setClaimLinkData(data);
      }
      setIsLoading(false);
    };
    
    loadClaimLink();
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading claim link...</p>
        </div>
      </div>
    );
  }

  if (!claimLinkData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Claim link not found</h1>
        </div>
      </div>
    );
  }

  const handleClaim = async () => {
    if (!isConnected || !activeAddress) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const txHash = await claimLink(id!, activeAddress);
      toast.success('Claim successful!');
      
      // Reload claim link data
      const updated = getClaimLink(id!);
      if (updated) {
        setClaimLinkData(updated);
      }
    } catch (error: any) {
      toast.error(error.message || 'Claim failed');
      console.error('Claim error:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isExpired = claimLinkData.expiryDate && new Date(claimLinkData.expiryDate) < new Date();
  const canClaim = !claimLinkData.claimed && 
                   claimLinkData.status === 'active' && 
                   !isExpired &&
                   (!claimLinkData.receiverAddress || claimLinkData.receiverAddress === activeAddress);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          {/* Header Card */}
          <Card className="p-8 shadow-card">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <h1 className="text-3xl md:text-4xl font-bold">Claim Link</h1>
                  <p className="text-muted-foreground">
                    {claimLinkData.claimed ? 'This link has been claimed' : 'Claim your tokens'}
                  </p>
                </div>
                
                {claimLinkData.expiryDate && (
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>
                      Expires: {new Date(claimLinkData.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Amount</div>
                  <div className="text-xl font-bold text-primary">
                    {claimLinkData.amount} {claimLinkData.currency}
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <div className="text-xl font-bold">
                    {claimLinkData.claimed ? (
                      <span className="text-green-600">Claimed</span>
                    ) : claimLinkData.status === 'active' ? (
                      <span className="text-blue-600">Active</span>
                    ) : (
                      <span className="text-gray-600">{claimLinkData.status}</span>
                    )}
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Sender</div>
                  <div className="text-sm font-mono">
                    {ellipseAddress(claimLinkData.senderAddress)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Claim Action */}
          {claimLinkData.claimed ? (
            <Card className="p-8 shadow-card">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Already Claimed</h3>
                  <p className="text-muted-foreground">
                    This claim link has been claimed by {ellipseAddress(claimLinkData.claimedBy || '')}
                  </p>
                  {claimLinkData.claimedAt && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Claimed on {new Date(claimLinkData.claimedAt).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </Card>
          ) : isExpired ? (
            <Card className="p-8 shadow-card">
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Expired</h3>
                  <p className="text-muted-foreground">
                    This claim link has expired
                  </p>
                </div>
              </div>
            </Card>
          ) : canClaim ? (
            <Card className="p-8 shadow-card">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold mb-2">Ready to Claim?</h3>
                  <p className="text-muted-foreground">
                    You'll receive {claimLinkData.amount} {claimLinkData.currency}
                  </p>
                </div>

                {claimLinkData.receiverAddress && (
                  <div className="p-4 rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground mb-1">Restricted Receiver</div>
                    <div className="font-mono text-sm">
                      {ellipseAddress(claimLinkData.receiverAddress)}
                    </div>
                    {activeAddress && claimLinkData.receiverAddress !== activeAddress && (
                      <p className="text-sm text-red-600 mt-2">
                        Only the specified receiver can claim this link
                      </p>
                    )}
                  </div>
                )}

                <Button
                  onClick={handleClaim}
                  size="lg"
                  className="w-full gradient-primary shadow-glow"
                  disabled={isProcessing || !canClaim}
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing Claim...
                    </>
                  ) : (
                    `Claim ${claimLinkData.amount} ${claimLinkData.currency}`
                  )}
                </Button>
              </div>
            </Card>
          ) : (
            <Card className="p-8 shadow-card">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold">Cannot Claim</h3>
                <p className="text-muted-foreground">
                  {!isConnected 
                    ? 'Please connect your wallet to claim'
                    : claimLinkData.receiverAddress && claimLinkData.receiverAddress !== activeAddress
                    ? 'Only the specified receiver can claim this link'
                    : 'This link cannot be claimed'}
                </p>
              </div>
            </Card>
          )}

          {/* Transaction Info */}
          {claimLinkData.claimTxHash && (
            <Card className="p-6 shadow-card">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Claim Transaction</span>
                  <a
                    href={`https://lora.algokit.io/testnet/transaction/${claimLinkData.claimTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center"
                  >
                    View on Explorer
                    <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
              </div>
            </Card>
          )}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ClaimLinkPage;






