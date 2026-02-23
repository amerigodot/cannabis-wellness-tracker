# 🏆 MedGemma Impact Challenge: Edge AI Architecture & QMS

**Project Name:** Cannabis Wellness Tracker (MedGemma-Edge Edition)  
**Track:** Main Track + Edge AI Prize  
**Model:** Gemma-2-2B (Quantized `q4f16_1` via WebLLM)  
**Live Demo:** [cannabis-wellness-tracker.lovable.app](https://cannabis-wellness-tracker.lovable.app)

---

## 1. Problem Importance & Real-World Impact

Medical cannabis now sits on an evidence base of tens of thousands of PubMed‑indexed studies, yet clinical workflows and tooling have not kept pace, leaving many clinicians without practical ways to apply that evidence at the point of care. Surveys consistently show that most clinicians receive little or no formal training in cannabinoid medicine, report low confidence in dosing and product selection, and identify stigma and legal uncertainty as major barriers to discussing cannabis with patients. 

In that vacuum, patients using cannabis for anxiety, chronic pain, and sleep often self‑experiment with high‑THC products guided by peers rather than evidence‑based protocols—increasing risks for panic, tachycardia, and cannabis use disorder.

The **Cannabis Wellness Tracker (MedGemma‑Edge Edition)** addresses this gap by reframing cannabis care as a longitudinal, **shared decision‑support problem**. The system turns detailed patient logs into trend visualizations and effectiveness scores, supporting gradual dose reductions and guideline-concordant use. By providing immediate feedback on dose drift and adverse-effect patterns, the system reduces avoidable emergency presentations and empowers both patient and provider with evidence-based insights.

---

## 2. Technical Stack & AI QMS Governance

We have engineered a high-performance, local-first stack governed by an **AI Quality Management System (AI QMS)**. This ensures that the high-risk nature of clinical decision support is mitigated through structured processes and technical controls.

| Layer | Component | QMS / Regulatory Role (EU AI Act) |
| :--- | :--- | :--- |
| **Inference** | **WebLLM (MLC)** | `Gemma-2-2b-it-q4f16_1` runs locally via WebGPU, ensuring **Zero-Knowledge** privacy and Art. 15 Cybersecurity compliance. |
| **Governance** | **AI QMS Scaffold** | `AI_QMS.md` defines the design, validation, and monitoring processes for high-risk AI (Art. 9). |
| **Safety** | **Deterministic Interceptor** | regex/keyword filter that bypasses the LLM for immediate crisis triage (e.g., chest pain, suicide), ensuring Art. 9 safety reliability. |
| **Retrieval** | **Local RAG** | Grounds AI reasoning in a JSON knowledge base (Bell et al., RACGP), satisfying Art. 13 Transparency. |
| **Data Eng.** | **Local Feature Engine** | Keeps math and risk scoring outside the model; abstraction of PHI into clinical metrics before LLM ingestion (Art. 10 Data Governance). |
| **Audit** | **Traceability Log** | Immutable local logging of inference events and safety overrides (Art. 12 Traceability). |
| **Human Loop** | **Clinician Portal** | Mandates human review and "Save & Sync" approval for all AI-generated care plan changes (Art. 14 Human Oversight). |

---

## 3. The Edge AI Pipeline: Lifecycle Management

Our pipeline transforms noisy, subjective patient logs into structured clinical intelligence while strictly adhering to MedGemma’s **HAI‑DEF** philosophy: models should live inside controlled pipelines and never hold the last word on life‑critical choices.

### Stage 1: Deterministic Abstraction (Data Governance)
A central design choice is to keep math and risk scoring outside the model. Before any LLM call, a local feature engine converts journal data into clinically meaningful metrics—dose drift, adherence rate, and symptom slopes. The model then reasons over an **abstracted "patient card"** rather than raw PHI, minimizing data exposure and improving reasoning reliability for a small 2B model.

### Stage 2: System Persona & RAG (Transparency)
Rather than a generic chatbot, we lock the model into a clinical decision support persona. The system prompt defines it as a CDS Agent governed by specific guidelines (Bell et al., LRCUG). Retrieval-augmented generation is performed entirely client-side, injecting `[SOURCE: ...]` blocks that the model *must* quote, ensuring every recommendation is traceable to medical literature.

### Stage 3: Zero-Knowledge Privacy (Security)
Patient journal entries are stored as ciphertext in Supabase using **RSA-4096 asymmetric E2EE**. The private key is wrapped under the patient’s passphrase and never leaves their device. Clinical reasoning over this sensitive information runs entirely on the client via WebLLM/WebGPU. When sharing with clinicians, only aggregated summaries are encrypted for transmission, preserving the privacy of the underlying narrative.

---

## 4. Regulatory Maturity & AI Act Alignment

This project is engineered as a model of **"maximal privacy within high‑risk AI constraints."** 

1.  **AI QMS Integration:** Our formally documented **[AI Quality Management System](./AI_QMS.md)** governs the entire lifecycle, from pre-deployment bias detection to continuous RLHF monitoring.
2.  **Traceability (Art. 12):** The system maintains an immutable local audit log, exportable by the user, providing a complete trail of AI decision pathways.
3.  **Transparency (Art. 13):** The `AiTransparencyBadge` provides clear disclosures on model limitations and local execution.
4.  **Human Oversight (Art. 14):** Clinicians retain ultimate control via the Care Plan Editor, with the AI functioning as a multi-choice operator assistant.

---
*Submitted by Amerigo Di Maria & Team for the Kaggle MedGemma Impact Challenge.*
