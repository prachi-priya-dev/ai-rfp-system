// backend/aiParser.js

// MOCK AI: parse long RFP text into structured JSON (NO external API)
async function parseRfpWithAI(rawText) {
  // You can tweak this to look more dynamic later if you want
  return {
    title: 'Website + Mobile App Development',
    summary:
      'Client requires a complete digital solution including website, mobile apps, admin dashboard, payment gateway integration, and analytics. System should support scalability and secure transactions.',
    budget_amount: 800000,
    budget_currency: 'INR',
    deadline: '2026-04-01',
    expected_timeline: '3–4 months',
    key_requirements: [
      'Responsive website',
      'Android & iOS apps',
      'Product catalog + search',
      'Shopping cart & payment gateway',
      'Order tracking & notifications',
      'Admin dashboard',
      'Basic analytics',
    ],
    deliverables: [
      'Web Application',
      'Android App',
      'iOS App',
      'Admin Panel',
      'Analytics Dashboard',
    ],
  };
}

module.exports = {
  parseRfpWithAI,
};
