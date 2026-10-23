import React from 'react';
import { X, Clock } from 'lucide-react';
import mascotImg from '../assets/images/roosted_owl_mascot_orange_1792700795860.jpg';

interface PreLaunchModalProps {
  isOpen: boolean;
  onClose: () => void;
  enteredAddress?: string;
}

export const PreLaunchModal: React.FC<PreLaunchModalProps> = ({
  isOpen,
  onClose,
  enteredAddress
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-zinc-900 border border-zinc-700 p-6 sm:p-8 shadow-2xl shadow-orange-950/30">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-xl overflow-hidden border border-orange-500/30 shrink-0 shadow-md shadow-orange-500/10">
            <img src={mascotImg} alt="The Owl" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/25 mb-1">
              <Clock className="w-3 h-3 text-orange-400" />
              STATUS: PRE-LAUNCH
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">
              The Owl Is Getting Ready
            </h3>
          </div>
        </div>

        <div className="space-y-3 text-sm text-zinc-300 leading-relaxed">
          <p>
            <strong className="text-white font-semibold">$ROOSTED has not launched yet.</strong> The official contract address is currently pending deployment (<code className="px-1.5 py-0.5 rounded bg-zinc-800 text-xs font-mono text-orange-400">CA: COMING SOON</code>).
          </p>
          <p className="text-xs text-zinc-400">
            Unlike fake meme tools that fabricate simulated trades, $ROOSTED is engineered to read <strong className="text-zinc-200">actual on-chain ledger records</strong> directly from the blockchain indexer on NEAR Protocol mainnet. Because the token is not yet live, no trades exist to roast.
          </p>
          {enteredAddress && (
            <div className="p-3 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-xs text-zinc-400">
              <span className="text-zinc-500">Your Address: </span>
              <span className="text-zinc-200 break-all">{enteredAddress}</span>
            </div>
          )}
        </div>

        <div className="mt-6 pt-5 border-t border-zinc-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-400 text-black text-xs font-extrabold transition-all shadow-md shadow-orange-500/20"
          >
            Understood
          </button>
        </div>
      </div>
    </div>
  );
};
