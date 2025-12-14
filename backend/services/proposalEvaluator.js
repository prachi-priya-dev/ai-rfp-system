// backend/proposalEvaluator.js
const { getProposalsForRfp } = require('../stores/proposalStore');

/**
 * Convert timeline string like "6 weeks", "3 months", "10 days" -> weeks (approx)
 */
function parseTimelineToWeeks(timeline) {
  if (!timeline) return null;
  const s = timeline.toLowerCase();

  const match = s.match(/(\d+(\.\d+)?)/);
  if (!match) return null;

  const n = parseFloat(match[1]);

  if (s.includes('month')) return n * 4;
  if (s.includes('week')) return n;
  if (s.includes('day')) return n / 7;

  return null;
}

/**
 * Give a simple score:
 * - Lower price = better
 * - Shorter timeline = better
 * - Has summary / parsed = better
 */
function evaluateProposalsForRfp(rfpId) {
  const proposals = getProposalsForRfp(rfpId);

  const formatted = proposals.map((p) => {
    const parsed = p.parsed || {};
    const timeline = parsed.timeline || null;
    const timelineWeeks = parseTimelineToWeeks(timeline);

    return {
      id: p.id,
      vendorName: p.vendorName,
      vendorEmail: p.vendorEmail,
      amount: p.amount ?? null,
      currency: p.currency ?? parsed.currency ?? null,
      timeline: timeline,
      timelineWeeks,
      summary: parsed.summary || null,
      createdAt: p.createdAt,
    };
  });

  if (formatted.length === 0) {
    return {
      rfpId,
      proposals: [],
      recommendation: null,
    };
  }

  // Filter proposals that have a price (for recommendation)
  const priced = formatted.filter((p) => p.amount != null);

  // If no priced proposals exist, recommend based on completeness
  if (priced.length === 0) {
    // completeness score: summary present + timeline present
    const best = [...formatted].sort((a, b) => {
      const aScore = (a.summary ? 1 : 0) + (a.timeline ? 1 : 0);
      const bScore = (b.summary ? 1 : 0) + (b.timeline ? 1 : 0);
      return bScore - aScore;
    })[0];

    return {
      rfpId,
      proposals: formatted,
      recommendation: {
        vendorId: best.id,
        vendorName: best.vendorName,
        reason:
          `No proposal had a clear price. "${best.vendorName}" is recommended because it has the most complete response ` +
          `(timeline: ${best.timeline || 'N/A'}, summary available: ${best.summary ? 'yes' : 'no'}).`,
      },
    };
  }

  // Sort by price first, then timeline
  priced.sort((a, b) => {
    if (a.amount !== b.amount) return a.amount - b.amount;

    const aw = a.timelineWeeks ?? Infinity;
    const bw = b.timelineWeeks ?? Infinity;
    return aw - bw;
  });

  const best = priced[0];
  const bestPrice = `${best.currency || ''} ${best.amount}`.trim();

  // Compare against others
  const others = priced.filter((p) => p.id !== best.id);

  const reason =
    others.length === 0
      ? `Only one proposal with a clear price was found, from "${best.vendorName}". ` +
        `They offer ${bestPrice} with timeline "${best.timeline || 'N/A'}".`
      : `"${best.vendorName}" is recommended because it offers the best combination of price and timeline. ` +
        `They offer ${bestPrice} with timeline "${best.timeline || 'N/A'}".`;

  return {
    rfpId,
    proposals: formatted,
    recommendation: {
      vendorId: best.id,
      vendorName: best.vendorName,
      reason,
    },
  };
}

module.exports = {
  evaluateProposalsForRfp,
};
