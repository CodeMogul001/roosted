import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { 
  getTokenStatus, 
  isTokenLive, 
  validateWalletAddress, 
  getWalletTokenInteractions, 
  CONFIG 
} from './src/server/blockchain.ts';
import { buildRoastResult, RawTransactionRecord } from './src/utils/scoringEngine.ts';
import { HallOfCookedEntry, RoastAnalysisResult } from './src/types/roast.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// In-memory store for shareable roast results and Hall of Cooked
const roastResultsCache = new Map<string, RoastAnalysisResult>();

// Hall of Cooked: No demo wallets. Only populated when a wallet address holds the $ROOSTED token.
let hallOfCookedList: HallOfCookedEntry[] = [];

// Simple in-memory sliding window rate limiter
const ipRequests = new Map<string, { count: number; resetTime: number }>();
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = ipRequests.get(ip);
  if (!entry || entry.resetTime < now) {
    ipRequests.set(ip, { count: 1, resetTime: now + 60000 }); // 60 requests per minute
    return true;
  }
  if (entry.count >= 60) return false;
  entry.count++;
  return true;
}

// 1. Token Launch Status
app.get('/api/token-status', (_req: Request, res: Response) => {
  res.json(getTokenStatus());
});

// 2. Roast Analyzer
app.post('/api/roast/analyze', async (req: Request, res: Response) => {
  const clientIp = req.ip || 'unknown';
  if (!checkRateLimit(clientIp)) {
    res.status(429).json({ 
      success: false, 
      status: 'error', 
      message: 'Too many requests. Please wait a minute before roasting again.' 
    });
    return;
  }

  const { address } = req.body || {};
  if (!address || typeof address !== 'string') {
    res.status(400).json({
      success: false,
      status: 'invalid_address',
      message: 'Please paste a valid public wallet address.'
    });
    return;
  }

  const validation = validateWalletAddress(address);
  if (!validation.valid) {
    res.status(400).json({
      success: false,
      status: 'invalid_address',
      message: validation.error || 'Invalid address format. Enter a valid NEAR, EVM, or Solana public address.'
    });
    return;
  }

  // Check launch status
  if (!isTokenLive()) {
    res.status(200).json({
      success: false,
      status: 'token_not_launched',
      message: 'The owl is getting ready. $ROOSTED has not launched yet. Token details will be announced officially.'
    });
    return;
  }

  try {
    const transactions = await getWalletTokenInteractions(address);
    if (!transactions || transactions.length === 0) {
      res.status(200).json({
        success: false,
        status: 'no_activity',
        message: 'This owl has nothing to investigate yet. No $ROOSTED trading activity found.'
      });
      return;
    }

    const result = buildRoastResult(
      address,
      CONFIG.network,
      CONFIG.contractAddress,
      transactions
    );

    roastResultsCache.set(result.id, result);
    // Also key by address for fast lookup
    roastResultsCache.set(address.toLowerCase(), result);

    // Requirement: ONLY add wallets and info when wallet address pasted holds the $ROOSTED token
    if (result.metrics.isHolder && result.metrics.netTokenBalanceNumber > 0) {
      const existingIdx = hallOfCookedList.findIndex(
        e => e.walletAddress.toLowerCase() === address.toLowerCase()
      );
      const entry: HallOfCookedEntry = {
        id: result.id,
        rank: 1,
        walletAddress: result.walletAddress,
        shortAddress: result.shortAddress,
        cookedScore: result.cookedScore,
        roastLevel: result.roastLevel,
        roast: result.headlineRoast,
        buys: result.metrics.buysCount,
        sells: result.metrics.sellsCount,
        holdingAmount: `${result.metrics.netTokenBalance} $ROOSTED`,
        analyzedAt: result.analyzedAt,
        isMostCooked: false
      };

      if (existingIdx >= 0) {
        hallOfCookedList[existingIdx] = entry;
      } else {
        hallOfCookedList.push(entry);
      }

      // Re-sort by highest cooked score
      hallOfCookedList.sort((a, b) => b.cookedScore - a.cookedScore);
      hallOfCookedList = hallOfCookedList.slice(0, 25).map((e, idx) => ({
        ...e,
        rank: idx + 1,
        isMostCooked: idx === 0
      }));
    }

    res.json({
      success: true,
      status: 'success',
      message: 'Wallet analyzed successfully.',
      data: result
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    res.status(500).json({
      success: false,
      status: 'error',
      message: `Blockchain data retrieval failed: ${errorMsg}. Please try again.`
    });
  }
});

// 3. Retrieve Saved Roast (Shareable Result URL)
app.get('/api/roast/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const result = roastResultsCache.get(id) || roastResultsCache.get(id.toLowerCase());
  if (!result) {
    res.status(404).json({ success: false, message: 'Roast result not found or expired.' });
    return;
  }
  res.json({ success: true, data: result });
});

// 4. Hall of Cooked
app.get('/api/hall-of-cooked', (_req: Request, res: Response) => {
  res.json({ success: true, data: hallOfCookedList });
});

// 5. Hall of Cooked Removal Request
app.post('/api/hall-of-cooked/remove', (req: Request, res: Response) => {
  const { walletAddress } = req.body || {};
  if (!walletAddress || typeof walletAddress !== 'string') {
    res.status(400).json({ success: false, message: 'Wallet address is required for removal.' });
    return;
  }

  const beforeLen = hallOfCookedList.length;
  hallOfCookedList = hallOfCookedList.filter(
    e => e.walletAddress.toLowerCase() !== walletAddress.trim().toLowerCase()
  );

  // Re-rank
  hallOfCookedList = hallOfCookedList.map((e, idx) => ({
    ...e,
    rank: idx + 1,
    isMostCooked: idx === 0
  }));

  res.json({
    success: true,
    message: beforeLen !== hallOfCookedList.length
      ? 'Wallet address successfully unlisted from Hall of Cooked.'
      : 'Address was not found on the active leaderboard.'
  });
});


// Configure Vite middleware in development or serve static in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ROOSTED Backend] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
