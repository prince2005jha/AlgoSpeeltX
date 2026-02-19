import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster as HotToaster } from 'react-hot-toast';
import { WalletProvider, NetworkId, WalletId, WalletManager } from '@txnlab/use-wallet-react';
import { PaymentProvider } from './contexts/PaymentContext';
import { ClaimLinkProvider } from './contexts/ClaimLinkContext';
import Landing from "./pages/Landing";
import CreatePayment from "./pages/CreatePayment";
import PaymentGenerated from "./pages/PaymentGenerated";
import JoinPayment from "./pages/JoinPayment";
import MyPayments from "./pages/MyPayments";
import CreateClaimLink from "./pages/CreateClaimLink";
import ClaimLinkPage from "./pages/ClaimLinkPage";
import ClaimLinkGenerated from "./pages/ClaimLinkGenerated";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Configure the wallets you want to use
const walletManager = new WalletManager({
  wallets: [
    WalletId.PERA,
    WalletId.DEFLY,
    WalletId.LUTE,
  ],
  defaultNetwork: NetworkId.TESTNET,
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <WalletProvider manager={walletManager}>
      <PaymentProvider>
        <ClaimLinkProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <HotToaster position="top-right" />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/create" element={<CreatePayment />} />
                <Route path="/create-claim" element={<CreateClaimLink />} />
                <Route path="/my-payments" element={<MyPayments />} />
                <Route path="/payment/:id" element={<PaymentGenerated />} />
                <Route path="/pay/:id" element={<JoinPayment />} />
                <Route path="/claim/:id" element={<ClaimLinkPage />} />
                <Route path="/claim-link/:id" element={<ClaimLinkGenerated />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ClaimLinkProvider>
      </PaymentProvider>
    </WalletProvider>
  </QueryClientProvider>
);

export default App;
