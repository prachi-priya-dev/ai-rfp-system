// backend/proposalParser.js
// Simple "AI-like" parser for vendor proposals (email text).

const MONTHS = {
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',
};

function normalizeWhitespace(text) {
  return text.replace(/\s+/g, ' ').trim();
}

function extractSentences(text) {
  const cleaned = normalizeWhitespace(text);
  const raw = cleaned.split(/[.!?]+/);
  return raw.map((s) => s.trim()).filter((s) => s.length > 0);
}

function extractSummary(text) {
  const sentences = extractSentences(text);
  if (sentences.length === 0) return '';
  if (sentences.length === 1) return sentences[0];
  return sentences.slice(0, 2).join('. ') + '.';
}

// Reuse budget logic similar to RFP parser
function extractBudget(text) {
  const lines = text.split('\n');
  let candidateLine = null;

  for (const line of lines) {
    if (/(budget|price|pricing|total|cost|fees|amount)/i.test(line)) {
      candidateLine = line;
      break;
    }
  }

  const searchText = normalizeWhitespace(candidateLine || text);
  const numberMatches = [...searchText.matchAll(/(\d[\d,\.]*)/g)];
  if (numberMatches.length === 0) {
    return { amount: null, currency: 'UNKNOWN' };
  }

  let amount = null;
  for (const m of numberMatches) {
    const clean = m[1].replace(/,/g, '');
    const n = Number(clean);
    if (!Number.isNaN(n)) {
      if (amount === null || n > amount) {
        amount = n;
      }
    }
  }

  let currency = 'UNKNOWN';
  const lower = searchText.toLowerCase();

  if (/[₹]/.test(searchText) || /\brs\b|\brs\./i.test(searchText) || /\brupees?\b/i.test(lower) || /\binr\b/i.test(lower)) {
    currency = 'INR';
  } else if (/\$/g.test(searchText) || /\busd\b/i.test(lower) || /\bdollars?\b/i.test(lower)) {
    currency = 'USD';
  } else if (/[€]/.test(searchText) || /\beur\b/i.test(lower) || /\beuros?\b/i.test(lower)) {
    currency = 'EUR';
  } else if (/[£]/.test(searchText) || /\bgbp\b/i.test(lower) || /\bpounds?\b/i.test(lower)) {
    currency = 'GBP';
  } else if (/[¥]/.test(searchText) || /\bjpy\b/i.test(lower) || /\byen\b/i.test(lower)) {
    currency = 'JPY';
  } else if (/\bcad\b/i.test(lower) || /\bcanadian dollars?\b/i.test(lower)) {
    currency = 'CAD';
  } else if (/\baud\b/i.test(lower) || /\baustralian dollars?\b/i.test(lower)) {
    currency = 'AUD';
  } else if (/\byen\b/i.test(lower)) {
    currency = 'JPY';
  }

  return { amount, currency };
}

function extractTimeline(text) {
  const match = text.match(/(\d+\s*(weeks?|months?|days?))/i);
  return match ? match[0] : null;
}

async function parseProposalText(rawText) {
  try {
    const text = (rawText || '').trim();
    if (!text) {
      return {
        summary: '',
        amount: null,
        currency: 'UNKNOWN',
        timeline: null,
      };
    }

    const summary = extractSummary(text);
    const { amount, currency } = extractBudget(text);
    const timeline = extractTimeline(text);

    return {
      summary,
      amount,
      currency,
      timeline,
    };
  } catch (err) {
    console.error('Proposal parser error:', err);
    return {
      summary: rawText.slice(0, 240),
      amount: null,
      currency: 'UNKNOWN',
      timeline: null,
    };
  }
}

module.exports = {
  parseProposalText,
};
