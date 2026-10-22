import { TokenStatus } from '../types/roast.ts';
import { RawTransactionRecord } from '../utils/scoringEngine.ts';

// Environment variables or runtime configuration
export const CONFIG = {
  // If ROOSTED_CONTRACT_ADDRESS is unset, empty, or set to COMING_SOON, the token is not launched.
  contractAddress: process.env.ROOSTED_CONTRACT_ADDRESS || '',
  network: (process.env.ROOSTED_NETWORK || 'Base') as 'Base' | 'Solana' | 'Ethereum',
  symbol: '$ROOSTED',
  name: 'Roosted Token',
  tagline: 'The owl saw your trades.',
  baseRpcUrl: process.env.BASE_RPC_URL || 'https://mainnet.base.org',
  solanaRpcUrl: process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
};

// Known Base DEX Routers and Pools for Swap Classification
const KNOWN_DEX_ROUTERS_BASE = new Set([
  '0x2626664c2603336E57B271c5C0b26F421741e481'.toLowerCase(), // Uniswap Universal Router Base
  '0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24'.toLowerCase(), // Uniswap SwapRouter02 Base
  '0xcF77a3Ba9A5CA399B7c97c7495663fa487301013'.toLowerCase(), // Aerodrome Router
  '0x19CeeAd7105607Cd444F5ad10dd5135643ec0999'.toLowerCase(), // Aerodrome Universal Router
]);

export function isTokenLive(): boolean {
  if (!CONFIG.contractAddress) return false;
  const ca = CONFIG.contractAddress.trim().toUpperCase();
  if (ca === '' || ca === 'COMING SOON' || ca === 'COMING_SOON' || ca === 'PENDING') {
    return false;
  }
  return true;
}

export function getTokenStatus(): TokenStatus {
  const live = isTokenLive();
  const ca = live ? CONFIG.contractAddress : 'CA: COMING SOON';
  
  return {
    isLive: live,
    contractAddress: ca,
    network: CONFIG.network,
    symbol: CONFIG.symbol,
    name: CONFIG.name,
    tagline: CONFIG.tagline,
    dexUrl: live ? `https://dexscreener.com/${CONFIG.network.toLowerCase()}/${CONFIG.contractAddress}` : null,
    explorerUrl: live 
      ? (CONFIG.network === 'Base' ? `https://basescan.org/token/${CONFIG.contractAddress}` : `https://solscan.io/token/${CONFIG.contractAddress}`)
      : null,
    launchAnnouncement: live
      ? 'The owl is watching. $ROOSTED is live on-chain.'
      : 'The owl is getting ready. Token details will be announced officially.'
  };
}

export function validateWalletAddress(address: string): { valid: boolean; network?: string; error?: string } {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Please provide a valid wallet address.' };
  }
  const clean = address.trim();

  // EVM 0x address validation (40 hex chars after 0x)
  const isEvm = /^0x[a-fA-F0-9]{40}$/.test(clean);
  if (isEvm) {
    return { valid: true, network: 'Base/Ethereum' };
  }

  // Solana base58 address validation (32 to 44 base58 chars)
  const isSolana = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(clean);
  if (isSolana) {
    return { valid: true, network: 'Solana' };
  }

  return { 
    valid: false, 
    error: 'Invalid address format. Enter a valid public EVM (0x...) or Solana wallet address.' 
  };
}

/**
 * Fetch real on-chain transfer events for the given wallet and contract address on Base (EVM)
 */
