const express = require('express');
const { createRfp, getAllRfps, getRfpById } = require('../rfpStore');
const { parseRfpWithAI } = require('../aiParser');

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

module.exports = router;
