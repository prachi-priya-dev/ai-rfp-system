require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// ---- In-memory data store for RFPs (for now, no DB) ----
let rfps = [];
let nextRfpId = 1;

// Helper to create a new RFP object
function createRfp({ title, description, budget, deadline }) {
  const newRfp = {
    id: nextRfpId++,
    title,
    description,
    budget,
    deadline,
    createdAt: new Date().toISOString(),
  };
  rfps.push(newRfp);
  return newRfp;
}

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Create a new RFP
app.post('/api/rfps', (req, res) => {
  const { title, description, budget, deadline } = req.body;

  if (!title || !description) {
    return res
      .status(400)
      .json({ error: 'Title and description are required' });
  }

  const newRfp = createRfp({
    title,
    description,
    budget: budget ?? null,
    deadline: deadline ?? null,
  });

  res.status(201).json(newRfp);
});

// Get all RFPs
app.get('/api/rfps', (req, res) => {
  res.json(rfps);
});

// Get single RFP by id
app.get('/api/rfps/:id', (req, res) => {
  const id = Number(req.params.id);
  const rfp = rfps.find((r) => r.id === id);

  if (!rfp) {
    return res.status(404).json({ error: 'RFP not found' });
  }

  res.json(rfp);
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
