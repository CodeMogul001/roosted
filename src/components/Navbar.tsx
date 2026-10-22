import React from 'react';
import mascotImg from '../assets/images/roosted_owl_mascot_orange_1792700795860.jpg';

interface NavbarProps {
  isLive: boolean;
  onOpenTestFlight?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ isLive, onOpenTestFlight }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-800/80 bg-[#070709]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Lockup */}
        <a href="/" className="flex items-center gap-2.5 whitespace-nowrap shrink-0 group">
          <img 
            src={mascotImg} 
            alt="$ROOSTED Owl" 
            className="w-8 h-8 rounded-full border border-orange-500/40 object-cover group-hover:border-orange-400 group-hover:shadow-[0_0_12px_rgba(249,115,22,0.4)] transition-all"
          />
          <span className="text-xl font-extrabold tracking-tight text-white group-hover:text-orange-400 transition-colors">
            $ROOSTED
          </span>
        </a>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-zinc-400">
          <a href="#roast" className="hover:text-orange-300 transition-colors whitespace-nowrap shrink-0">
            Roast
          </a>
          <a href="#hall-of-cooked" className="hover:text-orange-300 transition-colors whitespace-nowrap shrink-0">
            Hall of Cooked
          </a>
          <a href="#how-it-works" className="hover:text-orange-300 transition-colors whitespace-nowrap shrink-0">
            How It Works
          </a>
          <a 
            href="https://x.com" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-orange-300 transition-colors whitespace-nowrap shrink-0"
          >
            X (Twitter)
          </a>
          {onOpenTestFlight && (
            <button 
              type="button" 
              onClick={onOpenTestFlight} 
              className="text-xs text-zinc-500 hover:text-orange-400 transition-colors whitespace-nowrap shrink-0"
            >
              Indexer Inspector
            </button>
          )}
        </nav>

        {/* Zone 3: 1 Primary Action (Disabled until launch) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            disabled={!isLive}
            title={isLive ? 'Buy $ROOSTED on DEX' : 'Trading will open upon official contract deployment'}
            className={`px-4 py-2 text-xs font-semibold rounded-lg tracking-wide whitespace-nowrap shrink-0 transition-all ${
              isLive
                ? 'bg-orange-500 text-black hover:bg-orange-400 shadow-sm shadow-orange-500/30'
                : 'bg-zinc-800/80 text-zinc-400 border border-zinc-700/60 cursor-not-allowed opacity-80'
            }`}
          >
            {isLive ? 'BUY $ROOSTED' : 'BUY $ROOSTED (COMING SOON)'}
          </button>
        </div>
      </div>
    </header>
  );
};
