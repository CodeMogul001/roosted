import React from 'react';
import { Coins, ExternalLink, Flame, ShieldCheck, Sparkles, ArrowUpRight } from 'lucide-react';
import { NearWalletPortfolio, NearTokenHolding } from '../types/roast.ts';

interface NearTokenPortfolioProps {
  portfolio: NearWalletPortfolio;
  compact?: boolean;
}

export const NearTokenPortfolio: React.FC<NearTokenPortfolioProps> = ({ portfolio, compact = false }) => {
  const { nativeNear, tokens, totalTokensCount, walletAddress } = portfolio;

  const getCategoryBadge = (category: NearTokenHolding['category'], isRoosted: boolean) => {
    if (isRoosted) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 animate-pulse">
          <Flame className="w-3 h-3 text-orange-400" />
          $ROOSTED
        </span>
      );
    }
    switch (category) {
      case 'stablecoin':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Stablecoin
          </span>
        );
      case 'defi':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            DeFi
          </span>
        );
      case 'meme':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-purple-500/10 text-purple-400 border border-purple-500/20">
            Meme
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-800 text-zinc-400 border border-zinc-700">
            Ecosystem
          </span>
        );
    }
  };

  return (
    <div className={`w-full rounded-xl bg-zinc-950/70 border border-zinc-800/90 ${compact ? 'p-3 sm:p-4' : 'p-5 sm:p-6'}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-400">
            <Coins className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-white tracking-wide">
                NEAR Mainnet Token Portfolio
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                {totalTokensCount} {totalTokensCount === 1 ? 'Token' : 'Tokens'} Identified
              </span>
            </div>
            <p className="text-[11px] font-mono text-zinc-400">
              On-chain scan of native gas and all NEP-141 tokens on NEAR Protocol
            </p>
          </div>
        </div>

        <div className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Audited on NEAR Mainnet</span>
        </div>
      </div>

      {/* Tokens List */}
      <div className="mt-4 space-y-2.5">
        {/* 1. Native NEAR Card */}
        {nativeNear && (
          <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-600 flex items-center justify-center font-bold font-mono text-xs text-white shrink-0 shadow-inner">
                N
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-white font-mono">NEAR</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700">
                    Native Gas
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 font-mono">NEAR Protocol</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-sm font-bold font-mono text-white">
                {nativeNear.balanceFormatted}
              </p>
              <a
                href={`https://nearblocks.io/address/${walletAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[10px] font-mono text-zinc-500 hover:text-orange-400 transition-colors"
              >
                Explorer
                <ArrowUpRight className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        )}

        {/* 2. NEP-141 Fungible Tokens */}
        {tokens && tokens.length > 0 ? (
          tokens.map((token) => (
            <div
              key={token.contractId}
              className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                token.isRoosted
                  ? 'bg-gradient-to-r from-orange-950/40 via-zinc-900 to-zinc-900 border border-orange-500/50 shadow-md shadow-orange-500/10'
                  : 'bg-zinc-900/80 border border-zinc-800/90 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                {token.icon ? (
                  <img
                    src={token.icon}
                    alt={token.symbol}
                    className="w-8 h-8 rounded-full object-cover shrink-0 border border-zinc-700 bg-zinc-950"
                    onError={(e) => {
                      // Fallback if image fails to render
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold font-mono text-xs shrink-0 border ${
                    token.isRoosted
                      ? 'bg-gradient-to-br from-orange-500 to-amber-600 text-black border-orange-400 font-black'
                      : 'bg-zinc-800 text-zinc-200 border-zinc-700'
                  }`}>
                    {token.symbol.slice(0, 3)}
                  </div>
                )}

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`font-bold text-sm font-mono truncate ${
                      token.isRoosted ? 'text-orange-400 font-extrabold' : 'text-white'
                    }`}>
                      {token.symbol}
                    </span>
                    {getCategoryBadge(token.category, token.isRoosted)}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] font-mono text-zinc-500 truncate">
                    <span className="truncate">{token.name}</span>
                    <span>•</span>
                    <span className="truncate max-w-[140px]" title={token.contractId}>
                      {token.contractId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className={`text-sm font-bold font-mono ${
                  token.isRoosted ? 'text-orange-400 text-base font-extrabold' : 'text-white'
                }`}>
                  {token.balanceFormatted}
                </p>
                <div className="flex items-center justify-end gap-2 text-[10px] font-mono mt-0.5">
                  {token.dexUrl && (
                    <a
                      href={token.dexUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-orange-400 transition-colors inline-flex items-center gap-0.5"
                    >
                      Trade
                      <ArrowUpRight className="w-2.5 h-2.5" />
                    </a>
                  )}
                  {token.explorerUrl && (
                    <a
                      href={token.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-zinc-300 transition-colors inline-flex items-center gap-0.5"
                    >
                      Explorer
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : !nativeNear ? (
          <div className="p-6 text-center rounded-lg bg-zinc-900/40 border border-dashed border-zinc-800 text-zinc-500 text-xs font-mono">
            No NEP-141 tokens detected in this wallet on NEAR Protocol Mainnet.
          </div>
        ) : null}
      </div>
    </div>
  );
};
