// backend/index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());

// Simple test route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// TODO: later add:
// - RFP routes
// - Vendor routes
// - Proposal / AI routes
// - Email send/receive routes

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
