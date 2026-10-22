import React, { useState } from 'react';
import { X, UserX, Check, AlertCircle } from 'lucide-react';

interface RemovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRemoved: () => void;
}

export const RemovalModal: React.FC<RemovalModalProps> = ({
  isOpen,
  onClose,
  onRemoved
}) => {
  const [address, setAddress] = useState('');
  const [reason, setReason] = useState('Privacy / Owner Preference');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) return;

    setLoading(true);
    setStatusMsg(null);

    try {
      const res = await fetch('/api/hall-of-cooked/remove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ walletAddress: address.trim(), reason })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: 'success', text: data.message });
        setTimeout(() => {
          onRemoved();
          onClose();
        }, 1500);
      } else {
        setStatusMsg({ type: 'error', text: data.message || 'Failed to submit removal request.' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Network request error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-zinc-900 border border-zinc-700 p-6 sm:p-8 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2 text-zinc-200">
          <UserX className="w-5 h-5 text-red-400" />
          <h3 className="text-lg font-bold text-white tracking-tight">
            Hall of Cooked Removal Request
          </h3>
        </div>
        <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
          If your public wallet is featured on the Hall of Cooked leaderboard and you prefer it not to be displayed, submit your address below.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
              Wallet Address
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="0x... or Solana Address"
              className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-mono text-white placeholder-zinc-600 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono uppercase text-zinc-400 mb-1">
              Reason (Optional)
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-950 border border-zinc-700 text-xs font-sans text-zinc-300 focus:outline-none focus:border-orange-500"
            >
              <option value="Privacy / Owner Preference">Privacy / Owner Preference</option>
              <option value="Not my active wallet">Not my active wallet</option>
              <option value="Tired of being roasted">Tired of being roasted</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {statusMsg && (
            <div className={`p-3 rounded-lg text-xs font-mono flex items-center gap-2 ${
              statusMsg.type === 'success' ? 'bg-orange-950/50 border border-orange-500/30 text-orange-400' : 'bg-red-950/50 border border-red-500/30 text-red-400'
            }`}>
              {statusMsg.type === 'success' ? <Check className="w-4 h-4 shrink-0 text-orange-400" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-red-500/90 hover:bg-red-500 text-white text-xs font-bold transition-colors disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Unlist Wallet'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