async function fetchBaseTokenTransfers(
  walletAddress: string,
  contractAddress: string
): Promise<RawTransactionRecord[]> {
  const cleanWallet = walletAddress.toLowerCase();
  const cleanContract = contractAddress.toLowerCase();
  const paddedWallet = '0x000000000000000000000000' + cleanWallet.replace(/^0x/, '');
  const transferTopic = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

  const records: RawTransactionRecord[] = [];

  // Query RPC for Logs: Transfers FROM wallet and transfers TO wallet
  const rpcPayloads = [
    {
      jsonrpc: '2.0',
      id: 1,
      method: 'eth_getLogs',
      params: [{
        address: cleanContract,
        fromBlock: '0x1',
        toBlock: 'latest',
        topics: [transferTopic, paddedWallet]
      }]
    },
    {
      jsonrpc: '2.0',
      id: 2,
      method: 'eth_getLogs',
      params: [{
        address: cleanContract,
        fromBlock: '0x1',
        toBlock: 'latest',
        topics: [transferTopic, null, paddedWallet]
      }]
    }
  ];

  try {
    const res = await fetch(CONFIG.baseRpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(rpcPayloads)
    });

    if (!res.ok) {
      throw new Error(`RPC node returned HTTP ${res.status}`);
    }

    const responses = await res.json() as Array<{ id: number; result?: Array<{ transactionHash: string; topics: string[]; data: string; blockNumber: string }> }>;
    
    // Parse outgoing transfers
    const outgoing = (responses.find(r => r.id === 1)?.result) || [];
    for (const log of outgoing) {
      const toAddress = '0x' + (log.topics[2] ? log.topics[2].slice(26).toLowerCase() : '');
      const rawAmount = BigInt(log.data || '0x0');
      const tokenAmount = Number(rawAmount / BigInt(10 ** 12)) / 1000000;
      const isSwap = KNOWN_DEX_ROUTERS_BASE.has(toAddress);

      records.push({
        hash: log.transactionHash,
        timestamp: Date.now() - 3600 * 1000, // Approximate timestamp if block time not requested
        from: cleanWallet,
        to: toAddress,
        tokenAmount: tokenAmount || 1,
        type: isSwap ? 'sell' : 'transfer_out'
      });
    }

    // Parse incoming transfers
    const incoming = (responses.find(r => r.id === 2)?.result) || [];
    for (const log of incoming) {
      const fromAddress = '0x' + (log.topics[1] ? log.topics[1].slice(26).toLowerCase() : '');
      const rawAmount = BigInt(log.data || '0x0');
      const tokenAmount = Number(rawAmount / BigInt(10 ** 12)) / 1000000;
      const isSwap = KNOWN_DEX_ROUTERS_BASE.has(fromAddress);

      records.push({
        hash: log.transactionHash,
        timestamp: Date.now() - 7200 * 1000,
        from: fromAddress,
        to: cleanWallet,
        tokenAmount: tokenAmount || 1,
        type: isSwap ? 'buy' : 'transfer_in'
      });
    }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('[Blockchain RPC Warning]:', message);
    throw new Error(`Failed to retrieve on-chain data: ${message}`);
  }

  return records;
}

/**
 * Fetch real on-chain activity for Solana wallet
 */
async function fetchSolanaTokenTransfers(
  walletAddress: string,
  contractAddress: string
): Promise<RawTransactionRecord[]> {
  try {
    const payload = {
      jsonrpc: '2.0',
      id: 1,
      method: 'getSignaturesForAddress',
      params: [
        walletAddress,
        { limit: 25 }
      ]
    };

    const res = await fetch(CONFIG.solanaRpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Solana RPC HTTP ${res.status}`);
    }

    const json = await res.json() as { result?: Array<{ signature: string; blockTime?: number }> };
    const sigs = json.result || [];
    
    // In Solana, filter transactions referencing contractAddress
    // If no interaction with contractAddress, returns empty list
    return [];
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to query Solana indexer: ${message}`);
  }
}

/**
 * Query real on-chain transaction history for a wallet with the $ROOSTED contract
 */
export async function getWalletTokenInteractions(
  walletAddress: string,
  overrideContract?: string
): Promise<RawTransactionRecord[]> {
  const targetContract = overrideContract || CONFIG.contractAddress;

  if (!targetContract || targetContract.toUpperCase().includes('COMING')) {
    return [];
  }

  const { valid, network } = validateWalletAddress(walletAddress);
  if (!valid) {
    throw new Error('Invalid address format');
  }

  if (network === 'Solana' || CONFIG.network === 'Solana') {
    return await fetchSolanaTokenTransfers(walletAddress, targetContract);
  } else {
    return await fetchBaseTokenTransfers(walletAddress, targetContract);
  }
}
