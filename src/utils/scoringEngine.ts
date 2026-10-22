import { RoastLevel, TradingMetrics, RoastAnalysisResult } from '../types/roast.ts';

export interface RawTransactionRecord {
  hash: string;
  timestamp: number;
  from: string;
  to: string;
  tokenAmount: number;
  type: 'buy' | 'sell' | 'transfer_in' | 'transfer_out';
  estimatedUsdValue?: number;
  pricePerToken?: number;
}

export function classifyRoastLevel(score: number): RoastLevel {
  if (score < 25) return 'RAW';
  if (score < 50) return 'MEDIUM';
  if (score < 75) return 'WELL DONE';
  return 'CHARCOAL';
}

export function calculateCookedMetrics(
  transactions: RawTransactionRecord[],
  walletAddress: string
): { metrics: TradingMetrics; score: number; headline: string; detailed: string; evidence: string[] } {
  if (!transactions || transactions.length === 0) {
    throw new Error('No transactions provided for analysis');
  }

  // Sort chronologically
  const sorted = [...transactions].sort((a, b) => a.timestamp - b.timestamp);
  
  let buysCount = 0;
  let sellsCount = 0;
  let transfersCount = 0;
  let totalBoughtTokens = 0;
  let totalSoldTokens = 0;
  let totalBuyUsd = 0;
  let totalSellUsd = 0;
  let hasPriceData = false;

  const buyTimestamps: number[] = [];
  const sellTimestamps: number[] = [];
  const realizedPnLPercentages: number[] = [];

  for (const tx of sorted) {
    if (tx.type === 'buy') {
      buysCount++;
      totalBoughtTokens += tx.tokenAmount;
      buyTimestamps.push(tx.timestamp);
      if (tx.estimatedUsdValue && tx.estimatedUsdValue > 0) {
        totalBuyUsd += tx.estimatedUsdValue;
        hasPriceData = true;
      }
    } else if (tx.type === 'sell') {
      sellsCount++;
      totalSoldTokens += tx.tokenAmount;
      sellTimestamps.push(tx.timestamp);
      if (tx.estimatedUsdValue && tx.estimatedUsdValue > 0) {
        totalSellUsd += tx.estimatedUsdValue;
        hasPriceData = true;
      }
      // If we have price per token, compare to previous average buy price
      if (tx.pricePerToken && buysCount > 0 && totalBoughtTokens > 0) {
        const avgBuyPrice = totalBuyUsd > 0 ? (totalBuyUsd / totalBoughtTokens) : 0;
        if (avgBuyPrice > 0) {
          const pnlPct = ((tx.pricePerToken - avgBuyPrice) / avgBuyPrice) * 100;
          realizedPnLPercentages.push(pnlPct);
        }
      }
    } else {
      transfersCount++;
    }
  }

  const totalTrades = buysCount + sellsCount;

  // Calculate average holding time if we have buys and sells
  let avgHoldingTimeHours: number | null = null;
  if (buyTimestamps.length > 0 && sellTimestamps.length > 0) {
    const minBuy = Math.min(...buyTimestamps);
    const avgSell = sellTimestamps.reduce((a, b) => a + b, 0) / sellTimestamps.length;
    const diffMs = Math.max(0, avgSell - minBuy);
    avgHoldingTimeHours = Math.round((diffMs / (1000 * 60 * 60)) * 10) / 10;
  }

  // Calculate Win Rate
  let winRatePercent: number | null = null;
  let worstRealizedTradePercent: number | null = null;

  if (realizedPnLPercentages.length > 0) {
    const winningTrades = realizedPnLPercentages.filter(p => p > 0).length;
    winRatePercent = Math.round((winningTrades / realizedPnLPercentages.length) * 100);
    worstRealizedTradePercent = Math.round(Math.min(...realizedPnLPercentages) * 10) / 10;
  } else if (hasPriceData && totalBuyUsd > 0 && totalSellUsd > 0) {
    // Macro win rate approximation from aggregated USD
    const overallReturn = ((totalSellUsd - totalBuyUsd) / totalBuyUsd) * 100;
    if (overallReturn >= 0) {
      winRatePercent = Math.min(100, Math.round(50 + overallReturn / 2));
    } else {
      winRatePercent = Math.max(0, Math.round(50 + overallReturn / 2));
      worstRealizedTradePercent = Math.round(overallReturn * 10) / 10;
    }
  }

  // Calculate Cooked Score (0 to 100)
  // 0-24 = RAW (profitable/smart), 25-49 = MEDIUM (average), 50-74 = WELL DONE (unprofitable), 75-100 = CHARCOAL (wrecked)
  let baseScore = 50;

  if (hasPriceData && totalBuyUsd > 0) {
    const netReturn = ((totalSellUsd - totalBuyUsd) / totalBuyUsd) * 100;
    if (netReturn >= 100) {
      baseScore = 5; // Elite profit
    } else if (netReturn > 20) {
      baseScore = 15; // Solid profit
    } else if (netReturn >= -10 && netReturn <= 20) {
      baseScore = 35; // Breakeven
    } else if (netReturn < -10 && netReturn >= -40) {
      baseScore = 60; // Notable loss
    } else if (netReturn < -40 && netReturn >= -70) {
      baseScore = 80; // Heavy loss
    } else {
      baseScore = 95; // Wiped out
    }
  } else {
    // If no exact price history, derive from trade behavior:
    // Sells with zero buys (received tokens & dumped), or buys with no exits, or multiple buys
    if (buysCount > 3 && sellsCount === 0) {
      baseScore = 65; // Averaging down or bagholding
    } else if (buysCount > 0 && sellsCount > buysCount) {
      baseScore = 40; // Active scalper
    } else if (buysCount === 1 && sellsCount === 1) {
      baseScore = 45; // In and out
    } else {
      baseScore = 50;
    }
  }

  // Adjustments based on holding time
  if (avgHoldingTimeHours !== null) {
    if (avgHoldingTimeHours < 0.2 && baseScore > 50) {
      baseScore += 8; // Panic dumped immediately
    } else if (avgHoldingTimeHours > 240 && baseScore > 60) {
      baseScore += 5; // Bagheld for weeks through a decline
    }
  }

  // Clamp score strictly between 1 and 99
  const score = Math.max(1, Math.min(99, Math.round(baseScore)));

  // Pick tailored roasts based on actual behavior
  let headline = '';
  let detailed = '';

  if (score >= 75) {
    // CHARCOAL
    if (buysCount >= 2 && sellsCount > 0) {
      headline = 'The owl watched you buy the dip. Then another dip. Then another.';
      detailed = `You accumulated ${buysCount} separate times into falling price action and eventually panic dumped at an estimated ${worstRealizedTradePercent !== null ? worstRealizedTradePercent + '%' : 'heavy loss'}. Your wallet is a masterclass in exit liquidity.`;
    } else if (avgHoldingTimeHours !== null && avgHoldingTimeHours < 1) {
      headline = 'Paper hands folded faster than an origami crane.';
      detailed = `You panicked within ${Math.round(avgHoldingTimeHours * 60)} minutes of buying and ejected. The owl took notes on your heart rate.`;
    } else {
      headline = 'You bought the green candle and held through the funeral.';
      detailed = `You entered at peak excitement and rode the chart all the way down into the cemetery. Total token incineration.`;
    }
  } else if (score >= 50) {
    // WELL DONE
    if (sellsCount > 0 && buysCount > 0) {
      headline = 'Your exit strategy deserves its own investigation.';
      detailed = `You executed ${totalTrades} trades, faithfully selling into red candles and providing liquidity for the smarter birds.`;
    } else if (buysCount > 0 && sellsCount === 0) {
      headline = 'Diamond hands or terminal denial?';
      detailed = `You purchased $ROOSTED across ${buysCount} transaction${buysCount > 1 ? 's' : ''} and haven't touched a single sell button. You are perched quietly on the branch, praying for a miracle.`;
    } else {
      headline = 'Cooked to a crisp, but still breathing.';
      detailed = `Your trades generated plenty of blockchain fees, but very little financial joy. The owl feels secondhand embarrassment.`;
    }
  } else if (score >= 25) {
    // MEDIUM
    headline = 'You survived the roost, but the fees took your dignity.';
    detailed = `Completed ${totalTrades} verified transactions. You didn\'t get completely liquidated, but your net return barely outpaced Ethereum gas fees.`;
  } else {
    // RAW
    headline = 'The owl came for a barbecue, but you actually made money.';
    detailed = `Unacceptable discipline. With ${buysCount} buys and ${sellsCount} sells, you extracted value while others were getting plucked. You are an owl in hawk\'s clothing.`;
  }

  // Evidence Summary
  const evidence: string[] = [
    `Verified ${totalTrades + transfersCount} total on-chain interaction${(totalTrades + transfersCount) !== 1 ? 's' : ''} with $ROOSTED contract.`,
    `${buysCount} swap buy${buysCount !== 1 ? 's' : ''} / ${sellsCount} swap sell${sellsCount !== 1 ? 's' : ''} / ${transfersCount} direct transfer${transfersCount !== 1 ? 's' : ''}.`
  ];

  if (avgHoldingTimeHours !== null) {
    evidence.push(`Average calculated holding duration: ${avgHoldingTimeHours} hours.`);
  }
  if (winRatePercent !== null) {
    evidence.push(`Calculated trade win rate: ${winRatePercent}%.`);
  }
  if (worstRealizedTradePercent !== null) {
    evidence.push(`Worst realized trade draw: ${worstRealizedTradePercent}%.`);
  }

  const netBalanceTokens = Math.max(0, totalBoughtTokens - totalSoldTokens);
  const isHolder = netBalanceTokens > 0;

  if (isHolder) {
    evidence.push(`Current $ROOSTED token holdings: ${netBalanceTokens.toLocaleString()} tokens.`);
  } else {
    evidence.push(`No current $ROOSTED token holdings remaining (position fully closed).`);
  }

  const metrics: TradingMetrics = {
    buysCount,
    sellsCount,
    transfersCount,
    totalTrades,
    winRatePercent,
    avgHoldingTimeHours,
    worstRealizedTradePercent,
    totalVolumeEstimated: hasPriceData ? `$${Math.round(totalBuyUsd + totalSellUsd).toLocaleString()}` : null,
    netTokenBalance: netBalanceTokens > 0 ? netBalanceTokens.toLocaleString() : '0',
    netTokenBalanceNumber: netBalanceTokens,
    isHolder,
    firstTradeTimestamp: sorted[0]?.timestamp || null,
    lastTradeTimestamp: sorted[sorted.length - 1]?.timestamp || null
  };

  return { metrics, score, headline, detailed, evidence };
}

export function buildRoastResult(
  walletAddress: string,
  network: string,
  tokenContract: string,
  transactions: RawTransactionRecord[]
): RoastAnalysisResult {
  const shortAddress = walletAddress.length > 10 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : walletAddress;

  const { metrics, score, headline, detailed, evidence } = calculateCookedMetrics(transactions, walletAddress);

  return {
    id: `roast_${Date.now()}_${walletAddress.slice(2, 8).toLowerCase()}`,
    walletAddress,
    shortAddress,
    analyzedAt: Date.now(),
    cookedScore: score,
    roastLevel: classifyRoastLevel(score),
    metrics,
    headlineRoast: headline,
    detailedRoast: detailed,
    network,
    tokenContract,
    verifiedTransactionsCount: transactions.length,
    evidenceSummary: evidence
  };
}
