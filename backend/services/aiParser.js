// backend/aiParser.js
// "AI-like" local parser: turns messy RFP text into structured JSON
// No external API, uses simple heuristics and section parsing.

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
  // Simple sentence split on . ! ? – no lookbehind
  const cleaned = normalizeWhitespace(text);
  const raw = cleaned.split(/[.!?]+/);
  return raw.map((s) => s.trim()).filter((s) => s.length > 0);
}

function extractTitle(text) {
  const firstLine = text.split('\n')[0].trim();
  const lower = firstLine.toLowerCase();

  if (lower.startsWith('subject:')) {
    const withoutSubject = firstLine.replace(/subject:/i, '').trim();
    return withoutSubject.length > 0 ? withoutSubject : 'New Project';
  }

  if (lower.startsWith('request for proposal:')) {
    return firstLine.replace(/request for proposal:/i, '').trim() || 'New Project';
  }

  if (lower.startsWith('we need')) {
    return firstLine.replace(/we need/i, '').trim() || 'New Project';
  }
  if (lower.startsWith('need')) {
    return firstLine.replace(/need/i, '').trim() || 'New Project';
  }
  if (lower.startsWith('looking for')) {
    return firstLine.replace(/looking for/i, '').trim() || 'New Project';
  }

  return firstLine.length > 80 ? firstLine.slice(0, 77) + '...' : firstLine;
}

function extractSummary(text) {
  const sentences = extractSentences(text);
  if (sentences.length === 0) return '';
  if (sentences.length === 1) return sentences[0];
  return sentences.slice(0, 2).join('. ') + '.';
}

// Budget: use only the line that mentions budget/pricing
function extractBudget(text) {
  const lines = text.split('\n');
  let candidateLine = null;

  for (const line of lines) {
    if (/(budget|pricing|price|total cost|ceiling)/i.test(line)) {
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

function extractDeadline(text) {
  const isoMatch = text.match(
    /\b(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/,
  );
  if (isoMatch) {
    return isoMatch[0];
  }

  const dmyMatch = text.match(
    /\b(0?[1-9]|[12]\d|3[01])[-/](0?[1-9]|1[0-2])[-/](20\d{2})\b/,
  );
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  const monthNameRegex =
    /\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+([0-3]?\d)(?:st|nd|rd|th)?[, ]+\s*(20\d{2})\b/i;

  const monthMatch = text.match(monthNameRegex);
  if (monthMatch) {
    const monthName = monthMatch[1].toLowerCase();
    const day = monthMatch[2].padStart(2, '0');
    const year = monthMatch[3];
    const month = MONTHS[monthName] || '01';
    return `${year}-${month}-${day}`;
  }

  return null;
}

function extractTimeline(text) {
  const match = text.match(/(\d+\s*(weeks?|months?|days?))/i);
  return match ? match[0] : null;
}

// Generic helper: extract block of text between headings
function extractSection(text, startLabelRegex, endLabelRegexes = []) {
  const lower = text.toLowerCase();
  const startMatch = lower.match(startLabelRegex);
  if (!startMatch) return '';

  const startIndex = startMatch.index + startMatch[0].length;

  let endIndex = text.length;
  for (const endRegex of endLabelRegexes) {
    const m = lower.slice(startIndex).match(endRegex);
    if (m) {
      const candidateEnd = startIndex + m.index;
      if (candidateEnd < endIndex) {
        endIndex = candidateEnd;
      }
    }
  }

  return text.slice(startIndex, endIndex).trim();
}

function extractLinesAsList(sectionText) {
  if (!sectionText) return [];

  const lines = sectionText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const items = [];

  for (let line of lines) {
    line = line.replace(/^[-*]\s*/, '');         // - text
    line = line.replace(/^\d+[\.\)]\s*/, '');    // 1. text or 2) text
    if (line.length < 3) continue;
    items.push(line);
  }

  return items;
}

function extractKeyRequirements(text) {
  const sectionText = extractSection(
    text,
    /key requirements/i,
    [/deliverables/i, /deadline/i, /expected timeline/i, /questions should be directed/i],
  );
  return extractLinesAsList(sectionText);
}

function extractDeliverables(text) {
  const sectionText = extractSection(
    text,
    /deliverables/i,
    [/deadline/i, /expected timeline/i, /questions should be directed/i, /contact:/i],
  );
  return extractLinesAsList(sectionText);
}

async function parseRfpWithAI(rawText) {
  try {
    const text = (rawText || '').trim();
    if (!text) {
      return {
        title: '',
        summary: '',
        budget_amount: null,
        budget_currency: 'UNKNOWN',
        deadline: null,
        expected_timeline: null,
        key_requirements: [],
        deliverables: [],
      };
    }

    const title = extractTitle(text);
    const summary = extractSummary(text);

    const { amount: budget_amount, currency: budget_currency } =
      extractBudget(text);

    const deadline = extractDeadline(text);
    const expected_timeline = extractTimeline(text);

    let key_requirements = extractKeyRequirements(text);
    let deliverables = extractDeliverables(text);

    return {
      title: title || 'New Project',
      summary: summary || text.slice(0, 240),
      budget_amount: budget_amount,
      budget_currency,
      deadline,
      expected_timeline,
      key_requirements,
      deliverables,
    };
  } catch (err) {
    // Ensure we NEVER crash the route – return a safe fallback
    console.error('Local AI parser error:', err);
    return {
      title: 'Parsed RFP',
      summary: rawText.slice(0, 240),
      budget_amount: null,
      budget_currency: 'UNKNOWN',
      deadline: null,
      expected_timeline: null,
      key_requirements: [],
      deliverables: [],
    };
  }
}

module.exports = {
  parseRfpWithAI,
};
