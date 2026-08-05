# 🚀 Micro-SaaS Validator

**An autonomous multi-agent AI engine that validates SaaS business ideas, analyzes competitor landscapes, scrapes marketing data, listens to social sentiment, and drafts MVP execution blueprints.**

---

## 💡 What This Tool Does Exactly

**Micro-SaaS Validator** is an end-to-end market intelligence and validation platform for indie hackers, founders, and product teams. Give it a high-level Micro-SaaS concept (e.g. *"AI video editor for short-form content creators"*), and the system deploys a team of specialized AI agents to analyze the market:

1. **📡 Scout Agent (Competitor Discovery)**: Queries Google (via Serper API) to identify direct and indirect competitors while automatically filtering out aggregator noise (Capterra, G2, Trustpilot, Yelp, etc.).
2. **🕵️ Spy Agent (Deep Web Scraping)**: Uses the Firecrawl API to extract raw landing page content, value propositions, pricing tiers, and messaging strategies from discovered competitor sites into clean markdown.
3. **📊 Analyst Agent (Skeptical VC Persona)**: Powered by OpenAI **GPT-4o**, this agent acts as a ruthless venture capitalist. It calculates an objective **Market Saturation Score (0–100%)**, breaks down competitor positioning, extracts customer pain points, and formulates a unique **Blue Ocean Opportunity**.
4. **💬 Social Listener Agent (Reddit & Hacker News)**: Scours Reddit threads and Hacker News discussions to unearth raw, organic customer frustrations, complaints, and unaddressed feature requests.
5. **🎯 Business Strategy Canvas Generator**: Auto-generates a structured 9-block **Business Model Canvas** (Key Partners, Value Proposition, Revenue Streams, Cost Structure, etc.) tailored to your specific niche.
6. **🤖 Pivot Coach (Interactive AI Chat)**: An interactive chat interface that lets you converse directly with the validation report to test alternative angles, reposition features, or iterate on the business model.
7. **🛠️ CTO Agent (MVP Technical Blueprint)**: Generates a complete technical specification for building the MVP — including recommended tech stack, core database schema, key API routes, third-party integrations, and a week-by-week build timeline.

---

## 🎯 What Problem It Solves

Building software is easier than ever, but **building something people actually pay for** remains hard. Most founders fall into one of two traps:

- **Building in a vacuum**: Spending 3 months building a product only to discover 5 mature competitors already dominate the exact same niche.
- **Analysis paralysis**: Spending weeks manually searching Google, copying text from competitor landing pages, reading endless Reddit/HN posts, and struggling to synthesize the data.

### How Micro-SaaS Validator solves this:
- **Instant Validation (< 2 Minutes)**: Replaces days of manual research with an automated, multi-step agent workflow.
- **Skeptical, Objective Insights**: Uses AI primed with VC-level skepticism to highlight real market risks instead of confirmation bias.
- **Actionable Blue Ocean Strategy**: Instead of just saying *"the market is crowded"*, it pinpoints underserved gaps and tells you exactly how to differentiate.
- **Zero-to-MVP Technical Plan**: Eliminates architectural guesswork by handing you a ready-to-implement technical blueprint.

---

## 🏗️ Architecture & Tech Stack

