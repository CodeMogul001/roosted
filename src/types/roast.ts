export type RoastLevel = 'RAW' | 'MEDIUM' | 'WELL DONE' | 'CHARCOAL';

export interface TokenStatus {
  isLive: boolean;
  contractAddress: string;
  network: 'NEAR Protocol' | 'NEAR' | 'Base' | 'Solana' | 'Ethereum';
  symbol: string;
  name: string;
  tagline: string;
  dexUrl: string | null;
  explorerUrl: string | null;
  launchAnnouncement: string;
}

export interface TradingMetrics {
  buysCount: number;
  sellsCount: number;
  transfersCount: number;
  totalTrades: number;
  winRatePercent: number | null;
  avgHoldingTimeHours: number | null;
  worstRealizedTradePercent: number | null;
  totalVolumeEstimated: string | null;
  netTokenBalance: string | null;
  netTokenBalanceNumber: number;
  isHolder: boolean;
  firstTradeTimestamp: number | null;
  lastTradeTimestamp: number | null;
}

export interface NearTokenHolding {
  contractId: string;
  symbol: string;
  name: string;
  balanceRaw: string;
  balanceFormatted: string;
  balanceNumber: number;
  decimals: number;
  icon?: string | null;
  isRoosted: boolean;
  category: 'native' | 'roosted' | 'stablecoin' | 'ecosystem' | 'defi' | 'meme' | 'ft';
  explorerUrl?: string;
  dexUrl?: string | null;
}

export interface NearWalletPortfolio {
  walletAddress: string;
  network: string;
  totalTokensCount: number;
  hasRoosted: boolean;
  roostedAmount: string;
  nativeNear: {
    balanceRaw: string;
    balanceFormatted: string;
    balanceNumber: number;
    symbol: 'NEAR';
  } | null;
  tokens: NearTokenHolding[];
  analyzedAt: number;
  dataSource: string;
}

export interface RoastAnalysisResult {
  id: string;
  walletAddress: string;
  shortAddress: string;
  analyzedAt: number;
  cookedScore: number;
  roastLevel: RoastLevel;
  metrics: TradingMetrics;
  headlineRoast: string;
  detailedRoast: string;
  network: string;
  tokenContract: string;
  verifiedTransactionsCount: number;
  evidenceSummary: string[];
  portfolio?: NearWalletPortfolio;
}

export type AnalysisStatus = 
  | 'success'
  | 'not_holding'
  | 'token_not_launched'
  | 'no_activity'
  | 'invalid_address'
  | 'error';

export interface AnalysisResponse {
  success: boolean;
  status: AnalysisStatus;
  message: string;
  isHolder?: boolean;
  holdingAmount?: string;
  walletAddress?: string;
  network?: string;
  portfolio?: NearWalletPortfolio;
  data?: RoastAnalysisResult;
}

export interface HallOfCookedEntry {
  id: string;
  rank: number;
  walletAddress: string;
  shortAddress: string;
  cookedScore: number;
  roastLevel: RoastLevel;
  roast: string;
  buys: number;
  sells: number;
  holdingAmount: string;
  analyzedAt: number;
  isMostCooked: boolean;
}
