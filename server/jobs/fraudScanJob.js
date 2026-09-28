/**
 * fraudScanJob.js
 * 
 * Scheduled cron (every 15 minutes).
 * Flags a slot as `under_review` if it has abnormally high request volume 
 * (auctions) in the last window.
 */
const Slot = require('../models/Slot');
const AuctionLog = require('../models/AuctionLog');
const socketService = require('../services/socketService');

async function processFraudScan() {
  console.log('fraudScanJob: Starting fraud scan');
  
  // Last 15 minutes window
  const now = new Date();
  const windowStart = new Date(now.getTime() - 15 * 60000);
  const THRESHOLD = parseInt(process.env.FRAUD_THRESHOLD_PER_15MIN || '1000', 10);

  // Group auction logs by slotId
  const suspiciousSlots = await AuctionLog.aggregate([
    { $match: { timestamp: { $gte: windowStart } } },
    { $group: { _id: "$slotId", count: { $sum: 1 } } },
    { $match: { count: { $gte: THRESHOLD } } }
  ]);

  if (suspiciousSlots.length === 0) {
    console.log('fraudScanJob: No suspicious slots found');
    return;
  }

  console.log(`fraudScanJob: Found ${suspiciousSlots.length} suspicious slots exceeding ${THRESHOLD} requests`);

  for (const item of suspiciousSlots) {
    const slotId = item._id;
    const slot = await Slot.findByIdAndUpdate(
      slotId, 
      { status: 'under_review' },
      { new: true }
    ).populate('publisherId');

    if (slot) {
      console.log(`fraudScanJob: Flagged slot ${slotId} as under_review (Count: ${item.count})`);
      
      // Optionally notify publisher or admin via socket
      const io = socketService.getIO();
      if (io && slot.publisherId) {
        io.to(`publisher-${slot.publisherId._id.toString()}-room`).emit('slot:blocked', {
          slotId: slot._id,
          reason: 'Abnormally high volume (fraud scan)'
        });
      }
    }
  }
}

module.exports = { processFraudScan };
