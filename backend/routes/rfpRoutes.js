// backend/routes/rfpRoutes.js

const express = require('express');
const { createRfp, getAllRfps, getRfpById } = require('../rfpStore');
const { parseRfpWithAI } = require('../aiParser');

const router = express.Router();

// POST /api/rfps - create new RFP
router.post('/rfps', (req, res) => {
  const { title, description, budget, deadline } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ error: 'Title and description are required' });
  }

  const newRfp = createRfp({ title, description, budget, deadline });
  return res.status(201).json(newRfp);
});

// GET /api/rfps - list all
router.get('/rfps', (req, res) => {
  const rfps = getAllRfps();
  return res.json(rfps);
});

// GET /api/rfps/:id - one RFP
router.get('/rfps/:id', (req, res) => {
  const id = Number(req.params.id);
  const rfp = getRfpById(id);

  if (!rfp) {
    return res.status(404).json({ error: 'RFP not found' });
  }

  return res.json(rfp);
});

// POST /api/rfps/parse - AI / mock AI parsing
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

module.exports = router;
