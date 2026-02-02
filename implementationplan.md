# Cannabis Wellness Tracker → Medical Dashboard
## Implementation Plan: Edge AI Clinical Decision Support System

**Version:** 1.0  
**Date:** February 2026  
**Target:** Transform patient-only wellness tracker into dual-interface clinical platform

---

## Executive Summary

This plan outlines the migration from a privacy-first patient wellness tracker to a **shared decision-support medical dashboard** where clinicians access structured patient journals and guideline-grounded insights while preserving edge AI privacy architecture. The system maintains zero-knowledge data sovereignty while enabling professional oversight of cannabis treatment trajectories.

**Core Innovation:** Bidirectional edge AI that pre-processes patient data locally, generates clinician-ready summaries with RAG-backed recommendations, and synchronizes care plans—all without centralizing raw PHI.

**Timeline:** 16 weeks (4 months)  
**Team:** 2 frontend, 1 backend, 1 ML/AI, 1 clinical advisor, 1 security/privacy engineer

---

## Phase 1: Foundation & Data Model Evolution (Weeks 1-4)

### 1.1 Patient Card Schema Design

**Goal:** Define the central clinical object that replaces simple journal entries.

**Tasks:**
- [x] Design `PatientCard` data structure
- [x] Extend existing journal schema with validated scales
- [x] Add consent layer: per-field permissions

**Deliverables:**
- [x] TypeScript interfaces for patient card (`src/types/patient.ts`)
- [x] Database migration scripts (`supabase/migrations/20260202000000_clinician_linking.sql`)
- [x] Updated local storage schema (Zod schemas in `src/schemas/patient.ts`)

---

### 1.2 Authentication & Account System

**Goal:** Enable secure patient-clinician linking with SSO support.

**Tasks:**
- [x] Implement patient account creation (Existing Auth.tsx)
- [x] Add device fingerprinting for session binding (Supabase Auth)
- [x] Build one-time code generator (`ClinicianLinking.tsx`)
- [x] Create clinician verification flow (`ClinicianAccess.tsx`)
- [x] Design consent modal (`Settings.tsx` integration)

**Deliverables:**
- [x] Auth module with patient/clinician roles
- [x] Linking flow UI (patient generates code, clinician enters)
- [x] Consent management interface

---

## Phase 2: Edge AI Analysis Pipeline (Weeks 5-8)

### 2.1 Local Feature Engineering

**Goal:** Pre-compute clinically relevant features from raw journals on patient device.

**Edge AI Processing (Client-Side JavaScript):**

```javascript
// src/analysis/clinicalFeatures.ts
export interface ClinicalSummary {
  timeRange: { start: Date; end: Date };
  doseMetrics: {
    meanDailyTHC: number; // mg
    meanDailyCBD: number; // mg
    adherenceRate: number; // 0-1
    doseDrift: number; // % change from prescribed
  };
  symptomTrends: {
    painDelta: number; // change since baseline
    anxietyDelta: number;
    sleepDelta: number;
    trajectorySlope: "improving" | "stable" | "worsening";
  };
  adverseEventRate: number; // events per week
  riskFlags: string[]; // "high_dose", "daily_use", "nighttime_only"
  adherenceToPlan: number; // 0-100%
}

async function computeClinicalFeatures(
  journals: JournalEntry[],
  prescribedRegimen: CannabisRegimen,
  baselineDate: Date
): Promise<ClinicalSummary> {
  // Time-series analysis
  const recentEntries = journals.filter(j => isAfter(j.date, subWeeks(new Date(), 4)));
  
  // Dose metrics
  const doses = recentEntries.map(e => e.thcDose);
  const meanDailyTHC = mean(doses);
  const prescribedMean = prescribedRegimen.dosing.targetTHC;
  const doseDrift = ((meanDailyTHC - prescribedMean) / prescribedMean) * 100;
  
  // Symptom trajectories (linear regression on scores)
  const painSlope = linearRegression(recentEntries.map(e => e.painScore));
  
  // Risk flags from LRCUG
  const flags: string[] = [];
  if (meanDailyTHC > 40) flags.push("high_dose"); // >8 THC units/week [8]
  if (recentEntries.filter(e => e.isDailyUse).length / recentEntries.length > 0.8) {
    flags.push("daily_use");
  }
  
  return { /* assembled summary */ };
}
```