```
┌─────────────────────────────────────────────────────────────────┐
│                    Next.js 16 Web Dashboard                     │
│          (React 19, TypeScript, Tailwind CSS v4, Axios)         │
└─────────────────────────────────────────────────────────────────┘
                                │ HTTP / REST API
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       FastAPI Backend                           │
│                (Python 3.10+, SQLModel, SQLite)                 │
├─────────────────────────────────────────────────────────────────┤
│                        Multi-Agent Engine                       │
│ ┌───────────────┐ ┌───────────────┐ ┌─────────────────────────┐ │
│ │  Scout Agent  │ │   Spy Agent   │ │  Analyst / VC Agent     │ │
│ │ (Serper API)  │ │ (Firecrawl)   │ │      (OpenAI GPT-4o)    │ │
│ └───────────────┘ └───────────────┘ └─────────────────────────┘ │
│ ┌───────────────┐ ┌───────────────┐ ┌─────────────────────────┐ │
│ │ Social Agent  │ │  Pivot Coach  │ │  CTO Blueprint Agent    │ │
│ │ (Reddit / HN) │ │ (Interactive) │ │     (Technical Spec)    │ │
│ └───────────────┘ └───────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

| Layer | Technology |
|---|---|
| **Backend** | FastAPI, Python 3.10+, Pydantic v2, Pydantic-Settings |
| **Database** | SQLite (`research.db`) via SQLModel & `aiosqlite` |
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React |
| **Search Engine** | Serper.dev API (Google Search engine integration) |
| **Web Scraper** | Firecrawl v0 API |
| **AI Engine** | OpenAI API (`gpt-4o`) |

---

## 🚀 Quick Start Guide

### 📋 Prerequisites

Before running the application, ensure you have:
- **Python 3.10+** installed
- **Node.js 18+** and `npm` installed
- The following API Keys:
  - **OpenAI API Key** ([Get one here](https://platform.openai.com/))
  - **Serper.dev API Key** ([Get one here](https://serper.dev/))
  - **Firecrawl API Key** ([Get one here](https://www.firecrawl.dev/))

---

### 1. Clone & Configure Environment

```bash
# Clone the repository
git clone https://github.com/IonitaAC/MicroSaaS-Validator.git
cd MicroSaaS-Validator
```

Create a `.env` file in the root directory:

```bash
# Create .env file
touch .env
```

Add your API keys to `.env`:

```env
# ── Micro-SaaS Validator — Environment Variables ──
SERPER_API_KEY=your_serper_api_key_here
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

---

### 2. Start the Backend (FastAPI)

```bash
# Navigate to project root (if not already there)
cd MicroSaaS-Validator

# Create a virtual environment
python -m venv venv

# Activate virtual environment
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# On macOS / Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```

The backend server will run at:
- **API Server**: `http://localhost:8000`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`

---

### 3. Start the Frontend (Next.js)

Open a new terminal window:

```bash
# Navigate to the frontend directory
cd MicroSaaS-Validator/frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend application will be available at:
- **Dashboard**: `http://localhost:3000`

---

## 📡 API Reference Summary

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Backend service health check |
| `POST` | `/api/validate/step1-search` | Scout Agent: Find competitor URLs via Serper |
| `POST` | `/api/validate/step2-scrape` | Spy Agent: Scrape competitor landing pages via Firecrawl |
| `POST` | `/api/validate/step3-analyze` | Analyst Agent: Run VC market analysis & calculate saturation |
| `POST` | `/api/strategy/canvas` | Generate 9-block Business Model Canvas |
| `POST` | `/api/validate/step4-social` | Social Listener Agent: Reddit/HN community sentiment |
| `POST` | `/api/validate/chat` | Pivot Coach: Interactive AI chat with validation report |
| `POST` | `/api/blueprint/generate` | CTO Agent: Draft MVP Technical Execution Blueprint |
| `GET` | `/api/history` | List all historical validation reports |
| `GET` | `/api/validate/{validation_id}` | Retrieve a specific validation report by ID |

---

## 📁 Project Structure

```
MicroSaaS-Validator/
├── .env                  # API keys (gitignored)
├── .gitignore            # Git exclusion rules
├── requirements.txt      # Python dependencies
├── README.md             # Project documentation
├── app/                  # FastAPI Backend
│   ├── main.py           # Application entry point & REST endpoints
│   ├── core/             # Database & Config setup
│   │   ├── config.py     # Pydantic Settings loader
│   │   └── db.py         # Async SQLite engine & sessions
│   ├── models/           # SQLModel database schemas
│   │   └── research.py   # ValidationRecord, BusinessCanvas, ChatLog
│   ├── schemas/          # Pydantic request/response schemas
│   └── services/         # AI Agent Services
│       ├── scout.py      # Google Search via Serper
│       ├── spy.py        # Web Scraping via Firecrawl
│       ├── analyst.py    # GPT-4o VC Market Analyst
│       ├── social.py     # Social sentiment listener
│       ├── coach.py      # Interactive pivot assistant
│       └── cto.py        # MVP Technical Blueprint generator
└── frontend/             # Next.js 16 Web Dashboard
    ├── package.json      # Dependencies & scripts
    └── src/
        ├── app/          # Next.js App Router pages
        ├── components/   # UI Components (Canvas, Gauges, Terminal, etc.)
        └── hooks/        # React hooks (`useValidator.ts`)
```

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
