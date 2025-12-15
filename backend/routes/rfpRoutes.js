const express = require('express');
const { createRfp,
  getAllRfps,
  getRfpById,
  updateRfp,
  deleteRfp, } = require('../stores/rfpStore');
const { parseRfpWithAI } = require('../services/aiParser');
const { setVendorsForRfp, getVendorsForRfp } = require('../stores/vendorStore');
const { sendRfpEmails } = require('../services/emailService');
const { createProposal, getProposalsForRfp } = require('../stores/proposalStore');
const { parseProposalText } = require('../services/proposalParser');
const { evaluateProposalsForRfp } = require('../services/proposalEvaluator');


const router = express.Router();

// Create a new RFP
router.post('/rfps', (req, res) => {
  const { title, description, budget, deadline, budgetCurrency } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ error: 'Title and description are required' });
  }

  const newRfp = createRfp({
    title,
    description,
    budget: budget ?? null,
    budgetCurrency: budgetCurrency || null,
    deadline: deadline ?? null,
  });

  res.status(201).json(newRfp);
});

// Get all RFPs
router.get('/rfps', (req, res) => {
  const rfps = getAllRfps();
  res.json(rfps);
});

// Get single RFP by id
router.get('/rfps/:id', (req, res) => {
  const id = Number(req.params.id);
  const rfp = getRfpById(id);

  if (!rfp) {
    return res.status(404).json({ error: 'RFP not found' });
  }

  res.json(rfp);
});

// AI parse route stays same...
router.post('/rfps/parse', async (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'RFP text is required' });
  }

  try {
    const structured = await parseRfpWithAI(text);

    return res.json({
      structuredRfp: structured,
    });
  } catch (err) {
    console.error('AI parsing error:', err);
    return res.status(500).json({
      error: 'Failed to parse RFP with AI',
      details: err.message,
    });
  }
});

// POST /api/rfps/:id/send
// Body (optional): { vendorIds: [1,2,3] } -> send only to these
// If vendorIds missing -> send to all vendors linked to this RFP
router.post('/rfps/:id/send', async (req, res) => {
  const rfpId = Number(req.params.id);
  const { vendorIds } = req.body || {};

  if (!rfpId) {
    return res.status(400).json({ error: 'Invalid RFP id' });
  }

  // 1. Load RFP
  const rfp = getRfpById(rfpId);
  if (!rfp) {
    return res.status(404).json({ error: 'RFP not found' });
  }

  // 2. Load vendors for this RFP
  let vendors = [];
  if (Array.isArray(vendorIds) && vendorIds.length > 0) {
    const allVendors = getVendorsForRfp(rfpId);
    const set = new Set(vendorIds.map((id) => Number(id)));
    vendors = allVendors.filter((v) => set.has(v.id));
  } else {
    vendors = getVendorsForRfp(rfpId);
  }

  if (!vendors || vendors.length === 0) {
    return res
      .status(400)
      .json({ error: 'No vendors linked to this RFP' });
  }

  try {
    const result = await sendRfpEmails(rfp, vendors);
    res.json({
      ok: true,
      message: `Sent RFP to ${result.sent} vendor(s).`,
      details: result,
    });
  } catch (err) {
    console.error('Send RFP email error:', err);
    res.status(500).json({
      error: 'Failed to send RFP emails',
      details: err.message,
    });
  }
});

// GET /api/rfps/:id/vendors
// POST /api/rfps/:id/vendors
// Body: { vendorIds: [1, 2, 3] }
router.post('/rfps/:id/vendors', (req, res) => {
  const rfpId = Number(req.params.id);
  const { vendorIds } = req.body || {};

  if (!rfpId) {
    return res.status(400).json({ error: 'Invalid RFP id' });
  }
  if (!Array.isArray(vendorIds) || vendorIds.length === 0) {
    return res.status(400).json({ error: 'vendorIds array is required' });
  }

  try {
    setVendorsForRfp(rfpId, vendorIds);
    res.json({ ok: true });
  } catch (err) {
    console.error('Link vendors to RFP error:', err);
    res.status(500).json({
      error: 'Failed to link vendors to RFP',
      details: err.message,
    });
  }
});