**Tasks:**
- Implement dose-response curve fitting (simple linear/logistic)
- Add symptom trajectory analysis (moving averages, trend detection)
- Build adverse event classifier (severity scoring)
- Create LRCUG rule engine (dose thresholds, frequency limits) [8]
- Generate "notable events" timeline (ER visits, panic attacks, dose changes)

**Resources:**
- [8] LRCUG guidelines: https://pmc.ncbi.nlm.nih.gov/articles/PMC5508136/
- [9] Cannabis use disorder risk units: https://www.healthline.com/health-news/should-cannabis-have-standard-units-like-alcohol
- [10] Patient-reported outcomes tracking: https://pmc.ncbi.nlm.nih.gov/articles/PMC7592869/

**Deliverables:**
- Clinical feature computation library
- Real-time dashboard preview for patients ("Your trends")
- JSON export format for clinician dashboard

---

### 2.2 Pre-Visit Summary Generation with Gemma/MedGemma

**Goal:** Use local LLM to turn metrics into readable clinical narrative.

**Implementation:**

```typescript
// src/ai/visitSummary.ts
import { WebLLM } from "@mlc-ai/web-llm";
import { findRelevantGuidelines } from "./rag";

async function generateVisitSummary(
  features: ClinicalSummary,
  guidelines: GuidelineChunk[]
): Promise<string> {
  const relevantGuidelines = findRelevantGuidelines(
    features.riskFlags.join(", "),
    guidelines
  );
  
  const prompt = `
You are a Clinical Summary Assistant preparing a pre-visit briefing for a physician.
Summarize the following patient data concisely, citing relevant guidelines.

## Patient Metrics (Last 4 Weeks)
- Mean daily THC: ${features.doseMetrics.meanDailyTHC}mg (prescribed: ${prescribedMean}mg)
- Dose drift: ${features.doseMetrics.doseDrift}%
- Pain score change: ${features.symptomTrends.painDelta} points
- Anxiety score change: ${features.symptomTrends.anxietyDelta} points
- Adverse events: ${features.adverseEventRate} per week
- Risk flags: ${features.riskFlags.join(", ")}

## Relevant Guidelines
${relevantGuidelines.map(g => `[${g.source}] ${g.text}`).join("\n\n")}

Generate a 4-sentence summary for the physician, including:
1. Adherence and dose drift assessment
2. Symptom trajectory interpretation
3. Any safety concerns with guideline citations
4. Suggested discussion points

Format: Brief, evidence-backed, cite [SOURCE] inline.
  `.trim();

  const response = await webllm.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
    max_tokens: 256,
  });
  
  return response.choices[0].message.content;
}
```

**Tasks:**
- Integrate Gemma-2B or MedGemma text model in WebLLM
- Build prompt templates for different visit types (follow-up, urgent, routine)
- Add guideline citation extraction from RAG context
- Create fallback logic if model unavailable (template-based summary)

**Resources:**
- [11] WebLLM documentation: https://github.com/mlc-ai/web-llm
- [12] MedGemma quick start: https://developers.google.com/health-ai-developer-foundations/medgemma/get-started
- [13] RAG for medical applications: https://hatchworks.com/blog/gen-ai/rag-for-healthcare/

**Deliverables:**
- Visit summary generator module
- Unit tests with sample patient data
- Performance benchmarks (inference time, token count)

---

## Phase 3: Clinician Dashboard (Weeks 9-12)

### 3.1 Dashboard UI/UX Design

**Goal:** Create intuitive, timeline-focused interface for busy clinicians.

