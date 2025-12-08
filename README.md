# 🤖 AI-Powered RFP Management System

A full-stack web application to **create, manage, and AI-parse RFPs (**Request** for Proposals)**.

- Frontend: **React + Vite**
- Backend: **Node.js + Express**
- AI: **Mock AI parser (no paid API key needed)**

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

> ✅ Uses **mock AI** on backend – works completely offline, no OpenAI account or billing required.

---

## 🧱 Project Structure

ai-rfp-system/
├── backend/
│   ├── index.js          # Express app entry point
│   ├── rfpStore.js       # In-memory RFP storage + helpers
│   ├── aiParser.js       # Mock AI parser (no external API)
│   └── routes/
│       └── rfpRoutes.js    # All /api/rfps* routes
└── frontend/
    ├── src/
    │   ├── App.jsx         # Main React app
    │   ├── main.jsx        # React entry
    │   ├── index.css       # Global base styles
    │   └── components/
    │       ├── Header.jsx
    │       ├── BackendHealth.jsx
    │       ├── AiAssistSection.jsx
    │       ├── RfpForm.jsx
    │       └── RfpList.jsx
    └── styles/
        ├── variables.css  # CSS variables (colors, fonts, etc.)
        ├── layout.css     # Layout styles (app container, card)
        ├── buttons.css    # Button styles
        ├── form.css       # Form + input styles
        └── sections.css   # Sections, cards, list styles
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

{
  "status": "ok",
  "message": "Backend is running"
}

### 📂 GET /api/rfps

Returns all stored RFPs.

**Request**
GET /api/rfps

**Response**
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

### 📝 POST /api/rfps

Creates a new RFP entry.

**Request**
POST /api/rfps
Content-Type: application/json

{
  "title": "New App Development",
  "description": "iOS + Android app with product catalog",
  "budget": 200000,
  "deadline": "2026-02-01"
}

**Response**
{
  "id": 2,
  "title": "New App Development",
  "description": "iOS + Android app with product catalog",
  "budget": 200000,
  "deadline": "2026-02-01",
  "createdAt": "2025-12-08T10:25:11.123Z"
}

### 📄 GET /api/rfps/:id

Returns one RFP.

**Request**
GET /api/rfps/1

**Response**
{
  "id": 1,
  "title": "Website Redesign",
  "description": "Need modern UI redesign...",
  "budget": 60000,
  "deadline": "2025-12-31",
  "createdAt": "2025-12-08T10:20:11.123Z"
}


If not found:

{ "error": "RFP not found" }

### 🤖 POST /api/rfps/parse

Parses unstructured RFP text into structured JSON using a local mock AI.

**Request**
POST /api/rfps/parse
Content-Type: application/json

{
  "text": "We need a website and mobile app with product catalog..."
}

**Response**
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

---

## 📸 Screenshots

### 🏠 Main Screen
![Main Screen](https://raw.githubusercontent.com/prachi-priya-dev/ai-rfp-system/main/screenshots/home.png)

### 🤖 AI Assist
![AI Assist](https://raw.githubusercontent.com/prachi-priya-dev/ai-rfp-system/main/screenshots/ai-assist.png)

### 📝 Create RFP
![Create RFP](https://raw.githubusercontent.com/prachi-priya-dev/ai-rfp-system/main/screenshots/create-rfp.png)

### 📂 RFP List
![RFP List](https://raw.githubusercontent.com/prachi-priya-dev/ai-rfp-system/main/screenshots/rfp-list.png)