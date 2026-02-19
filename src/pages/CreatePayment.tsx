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
import { usePayment } from '@/contexts/PaymentContext';
import { useWallet } from '@txnlab/use-wallet-react';
import { Card } from '@/components/ui/card';
import { Calendar, DollarSign, Users, Wallet, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const CreatePayment = () => {
  const navigate = useNavigate();
  const { createPayment } = usePayment();
  const { activeAddress } = useWallet();
  
  const walletAddress = activeAddress || '';
  const isConnected = !!activeAddress;
  
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    totalAmount: '',
    currency: 'ALGO',
    participants: '',
    receiverAddress: '',
    expiryDate: '',
  });

  // Update receiverAddress when wallet connects
  useEffect(() => {
    if (activeAddress) {
      setFormData(prev => ({ ...prev, receiverAddress: activeAddress }));
    }
  }, [activeAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!formData.title || !formData.totalAmount || !formData.participants || !formData.receiverAddress) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      const paymentId = await createPayment({
        title: formData.title,
        description: formData.description,
        totalAmount: parseFloat(formData.totalAmount),
        currency: formData.currency,
        participants: parseInt(formData.participants),
        receiverAddress: formData.receiverAddress,
        expiryDate: formData.expiryDate ? new Date(formData.expiryDate) : undefined,
      });
      
      toast.success('Payment link created successfully!');
      navigate(`/payment/${paymentId}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment link');
      console.error('Error creating payment:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const perPersonAmount = formData.totalAmount && formData.participants 
    ? (parseFloat(formData.totalAmount) / parseInt(formData.participants)).toFixed(2)
    : '0.00';

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
            <h1 className="text-4xl md:text-5xl font-bold">Create Split Payment</h1>
            <p className="text-xl text-muted-foreground">
              Set up your payment request and share with your group
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <Card className="p-8 shadow-card">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="title">Payment Title *</Label>
                    <Input
                      id="title"
                      placeholder="e.g., Weekend Trip Fund"
                      value={formData.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      placeholder="Add details about this payment..."
                      value={formData.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Total Amount *</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          className="pl-10"
                          value={formData.totalAmount}
                          onChange={(e) => handleInputChange('totalAmount', e.target.value)}
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
                    <Label htmlFor="participants">Number of Participants *</Label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="participants"
                        type="number"
                        min="2"
                        placeholder="2"
                        className="pl-10"
                        value={formData.participants}
                        onChange={(e) => handleInputChange('participants', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="receiver">Receiver Wallet Address *</Label>
                    <div className="relative">
                      <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="receiver"
                        placeholder="ALGO..."
                        className="pl-10"
                        value={formData.receiverAddress}
                        onChange={(e) => handleInputChange('receiverAddress', e.target.value)}
                        required
                      />
                    </div>
                    {walletAddress && (
                      <Button
                        type="button"
                        variant="link"
                        size="sm"
                        onClick={() => handleInputChange('receiverAddress', walletAddress)}
                        className="p-0 h-auto text-primary"
                      >
                        Use my wallet address
                      </Button>
                    )}
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

                  <Button
                    type="submit"
                    size="lg"
                    className="w-full gradient-primary shadow-glow"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Smart Contract...
                      </>
                    ) : (
                      'Generate Payment Link'
                    )}
                  </Button>
                </form>
              </Card>
            </div>

            {/* Live Preview */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Card className="p-6 shadow-card">
                  <h3 className="text-lg font-bold mb-4">Preview</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Title</div>
                      <div className="font-semibold">{formData.title || 'Payment Title'}</div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Total Amount</div>
                      <div className="text-2xl font-bold text-primary">
                        {formData.totalAmount || '0'} {formData.currency}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Per Person</div>
                      <div className="text-xl font-semibold">
                        {perPersonAmount} {formData.currency}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm text-muted-foreground mb-1">Participants</div>
                      <div className="font-semibold">{formData.participants || '0'} people</div>
                    </div>

                    {formData.description && (
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">Description</div>
                        <div className="text-sm">{formData.description}</div>
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

export default CreatePayment;
