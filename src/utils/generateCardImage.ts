import { RoastAnalysisResult } from '../types/roast.ts';

/**
 * Renders a crisp 1200x630 PNG card on a virtual HTML5 Canvas and triggers download.
 */
export async function downloadRoastCardPNG(result: RoastAnalysisResult): Promise<void> {
  const width = 1200;
  const height = 630;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  // Background
  ctx.fillStyle = '#070709';
  ctx.fillRect(0, 0, width, height);

  // Subtle radial ambient glow behind score - blended fiery orange into black
  const grad = ctx.createRadialGradient(260, 315, 20, 260, 315, 320);
  grad.addColorStop(0, 'rgba(249, 115, 22, 0.22)');
  grad.addColorStop(0.5, 'rgba(234, 88, 12, 0.08)');
  grad.addColorStop(1, 'rgba(7, 7, 9, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Border frame
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 30, width - 60, height - 60);

  // Inner subtle border
  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 1;
  ctx.strokeRect(40, 40, width - 80, height - 80);

  // Header Brand Lockup
  ctx.fillStyle = '#f97316'; // Fiery Orange
  ctx.font = 'bold 26px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('$ROOSTED', 70, 95);

  ctx.fillStyle = '#a8a29e';
  ctx.font = '500 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('•   The owl saw your trades', 215, 95);

  // Wallet Address Pill Box
  ctx.fillStyle = '#18181b';
  ctx.fillRect(width - 360, 68, 290, 42);
  ctx.strokeStyle = '#27272a';
  ctx.lineWidth = 1;
  ctx.strokeRect(width - 360, 68, 290, 42);

  ctx.fillStyle = '#a1a1aa';
  ctx.font = '600 14px "JetBrains Mono", monospace';
  ctx.fillText(result.shortAddress, width - 340, 95);

  // Divider line
  ctx.strokeStyle = '#27272a';
  ctx.beginPath();
  ctx.moveTo(70, 130);
  ctx.lineTo(width - 70, 130);
  ctx.stroke();

  // Cooked Score Circle
  const scoreCenterX = 210;
  const scoreCenterY = 320;
  const radius = 100;

  // Background ring
  ctx.beginPath();
  ctx.arc(scoreCenterX, scoreCenterY, radius, 0, 2 * Math.PI);
  ctx.strokeStyle = '#1f2937';
  ctx.lineWidth = 16;
  ctx.stroke();

  // Progress ring
  const scorePct = result.cookedScore / 100;
  const startAngle = -0.5 * Math.PI;
  const endAngle = startAngle + (2 * Math.PI * scorePct);

  ctx.beginPath();
  ctx.arc(scoreCenterX, scoreCenterY, radius, startAngle, endAngle);
  ctx.strokeStyle = result.cookedScore >= 75 ? '#ef4444' : result.cookedScore >= 50 ? '#f97316' : result.cookedScore >= 25 ? '#fb923c' : '#fdba74';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Score Text
  ctx.fillStyle = '#ffffff';
  ctx.font = '800 68px "JetBrains Mono", monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${result.cookedScore}`, scoreCenterX, scoreCenterY + 15);

  ctx.fillStyle = '#a8a29e';
  ctx.font = '600 14px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('COOKED SCORE / 100', scoreCenterX, scoreCenterY + 45);

  // Level Badge
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(scoreCenterX - 65, scoreCenterY + 65, 130, 28);
  ctx.strokeStyle = '#44403c';
  ctx.strokeRect(scoreCenterX - 65, scoreCenterY + 65, 130, 28);

  ctx.fillStyle = '#f97316';
  ctx.font = '700 12px "JetBrains Mono", monospace';
  ctx.fillText(result.roastLevel, scoreCenterX, scoreCenterY + 84);

  // Right Side Content
  ctx.textAlign = 'left';

  // Headline Roast
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 28px "Plus Jakarta Sans", sans-serif';
  
  // Wrap headline
  const headlineWords = result.headlineRoast.split(' ');
  let line1 = '';
  let line2 = '';
  for (const word of headlineWords) {
    if ((line1 + ' ' + word).length < 38) {
      line1 += (line1 ? ' ' : '') + word;
    } else {
      line2 += (line2 ? ' ' : '') + word;
    }
  }

  ctx.fillText(`“${line1}`, 380, 210);
  if (line2) {
    ctx.fillText(`${line2}”`, 380, 248);
  } else {
    // Add closing quote
    ctx.fillText(`”`, 380 + ctx.measureText(`“${line1}`).width, 210);
  }

  // Detailed explanation
  ctx.fillStyle = '#a1a1aa';
  ctx.font = '400 16px "Plus Jakarta Sans", sans-serif';
  
  const detailWords = result.detailedRoast.split(' ');
  let dLine1 = '';
  let dLine2 = '';
  for (const word of detailWords) {
    if ((dLine1 + ' ' + word).length < 55) {
      dLine1 += (dLine1 ? ' ' : '') + word;
    } else if ((dLine2 + ' ' + word).length < 55) {
      dLine2 += (dLine2 ? ' ' : '') + word;
    }
  }
  ctx.fillText(dLine1, 380, line2 ? 295 : 265);
  if (dLine2) {
    ctx.fillText(dLine2, 380, line2 ? 325 : 295);
  }

  // Metric Stats Grid
  const statsY = 385;
  const metrics = [
    { label: 'BUYS', val: `${result.metrics.buysCount}` },
    { label: 'SELLS', val: `${result.metrics.sellsCount}` },
    { label: 'HOLD TIME', val: result.metrics.avgHoldingTimeHours !== null ? `${result.metrics.avgHoldingTimeHours}h` : 'N/A' },
    { label: 'WIN RATE', val: result.metrics.winRatePercent !== null ? `${result.metrics.winRatePercent}%` : 'N/A' },
    { label: 'WORST TRADE', val: result.metrics.worstRealizedTradePercent !== null ? `${result.metrics.worstRealizedTradePercent}%` : 'N/A' }
  ];

  metrics.forEach((m, idx) => {
    const x = 380 + (idx * 145);
    ctx.fillStyle = '#141416';
    ctx.fillRect(x, statsY, 130, 75);
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, statsY, 130, 75);

    ctx.fillStyle = '#71717a';
    ctx.font = '600 11px "JetBrains Mono", monospace';
    ctx.fillText(m.label, x + 16, statsY + 28);

    ctx.fillStyle = '#f4f4f5';
    ctx.font = '700 20px "JetBrains Mono", monospace';
    ctx.fillText(m.val, x + 16, statsY + 58);
  });

  // Footer Disclaimer
  ctx.fillStyle = '#52525b';
  ctx.font = '500 13px "JetBrains Mono", monospace';
  ctx.fillText('VERIFIED ON-CHAIN $ROOSTED ACTIVITY • PUBLIC BLOCKCHAIN DATA ONLY • NO WALLET CONNECTED', 70, 565);

  // Trigger download
  const imageURI = canvas.toDataURL('image/png');
  const a = document.createElement('a');
  a.href = imageURI;
  a.download = `roosted-${result.shortAddress.replace('...', '_')}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