router.get('/rfps/:id/vendors', (req, res) => {
  const rfpId = Number(req.params.id);
  if (!rfpId) return res.status(400).json({ error: 'Invalid RFP id' });

  try {
    const vendors = getVendorsForRfp(rfpId);
    res.json(vendors);
  } catch (err) {
    console.error("Get vendors for RFP error:", err);
    res.status(500).json({ error: 'Failed to load vendors for RFP' });
  }
});


// POST /api/rfps/:id/proposals
// Body: { vendorName, vendorEmail, text }
router.post('/rfps/:id/proposals', async (req, res) => {
  const rfpId = Number(req.params.id);
  const { vendorName, vendorEmail, text } = req.body || {};

  if (!rfpId) {
    return res.status(400).json({ error: 'Invalid RFP id' });
  }
  if (!text || !text.trim()) {
    return res
      .status(400)
      .json({ error: 'Proposal text is required' });
  }

  const rfp = getRfpById(rfpId);
  if (!rfp) {
    return res.status(404).json({ error: 'RFP not found' });
  }

  try {
    const parsed = await parseProposalText(text);

    const proposal = createProposal({
      rfpId,
      vendorName: vendorName || null,
      vendorEmail: vendorEmail || null,
      rawText: text,
      parsed,
    });

    res.status(201).json({
      proposal,
      parsed,
    });
  } catch (err) {
    console.error('Create proposal error:', err);
    res.status(500).json({
      error: 'Failed to save proposal',
      details: err.message,
    });
  }
});

// GET /api/rfps/:id/proposals
router.get('/rfps/:id/proposals', (req, res) => {
  const rfpId = Number(req.params.id);
  if (!rfpId) {
    return res.status(400).json({ error: 'Invalid RFP id' });
  }

  try {
    const proposals = getProposalsForRfp(rfpId);
    res.json(proposals);
  } catch (err) {
    console.error('Get proposals error:', err);
    res.status(500).json({
      error: 'Failed to load proposals',
      details: err.message,
    });
  }
});

// GET /api/rfps/:id/proposals/evaluate
router.get('/rfps/:id/proposals/evaluate', (req, res) => {
  const rfpId = Number(req.params.id);

  if (!rfpId) {
    return res.status(400).json({ error: 'Invalid RFP id' });
  }

  try {
    const result = evaluateProposalsForRfp(rfpId);

    if (!result.proposals.length) {
      return res.status(404).json({ error: 'No proposals found for this RFP' });
    }

    res.json(result);
  } catch (err) {
    console.error('Evaluate proposals error:', err);
    res.status(500).json({
      error: 'Failed to evaluate proposals',
      details: err.message,
    });
  }
});

// DELETE /api/rfps/:id
router.delete('/rfps/:id', (req, res) => {
  const rfpId = Number(req.params.id);

  if (!rfpId) {
    return res.status(400).json({ error: 'Invalid RFP id' });
  }

  const rfp = getRfpById(rfpId);
  if (!rfp) {
    return res.status(404).json({ error: 'RFP not found' });
  }

  try {
    deleteRfp(rfpId);
    res.json({ ok: true });
  } catch (err) {
    console.error('Delete RFP error:', err);
    res.status(500).json({ error: 'Failed to delete RFP' });
  }
});

// PUT /api/rfps/:id
router.put('/rfps/:id', (req, res) => {
  const rfpId = Number(req.params.id);
  const { title, description, budget, budgetCurrency, deadline, vendorIds } = req.body;

  if (!rfpId || !title || !description) {
    return res.status(400).json({ error: 'Invalid input' });
  }

  try {
    const updated = updateRfp(rfpId, {
      title,
      description,
      budget,
      budgetCurrency,
      deadline,
    });

    // update vendor links if provided
    if (Array.isArray(vendorIds)) {
      setVendorsForRfp(rfpId, vendorIds);
    }

    res.json(updated);
  } catch (err) {
    console.error('Update RFP error:', err);
    res.status(500).json({ error: 'Failed to update RFP' });
  }
});

module.exports = router;
