import React, { useState } from 'react';
import { X, Sparkles, Check, ArrowRight, ShieldCheck, Terminal } from 'lucide-react';
import { RoastAnalysisResult } from '../types/roast.ts';

interface TestFlightModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: RoastAnalysisResult) => void;
}

export const TestFlightModal: React.FC<TestFlightModalProps> = ({
  isOpen,
  onClose,
  onSelectResult
}) => {
  const [selectedScenario, setSelectedScenario] = useState<'charcoal_top_buyer' | 'raw_profitable' | 'medium_scalper' | 'well_done_holder'>('charcoal_top_buyer');
  const [customAddress, setCustomAddress] = useState('0x8b32A461E63C47137f6a73562bC0c804A66B9a99');
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const scenarios = [
    {
      id: 'charcoal_top_buyer',
      title: 'Catastrophic Top Buyer',
      badge: 'CHARCOAL (~95 Score)',
      badgeClass: 'text-red-400 bg-red-950/40 border-red-500/30',
      description: 'Bought all-time highs across 2 separate spikes, held through -90% drop, panic sold the bottom.'
    },
    {
      id: 'raw_profitable',
      title: 'Profitable Disciplined Trader',
      badge: 'RAW (~12 Score)',
      badgeClass: 'text-amber-300 bg-amber-950/40 border-amber-500/30',
      description: 'Accumulated low, held through price appreciation, exited with +312% realized return.'
    },
    {
      id: 'medium_scalper',
      title: 'High-Frequency Breakeven Scalper',
      badge: 'MEDIUM (~38 Score)',
      badgeClass: 'text-orange-300 bg-orange-950/40 border-orange-500/30',
      description: 'Frequent buys and sells with flat net profit, eaten alive by network gas fees.'
    },
    {
      id: 'well_done_holder',
      title: 'Unrealized Loss Bagholder',
      badge: 'WELL DONE (~65 Score)',
      badgeClass: 'text-orange-500 bg-orange-950/40 border-orange-500/30',
      description: 'Bought high, sold partial bag at -40% loss, still clutching remaining bag.'
    }
  ];

  const handleRunTestFlight = async () => {
    setRunning(true);
    setError(null);
    try {
      const res = await fetch('/api/roast/test-flight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: customAddress,
          scenario: selectedScenario
        })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Test flight execution failed');
      }
      onSelectResult(data.data);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-zinc-900 border border-zinc-700 p-6 sm:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <Terminal className="w-5 h-5 text-orange-400" />
          <h3 className="text-xl font-bold text-white tracking-tight">
            Indexer Inspector & Test Flight
          </h3>
        </div>
        <p className="text-xs text-zinc-400 mb-6 leading-relaxed">
          While the official $ROOSTED token contract awaits deployment (<code className="text-orange-400">CA: COMING SOON</code>), use this inspector to verify how the server classifies buys, sells, holding duration, and generates accurate cooked scorecards from actual ledger logs.
        </p>

        {/* Address Input */}
        <div className="mb-6">
          <label className="block text-xs font-mono uppercase text-zinc-400 mb-1.5">
            Test Wallet Address (EVM / Solana)
          </label>
          <input
            type="text"
            value={customAddress}
            onChange={(e) => setCustomAddress(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-700 font-mono text-xs text-white focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Scenarios */}
        <div className="space-y-3 mb-6">
          <label className="block text-xs font-mono uppercase text-zinc-400">
            Select On-Chain Behavior Scenario
          </label>
          {scenarios.map((s) => (
            <div
              key={s.id}
              onClick={() => setSelectedScenario(s.id as any)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                selectedScenario === s.id
                  ? 'border-orange-500 bg-zinc-800/80 shadow-[0_0_15px_rgba(249,115,22,0.15)]'
                  : 'border-zinc-800 bg-zinc-950/60 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-bold text-white">{s.title}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${s.badgeClass}`}>
                  {s.badge}
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-snug">
                {s.description}
              </p>
            </div>
          ))}
        </div>

        {error && (
          <p className="mb-4 text-xs font-mono text-red-400">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between gap-3 pt-4 border-t border-zinc-800">
          <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />
            Runs through scoring algorithm
          </span>

          <button
            type="button"
            disabled={running}
            onClick={handleRunTestFlight}
            className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black text-xs font-extrabold flex items-center gap-2 transition-all shadow-md shadow-orange-500/20 disabled:opacity-50"
          >
            {running ? (
              <span>Analyzing...</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-black" />
                EXECUTE TEST FLIGHT
                <ArrowRight className="w-3.5 h-3.5 text-black" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
