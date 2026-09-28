/**
 * Fixture test for categoryMatcher.js — runs without a DB connection.
 * Usage: node services/categoryMatcher.test.js
 */
const { categoryMatches, slotMatchesCampaign } = require('./categoryMatcher');

let passed = 0;
let failed = 0;

function assert(description, actual, expected) {
  if (actual === expected) {
    console.log(`  ✓ ${description}`);
    passed++;
  } else {
    console.error(`  ✗ ${description} — expected ${expected}, got ${actual}`);
    failed++;
  }
}

// Fixture categories (mirrors server.md §6 and client.md §5.2)
const CATEGORIES = [
  { _id: 'sports',   parentId: null },
  { _id: 'cricket',  parentId: 'sports' },
  { _id: 'football', parentId: 'sports' },
  { _id: 'news',     parentId: null },
  { _id: 'politics', parentId: 'news' },
];

console.log('\n--- categoryMatches (pure) ---');
assert('cricket matches campaign targeting ["cricket"] (exact)', categoryMatches('cricket', 'sports', ['cricket']), true);
assert('cricket matches campaign targeting ["sports"] (broad/parent)', categoryMatches('cricket', 'sports', ['sports']), true);
assert('cricket does NOT match campaign targeting ["tennis"]', categoryMatches('cricket', 'sports', ['tennis']), false);
assert('cricket does NOT match campaign targeting ["news"]', categoryMatches('cricket', 'sports', ['news']), false);
assert('sports (top-level) matches campaign targeting ["sports"] (exact)', categoryMatches('sports', null, ['sports']), true);
assert('sports (top-level) does NOT match campaign targeting ["cricket"]', categoryMatches('sports', null, ['cricket']), false);
assert('empty targeting array never matches', categoryMatches('cricket', 'sports', []), false);
assert('football matches ["sports"] (broad)', categoryMatches('football', 'sports', ['sports']), true);
assert('politics matches ["politics"] (exact)', categoryMatches('politics', 'news', ['politics']), true);
assert('politics matches ["news"] (broad)', categoryMatches('politics', 'news', ['news']), true);
assert('politics does NOT match ["sports"]', categoryMatches('politics', 'news', ['sports']), false);

console.log('\n--- slotMatchesCampaign (with category lookup) ---');
const cricketSlot = { category: 'cricket' };
assert('cricket slot matches ["cricket"]', slotMatchesCampaign(cricketSlot, CATEGORIES, ['cricket']), true);
assert('cricket slot matches ["sports"] (parent)', slotMatchesCampaign(cricketSlot, CATEGORIES, ['sports']), true);
assert('cricket slot does NOT match ["news"]', slotMatchesCampaign(cricketSlot, CATEGORIES, ['news']), false);

const politicsSlot = { category: 'politics' };
assert('politics slot matches ["news"] (parent)', slotMatchesCampaign(politicsSlot, CATEGORIES, ['news']), true);
assert('politics slot does NOT match ["sports"]', slotMatchesCampaign(politicsSlot, CATEGORIES, ['sports']), false);

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
