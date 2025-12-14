# 🤖 AI-Powered RFP Management System

A full-stack web application to **create, manage, and AI-parse RFPs (**Request** for Proposals)**.

- Frontend: **React + Vite**
- Backend: **Node.js + Express**
- AI: **Mock AI parser (no paid API key needed)**

---
## 🔗 Live Demo

 - **Frontend:**  https://ai-rfp-frontend-system.netlify.app/
 - **Backend Health:**  https://ai-rfp-backend-xn45.onrender.com/api/health

---

## 📌 Features

- ✍️ **Create RFPs** with title, description, budget, deadline.
- 📂 **View all RFPs** in a clean list.
- 🤖 **AI Assist – Parse RFP Text**:
  - Paste long, unstructured RFP text (like from an email or PDF).
  - Backend mock AI converts it into structured JSON with:
    - `title`
    - `summary`
    - `budget_amount`
    - `budget_currency`
    - `deadline`
    - `expected_timeline`
    - `key_requirements[]`
    - `deliverables[]`
  - One click to **fill the Create RFP form** from AI output.
- 🩺 **Backend Health Check** section in UI.
- **🧑‍💼 Vendor Management**
  - Add vendors with name, email, company, and notes
  - Edit vendor details later if required
  - Link vendors to specific RFPs
- **📧 Send RFPs to Vendors**
  - Send RFP invitations via email using Mailtrap (dev-safe SMTP)
  - One click sends emails to all vendors linked to the RFP
  - Handles per-vendor success/failure safely
- **📬 Vendor Proposals (Simulated)**
  - Paste vendor email responses directly into the UI
  - Store proposals per RFP
  - Mock AI parses proposal text to extract:
    - `Pricing`
    - `Currency`
    - `Timeline`
    - `Summary`
💡 IMAP inbox integration was intentionally skipped to keep the system clean and deterministic for demo purposes.
- **📊 Compare & Recommend (Phase 5)**
  - View all proposals for an RFP in a comparison table
  - Mock AI evaluation logic:
     - `Reads parsed proposal data`
     - `Compares price and timeline`

  - Returns:
    - `Recommended vendor`
    - `Clear explanation of the decision`
- Fully client-visible and explainable (no black box)

> ✅ Uses **mock AI** on backend – works completely offline, no OpenAI account or billing required.

---

## 🧱 Project Structure

```text
ai-rfp-system/
├── backend/
│   ├── index.js                # Express app entry
│   ├── db.js                   # SQLite connection
│   ├── emailService.js         # Mailtrap + Nodemailer
│   ├── services/
│   │   ├── aiParser.js         # Mock AI for RFP & proposals
│   │   ├── evaluationService.js# Vendor comparison logic
│   ├── stores/
│   │   ├── rfpStore.js
│   │   ├── vendorStore.js
│   │   ├── proposalStore.js
│   ├── routes/
│   │   ├── rfpRoutes.js
│   │   ├── vendorRoutes.js
│   │   ├── proposalRoutes.js
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── BackendHealth.jsx
│   │   │   ├── AiAssistSection.jsx
│   │   │   ├── RfpForm.jsx
│   │   │   ├── VendorManagement.jsx
│   │   │   ├── VendorProposalsSection.jsx
│   │   │   ├── RecommendationPanel.jsx
│   │   ├── styles/
│   │   │   ├── variables.css
│   │   │   ├── layout.css
│   │   │   ├── buttons.css
│   │   │   ├── form.css
│   │   │   ├── sections.css
│
└── screenshots/
    ├── home.png
    ├── ai-assist.png
    ├── create-rfp.png
    ├── vendor-proposals.png
    ├── comparison.png
```
---

## 🧪 Running the Project Locally

### 1️⃣ Start backend

cd backend
npm install      # only first time
npm run dev      # starts server on http://localhost:4000

### 2️⃣ Start the frontend

Open a second terminal:

cd frontend
npm install      # only first time
npm run dev      # starts app on http://localhost:5173


### Open browser:

http://localhost:5173


### You should now see:

Header

Backend Health

AI Assist

Create New RFP

Existing RFP List

## 📡 API Documentation

Base URL (local):

http://localhost:4000/api

### 🩺 GET /api/health

Checks if backend server is running.

**Request**
GET /api/health

**Response**
```json
{
  "status": "ok",
  "message": "Backend is running"
}
```

### 📄 RFPs

**GET /rfps**

**POST /rfps**

**GET /rfps/:id**

**POST /rfps/parse**

**POST /rfps/:id/send**

### 🧑‍💼 Vendors

**GET /vendors**

**POST /vendors**

**PUT /vendors/:id**

### 📬 Proposals

**GET /rfps/:id/proposals**

**POST /rfps/:id/proposals**

### 📊 Evaluation

**POST /rfps/:id/evaluate**

Returns recommended vendor + explanation.

### 📂 GET /api/rfps

Returns all stored RFPs.

**Request**
GET /api/rfps

**Response**
```json
[
  {
    "id": 1,
    "title": "Website Redesign",
    "description": "Need modern UI redesign for e-commerce store...",
    "budget": 60000,
    "deadline": "2025-12-31",
    "createdAt": "2025-12-08T10:20:11.123Z"
  }
]
```

### 📝 POST /api/rfps

Creates a new RFP entry.

**Request**
POST /api/rfps
Content-Type: application/json
```json
{
  "title": "New App Development",
  "description": "iOS + Android app with product catalog",
  "budget": 200000,
  "deadline": "2026-02-01"
}
```
**Response**
```json
{
  "id": 2,
  "title": "New App Development",
  "description": "iOS + Android app with product catalog",
  "budget": 200000,
  "deadline": "2026-02-01",
  "createdAt": "2025-12-08T10:25:11.123Z"
}
```

### 📄 GET /api/rfps/:id

Returns one RFP.

**Request**
GET /api/rfps/1

**Response**
```json
{
  "id": 1,
  "title": "Website Redesign",
  "description": "Need modern UI redesign...",
  "budget": 60000,
  "deadline": "2025-12-31",
  "createdAt": "2025-12-08T10:20:11.123Z"
}
```


If not found:

{ "error": "RFP not found" }

### 🤖 POST /api/rfps/parse

Parses unstructured RFP text into structured JSON using a local mock AI.

**Request**
POST /api/rfps/parse
Content-Type: application/json
```json
{
  "text": "We need a website and mobile app with product catalog..."
}
```

**Response**
```json
{
  "structuredRfp": {
    "title": "Website + Mobile App Development",
    "summary": "Client requires a complete digital solution...",
    "budget_amount": 800000,
    "budget_currency": "INR",
    "deadline": "2026-04-01",
    "expected_timeline": "3–4 months",
    "key_requirements": [
      "Responsive website",
      "Android & iOS apps",
      "Product catalog + search",
      "Shopping cart & payment gateway"
    ],
    "deliverables": [
      "Web Application",
      "Android App",
      "iOS App",
      "Admin Panel"
    ]
  }
}
```

---

## 📸 Screenshots

### 🏠 Main Screen
![Main Screen](/screenshots/home.png)

### 🤖 AI Assist
![AI Assist](/screenshots/ai-assist.png)

### 📝 Create RFP
![Create RFP](/screenshots/create-rfp.png)

### 📂 RFP List
![RFP List](/screenshots/rfp-list.png)

### 🗄️ Vendor Management
![Vendor Management](/screenshots/vendor-management.png)

### 📬 Vendor Proposals
![Vendor Proposal](/screenshots/vendor-proposal.png)

### 📊 Comparison & Recommendation
![Evalution](/screenshots/evalutation.png)
