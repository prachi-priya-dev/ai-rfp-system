// backend/routes/vendorRoutes.js
const express = require('express');
const {
  createVendor,
  getAllVendors,
  getVendorsForRfp,
  setVendorsForRfp,
  updateVendor,   // 👈 NEW
} = require('../stores/vendorStore');

const router = express.Router();

// GET /api/vendors - list all vendors
router.get('/vendors', (req, res) => {
  const vendors = getAllVendors();
  res.json(vendors);
});

// POST /api/vendors - create a vendor
router.post('/vendors', (req, res) => {
  const { name, email, company, notes } = req.body;

  if (!name || !email) {
    return res
      .status(400)
      .json({ error: 'Name and email are required' });
  }

  try {
    const vendor = createVendor({ name, email, company, notes });
    res.status(201).json(vendor);
  } catch (err) {
    console.error('Create vendor error:', err);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

// 🔹 NEW: PUT /api/vendors/:id - update vendor
router.put('/vendors/:id', (req, res) => {
  const id = Number(req.params.id);
  const { name, email, company, notes } = req.body;

  if (!id) {
    return res.status(400).json({ error: 'Invalid vendor id' });
  }
  if (!name || !email) {
    return res
      .status(400)
      .json({ error: 'Name and email are required' });
  }

  try {
    const updated = updateVendor(id, {
      name,
      email,
      company,
      notes,
    });
    if (!updated) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json(updated);
  } catch (err) {
    console.error('Update vendor error:', err);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

// GET /api/rfps/:id/vendors - vendors linked to a specific RFP
router.get('/rfps/:id/vendors', (req, res) => {
  const rfpId = Number(req.params.id);
  if (!rfpId) {
    return res.status(400).json({ error: 'Invalid RFP id' });
  }

  const vendors = getVendorsForRfp(rfpId);
  res.json(vendors);
});

// POST /api/rfps/:id/vendors - set vendors for an RFP
// body: { vendorIds: [1, 2, 3] }
router.post('/rfps/:id/vendors', (req, res) => {
  const rfpId = Number(req.params.id);
  const { vendorIds } = req.body;

  if (!rfpId) {
    return res.status(400).json({ error: 'Invalid RFP id' });
  }

  if (!Array.isArray(vendorIds)) {
    return res
      .status(400)
      .json({ error: 'vendorIds array is required' });
  }

  try {
    setVendorsForRfp(
      rfpId,
      vendorIds.map((id) => Number(id)),
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Set vendors for RFP error:', err);
    res.status(500).json({
      error: 'Failed to assign vendors to RFP',
    });
  }
});

module.exports = router;
