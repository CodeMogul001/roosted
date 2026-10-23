import React, { useState } from 'react';
import { Flame, UserX, ExternalLink } from 'lucide-react';
import { HallOfCookedEntry, RoastLevel } from '../types/roast.ts';

interface HallOfCookedProps {
  entries: HallOfCookedEntry[];
  onRequestRemoval: () => void;
  onSelectEntry?: (address: string) => void;
}

export const HallOfCooked: React.FC<HallOfCookedProps> = ({
  entries,
  onRequestRemoval,
  onSelectEntry
}) => {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const getLevelBadgeClass = (level: RoastLevel) => {
    switch (level) {
      case 'RAW':
        return 'text-amber-300 bg-amber-950/50 border-amber-500/30';
      case 'MEDIUM':
        return 'text-orange-300 bg-orange-950/50 border-orange-500/30';
      case 'WELL DONE':
        return 'text-orange-500 bg-orange-950/50 border-orange-500/30';
      case 'CHARCOAL':
        return 'text-red-400 bg-red-950/50 border-red-500/30';
    }
  };

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  return (
    <section id="hall-of-cooked" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 pb-6 border-b border-zinc-800">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-semibold uppercase text-orange-400 tracking-wider mb-2">
            <Flame className="w-4 h-4 text-orange-500" />
            TOKEN HOLDERS LEADERBOARD
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Hall of Cooked
          </h2>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            Reserved exclusively for wallets with verified on-chain $ROOSTED trades that currently hold the token. No demo data.
          </p>
        </div>

        {entries.length > 0 && (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onRequestRemoval}
              className="text-xs font-mono text-zinc-400 hover:text-white flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 transition-colors"
            >
              <UserX className="w-3.5 h-3.5" />
              Request Wallet Removal
            </button>
          </div>
        )}
      </div>

      {/* Leaderboard Table or Empty State */}
      {entries.length === 0 ? (
        <div className="p-10 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 text-center max-w-2xl mx-auto flex flex-col items-center">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/25 flex items-center justify-center text-orange-400 mb-4 shadow-[0_0_15px_rgba(249,115,22,0.15)]">
            <Flame className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white mb-2">
            The Hall of Cooked Is Empty
          </h3>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md mb-6">
            Wallets are added to this leaderboard <strong className="text-white">only when they paste an address that holds $ROOSTED tokens</strong> and get audited.
          </p>
          <a
            href="#roast"
            className="px-5 py-2.5 rounded-lg bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-bold font-mono transition-colors"
          >
            ↑ Paste A Wallet Above
          </a>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 text-[11px] font-mono uppercase text-zinc-500">
                <th className="py-3 px-4 w-16">RANK</th>
                <th className="py-3 px-4">WALLET</th>
                <th className="py-3 px-4">HOLDINGS</th>
                <th className="py-3 px-4">SCORE</th>
                <th className="py-3 px-4">LEVEL</th>
                <th className="py-3 px-4">THE ROAST</th>
                <th className="py-3 px-4 text-right">ACTIVITY</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 font-mono text-xs">
              {entries.map((entry) => (
                <tr 
                  key={entry.id} 
                  className={`group hover:bg-zinc-900/60 transition-colors ${
                    entry.isMostCooked ? 'bg-red-950/15' : ''
                  }`}
                >
                  {/* Rank with Most Cooked badge for #1 */}
                  <td className="py-4 px-4 font-bold">
                    {entry.isMostCooked ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-red-400 font-extrabold text-sm">#1</span>
                      </div>
                    ) : (
                      <span className="text-zinc-500 font-medium">#{entry.rank}</span>
                    )}
                  </td>

                  {/* Wallet Address */}
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(entry.walletAddress)}
                        className="text-zinc-300 font-medium hover:text-orange-400 transition-colors"
                        title="Click to copy full address"
                      >
                        {entry.shortAddress}
                      </button>
                      {copiedAddress === entry.walletAddress && (
                        <span className="text-[10px] text-orange-400 font-semibold">Copied</span>
                      )}
                      {entry.isMostCooked && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-500/20 text-red-400 border border-red-500/30 whitespace-nowrap">
                          MOST COOKED
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Token Holdings */}
                  <td className="py-4 px-4 font-mono text-orange-400 font-semibold tabular-nums whitespace-nowrap">
                    {entry.holdingAmount || 'Held'}
                  </td>

                  {/* Score */}
                  <td className="py-4 px-4 font-bold tabular-nums text-sm text-white">
                    {entry.cookedScore}/100
                  </td>

                  {/* Roast Level */}
                  <td className="py-4 px-4">
                    <span className={`px-2 py-0.5 rounded border text-[10px] font-bold ${getLevelBadgeClass(entry.roastLevel)}`}>
                      {entry.roastLevel}
                    </span>
                  </td>

                  {/* Short Roast */}
                  <td className="py-4 px-4 font-sans text-xs text-zinc-300 max-w-md">
                    “{entry.roast}”
                  </td>

                  {/* Trades */}
                  <td className="py-4 px-4 text-right tabular-nums text-zinc-400 whitespace-nowrap">
                    {entry.buys}B / {entry.sells}S
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-center text-xs font-mono text-zinc-600">
        All rankings are derived exclusively from verified $ROOSTED token contracts. No private keys, signatures, or portfolio tracking.
      </p>
    </section>
  );
};
