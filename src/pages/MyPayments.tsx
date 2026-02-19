import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { usePayment } from '@/contexts/PaymentContext';
import { useWallet } from '@txnlab/use-wallet-react';
import { Calendar, DollarSign, Users, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { ellipseAddress } from '@/lib/utils';
import toast from 'react-hot-toast';

const MyPayments = () => {
  const { payments } = usePayment();
  const { activeAddress } = useWallet();
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed' | 'contributed'>('active');

  // Filter payments based on tab
  const activePayments = payments.filter(p => p.status === 'active');
  const completedPayments = payments.filter(p => p.status === 'completed');
  
  // Get payments where user has contributed
  const contributedPayments = payments.filter(p => 
    p.contributors.some(c => c.address === activeAddress)
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getContributedAmount = (payment: any) => {
    if (!activeAddress) return 0;
    const contributor = payment.contributors.find((c: any) => c.address === activeAddress);
    return contributor ? contributor.amount : 0;
  };

  const renderPaymentCard = (payment: any, isReceiver: boolean) => {
    const progressPercentage = (payment.collected / payment.totalAmount) * 100;
    const perPersonAmount = payment.totalAmount / payment.participants;
    const hasContributed = activeAddress ? payment.contributors.some((c: any) => c.address === activeAddress) : false;

    return (
      <Card key={payment.id} className="p-6 shadow-card hover:shadow-glow transition-shadow">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold">{payment.title}</h3>
              {payment.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">{payment.description}</p>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {payment.status === 'completed' ? (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Completed
                </span>
              ) : (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  Active
                </span>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y">
            <div>
              <div className="text-sm text-muted-foreground">Total</div>
              <div className="text-lg font-bold text-primary">
                {payment.totalAmount} {payment.currency}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Collected</div>
              <div className="text-lg font-bold text-accent">
                {payment.collected.toFixed(2)} {payment.currency}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Contributors</div>
              <div className="text-lg font-bold">
                {payment.contributors.length} / {payment.participants}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground">Per Person</div>
              <div className="text-lg font-bold">
                {perPersonAmount.toFixed(2)} {payment.currency}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Progress</span>
              <span className="text-muted-foreground">{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Receiver/Creator Info */}
          {isReceiver ? (
            <div className="flex items-center justify-between pt-2">
              <div className="text-sm text-muted-foreground">
                Receiver: <span className="font-mono">{ellipseAddress(payment.receiverAddress)}</span>
              </div>
              <Link to={`/payment/${payment.id}`}>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </Link>
            </div>
          ) : hasContributed && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Your Contribution:</span>
                <span className="font-bold text-green-600">
                  {getContributedAmount(payment).toFixed(2)} {payment.currency}
                </span>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(payment.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-2">
              {payment.txHash && (
                <a
                  href={`https://lora.algokit.io/testnet/transaction/${payment.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center text-sm"
                >
                  View Transaction
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-32 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-6xl mx-auto"
        >
          {/* Header */}
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold">My Payments</h1>
            <p className="text-xl text-muted-foreground">
              Manage and track your payment splits
            </p>
          </div>

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={(v: any) => setSelectedTab(v)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="active">Active Splits</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="contributed">My Contributions</TabsTrigger>
            </TabsList>

            {/* Active Splits Tab */}
            <TabsContent value="active" className="space-y-6">
              {activePayments.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="space-y-4">
                    <DollarSign className="w-16 h-16 mx-auto text-muted-foreground" />
                    <h3 className="text-2xl font-bold">No Active Splits</h3>
                    <p className="text-muted-foreground">
                      You haven't created any active payment splits yet.
                    </p>
                    <Link to="/create">
                      <Button className="gradient-primary shadow-glow">
                        Create Payment Split
                      </Button>
                    </Link>
                  </div>
                </Card>
              ) : (
                <>
                  <div className="text-sm text-muted-foreground">
                    Showing {activePayments.length} active payment split{activePayments.length !== 1 ? 's' : ''}
                  </div>
                  <div className="grid gap-6">
                    {activePayments.map(payment => renderPaymentCard(payment, true))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* Completed Tab */}
            <TabsContent value="completed" className="space-y-6">
              {completedPayments.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="space-y-4">
                    <CheckCircle className="w-16 h-16 mx-auto text-muted-foreground" />
                    <h3 className="text-2xl font-bold">No Completed Payments</h3>
                    <p className="text-muted-foreground">
                      Completed payment splits will appear here.
                    </p>
                  </div>
                </Card>
              ) : (
                <>
                  <div className="text-sm text-muted-foreground">
                    Showing {completedPayments.length} completed payment split{completedPayments.length !== 1 ? 's' : ''}
                  </div>
                  <div className="grid gap-6">
                    {completedPayments.map(payment => renderPaymentCard(payment, true))}
                  </div>
                </>
              )}
            </TabsContent>

            {/* My Contributions Tab */}
            <TabsContent value="contributed" className="space-y-6">
              {contributedPayments.length === 0 ? (
                <Card className="p-12 text-center">
                  <div className="space-y-4">
                    <Users className="w-16 h-16 mx-auto text-muted-foreground" />
                    <h3 className="text-2xl font-bold">No Contributions Yet</h3>
                    <p className="text-muted-foreground">
                      Payment splits you've contributed to will appear here.
                    </p>
                  </div>
                </Card>
              ) : (
                <>
                  <div className="text-sm text-muted-foreground">
                    Showing {contributedPayments.length} contribution{contributedPayments.length !== 1 ? 's' : ''}
                  </div>
                  <div className="grid gap-6">
                    {contributedPayments.map(payment => renderPaymentCard(payment, false))}
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default MyPayments;

