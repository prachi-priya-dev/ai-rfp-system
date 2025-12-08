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
// ---- MOCK AI: parse long RFP text into structured JSON (NO API NEEDED) ----
async function parseRfpWithAI(rawText) {
  // This is a fake AI just for demonstration purposes.
  // You can modify the output however you want.
  return {
    title: "Website + Mobile App Development",
    summary:
      "Client requires a complete digital solution including website, mobile apps, admin dashboard, payment gateway integration, and analytics. System should support scalability and secure transactions.",
    budget_amount: 800000,
    budget_currency: "INR",
    deadline: "2026-04-01",
    expected_timeline: "3–4 months",
    key_requirements: [
      "Website (Responsive)",
      "Android & iOS apps",
      "Checkout & Payment Gateway",
      "Product Catalog + Search",
      "Order Tracking",
      "Notification System (Email + Push)",
      "Admin Dashboard"
    ],
    deliverables: [
      "Web Application",
      "Android App",
      "iOS App",
      "Admin Panel",
      "Analytics Dashboard"
    ],
  };
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

// AI route: parse unstructured RFP text into structured JSON
app.post('/api/rfps/parse', async (req, res) => {
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
      rawResponse: err.rawResponse ?? null,
    });
  }
});


app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
