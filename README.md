# 🚀 SaaS-Validator

> **AI-powered validation for Micro-SaaS ideas — before you build.**

SaaS-Validator takes a raw concept and rigorously evaluates it through automated market research, competitive analysis, and strategic planning. It simulates the scrutiny of a venture capitalist, the technical insight of a CTO, and the strategic guidance of an advisor to give founders a data-driven reality check.

---

> ⚠️ **Partial Repository Notice**
> This repository does **not** contain the full source code. The complete project is kept private for personal use. Additionally, **API keys are hardcoded directly in the file directory** — without them, the application will not function. You will need to supply your own keys for OpenAI, Serper, and any other integrated services before running this project.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [How It Works](#how-it-works)
- [Agent Pipeline](#agent-pipeline)
- [Getting Started](#getting-started)
- [Environment & API Keys](#environment--api-keys)
- [Project Structure](#project-structure)
- [Contributing / Extending](#contributing--extending)

---

## Overview

SaaS-Validator is designed to answer one critical question before you write a single line of code:

> *"Is this idea actually worth building?"*

The app runs your concept through a multi-step AI pipeline — scouting competitors, scraping their messaging, analyzing market gaps, generating a business model canvas, listening to social communities, and finally drafting an MVP technical plan.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js |
| Backend | Python (FastAPI) |
| Database | SQLite |
| AI Models | OpenAI GPT-4o |
| Web Search | Serper API |

---

## How It Works

When a user submits an idea, it passes through a sequential pipeline of specialized AI agents, each performing a distinct role in the validation process.

### Agent Pipeline

#### 1. 🔍 Competitor Scouting — *Scout Agent*
Searches the web to identify direct and indirect competitors already operating in the proposed space.

#### 2. 🕵️ Data Scraping — *Spy Agent*
Visits and scrapes competitor websites to extract messaging, feature sets, and positioning data.

#### 3. 📊 Market Analysis — *Analyst Agent*
Acts as a highly critical Venture Capitalist. Synthesizes scraped data to evaluate market saturation, highlight customer pain points, and identify **Blue Ocean** opportunities — untapped gaps the idea can capitalize on.

#### 4. 🗺️ Business Modeling — *Strategy Module*
Generates a localized **Business Model Canvas**, covering value proposition, target demographics, and potential revenue streams.

#### 5. 📢 Social Listening — *Social Agent*
Scans platforms like **Reddit** and **HackerNews** to find what real users are demanding, complaining about, or struggling with in the niche.

#### 6. 💬 Pivot Coaching — *Coach Agent*
An interactive chat interface where founders can discuss the findings, challenge assumptions, and brainstorm strategic pivots with an AI coach.

#### 7. 🛠️ Technical Blueprinting — *CTO Agent*
A virtual CTO drafts an actionable technical execution plan for the **Minimum Viable Product (MVP)**, outlining the best path to build it.

---

## Getting Started

> ⚠️ See the [Partial Repository Notice](#️-partial-repository-notice) above. These steps assume you have all required files and API keys.

```bash
# 1. Clone the repository
git clone https://github.com/your-username/saas-validator.git
cd saas-validator

# 2. Install frontend dependencies
cd frontend
npm install
npm run dev

# 3. Install backend dependencies
cd ../backend
pip install -r requirements.txt
uvicorn main:app --reload
```

---

## Environment & API Keys

API keys are currently hardcoded in the project directory. If you are setting this up independently, you will need to configure the following:

| Key | Service | Used For |
|---|---|---|
| `OPENAI_API_KEY` | OpenAI | GPT-4o agents |
| `SERPER_API_KEY` | Serper | Web search & competitor scouting |

> 💡 It is strongly recommended to move these to a `.env` file and load them via `python-dotenv` (backend) and `next/env` (frontend) before any collaborative or public use.

---

## Project Structure

```
saas-validator/
├── frontend/          # Next.js app
│   ├── components/
│   ├── pages/
│   └── ...
├── backend/           # FastAPI app
│   ├── agents/        # Scout, Spy, Analyst, Strategy, Social, Coach, CTO
│   ├── main.py
│   ├── database.py    # SQLite setup
│   └── ...
└── README.md
```

> 📁 Some directories and files are not included in this public version.

---

## Contributing / Extending

This project is primarily for personal use, but if you'd like to fork and extend it, here are natural entry points:

- **Add a new agent** → create a new file in `backend/agents/` and wire it into the pipeline in `main.py`
- **Expand social listening** → plug in additional platforms (e.g., Twitter/X, LinkedIn, IndieHackers) via the Social Agent
- **Swap the AI model** → the model config is centralized; swap GPT-4o for any OpenAI-compatible endpoint
- **Add export options** → extend the frontend to export validation reports as PDF or Notion pages

---

*Built for founders who want clarity before commitment.*
