/**
 * categoryMatcher.js — Standalone, pure category matching logic.
 *
 * Rule (server.md §6):
 * A slot's category matches a campaign's targeting if:
 *   (a) the slot's categoryId is directly in campaign.targeting.category, OR
 *   (b) the slot's category's parentId is in campaign.targeting.category
 *
 * Example:
 *   slot.category = "cricket"  (parentId = "sports")
 *   campaign targeting ["cricket"] → match (exact)
 *   campaign targeting ["sports"]  → match (broad/parent)
 *   campaign targeting ["tennis"]  → no match
 *
 * This function is deliberately pure and receives all data as arguments
 * so it can be tested with fixture data without a database connection.
 *
 * @param {string}   slotCategoryId        - The slot's leaf category ID
 * @param {string|null} slotParentId       - The slot category's parentId (null if top-level)
 * @param {string[]} campaignCategoryIds   - The campaign's targeting.category array
 * @returns {boolean}
 */
function categoryMatches(slotCategoryId, slotParentId, campaignCategoryIds) {
  if (!Array.isArray(campaignCategoryIds) || campaignCategoryIds.length === 0) {
    return false;
  }
  // (a) exact match
  if (campaignCategoryIds.includes(slotCategoryId)) return true;
  // (b) broad/parent match
  if (slotParentId && campaignCategoryIds.includes(slotParentId)) return true;
  return false;
}

/**
 * Given a slot (with its category populated or resolved) and a list of categories,
 * determine whether the slot matches a campaign's targeting.
 *
 * @param {object}   slot              - { category: string }
 * @param {object[]} allCategories     - Array of { _id, parentId } objects (from DB or cache)
 * @param {string[]} campaignCategoryIds
 * @returns {boolean}
 */
function slotMatchesCampaign(slot, allCategories, campaignCategoryIds) {
  const slotCategoryId = slot.category;
  const catDoc = allCategories.find((c) => c._id === slotCategoryId || c._id.toString() === slotCategoryId);
  const slotParentId = catDoc ? catDoc.parentId || null : null;
  return categoryMatches(slotCategoryId, slotParentId, campaignCategoryIds);
}

module.exports = { categoryMatches, slotMatchesCampaign };
