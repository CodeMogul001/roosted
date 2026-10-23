import React, { useState } from 'react';
import { Copy, Check, ArrowRight, ShieldCheck, Flame } from 'lucide-react';
import mascotImg from '../assets/images/roosted_owl_mascot_orange_1792700795860.jpg';
import { TokenStatus } from '../types/roast.ts';

interface HeroProps {
  tokenStatus: TokenStatus;
  onRoastSubmit: (address: string) => void;
  isLoading: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  tokenStatus,
  onRoastSubmit,
  isLoading
}) => {
  const [addressInput, setAddressInput] = useState('');
  const [copiedCa, setCopiedCa] = useState(false);
  const [inputError, setInputError] = useState<string | null>(null);

  const handleCopyCa = () => {
    if (tokenStatus.contractAddress) {
      navigator.clipboard.writeText(tokenStatus.contractAddress);
      setCopiedCa(true);
      setTimeout(() => setCopiedCa(false), 2000);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setAddressInput(text.trim());
        setInputError(null);
      }
    } catch {
      // Clipboard access denied, user can paste manually
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = addressInput.trim();
    if (!clean) {
      setInputError('Please enter a public wallet address to inspect.');
      return;
    }
    setInputError(null);
    onRoastSubmit(clean);
  };

  return (
    <section id="roast" className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Background ambient lighting - blended orange ember into deep black */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[400px] bg-gradient-to-b from-orange-500/15 via-orange-950/10 to-transparent blur-[130px] rounded-full pointer-events-none" />

      {/* Hero Container */}
      <div className="relative flex flex-col items-center text-center">
        {/* Token Pre-Launch / Live Status Strip */}
        <div className="mb-8 inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-zinc-900/90 border border-zinc-800 text-xs text-zinc-300 shadow-sm">
          <span className="font-bold text-orange-400 tracking-wider uppercase">
            {tokenStatus.isLive ? 'TOKEN LIVE' : 'STATUS: COMING SOON'}
          </span>
          <span className="text-zinc-600">|</span>
          <span className="font-mono text-zinc-400">
            {tokenStatus.contractAddress}
          </span>
          <button
            type="button"
            onClick={handleCopyCa}
            className="p-1 hover:text-white transition-colors"
            title="Copy Contract Address"
          >
            {copiedCa ? <Check className="w-3.5 h-3.5 text-orange-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Mascot Visual Focal Point */}
        <div className="relative mb-6">
          <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl p-1 bg-gradient-to-b from-zinc-800 to-zinc-950 border border-zinc-800 shadow-2xl shadow-orange-500/15 overflow-hidden group">
            <img
              src={mascotImg}
              alt="$ROOSTED Sovereign Owl Mascot"
              className="w-full h-full object-cover rounded-xl"
            />
          </div>
          {/* Subtle eye reflection accent */}
          <div className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-md bg-zinc-950 border border-orange-500/40 text-[10px] font-mono font-semibold text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.3)]">
            WATCHING
          </div>
        </div>

        {/* Tagline & Headline */}
        <p className="text-sm font-semibold uppercase tracking-widest text-orange-400 mb-3 drop-shadow-[0_0_15px_rgba(249,115,22,0.3)]">
          “The owl saw your trades.”
        </p>
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white max-w-3xl leading-[1.15] text-balance mb-4">
          Paste your wallet. The owl will judge you.
        </h1>
        <p className="text-base sm:text-lg text-zinc-400 max-w-xl text-balance mb-8">
          Every $ROOSTED trade tells a story. Let’s find out how cooked yours is.
        </p>

        {/* Wallet Input Form */}
        <div className="w-full max-w-2xl">
          <form onSubmit={handleSubmit} className="relative">
            <div className="flex flex-col sm:flex-row items-center gap-2.5 p-2 bg-zinc-900/90 border border-zinc-700/80 rounded-xl shadow-xl focus-within:border-orange-500/90 focus-within:shadow-[0_0_25px_rgba(249,115,22,0.2)] transition-all">
              <div className="relative flex-1 w-full flex items-center">
                <input
                  type="text"
                  value={addressInput}
                  onChange={(e) => {
                    setAddressInput(e.target.value);
                    if (inputError) setInputError(null);
                  }}
                  placeholder="Paste public wallet address (e.g. user.near, 0x..., or Solana)"
                  className="w-full px-3.5 py-2.5 bg-transparent text-sm sm:text-base font-mono text-white placeholder-zinc-500 focus:outline-none"
                  autoComplete="off"
                  spellCheck="false"
                />
                {addressInput ? (
                  <button
                    type="button"
                    onClick={() => setAddressInput('')}
                    className="px-2 text-xs text-zinc-500 hover:text-zinc-300"
                  >
                    Clear
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePaste}
                    className="px-2.5 py-1 text-xs font-medium text-zinc-400 hover:text-white bg-zinc-800 rounded transition-colors"
                  >
                    Paste
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black font-extrabold text-sm tracking-wide flex items-center justify-center gap-2 whitespace-nowrap transition-all shadow-md shadow-orange-500/25 active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    INSPECTING TRADES...
                  </span>
                ) : (
                  <>
                    <Flame className="w-4 h-4 text-black" />
                    ROAST ME
                    <ArrowRight className="w-4 h-4 text-black" />
                  </>
                )}
              </button>
            </div>

            {inputError && (
              <p className="mt-2 text-xs text-red-400 text-left font-mono">
                {inputError}
              </p>
            )}
          </form>

          {/* Trust Marker */}
          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs text-zinc-500 font-mono">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-orange-400/80" />
              Read-only. No wallet connection. Public on-chain data only.
            </span>
          </div>
        </div>

        {/* Pre-launch Token Spec Card */}
        <div className="mt-14 w-full max-w-2xl p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 text-left">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wide">$ROOSTED TOKEN</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-orange-500/10 text-orange-400 border border-orange-500/25">
                  COMING SOON
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-1">
                {tokenStatus.launchAnnouncement}
              </p>
            </div>
            <button
              type="button"
              disabled
              className="px-3.5 py-1.5 rounded-lg bg-zinc-800 text-zinc-500 text-xs font-semibold cursor-not-allowed border border-zinc-700/50 self-start sm:self-center"
            >
              BUY $ROOSTED (DISABLED)
            </button>
          </div>

          <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500 font-mono">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-zinc-400">Contract Address:</span>
              <span className="text-zinc-200 font-semibold font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                {tokenStatus.contractAddress}
              </span>
              <button
                type="button"
                onClick={handleCopyCa}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs font-semibold font-mono transition-all active:scale-95 cursor-pointer shadow-sm"
                title="Copy official contract address"
              >
                {copiedCa ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-orange-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Address</span>
                  </>
                )}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-zinc-400">Network: <strong className="text-zinc-200">{tokenStatus.network} Mainnet</strong></span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