**Core Views:**

1. **Patient List View**
   - Sortable table: name, last visit, next scheduled, alert badges (red: adverse event, yellow: dose drift)
   - Quick filters: "High risk", "Overdue visit", "New patients"

2. **Patient Card Detail View**
   - Header: demographics, diagnoses, current regimen
   - Timeline (interactive chart):
     - Y-axes: pain score, anxiety score, sleep quality, THC/CBD dose
     - X-axis: time (last 3 months default, expandable)
     - Event markers: ER visit, panic attack, dose change, clinician note
   - Tabbed sections:
     - **Summary**: Auto-generated pre-visit narrative + risk flags
     - **Trends**: Statistical tables (mean, std dev, trajectory slopes)
     - **Adverse Events**: Chronological list with severity tags
     - **Guidelines**: RAG snippets relevant to current regimen + diagnoses
     - **Plan Editor**: Adjust dose, frequency, product recommendations

3. **Plan Editor Workflow**
   - Clinician proposes changes (e.g., "Reduce THC to 5mg/night, add CBD 10mg")
   - System validates against guidelines, shows warnings (e.g., "LRCUG recommends <8 THC units/week")
   - Saves as structured `CarePlan` object, syncs to patient app
   - Patient receives notification: "Dr. Smith updated your plan. Review and confirm."

**Tasks:**
- Wireframe all views (Figma or similar)
- Implement responsive dashboard (React + Tailwind or Chakra UI)
- Build interactive timeline component (Recharts, D3.js, or Plotly.js)
- Add guideline citation popovers (hover over risk flag → shows LRCUG excerpt)
- Create plan editor form with real-time validation

**Resources:**
- [14] Medical dashboard UX patterns: https://www.nngroup.com/articles/medical-dashboard-design/
- [15] Cannabis registry dashboard examples: https://pmc.ncbi.nlm.nih.gov/articles/PMC11303852/
- [16] Shared decision-making UI: https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0336598

**Deliverables:**
- High-fidelity mockups (5 key screens)
- React dashboard prototype (read-only data)
- Plan editor with validation logic

---

### 3.2 Data Synchronization Architecture

**Goal:** Enable secure, patient-controlled data sharing without centralizing raw journals.

**Privacy-Preserving Sync Model:**

```
┌─────────────────┐           ┌──────────────────┐
│  Patient Device │           │ Clinician Device │
│   (Edge AI)     │           │   (Dashboard)    │
└────────┬────────┘           └────────┬─────────┘
         │                              │
         │ 1. Generate summary          │
         │    (local Gemma)             │
         │                              │
         │ 2. Encrypt summary +         │
         │    consented fields          │
         │    (NaCl box, clinician      │
         │     public key)              │
         │                              │
         ▼                              │
┌─────────────────────────────────┐    │
│  Sync Server (Minimal State)    │    │
│  - Stores: encrypted blobs       │    │
│  - Indexed by: patientID +       │    │
│    clinicianID                   │    │
│  - No decryption keys            │    │
│  - Audit log only                │    │
└─────────────┬───────────────────┘    │
              │                        │
              │ 3. Fetch encrypted     │
              │    data                │
              ▼                        ▼
         ┌────────────────────────────────┐
         │ Clinician decrypts locally     │
         │ (private key in browser        │
         │  keystore or HSM token)        │
         └────────────────────────────────┘
```

**Implementation:**
- **Patient side:** 
  - Runs `computeClinicalFeatures()` locally
  - Generates summary via WebLLM
  - Encrypts bundle with clinician's public key (retrieved once during linking)
  - POSTs to `/sync/upload` with signature
  
- **Sync server (Node.js + PostgreSQL or Firebase):**
  - Stores encrypted blobs (no PHI in plaintext)
  - Enforces access control (only linked clinician can fetch)
  - Logs all access attempts for audit
  
