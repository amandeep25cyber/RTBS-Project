/**
 * auctionEngine.js — Pure auction logic for testing.
 * 
 * Takes pre-fetched candidates and their current budget/frequency cap status,
 * and determines the winner according to server.md §7 rules.
 * 
 * @param {object} slot - The ad slot (needs floorPrice)
 * @param {object[]} candidates - Array of campaign objects
 * @param {object} state - Record mapping campaignId to { budget, freqcap }
 * @returns {object|null} - The winning campaign object or null
 */
function runAuctionLogic(slot, candidates, state) {
  let winner = null;

  for (const campaign of candidates) {
    const campaignId = campaign._id.toString();
    const campaignState = state[campaignId] || { budget: 0, freqcap: 0 };
    
    // Step 2: Eligibility filter
    if (campaignState.budget < campaign.maxBid) {
      continue;
    }
    if (campaignState.freqcap >= campaign.frequencyCapPerDay) {
      continue;
    }

    // Step 3: Floor price check
    if (campaign.maxBid < slot.floorPrice) {
      continue;
    }

    // Step 4: Winner selection
    if (!winner) {
      winner = campaign;
    } else if (campaign.maxBid > winner.maxBid) {
      winner = campaign;
    } else if (campaign.maxBid === winner.maxBid) {
      // Tie-breaking: earliest createdAt wins
      if (new Date(campaign.createdAt).getTime() < new Date(winner.createdAt).getTime()) {
        winner = campaign;
      }
    }
  }

  return winner;
}

module.exports = { runAuctionLogic };
