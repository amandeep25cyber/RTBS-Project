const { runAuctionLogic } = require('./auctionEngine');

let passed = 0;
let failed = 0;

function assert(description, actualId, expectedId) {
  if (actualId === expectedId) {
    console.log(`  ✓ ${description}`);
    passed++;
  } else {
    console.error(`  ✗ ${description} — expected ${expectedId}, got ${actualId}`);
    failed++;
  }
}

const c1 = { _id: 'c1', maxBid: 200, frequencyCapPerDay: 5, createdAt: '2023-01-01T00:00:00Z' };
const c2 = { _id: 'c2', maxBid: 300, frequencyCapPerDay: 5, createdAt: '2023-01-02T00:00:00Z' };
const c3 = { _id: 'c3', maxBid: 300, frequencyCapPerDay: 5, createdAt: '2023-01-01T12:00:00Z' }; // Older than c2, tie-breaker winner vs c2

console.log('\n--- runAuctionLogic ---');

assert('c2 wins over c1 on bid', 
  runAuctionLogic({ floorPrice: 100 }, [c1, c2], {
    'c1': { budget: 1000, freqcap: 0 },
    'c2': { budget: 1000, freqcap: 0 }
  })?._id, 
  'c2'
);

assert('c3 wins over c2 on tie-breaker (earlier createdAt)', 
  runAuctionLogic({ floorPrice: 100 }, [c1, c2, c3], {
    'c1': { budget: 1000, freqcap: 0 },
    'c2': { budget: 1000, freqcap: 0 },
    'c3': { budget: 1000, freqcap: 0 }
  })?._id, 
  'c3'
);

assert('c2 loses to c1 because c2 maxBid < floorPrice', 
  runAuctionLogic({ floorPrice: 350 }, [c1, c2], {
    'c1': { budget: 1000, freqcap: 0 },
    'c2': { budget: 1000, freqcap: 0 }
  })?._id, 
  undefined
);

assert('c1 wins because c2 has insufficient budget', 
  runAuctionLogic({ floorPrice: 100 }, [c1, c2], {
    'c1': { budget: 1000, freqcap: 0 },
    'c2': { budget: 200, freqcap: 0 } // budget < maxBid
  })?._id, 
  'c1'
);

assert('c1 wins because c2 hit frequency cap', 
  runAuctionLogic({ floorPrice: 100 }, [c1, c2], {
    'c1': { budget: 1000, freqcap: 0 },
    'c2': { budget: 1000, freqcap: 5 } // freqcap == cap
  })?._id, 
  'c1'
);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
