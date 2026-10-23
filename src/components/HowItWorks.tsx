import React from 'react';
import { Search, Eye, Flame, ShieldCheck } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'PASTE YOUR WALLET',
      description: 'Enter your public wallet address.',
      icon: Search,
      sub: 'Supports NEAR, EVM (Base/ETH) and Solana public addresses.'
    },
    {
      num: '02',
      title: 'THE OWL INVESTIGATES',
      description: 'The analyzer retrieves your actual $ROOSTED transactions from public blockchain data.',
      icon: Eye,
      sub: 'Filters buys, sells, and swaps directly from the official contract.'
    },
    {
      num: '03',
      title: 'GET ROASTED',
      description: 'Receive your cooked score and shareable roast card.',
      icon: Flame,
      sub: 'Export high-res PNG scorecard and share directly on X.'
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-zinc-800">
      <div className="text-center max-w-2xl mx-auto mb-14">
        <span className="text-xs font-mono font-semibold uppercase tracking-widest text-orange-400">
          HOW IT WORKS
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight mt-2">
          Three Actions. Zero Wallet Connections.
        </h2>
        <p className="text-sm text-zinc-400 mt-3">
          Your wallet is never connected. We only read publicly available blockchain data associated with $ROOSTED.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.num}
              className="relative p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-zinc-800 hover:border-orange-500/30 transition-colors flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="text-3xl font-extrabold font-mono text-zinc-700 group-hover:text-zinc-600 transition-colors">
                    {step.num}
                  </span>
                  <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white tracking-wide mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                  {step.description}
                </p>
              </div>

              <div className="pt-4 border-t border-zinc-800/60 text-xs font-mono text-zinc-500">
                {step.sub}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust Notice Box */}
      <div className="mt-12 p-4 rounded-xl bg-zinc-950 border border-zinc-800/80 max-w-2xl mx-auto flex items-center gap-3 text-xs text-zinc-400 font-mono">
        <ShieldCheck className="w-5 h-5 text-orange-400 shrink-0" />
        <span>
          We will never request seed phrases, signatures, or transaction approvals. Public ledger data only.
        </span>
      </div>
    </section>
  );
};
