// backend/rfpStore.js

let rfps = [];
let nextRfpId = 1;

function createRfp({ title, description, budget, deadline }) {
  const newRfp = {
    id: nextRfpId++,
    title,
    description,
    budget: budget ?? null,
    deadline: deadline ?? null,
    createdAt: new Date().toISOString(),
  };
  rfps.push(newRfp);
  return newRfp;
}

function getAllRfps() {
  return rfps;
}

function getRfpById(id) {
  return rfps.find((rfp) => rfp.id === id);
}

module.exports = {
  createRfp,
  getAllRfps,
  getRfpById,
};
