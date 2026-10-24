import { validateWalletAddress, isTokenLive } from '../src/server/blockchain.ts';
import { 
  calculateCookedMetrics, 
  classifyRoastLevel, 
  RawTransactionRecord 
} from '../src/utils/scoringEngine.ts';

async function runTests() {
  console.log('--- Starting $ROOSTED Unit & Integration Tests ---');
  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, testName: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // 1. Address Validation Tests
  const validNearNamed = 'owltrader.near';
  const validNearTg = 'crypto_rooster.tg';
  const validNearImplicit = '9876543210abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  const validEvm = '0x8b32A461E63C47137f6a73562bC0c804A66B9a99';
  const validSolana = '7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU';
  const invalidAddress = '0x123notanaddress';

  assert(validateWalletAddress(validNearNamed).valid === true && validateWalletAddress(validNearNamed).network === 'NEAR Protocol', 'Valid NEAR named (.near) address passes validation');
  assert(validateWalletAddress(validNearTg).valid === true && validateWalletAddress(validNearTg).network === 'NEAR Protocol', 'Valid NEAR Telegram (.tg) address passes validation');
  assert(validateWalletAddress(validNearImplicit).valid === true && validateWalletAddress(validNearImplicit).network === 'NEAR Protocol', 'Valid NEAR 64-hex implicit address passes validation');
  assert(validateWalletAddress(validEvm).valid === true, 'Valid EVM address passes validation');
  assert(validateWalletAddress(validSolana).valid === true, 'Valid Solana address passes validation');
  assert(validateWalletAddress(invalidAddress).valid === false, 'Malformed address rejected');
  assert(validateWalletAddress('').valid === false, 'Empty address rejected');

  // 2. Token Status & Indexer Holding Checks
  assert(isTokenLive() === true, 'Token correctly identified as live on NEAR Protocol mainnet');

  // 3. Scoring & Classification Tests
  const now = Date.now();
  
  // Scenario A: Catastrophic Loss (CHARCOAL)
  const charcoalTxs: RawTransactionRecord[] = [
    {
      hash: '0x1',
      timestamp: now - 3600000 * 24,
      from: '0xDexRouter',
      to: validEvm,
      tokenAmount: 100000,
      type: 'buy',
      estimatedUsdValue: 1000,
      pricePerToken: 0.01
    },
    {
      hash: '0x2',
      timestamp: now - 3600000 * 2,
      from: validEvm,
      to: '0xDexRouter',
      tokenAmount: 100000,
      type: 'sell',
      estimatedUsdValue: 100,
      pricePerToken: 0.001
    }
  ];

  const charcoalResult = calculateCookedMetrics(charcoalTxs, validEvm);
  assert(charcoalResult.score >= 75, `Charcoal trader scores >= 75 (got ${charcoalResult.score})`);
  assert(classifyRoastLevel(charcoalResult.score) === 'CHARCOAL', 'Roast level is CHARCOAL');
  assert(charcoalResult.metrics.buysCount === 1, 'Classified 1 buy');
  assert(charcoalResult.metrics.sellsCount === 1, 'Classified 1 sell');

  // Scenario B: Profitable Trader (RAW)
  const rawTxs: RawTransactionRecord[] = [
    {
      hash: '0x3',
      timestamp: now - 3600000 * 48,
      from: '0xDexRouter',
      to: validEvm,
      tokenAmount: 50000,
      type: 'buy',
      estimatedUsdValue: 200,
      pricePerToken: 0.004
    },
    {
      hash: '0x4',
      timestamp: now - 3600000 * 6,
      from: validEvm,
      to: '0xDexRouter',
      tokenAmount: 50000,
      type: 'sell',
      estimatedUsdValue: 600,
      pricePerToken: 0.012
    }
  ];

  const rawResult = calculateCookedMetrics(rawTxs, validEvm);
  assert(rawResult.score < 25, `Profitable trader scores < 25 (got ${rawResult.score})`);
  assert(classifyRoastLevel(rawResult.score) === 'RAW', 'Roast level is RAW');

  // Scenario C: Token Holder verification
  const holderTxs: RawTransactionRecord[] = [
    {
      hash: '0x5',
      timestamp: now - 3600000 * 10,
      from: '0xDexRouter',
      to: validEvm,
      tokenAmount: 200000,
      type: 'buy',
      estimatedUsdValue: 300,
      pricePerToken: 0.0015
    },
    {
      hash: '0x6',
      timestamp: now - 3600000 * 2,
      from: validEvm,
      to: '0xDexRouter',
      tokenAmount: 50000,
      type: 'sell',
      estimatedUsdValue: 60,
      pricePerToken: 0.0012
    }
  ];
  const holderResult = calculateCookedMetrics(holderTxs, validEvm);
  assert(holderResult.metrics.isHolder === true, 'Wallet with net balance is verified as token holder');
  assert(holderResult.metrics.netTokenBalanceNumber === 150000, 'Calculates 150,000 net token holdings');

  // Scenario D: Sold-all non-holder
  assert(charcoalResult.metrics.isHolder === false, 'Wallet that sold entire position is not an active holder');

  // Scenario E: Empty transactions failure scenario
  try {
    calculateCookedMetrics([], validEvm);
    assert(false, 'Empty transactions should throw error');
  } catch (err: unknown) {
    assert(true, 'Empty transactions gracefully rejected with error');
  }

  // 4. Blockchain Indexer Holding Verification Tests
  const { checkWalletTokenHolding } = await import('../src/server/blockchain.ts');
  const holderCheck = await checkWalletTokenHolding('owltrader.near');
  assert(holderCheck.isHolder === true, 'Indexer correctly verifies wallet holding $ROOSTED');
  assert(holderCheck.balanceNumber > 0, 'Indexer reports positive token balance for holder');

  const nonHolderCheck = await checkWalletTokenHolding('0x8b32A461E63C47137f6a73562bC0c804A66B9a99');
  assert(nonHolderCheck.isHolder === false, 'Indexer correctly reports non-holder wallet');
  assert(nonHolderCheck.balanceNumber === 0, 'Non-holder balance is 0');

  console.log(`\nTests Completed: ${passed} Passed, ${failed} Failed`);
  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
