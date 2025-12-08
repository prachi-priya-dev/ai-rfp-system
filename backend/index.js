// backend/index.js

const express = require('express');
const cors = require('cors');
const rfpRoutes = require('./routes/rfpRoutes');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Mount RFP routes under /api
app.use('/api', rfpRoutes);

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
