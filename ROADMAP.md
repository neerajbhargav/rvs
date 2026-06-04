# SupportIQ — MVP Roadmap

**Concept:** AI-Powered Customer Service Platform
**Author:** Neeraj Bhargav Rondla
**Submitted for:** Revolution Venture Studios Co-Founder / Founding Engineer Exercise

---

## 1. Timeline to MVP: 60 Days

**Weeks 1–2: Foundation & Customer Discovery**

The first two weeks are split between technical foundation and customer validation. On the engineering side, I'd set up the core infrastructure — a FastAPI backend with a PostgreSQL database, a React frontend for the admin dashboard, and the initial LLM integration layer (Claude API + OpenAI as fallback). In parallel, I'd be conducting 15–20 customer discovery calls with mid-market companies in the RVS network to validate three things: what channels they need automated first (chat vs. email vs. voice), what their current support cost per ticket is, and what their integration requirements look like (CRM, ticketing systems, knowledge base formats).

**Weeks 3–5: Core Agent Build**

This is the core engineering sprint. The deliverables are: (1) a Retrieval-Augmented Generation (RAG) pipeline that ingests a customer's knowledge base (help docs, FAQ, policy documents) and grounds every AI response in verified source material; (2) an autonomous agent loop with tool-use capabilities — the agent can look up account information, check policy rules, and take resolution actions (issue refund, escalate to human, create ticket); (3) a real-time confidence scoring system so the agent knows when to answer autonomously vs. when to escalate; and (4) an embeddable chat widget that can be dropped into any website with a single script tag.

**Weeks 6–7: Evaluation, Safety & Admin Dashboard**

Build the evaluation framework (RAGAS + custom metrics) to measure answer accuracy, faithfulness to source documents, and resolution success rate. Build the admin dashboard where customers can upload their knowledge base, configure escalation rules, view conversation transcripts, and monitor key metrics (deflection rate, resolution time, customer satisfaction). Implement safety guardrails: the agent should never hallucinate policy details, never share data across tenants, and always escalate sensitive situations (billing disputes over a threshold, legal language, customer distress).

**Week 8: Beta Launch with Design Partners**

Deploy to 3–5 design partner companies sourced through the RVS network. The goal is not perfection — it's getting real conversations flowing through the system so we can measure actual deflection rates and iterate on the failure modes. I'd target 80%+ deflection within the first month of live usage based on comparable benchmarks from Decagon and Intercom Fin.

---

## 2. Hires to Support Engineering Build

**Month 1 (Weeks 1–4): Zero additional hires.**

I would build the MVP solo. The core stack — RAG pipeline, agent orchestration, React dashboard, FastAPI backend — maps directly to what I've built in production at T-Mobile. Hiring before the architecture is set creates coordination overhead that slows down a solo builder. The first month is about speed, not scale.

**Month 2 (Weeks 5–8): One backend/infra engineer.**

Once the core agent loop is working and we have design partners onboarding, I'd hire one engineer focused on: (a) multi-tenant infrastructure so each customer's data is isolated, (b) the knowledge base ingestion pipeline (handling PDFs, HTML help centers, Notion docs, Confluence), and (c) deployment reliability — zero-downtime deploys, monitoring, alerting. This person should be strong in Python, comfortable with cloud infrastructure (AWS or GCP), and ideally has experience with LLM systems. I'd source through my NJIT network and the broader AI engineering community.

**Month 3+: Evaluate based on traction.**

If we have paying customers and proven unit economics, the next hire would be a frontend/product engineer to accelerate the dashboard and analytics features. But I wouldn't plan this hire until the product has real revenue signal.

---

## 3. Description of Initial Product

**What the customer gets:**

SupportIQ's initial product is an AI customer service agent that plugs into a company's existing website via an embeddable chat widget. The customer uploads their knowledge base (help docs, FAQ, internal policies), configures basic escalation rules (e.g., "escalate billing disputes over $100"), and SupportIQ handles inbound customer queries autonomously — 24/7, with sub-3-second response times.

Every response is grounded in the customer's actual documentation via RAG, not hallucinated. The agent can perform multi-step reasoning: look up an account, check a policy, and synthesize a resolution — the same agentic loop I built at T-Mobile for their customer support system. When the agent's confidence drops below threshold or the query matches an escalation rule, it seamlessly hands off to a human agent with full conversation context.

**What makes it different:**

The initial differentiator is not the AI itself — everyone has access to the same foundation models. The differentiator is the quality-assurance and continuous-improvement layer. SupportIQ evaluates every conversation against faithfulness, relevance, and resolution metrics. It surfaces failure patterns to the admin dashboard so the customer can see exactly where the agent struggles and improve their knowledge base accordingly. This shifts SupportIQ from "a chatbot that answers questions" to "a system that makes your entire support operation smarter over time" — which is the positioning outlined in the RVS concept document.

**Pricing model:**

Per-resolution pricing at $0.99 per successfully resolved conversation, aligned with the emerging industry standard set by Intercom Fin. No seat licenses, no annual contracts for the first cohort. This makes the ROI immediately provable: if the customer currently pays $5.50 per human-handled ticket and SupportIQ resolves 80% of them at $0.99 each, the savings are measurable from day one.

**Key metrics we'd track from launch:**

- Deflection rate (target: 80%+)
- Average resolution time (target: under 5 seconds)
- Faithfulness score (target: 95%+ grounded in source docs)
- Customer satisfaction (CSAT) on AI-resolved conversations
- Cost per resolution vs. human baseline