- **Clinician side:**
  - Fetches latest blob from `/sync/fetch/:patientId`
  - Decrypts in browser with private key (Web Crypto API)
  - Renders in dashboard

**Tasks:**
- Implement end-to-end encryption layer (libsodium.js)
- Build lightweight sync API (REST or WebSocket)
- Add key management UI (patient exports public key QR for clinician)
- Implement offline queueing (patient can generate summaries offline, sync when online)
- Create audit log viewer (patient can see who accessed what, when)

**Resources:**
- [17] End-to-end encryption in healthcare: https://www.ncbi.nlm.nih.gov/pmc/articles/PMC5570116/
- [18] Edge AI privacy: https://edge-ai-tech.eu/edge-ai-security-privacy-protecting-data-where-it-matters-most/
- [19] FHIR security: https://www.hl7.org/fhir/security.html

**Deliverables:**
- Sync server API (2 endpoints: upload, fetch)
- Encryption module with key exchange protocol
- Audit log viewer UI

---

## Phase 4: Integration & Pilot (Weeks 13-16)

### 4.1 End-to-End Workflow Testing

**Goal:** Validate complete patient-to-clinician loop with real-world scenarios.

**Test Scenarios:**

| Scenario | Patient Actions | Clinician Actions | Expected Outcome |
|----------|----------------|-------------------|------------------|
| **Initial Onboarding** | Signs up, logs 2 weeks of use, links to Dr. A | Accepts link, reviews empty baseline | Patient card appears with "insufficient data" message |
| **First Visit Prep** | Logs 4 weeks, generates summary pre-visit | Opens card, sees trends + RAG summary | Summary cites LRCUG, flags high dose |
| **Care Plan Update** | Reviews plan, confirms new dose | Reduces THC, adds sleep hygiene note | Patient app shows updated regimen + reminders |
| **Adverse Event** | Logs "chest pain", triggers crisis template | Receives alert, calls patient | Alert shows "cardiovascular symptoms" protocol |
| **Consent Revocation** | Revokes access to free-text notes | Loses note access, retains scores | Dashboard updates instantly, audit logged |

**Tasks:**
- Write integration test suite (Playwright or Cypress)
- Recruit 5 pilot patients + 2 clinicians (internal or friendly practice)
- Conduct 2-week pilot with weekly feedback sessions
- Measure: time to complete summary, clinician satisfaction (SUS score), data accuracy

**Resources:**
- [20] Digital therapeutic validation: https://www.sciencedirect.com/science/article/abs/pii/S0149291825004126
- [21] Cannabis clinic workflows: https://www.jmir.org/2025/1/e65025

**Deliverables:**
- Test plan document
- Pilot feedback report
- Bug fixes and UX refinements

---

### 4.2 Clinical Validation & Guideline Alignment

**Goal:** Ensure RAG outputs match clinical evidence and are acceptable to physicians.

**Validation Process:**
1. **Guideline Audit:** Clinical advisor reviews 50 randomly sampled RAG responses against source guidelines (Bell et al., LRCUG, RACGP)
   - Metrics: citation accuracy, dosing correctness, contraindication recall
   - Target: >95% factual accuracy, 0% harmful recommendations

2. **Safety Review:** Test crisis interceptor with 100 high-risk inputs (chest pain, suicidal ideation, severe panic)
   - Metrics: sensitivity (catches all emergencies), specificity (minimal false alarms)
   - Target: 100% sensitivity, >90% specificity

3. **Clinician Feedback:** Survey pilot clinicians on:
   - Usefulness of pre-visit summaries (Likert 1-5)
   - Trust in guideline citations (Likert 1-5)
   - Time saved per patient visit (minutes)
   - Suggestions for additional features

**Tasks:**
- Conduct guideline alignment audit
- Run safety stress tests
- Administer clinician survey
- Document findings in clinical validation report

**Resources:**
- [22] Cannabis guideline implementation: https://pmc.ncbi.nlm.nih.gov/articles/PMC10998028/
- [23] AI safety in healthcare: https://pmc.ncbi.nlm.nih.gov/articles/PMC12455834/

