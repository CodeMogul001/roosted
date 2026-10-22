import React from 'react';
import mascotImg from '../assets/images/roosted_owl_mascot_orange_1792700795860.jpg';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-zinc-800 bg-[#050507] py-12 px-4 sm:px-6 lg:px-8 text-zinc-500 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <img
            src={mascotImg}
            alt="$ROOSTED Owl"
            className="w-7 h-7 rounded-full border border-orange-500/40 object-cover shadow-[0_0_8px_rgba(249,115,22,0.3)]"
          />
          <div>
            <span className="font-bold text-white tracking-wider text-sm">$ROOSTED</span>
            <span className="ml-2 text-zinc-400 font-sans">• The owl saw your trades.</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-6 font-mono text-[11px]">
          <a href="#roast" className="hover:text-orange-300 transition-colors">
            Roast
          </a>
          <a href="#hall-of-cooked" className="hover:text-orange-300 transition-colors">
            Hall of Cooked
          </a>
          <a href="#how-it-works" className="hover:text-orange-300 transition-colors">
            How It Works
          </a>
          <a
            href="https://x.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-orange-300 transition-colors"
          >
            X (Twitter)
          </a>
        </div>

        <div className="text-center md:text-right font-mono text-[11px] text-zinc-400">
          <p>Read-only public on-chain analyzer.</p>
          <p className="mt-0.5 text-zinc-400">No wallet connections. Public blockchain data only.</p>
        </div>
      </div>
    </footer>
  );
};
