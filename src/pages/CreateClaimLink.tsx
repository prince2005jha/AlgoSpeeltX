import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useClaimLink } from '@/contexts/ClaimLinkContext';
import { useWallet } from '@txnlab/use-wallet-react';
import { Card } from '@/components/ui/card';
import { DollarSign, Wallet, Calendar, Loader2, User } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateClaimLink = () => {
  const navigate = useNavigate();
  const { createClaimLink } = useClaimLink();
  const { activeAddress } = useWallet();
  
  const walletAddress = activeAddress || '';
  const isConnected = !!activeAddress;
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'ALGO',
    receiverAddress: '',
    expiryDate: '',
  });

  // Update receiverAddress when wallet connects
  useEffect(() => {
    if (activeAddress) {
      // Don't auto-fill receiver - let user choose if they want to restrict it
    }
  }, [activeAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.amount || !activeAddress) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const claimLinkId = await createClaimLink({
        senderAddress: activeAddress,
        receiverAddress: formData.receiverAddress || undefined,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      });
      
      toast.success('Claim link created successfully!');
      navigate(`/claim-link/${claimLinkId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create claim link');
      console.error('Error creating claim link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-5xl mx-auto"
        >
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold">Create Claim Link</h1>
            <p className="text-xl text-muted-foreground">
              Generate a link to send tokens that can be claimed by anyone (or a specific receiver)
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="p-8 shadow-card">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-10"
                          value={formData.amount}
                          onChange={(e) => handleInputChange('amount', e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ALGO">ALGO</SelectItem>
                          <SelectItem value="USDCa">USDCa</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receiver">Receiver Address (Optional)</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Leave empty to allow anyone to claim, or specify a receiver address
                    </p>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="receiver"
                        placeholder="ALGO... (leave empty for anyone to claim)"
                        className="pl-10"
                        value={formData.receiverAddress}
                        onChange={(e) => handleInputChange('receiverAddress', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date (Optional)</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="expiry"
                        type="date"
                        className="pl-10"
                        value={formData.expiryDate}
                        onChange={(e) => handleInputChange('expiryDate', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Wallet className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Sender Address</span>
                    </div>
                    <p className="text-sm text-muted-foreground font-mono">
                      {walletAddress || 'Connect wallet to see address'}
                    </p>
                  </div>

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gradient-primary shadow-glow"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Claim Link...
                      </>
                    ) : (
                      'Generate Claim Link'
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="p-6 shadow-card">
                  <h3 className="text-lg font-bold mb-4">Preview</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Amount</div>
                      <div className="text-2xl font-bold text-primary">
                        {formData.amount || '0'} {formData.currency}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Receiver</div>
                      <div className="font-semibold">
                        {formData.receiverAddress ? (
                          <span className="text-xs font-mono">
                            {formData.receiverAddress.slice(0, 8)}...{formData.receiverAddress.slice(-6)}
                          </span>
                        ) : (
                          <span className="text-accent">Anyone can claim</span>
                        )}
                      </div>
                    </div>

                    {formData.expiryDate && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Expires</div>
                        <div className="font-semibold">
                          {new Date(formData.expiryDate).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default CreateClaimLink;








