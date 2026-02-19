import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useClaimLink } from '@/contexts/ClaimLinkContext';
import { CheckCircle, Copy, Share2, ExternalLink, QrCode, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ellipseAddress } from '@/lib/utils';

const ClaimLinkGenerated = () => {
  const { id } = useParams<{ id: string }>();
  const { getClaimLink, fetchClaimLinkFromSupabase } = useClaimLink();
  const [showConfetti, setShowConfetti] = useState(true);
  const [showQR, setShowQR] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [claimLink, setClaimLink] = useState(() => getClaimLink(id!));
  
  const claimUrl = `${window.location.origin}/claim/${id}`;

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const loadClaimLink = async () => {
      // First try to get from state/localStorage
      let data = getClaimLink(id!);
      
      // If not found, try fetching from Supabase
      if (!data) {
        data = await fetchClaimLinkFromSupabase(id!);
      }
      
      if (data) {
        setClaimLink(data);
      }
      setIsLoading(false);
    };
    
    loadClaimLink();
  }, [id]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(claimUrl);
    toast.success('Link copied to clipboard!');
  };

  const shareClaimLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Claim Link',
          text: `Claim ${claimLink?.amount} ${claimLink?.currency}`,
          url: claimUrl,
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

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

  if (!claimLink) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Claim link not found</h1>
          <Link to="/">
            <Button>Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-3xl mx-auto"
        >
          <div className="text-center space-y-6 mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full gradient-primary shadow-glow"
            >
              <CheckCircle className="w-10 h-10 text-white" />
            </motion.div>
            
            <h1 className="text-4xl md:text-5xl font-bold">
              Claim Link Created!
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Share this link to allow someone to claim {claimLink.amount} {claimLink.currency}
            </p>
          </div>

          <Card className="p-8 shadow-card space-y-8">
            {/* Claim Link Details */}
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Amount</div>
                  <div className="text-xl font-bold text-primary">
                    {claimLink.amount} {claimLink.currency}
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <div className="text-xl font-bold text-accent">
                    {claimLink.claimed ? 'Claimed' : 'Active'}
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Receiver</div>
                  <div className="text-sm font-semibold">
                    {claimLink.receiverAddress ? (
                      <span className="font-mono text-xs">
                        {ellipseAddress(claimLink.receiverAddress)}
                      </span>
                    ) : (
                      <span className="text-accent">Anyone</span>
                    )}
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Sender</div>
                  <div className="text-sm font-mono">
                    {ellipseAddress(claimLink.senderAddress)}
                  </div>
                </div>
              </div>
            </div>

            {/* Claim Link */}
            <div className="space-y-3">
              <label className="text-sm font-semibold">Claim Link</label>
              <div className="flex gap-2">
                <input
                  value={claimUrl}
                  readOnly
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono"
                />
                <Button onClick={copyToClipboard} variant="outline" size="icon">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button onClick={shareClaimLink} className="gradient-primary" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* QR Code */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold">QR Code</label>
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => setShowQR(!showQR)}
                  className="text-primary"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  {showQR ? 'Hide' : 'Show'} QR Code
                </Button>
              </div>
              
              {showQR && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex justify-center p-6 bg-white rounded-lg"
                >
                  <QRCodeSVG value={claimUrl} size={200} level="H" />
                </motion.div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link to={`/claim/${id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  View Claim Page
                </Button>
              </Link>
              <Link to="/create-claim" className="flex-1">
                <Button className="w-full gradient-primary">
                  Create Another Claim Link
                </Button>
              </Link>
            </div>
          </Card>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default ClaimLinkGenerated;








