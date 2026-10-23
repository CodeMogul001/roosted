import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { Hero } from './components/Hero.tsx';
import { RoastResultCard } from './components/RoastResultCard.tsx';
import { HallOfCooked } from './components/HallOfCooked.tsx';
import { HowItWorks } from './components/HowItWorks.tsx';
import { PreLaunchModal } from './components/PreLaunchModal.tsx';
import { RemovalModal } from './components/RemovalModal.tsx';
import { Footer } from './components/Footer.tsx';
import { TokenStatus, RoastAnalysisResult, HallOfCookedEntry } from './types/roast.ts';
import { AlertCircle, AlertTriangle } from 'lucide-react';

export default function App() {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus>({
    isLive: false,
    contractAddress: 'CA: COMING SOON',
    network: 'NEAR Protocol',
    symbol: '$ROOSTED',
    name: 'Roosted Token',
    tagline: 'The owl saw your trades.',
    dexUrl: null,
    explorerUrl: null,
    launchAnnouncement: 'The owl is getting ready. Token details will be announced officially.'
  });

  const [hallEntries, setHallEntries] = useState<HallOfCookedEntry[]>([]);
  const [currentResult, setCurrentResult] = useState<RoastAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'error' | 'info'; message: string } | null>(null);

  // Modals
  const [isPreLaunchOpen, setIsPreLaunchOpen] = useState(false);
  const [isRemovalOpen, setIsRemovalOpen] = useState(false);
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

  // 2. Roast Submission Handler
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

      if (data.status === 'token_not_launched') {
        setIsPreLaunchOpen(true);
      } else if (data.status === 'no_activity') {
        setNotification({
          type: 'info',
          message: 'This owl has nothing to investigate yet. No $ROOSTED trading activity found.'
        });
      } else if (data.status === 'invalid_address') {
        setNotification({
          type: 'error',
          message: data.message || 'Invalid wallet address format.'
        });
      } else if (data.success && data.data) {
        setCurrentResult(data.data);
        // Update URL query string without reloading page
        const newUrl = `${window.location.pathname}?roast=${data.data.id}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        // Scroll to card
        window.scrollTo({ top: 180, behavior: 'smooth' });
      } else {
        setNotification({
          type: 'error',
          message: data.message || 'Analysis failed. Please check the address and try again.'
        });
      }
    } catch {
      setNotification({
        type: 'error',
        message: 'Network error communicating with the blockchain indexer. Please try again.'
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