**Deliverables:**
- Clinical validation report
- Safety test results
- Updated knowledge base (if errors found)

---

## Workflow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                      PATIENT WORKFLOW                             │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  1. Sign Up     │
                    │  (Email/SSO)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  2. Log Daily   │
                    │  Use + Symptoms │
                    │  (Local Storage)│
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  3. Generate    │
                    │  One-Time Code  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  4. Share Code  │
                    │  with Clinician │
                    └────────┬────────┘
                             │
                ┌────────────┴─────────────┐
                │  Clinician enters code   │
                │  Request appears         │
                └────────────┬─────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  5. Grant       │
                    │  Consent        │
                    │  (Select Scope) │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  6. Pre-Visit   │
                    │  Auto-Generate  │
                    │  Summary (Edge  │
                    │  AI + RAG)      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  7. Review &    │
                    │  Approve        │
                    │  Summary        │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  8. Encrypt &   │
                    │  Sync to        │
                    │  Clinician      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  9. Receive     │
                    │  Updated Care   │
                    │  Plan           │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ 10. Continue    │
                    │  Logging        │
                    │  (Loop to #2)   │
                    └─────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    CLINICIAN WORKFLOW                             │
└──────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │  1. Sign Up     │
                    │  (Verify Prof.  │
                    │   Credentials)  │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  2. Enter       │
                    │  Patient Code   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  3. Wait for    │
                    │  Patient        │
                    │  Consent        │
                    └────────┬────────┘
                             │
                ┌────────────┴─────────────┐
                │  Patient grants access   │
                └────────────┬─────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  4. View        │
                    │  Patient Card   │
                    │  (Dashboard)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  5. Review      │
                    │  Pre-Visit      │
                    │  Summary + RAG  │
                    │  Citations      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  6. Analyze     │
                    │  Trends         │
                    │  (Timeline,     │
                    │   Adverse       │
                    │   Events)       │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  7. Adjust      │
                    │  Care Plan      │
                    │  (Dose, Product,│
                    │   Frequency)    │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  8. Save &      │
                    │  Sync Plan to   │
                    │  Patient        │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  9. Schedule    │
                    │  Follow-Up      │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │ 10. Continue    │
                    │  Monitoring     │
                    │  (Loop to #4)   │
                    └─────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    EDGE AI PIPELINE                               │
└──────────────────────────────────────────────────────────────────┘

  Patient Device                      Sync Server            Clinician Device
  ──────────────                      ───────────            ────────────────
        │                                  │                         │
        │ 1. Journal Entries               │                         │
        │    (Local IndexedDB)             │                         │
        │                                  │                         │
        ▼                                  │                         │
  ┌──────────────┐                        │                         │
  │ Feature Eng. │                        │                         │
  │ (Dose, Trend,│                        │                         │
  │  Risk Flags) │                        │                         │
  └──────┬───────┘                        │                         │
         │                                 │                         │
         ▼                                 │                         │
  ┌──────────────┐                        │                         │
  │ RAG Retrieval│                        │                         │
  │ (Guidelines) │                        │                         │
  └──────┬───────┘                        │                         │
         │                                 │                         │
         ▼                                 │                         │
  ┌──────────────┐                        │                         │
  │ Gemma/MedGem │                        │                         │
  │ Summary Gen. │                        │                         │
  └──────┬───────┘                        │                         │
         │                                 │                         │
         │ 2. Encrypt Summary              │                         │
         ▼                                 │                         │
  ┌──────────────┐                        │                         │
  │ E2E Encrypt  │                        │                         │
  │ (Clinician   │                        │                         │
  │  Public Key) │                        │                         │
  └──────┬───────┘                        │                         │
         │                                 │                         │
         │ 3. POST /sync/upload            │                         │
         ├────────────────────────────────►│                         │
         │                                 │                         │
         │                                 │ 4. Store Encrypted Blob │
         │                                 │    (No PHI Access)      │
         │                                 │                         │
         │                                 │ 5. GET /sync/fetch      │
         │                                 │◄────────────────────────┤
         │                                 │                         │
         │                                 │ 6. Return Encrypted     │
         │                                 ├────────────────────────►│
         │                                 │                         │
         │                                 │                         ▼
         │                                 │                   ┌──────────────┐
         │                                 │                   │ Decrypt      │
         │                                 │                   │ (Private Key)│
         │                                 │                   └──────┬───────┘
         │                                 │                          │
         │                                 │                          ▼
         │                                 │                   ┌──────────────┐
         │                                 │                   │ Render       │
         │                                 │                   │ Dashboard    │
         │                                 │                   └──────────────┘
         │                                 │                          │
         │ 7. POST /care-plan              │                          │
         │◄────────────────────────────────┼──────────────────────────┤
         │                                 │                          │
         ▼                                 │                          │
  ┌──────────────┐                        │                          │
  │ Decrypt &    │                        │                          │
  │ Display Plan │                        │                          │
  │ in Patient   │                        │                          │
  │ App          │                        │                          │
  └──────────────┘                        │                          │
```

---

## Technology Stack

### Patient App (Existing + Enhancements)
- **Frontend:** React 18, TypeScript, Vite
- **State:** Zustand or Jotai (lightweight)
- **Storage:** IndexedDB (Dexie.js), localStorage fallback
- **Edge AI:** WebLLM (MLC-LLM), Gemma-2B quantized
- **Crypto:** libsodium.js (NaCl box encryption)
- **Charts:** Recharts or Plotly.js
- **Auth:** Local PBKDF2 + JWT (Phase 1), OpenID Connect (Phase 3)

### Clinician Dashboard (New)
- **Frontend:** React 18, TypeScript, Next.js (SSR for faster loads)
- **UI Library:** Chakra UI or shadcn/ui (Tailwind-based)
- **Charts:** Recharts, D3.js timeline
- **Auth:** NextAuth.js (OAuth2/OIDC support)
- **API Client:** tRPC or GraphQL (type-safe)

### Sync Server (Minimal Backend)
- **Runtime:** Node.js 20 + Express or Fastify
- **Database:** PostgreSQL (encrypted blobs + metadata) or Firebase (easier MVP)
- **Hosting:** Vercel Edge Functions, Railway, or on-prem Docker
- **Auth:** JWT validation, public key registry
- **Monitoring:** Sentry (errors), PostHog (analytics, privacy-friendly)

### RAG Knowledge Base
- **Format:** JSON (embedded in patient app bundle)
- **Sources:** Bell et al. 2024, LRCUG, RACGP, NCSCT
- **Embeddings:** Pre-computed offline (EmbeddingGemma or MedSigLIP)
- **Retrieval:** Cosine similarity in-browser (simple linear scan for <1000 chunks)

---

## Privacy & Security Architecture

### Core Principles
1. **Data Sovereignty:** Patient owns and controls all raw journal data
2. **Minimal Centralization:** Sync server stores only encrypted, consented summaries
3. **Zero-Knowledge:** Server cannot decrypt PHI; only patient and linked clinicians can
4. **Auditability:** All access logged and visible to patient
5. **Revocability:** Patient can instantly revoke clinician access

### Encryption Flow
```
Patient Device                     Sync Server             Clinician Device
──────────────                     ───────────             ────────────────
  Private Key (P_priv)              (No Keys)              Private Key (C_priv)
  Public Key (P_pub)                                       Public Key (C_pub)
        │                                                         │
        │ 1. During Linking: Exchange Public Keys                │
        ├────────────────────────────────────────────────────────┤
        │                                                         │
        │ 2. Encrypt Summary with C_pub                          │
        │    ciphertext = NaCl.box(summary, C_pub, P_priv)      │
        │                                                         │
        │ 3. Upload                                               │
        ├─────────────────────► Store(ciphertext) ──────────────►│
        │                                                         │
        │                                                         │ 4. Decrypt
        │                                                         │ plaintext = NaCl.box_open(
        │                                                         │   ciphertext, P_pub, C_priv)
```

### Compliance Considerations
- **HIPAA:** Encryption at rest/transit, audit logs, access controls, BAA with hosting provider if US-based
- **GDPR:** Right to access, rectification, erasure (patient-controlled), data portability (JSON export)
- **Local Regulations:** Consult legal team for EU, Canada (PIPEDA), Australia (Privacy Act)

---

## Key Performance Indicators (KPIs)

### Technical Metrics
- **Edge AI Latency:** Summary generation <5 seconds on M1-class hardware
- **Sync Speed:** Encrypted upload/download <2 seconds on broadband
- **Offline Capability:** 100% patient app functionality offline after initial load
- **Data Security:** Zero plaintext PHI on sync server (verified by audit)

### Clinical Metrics
- **Time Savings:** Clinicians spend 30% less time on cannabis-related prep (baseline: ~15 min/patient)
- **Adherence:** Patients following care plan improve from ~60% to >75% (measured by dose logs)
- **Adverse Event Detection:** >95% of serious events (chest pain, ER visits) flagged in summary
- **Clinician Satisfaction:** SUS score >80 (industry standard for good usability)

### Adoption Metrics
- **Pilot Retention:** >80% of pilot patients complete 8-week trial
- **Clinician Onboarding:** <10 minutes to first patient card view
- **Patient Linking:** >90% success rate on first attempt (code entry)

---

## Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| **Edge AI model hallucination** | High (clinical harm) | 1) Deterministic safety interceptor for crises; 2) RAG-forced citations; 3) Clinical validation audit |
| **Encryption key loss** | High (data inaccessible) | 1) Key backup flow with recovery codes; 2) Patient education on key management; 3) Optional cloud key escrow (with patient consent) |
| **Sync server downtime** | Medium (no new summaries) | 1) Offline summary generation + queue; 2) Multi-region hosting; 3) Graceful degradation (patient can export PDF) |
| **Clinician adoption resistance** | Medium (low usage) | 1) Involve clinicians in design; 2) Emphasize time savings; 3) Provide training videos; 4) Pilot with champions |
| **Regulatory non-compliance** | High (legal/financial) | 1) Legal review before launch; 2) HIPAA-compliant hosting (AWS/GCP with BAA); 3) Regular security audits; 4) Privacy impact assessment |
| **Patient privacy breach** | Critical | 1) Penetration testing; 2) Bug bounty; 3) Incident response plan; 4) Insurance (cyber liability) |

---

## Resource Requirements

### Team
- **Frontend Developer (2):** React dashboard + patient app enhancements
- **Backend Developer (1):** Sync server, auth, API
- **ML/AI Engineer (1):** Edge AI pipeline, RAG optimization, model fine-tuning
- **Clinical Advisor (0.5 FTE):** Guideline review, validation, user stories
- **Security/Privacy Engineer (0.5 FTE):** Encryption, audit, compliance

### Infrastructure
- **Hosting:** $200/month (Vercel Pro + Railway Postgres + CDN)
- **Models:** Free (Gemma-2B open weights)
- **Monitoring:** $50/month (Sentry + PostHog)
- **Total Monthly:** ~$250

### Budget (4-Month MVP)
- **Personnel:** $120k (assuming $30k avg/month for 4 FTE)
- **Infrastructure:** $1k
- **Legal/Compliance:** $10k (one-time HIPAA review)
- **Pilot Incentives:** $2k (gift cards for participants)
- **Total:** ~$133k

---

## Success Criteria (End of Phase 4)

- [ ] 5 pilot patients + 2 clinicians complete 4-week trial
- [ ] Clinical validation: >95% RAG citation accuracy, 0 harmful recommendations
- [ ] Security audit: No critical vulnerabilities, encryption verified
- [ ] Usability: SUS score >75 for both patient and clinician interfaces
- [ ] Performance: Summary generation <5s, sync <2s
- [ ] Privacy: Audit log confirms zero plaintext PHI on server
- [ ] Compliance: Legal sign-off on HIPAA alignment (US) or GDPR (EU)

---

## Next Steps (Post-MVP)

1. **Multi-Clinic Rollout:** Integrate with 3-5 clinics, 50+ patients
2. **EHR Integration:** FHIR API for importing diagnoses, exporting summaries
3. **Advanced Analytics:** Cohort-level insights (de-identified), outcome prediction models
4. **Mobile Native Apps:** iOS/Android with on-device Core ML/TensorFlow Lite
5. **Regulatory Approval:** FDA Digital Therapeutic classification (if pursuing)
6. **Reimbursement:** Explore CPT code for "digital cannabis monitoring" (US) or similar

---

## References & Resources

**Clinical Guidelines & Evidence:**
1. Bell, E. et al. (2024). Clinical Practice Guidelines for Cannabis and Cannabinoid-Based Medicines. PMC10998028. https://pmc.ncbi.nlm.nih.gov/articles/PMC10998028/
2. Fischer, B. et al. (2017). Lower-Risk Cannabis Use Guidelines (LRCUG). PMC5508136. https://pmc.ncbi.nlm.nih.gov/articles/PMC5508136/
3. RACGP. (2022). Medicinal cannabis for the treatment of anxiety disorders. https://www1.racgp.org.au/ajgp/2022/august/medicinal-cannabis
4. UK Medical Cannabis Registry. (2024). Clinical outcome measures. PMC11303852. https://pmc.ncbi.nlm.nih.gov/articles/PMC11303852/
5. Bell, A. et al. (2024). Patient-reported outcomes tracking in medical marijuana. PMC7592869. https://pmc.ncbi.nlm.nih.gov/articles/PMC7592869/

**Technical Resources:**
6. WebLLM Documentation. https://github.com/mlc-ai/web-llm
7. MedGemma Quick Start. https://developers.google.com/health-ai-developer-foundations/medgemma/get-started
8. RAG for Healthcare (Hatchworks). https://hatchworks.com/blog/gen-ai/rag-for-healthcare/
9. Edge AI Security & Privacy. https://edge-ai-tech.eu/edge-ai-security-privacy-protecting-data-where-it-matters-most/
10. Securing Edge AI in Healthcare (IEEE). https://ieeexplore.ieee.org/document/10987328/

**Privacy & Compliance:**
11. FHIR Security Guide. https://www.hl7.org/fhir/security.html
12. SMART on FHIR. https://www.hl7.org/fhir/smart-app-launch/
13. Privacy-Preserving Healthcare Monitoring. https://www.sciencedirect.com/science/article/abs/pii/S0167404823003747
14. HIPAA Compliance for AI. https://caylent.com/blog/accelerating-clinical-imaging-intelligence-with-hipaa-compliant-ai-solutions

**UX & Design:**
15. Medical Dashboard Design (Nielsen Norman Group). https://www.nngroup.com/articles/medical-dashboard-design/
16. Shared Decision-Making UI Patterns. https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0336598
17. eHealth Cannabis Interventions (JMIR). https://www.jmir.org/2025/1/e65025

**Standards & Validation:**
18. Digital Therapeutic Validation (Smart Cannabis). https://www.sciencedirect.com/science/article/abs/pii/S0149291825004126
19. AI Safety in Healthcare. https://pmc.ncbi.nlm.nih.gov/articles/PMC12455834/
20. Cannabis Use Disorder Risk Units. https://www.healthline.com/health-news/should-cannabis-have-standard-units-like-alcohol

---

## Document Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | Feb 2026 | Implementation Team | Initial plan |

---

**End of Implementation Plan**