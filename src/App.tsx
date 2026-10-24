import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { RoastResultCard } from './components/RoastResultCard.tsx';
import { HallOfCooked } from './components/HallOfCooked.tsx';
import { HowItWorks } from './components/HowItWorks.tsx';
import { PreLaunchModal } from './components/PreLaunchModal.tsx';
import { RemovalModal } from './components/RemovalModal.tsx';
import { HoldingStatusModal } from './components/HoldingStatusModal.tsx';
import { Footer } from './components/Footer.tsx';
import { TokenStatus, RoastAnalysisResult, HallOfCookedEntry } from './types/roast.ts';
import { AlertCircle, AlertTriangle } from 'lucide-react';

export default function App() {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({
    isLive: true,
    contractAddress: 'roosted.near',
    network: 'NEAR Protocol',
    symbol: '$ROOSTED',
    name: 'Roosted Token',
    tagline: 'The owl saw your trades.',
    dexUrl: 'https://app.ref.finance/#near|roosted.near',
    explorerUrl: 'https://nearblocks.io/token/roosted.near',
    launchAnnouncement: 'The owl is watching on NEAR Protocol mainnet. 1% tax to holders on every trade.'
  });

  const [hallEntries, setHallEntries] = useState<HallOfCookedEntry[]>([]);
  const [currentResult, setCurrentResult] = useState<RoastAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'error' | 'info'; message: string } | null>(null);

  // Modals
  const [isPreLaunchOpen, setIsPreLaunchOpen] = useState(false);
  const [isRemovalOpen, setIsRemovalOpen] = useState(false);
  const [holdingModal, setHoldingModal] = useState<{
    isOpen: boolean;
    isHolder: boolean;
    walletAddress: string;
    holdingAmount: string;
    network?: string;
  } | null>(null);
  const [lastEnteredAddress, setLastEnteredAddress] = useState('');

  // 1. Initial Data Fetching
  const fetchStatusAndHall = async () => {
    try {
      const [statusRes, hallRes] = await Promise.all([
        fetch('/api/token-status'),
        fetch('/api/hall-of-cooked')
      ]);

      if (statusRes.ok) {
        const sData = await statusRes.json();
        setTokenStatus(sData);
      }

      if (hallRes.ok) {
        const hData = await hallRes.json();
        if (hData.success) {
          setHallEntries(hData.data);
        }
      }
    } catch (err) {
      console.warn('Initial data load warning:', err);
    }
  };

  useEffect(() => {
    fetchStatusAndHall();

    // Check URL parameters for shareable roast link (?roast=...)
    const params = new URLSearchParams(window.location.search);
    const roastId = params.get('roast');
    if (roastId) {
      fetch(`/api/roast/${roastId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setCurrentResult(data.data);
          }
        })
        .catch((err) => console.error('Failed to load shared roast:', err));
    }
  }, []);

  // 2. Roast Submission Handler & Holder Verification
  const handleRoastSubmit = async (address: string) => {
    setLastEnteredAddress(address);
    setNotification(null);
    setIsLoading(true);

    try {
      const res = await fetch('/api/roast/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });

      const data = await res.json();

      if (data.status === 'invalid_address') {
        setNotification({
          type: 'error',
          message: data.message || 'Invalid wallet address format. Enter a valid NEAR, EVM, or Solana public address.'
        });
        return;
      }

      if (data.status === 'error') {
        setNotification({
          type: 'error',
          message: data.message || 'Blockchain indexer communication encountered an issue. Please try again.'
        });
        return;
      }

      // Check whether the wallet is holding $ROOSTED token
      if (data.isHolder && data.data) {
        // WALLET IS HOLDING: Signify with pop-up message and show in Hall of Cooked
        setCurrentResult(data.data);
        setHoldingModal({
          isOpen: true,
          isHolder: true,
          walletAddress: address,
          holdingAmount: data.holdingAmount || 'Verified $ROOSTED',
          network: data.network || 'NEAR Protocol'
        });

        // Update URL query string
        const newUrl = `${window.location.pathname}?roast=${data.data.id}`;
        window.history.pushState({ path: newUrl }, '', newUrl);

        // Instantly refresh Hall of Cooked entries
        fetchStatusAndHall();
      } else {
        // WALLET IS NOT HOLDING: Signify with pop-up message that it's not holding
        setHoldingModal({
          isOpen: true,
          isHolder: false,
          walletAddress: address,
          holdingAmount: '0 $ROOSTED',
          network: data.network || 'NEAR Protocol'
        });
      }
    } catch (err) {
      console.error('Indexer communication error:', err);
      setNotification({
        type: 'error',
        message: 'Unable to reach the blockchain indexer. Please verify your connection and try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setCurrentResult(null);
    setNotification(null);
    // Clear URL search params
    window.history.pushState({}, '', window.location.pathname);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans selection:bg-orange-500 selection:text-black">
      {/* Top Bar Navigation */}
      <Navbar 
        isLive={tokenStatus.isLive} 
      />

      {/* In-app Notification Banner */}
      {notification && (
        <div className="max-w-4xl mx-auto mt-4 px-4 w-full">
          <div className={`p-4 rounded-xl border flex items-start justify-between gap-3 ${
            notification.type === 'error'
              ? 'bg-red-950/40 border-red-500/40 text-red-300'
              : 'bg-zinc-900 border-zinc-700 text-zinc-200'
          }`}>
            <div className="flex items-start gap-2.5">
              {notification.type === 'error' ? (
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
              )}
              <span className="text-xs sm:text-sm font-mono leading-relaxed">
                {notification.message}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="text-xs font-mono text-zinc-500 hover:text-zinc-300 p-1"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {currentResult ? (
          <div className="pt-6">
            <RoastResultCard 
              result={currentResult} 
              onReset={handleReset} 
            />
          </div>
        ) : (
          <Hero
            tokenStatus={tokenStatus}
            onRoastSubmit={handleRoastSubmit}
            isLoading={isLoading}
          />
        )}

        {/* Hall of Cooked */}
        <HallOfCooked
          entries={hallEntries}
          onRequestRemoval={() => setIsRemovalOpen(true)}
          onSelectEntry={(addr) => handleRoastSubmit(addr)}
        />

        {/* How It Works */}
        <HowItWorks />
      </main>

      {/* Modals */}
      {holdingModal && (
        <HoldingStatusModal
          isOpen={holdingModal.isOpen}
          onClose={() => setHoldingModal(null)}
          isHolder={holdingModal.isHolder}
          walletAddress={holdingModal.walletAddress}
          holdingAmount={holdingModal.holdingAmount}
          network={holdingModal.network}
          onViewHallOfCooked={() => {
            const el = document.getElementById('hall-of-cooked');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }}
          onViewRoast={() => {
            window.scrollTo({ top: 120, behavior: 'smooth' });
          }}
        />
      )}

      <PreLaunchModal
        isOpen={isPreLaunchOpen}
        onClose={() => setIsPreLaunchOpen(false)}
        enteredAddress={lastEnteredAddress}
      />

      <RemovalModal
        isOpen={isRemovalOpen}
        onClose={() => setIsRemovalOpen(false)}
        onRemoved={fetchStatusAndHall}
      />

      {/* Footer */}
      <Footer />
    </div>
  );
}
