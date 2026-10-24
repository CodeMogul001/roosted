import React from 'react';
import { X, Flame, ShieldAlert, CheckCircle2, ArrowRight, ExternalLink, ShieldCheck } from 'lucide-react';
import mascotImg from '../assets/images/roosted_owl_mascot_orange_1792700795860.jpg';

interface HoldingStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  isHolder: boolean;
  walletAddress: string;
  holdingAmount: string;
  network?: string;
  onViewHallOfCooked?: () => void;
  onViewRoast?: () => void;
}

export const HoldingStatusModal: React.FC<HoldingStatusModalProps> = ({
  isOpen,
  onClose,
  isHolder,
  walletAddress,
  holdingAmount,
  network = 'NEAR Protocol',
  onViewHallOfCooked,
  onViewRoast
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-[#0e0e12] border border-zinc-800 p-6 sm:p-8 shadow-2xl shadow-orange-950/40 text-left">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-5">
          <div className="relative w-14 h-14 rounded-xl overflow-hidden border border-orange-500/40 shrink-0 shadow-lg shadow-orange-500/15">
            <img src={mascotImg} alt="The Owl" className="w-full h-full object-cover" />
            <div className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-zinc-950 ${isHolder ? 'bg-emerald-500' : 'bg-red-500'}`} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              {isHolder ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  VERIFIED $ROOSTED HOLDER
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-mono font-bold bg-red-500/10 text-red-400 border border-red-500/25">
                  <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                  NOT A $ROOSTED HOLDER
                </span>
              )}
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {isHolder ? 'The Owl Confirmed Your Bag' : 'No $ROOSTED In This Wallet'}
            </h3>
          </div>
        </div>

        {/* Body content */}
        <div className="space-y-4 text-sm text-zinc-300 leading-relaxed">
          {isHolder ? (
            <>
              <p>
                The owl successfully queried the blockchain indexer on <strong className="text-white">{network} Mainnet</strong> and verified that your wallet is an active <strong className="text-orange-400">$ROOSTED token holder</strong>.
              </p>
              
              <div className="p-4 rounded-xl bg-zinc-950/90 border border-emerald-500/30 space-y-2 font-mono text-xs shadow-inner">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-zinc-500">Wallet Address:</span>
                  <span className="text-zinc-200 font-semibold truncate max-w-[220px]" title={walletAddress}>
                    {walletAddress}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-zinc-500">Verified Holdings:</span>
                  <span className="text-emerald-400 font-extrabold text-sm">
                    {holdingAmount}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-zinc-500">Holder Perk:</span>
                  <span className="text-amber-300 font-semibold">1% tax to holders</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Hall of Cooked:</span>
                  <span className="text-orange-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-orange-400" /> Inducted
                  </span>
                </div>
              </div>

              <p className="text-xs text-zinc-400">
                Because this wallet holds $ROOSTED, its on-chain trade activity has been officially inducted into the <strong className="text-white">Hall of Cooked</strong> leaderboard.
              </p>
            </>
          ) : (
            <>
              <p>
                The owl investigated the blockchain indexer on <strong className="text-white">{network} Mainnet</strong>. This wallet address does <strong className="text-red-400">not currently hold</strong> any $ROOSTED tokens.
              </p>

              <div className="p-4 rounded-xl bg-zinc-950/90 border border-red-500/30 space-y-2 font-mono text-xs shadow-inner">
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-zinc-500">Wallet Address:</span>
                  <span className="text-zinc-200 font-semibold truncate max-w-[220px]" title={walletAddress}>
                    {walletAddress}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                  <span className="text-zinc-500">Verified Holdings:</span>
                  <span className="text-red-400 font-bold">0 $ROOSTED</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-500">Hall of Cooked:</span>
                  <span className="text-zinc-500">Excluded (Holders Only)</span>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/25 flex items-start gap-2.5 text-xs text-orange-300">
                <ShieldCheck className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                <span>
                  The Hall of Cooked strictly rejects empty or non-holding wallets. To earn a spot and receive your on-chain roast, hold $ROOSTED in your wallet.
                </span>
              </div>
            </>
          )}
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-5 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-end gap-3">
          {isHolder ? (
            <>
              {onViewRoast && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewRoast();
                  }}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold font-mono transition-colors cursor-pointer"
                >
                  View Roast Scorecard
                </button>
              )}
              {onViewHallOfCooked && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewHallOfCooked();
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black text-xs font-extrabold font-mono tracking-wide flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/20 transition-all cursor-pointer"
                >
                  <Flame className="w-4 h-4" />
                  View in Hall of Cooked
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-bold font-mono transition-colors cursor-pointer"
            >
              Try Another Wallet
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
