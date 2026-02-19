import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { usePayment } from '@/contexts/PaymentContext';
import { CheckCircle, Copy, Share2, ExternalLink, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

const PaymentGenerated = () => {
  const { id } = useParams<{ id: string }>();
  const { getPayment } = usePayment();
  const [showConfetti, setShowConfetti] = useState(true);
  const [showQR, setShowQR] = useState(false);
  
  const payment = getPayment(id!);
  const paymentUrl = `${window.location.origin}/pay/${id}`;

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(paymentUrl);
    toast.success('Link copied to clipboard!');
  };

  const sharePayment = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: payment?.title,
          text: `Join my payment split: ${payment?.title}`,
          url: paymentUrl,
        });
      } catch (err) {
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  if (!payment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Payment not found</h1>
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
              Payment Link Created!
            </h1>
            
            <p className="text-xl text-muted-foreground">
              Share this link with your group to start collecting payments
            </p>
          </div>

          <Card className="p-8 shadow-card space-y-8">
            {/* Payment Details */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{payment.title}</h2>
              {payment.description && (
                <p className="text-muted-foreground">{payment.description}</p>
              )}
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Total</div>
                  <div className="text-xl font-bold text-primary">
                    {payment.totalAmount} {payment.currency}
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Per Person</div>
                  <div className="text-xl font-bold">
                    {(payment.totalAmount / payment.participants).toFixed(2)} {payment.currency}
                  </div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Participants</div>
                  <div className="text-xl font-bold">{payment.participants}</div>
                </div>
                
                <div className="p-4 rounded-lg bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">Status</div>
                  <div className="text-xl font-bold text-accent">Active</div>
                </div>
              </div>
            </div>

            {/* Payment Link */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Payment Link</Label>
              <div className="flex gap-2">
                <Input
                  value={paymentUrl}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button onClick={copyToClipboard} variant="outline" size="icon">
                  <Copy className="w-4 h-4" />
                </Button>
                <Button onClick={sharePayment} className="gradient-primary" size="icon">
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* QR Code */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-semibold">QR Code</Label>
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
                  <QRCodeSVG value={paymentUrl} size={200} level="H" />
                </motion.div>
              )}
            </div>

            {/* Transaction Details */}
            <div className="space-y-3 pt-6 border-t">
              <h3 className="font-semibold">Transaction Details</h3>
              
              <div className="space-y-2 text-sm">
                {payment.contractAppId && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Smart Contract App ID</span>
                    <span className="font-mono">{payment.contractAppId}</span>
                  </div>
                )}
                
                {payment.contractAddress && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Contract Address</span>
                    <span className="font-mono text-xs">
                      {payment.contractAddress.slice(0, 8)}...{payment.contractAddress.slice(-6)}
                    </span>
                  </div>
                )}
                
                {payment.txHash && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Transaction Hash</span>
                    <a
                      href={`https://lora.algokit.io/testnet/transaction/${payment.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-mono text-primary hover:underline flex items-center"
                    >
                      {payment.txHash?.slice(0, 10)}...
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Receiver</span>
                  <span className="font-mono text-xs">
                    {payment.receiverAddress.slice(0, 6)}...{payment.receiverAddress.slice(-4)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Link to={`/pay/${id}`} className="flex-1">
                <Button variant="outline" className="w-full">
                  View Payment Page
                </Button>
              </Link>
              <Link to="/create" className="flex-1">
                <Button className="w-full gradient-primary">
                  Create Another Payment
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

const Label = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <label className={className}>{children}</label>
);

const Input = ({ value, readOnly, className, onChange }: any) => (
  <input
    value={value}
    readOnly={readOnly}
    onChange={onChange}
    className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`}
  />
);

export default PaymentGenerated;
