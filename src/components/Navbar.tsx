import { Link } from 'react-router-dom';
import { useWallet } from '@txnlab/use-wallet-react';
import { Button } from '@/components/ui/button';
import { Wallet, Menu, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import ConnectWallet from './ConnectWallet';
import { useState } from 'react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ellipseAddress } from '@/lib/utils';

const Navbar = () => {
  const { activeAddress, activeWallet } = useWallet();
  const isConnected = !!activeAddress;
  const walletAddress = activeAddress || null;
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const handleDisconnect = async () => {
    if (activeWallet) {
      await activeWallet.disconnect();
    }
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2"
            >
              <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <Wallet className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                AlgoSplitX
              </span>
            </motion.div>
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/create" className="text-foreground hover:text-primary transition-smooth">
              Split Payment
            </Link>
            <Link to="/create-claim" className="text-foreground hover:text-primary transition-smooth">
              Claim Link
            </Link>
            {isConnected && (
              <Link to="/my-payments" className="text-foreground hover:text-primary transition-smooth">
                My Payments
              </Link>
            )}
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-smooth">
              How It Works
            </a>
            <a href="#features" className="text-foreground hover:text-primary transition-smooth">
              Features
            </a>
          </div>

          <div className="flex items-center space-x-4">
            {isConnected && walletAddress ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center space-x-2"
              >
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="secondary" className="flex items-center gap-2">
                        <Wallet className="h-4 w-4" />
                        {ellipseAddress(walletAddress)}
                      </Button>
                    </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Disconnect</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </motion.div>
            ) : (
              <>
                <Button onClick={() => setIsConnectModalOpen(true)} className="gradient-primary shadow-glow">
                  <Wallet className="w-4 h-4 mr-2" />
                  Connect Wallet
                </Button>
                <ConnectWallet openModal={isConnectModalOpen} closeModal={() => setIsConnectModalOpen(false)} />
              </>
            )}
            
            <button className="md:hidden">
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
