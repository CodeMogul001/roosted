import React, { useState } from 'react';
import { Share2, Download, RotateCcw, Check, ExternalLink, ShieldAlert } from 'lucide-react';
import { RoastAnalysisResult, RoastLevel } from '../types/roast.ts';
import { downloadRoastCardPNG } from '../utils/generateCardImage.ts';
import mascotImg from '../assets/images/roosted_owl_mascot_orange_1792700795860.jpg';

interface RoastResultCardProps {
  result: RoastAnalysisResult;
  onReset: () => void;
}

export const RoastResultCard: React.FC<RoastResultCardProps> = ({ result, onReset }) => {
  const [downloading, setDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const getLevelColor = (level: RoastLevel) => {
    switch (level) {
      case 'RAW':
        return 'text-amber-300 border-amber-400/40 bg-amber-950/40';
      case 'MEDIUM':
        return 'text-orange-300 border-orange-400/40 bg-orange-950/40';
      case 'WELL DONE':
        return 'text-orange-500 border-orange-500/40 bg-orange-950/50';
      case 'CHARCOAL':
        return 'text-red-500 border-red-500/40 bg-red-950/50';
    }
  };

  const getScoreMeterStroke = (score: number) => {
    if (score >= 75) return '#ef4444'; // Red
    if (score >= 50) return '#f97316'; // Deep Orange
    if (score >= 25) return '#fb923c'; // Warm Amber
    return '#fdba74'; // Soft Peach Gold
  };

  const handleShareX = () => {
    const appUrl = window.location.origin;
    const shareUrl = `${appUrl}/?roast=${result.id}`;
    const text = `The owl saw my $ROOSTED trades 🦉💀\n\nCooked Score: ${result.cookedScore}/100 [${result.roastLevel}]\n\n"${result.headlineRoast}"\n\nGet roasted here:`;
    const twitterIntent = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(twitterIntent, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    const appUrl = window.location.origin;
    const shareUrl = `${appUrl}/?roast=${result.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadRoastCardPNG(result);
    } catch (err) {
      console.error('Failed to export PNG', err);
    } finally {
      setDownloading(false);
    }
  };

  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (result.cookedScore / 100) * circumference;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8">
      {/* Main Scorecard Container */}
      <div className="relative rounded-2xl bg-zinc-900/90 border border-zinc-700/80 shadow-2xl p-6 sm:p-8 backdrop-blur-xl overflow-hidden">
        {/* Subtle Ambient Glow - blended with dark background */}
        <div 
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full blur-[130px] pointer-events-none opacity-25"
          style={{ backgroundColor: getScoreMeterStroke(result.cookedScore) }}
        />

        {/* Card Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <img 
              src={mascotImg} 
              alt="The Owl" 
              className="w-12 h-12 rounded-xl object-cover border border-orange-500/30 shadow-md shadow-orange-500/10"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-semibold uppercase text-zinc-400">
                  VERIFIED AUDIT
                </span>
                <span className="text-zinc-600">•</span>
                <span className="text-xs font-mono text-zinc-400">
                  {result.network}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">
                $ROOSTED TRADING DOSSIER
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 bg-zinc-950/70 px-3 py-1.5 rounded-lg border border-zinc-800 self-stretch sm:self-auto justify-between sm:justify-start">
            <span>WALLET:</span>
            <span className="font-semibold text-white">{result.shortAddress}</span>
            <button
              type="button"
              onClick={handleCopyLink}
              className="ml-2 hover:text-white transition-colors"
              title="Copy shareable URL"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-orange-400" /> : <ExternalLink className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Card Body: Meter + Verdict */}
        <div className="py-8 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Circular Score Meter (Col 1-4) */}
          <div className="md:col-span-4 flex flex-col items-center justify-center">
            <div className="relative w-44 h-44 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
                {/* Background Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="#27272a"
                  strokeWidth="12"
                />
                {/* Progress Ring */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={getScoreMeterStroke(result.cookedScore)}
                  strokeWidth="12"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Inside Score Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl sm:text-5xl font-extrabold font-mono text-white tabular-nums">
                  {result.cookedScore}
                </span>
                <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 mt-0.5">
                  COOKED SCORE
                </span>
              </div>
            </div>

            {/* Level Badge */}
            <div className={`mt-4 px-3 py-1 rounded-md border text-xs font-mono font-bold tracking-wider uppercase ${getLevelColor(result.roastLevel)}`}>
              {result.roastLevel}
            </div>
          </div>

          {/* Verdict Text (Col 5-12) */}
          <div className="md:col-span-8 space-y-4">
            <div className="space-y-2">
              <span className="text-xs font-mono uppercase tracking-wider text-orange-400 font-semibold">
                THE OWL'S VERDICT
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug">
                “{result.headlineRoast}”
              </h3>
              <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                {result.detailedRoast}
              </p>
            </div>

            {/* Verified On-Chain Evidence List */}
            <div className="pt-2">
              <p className="text-xs font-mono uppercase text-zinc-500 mb-1.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-zinc-400" />
                Verified On-Chain Evidence:
              </p>
              <ul className="space-y-1 text-xs font-mono text-zinc-400">
                {result.evidenceSummary.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-orange-400 font-bold">›</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="pt-6 border-t border-zinc-800 grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
            <p className="text-[11px] font-mono uppercase text-zinc-500">BUYS</p>
            <p className="text-lg font-bold font-mono text-white mt-0.5">
              {result.metrics.buysCount}
            </p>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
            <p className="text-[11px] font-mono uppercase text-zinc-500">SELLS</p>
            <p className="text-lg font-bold font-mono text-white mt-0.5">
              {result.metrics.sellsCount}
            </p>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
            <p className="text-[11px] font-mono uppercase text-zinc-500">WIN RATE</p>
            <p className="text-lg font-bold font-mono text-white mt-0.5">
              {result.metrics.winRatePercent !== null ? `${result.metrics.winRatePercent}%` : 'Unavailable'}
            </p>
          </div>

          <div className="p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
            <p className="text-[11px] font-mono uppercase text-zinc-500">AVG HOLD</p>
            <p className="text-lg font-bold font-mono text-white mt-0.5">
              {result.metrics.avgHoldingTimeHours !== null ? `${result.metrics.avgHoldingTimeHours}h` : 'Unavailable'}
            </p>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 bg-zinc-950/60 rounded-xl border border-zinc-800/80">
            <p className="text-[11px] font-mono uppercase text-zinc-500">WORST TRADE</p>
            <p className="text-lg font-bold font-mono text-red-400 mt-0.5">
              {result.metrics.worstRealizedTradePercent !== null ? `${result.metrics.worstRealizedTradePercent}%` : 'Unavailable'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 pt-6 border-t border-zinc-800">
          <button
            type="button"
            onClick={onReset}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-800/60 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold flex items-center justify-center gap-2 transition-colors order-3 sm:order-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            ROAST ANOTHER WALLET
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto order-1 sm:order-2">
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-orange-400" />
              {downloading ? 'GENERATING CARD...' : 'DOWNLOAD CARD'}
            </button>

            <button
              type="button"
              onClick={handleShareX}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-black text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/20 active:scale-[0.98]"
            >
              <Share2 className="w-3.5 h-3.5 text-black" />
              SHARE ON X
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
