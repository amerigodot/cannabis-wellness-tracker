# AI Quality Management System (AI QMS)

**System Name:** Cannabis Wellness Tracker (MedGemma-Edge Edition)  
**Risk Classification:** High-Risk AI System (per EU AI Act Annex III - Healthcare/Medical Device software)  
**Version:** 1.0.0  
**Date:** February 2026  

## 1. Executive Summary
This AI Quality Management System (QMS) outlines the structured processes, controls, and technical scaffolds implemented to ensure the MedGemma-Edge AI system remains safe, effective, transparent, and compliant with the **EU AI Act**, **EHDS (European Health Data Space)**, and **GDPR** over its entire lifecycle. 

By leveraging an on-device, Asymmetric E2EE (RSA-4096) architecture with a zero-knowledge AI pipeline, this system exemplifies **"maximal privacy within high-risk AI constraints,"** making it an attractive model for regulators, clinicians, and health-tech grant committees.

---

## 2. EU AI Act Article Mapping & Compliance Strategy

### 2.1 Risk Management System (Article 9)
*   **Process:** Continuous iterative process for identifying and mitigating risks associated with the Gemma-2B model's medical reasoning.
*   **Mitigation Strategy:** 
    *   **Deterministic Safety Interceptor:** Rule-based pre-processing (regex/keyword matching for "chest pain", "suicide") intercepts emergency queries *before* LLM inference, ensuring absolute compliance with crisis protocols.
    *   **Fallback Protocols:** If WebGPU fails or memory limits are exceeded, the system gracefully degrades to standard, non-AI tracking features.
*   **Documentation:** Routine hazard analysis reports stored in `/docs/risk_assessments/`.

### 2.2 Data Governance & Provenance (Article 10)
*   **GDPR/EHDS Alignment:** Strict data minimization and encrypted cloud storage with client-side keys. Raw Protected Health Information (PHI) never leaves the user's browser in an unencrypted state.
*   **Consent Management:** Granular, user-controlled consent scopes (e.g., sharing symptom scores vs. private notes) managed via the `clinician_patient_links` E2EE protocol.
*   **Data Lineage:** The system explicitly tags the source of all clinical insights. Training data for the base Gemma model is documented by Google; fine-tuning is handled purely via runtime **In-Context Learning (ICL)** to prevent model drift and contamination.

### 2.3 Technical Documentation & Traceability (Article 11 & 12)
*   **Audit Trails:** Every AI inference event, including a hash of the prompt injected, the clinical metrics calculated, and the model's output, is logged with an immutable timestamp.
*   **Model Versioning:** The exact model hash (`gemma-2-2b-it-q4f16_1-MLC`) and configuration are hardcoded and validated via the `validateWeightIntegrity` checksum process before execution.
*   **Log Storage:** In alignment with E2EE, inference logs are stored locally in the user's browser storage or encrypted before syncing to the cloud, allowing for patient-controlled auditing.

### 2.4 Transparency and Information to Users (Article 13 & 50)
*   **Disclosure:** The UI prominently displays an **AI Transparency Badge** and explicit warnings that the system is an AI assistant, not a substitute for professional medical advice.
*   **Explainability:** Responses are strictly grounded using Local RAG against peer-reviewed guidelines (e.g., Bell et al. 2024, LRCUG). Citations are explicitly displayed in the UI so clinicians and patients understand *why* a recommendation was made.

### 2.5 Human Oversight (Article 14)
*   **Human-in-the-Loop (HITL):** The system operates solely as **Clinical Decision Support (CDS)**. 
*   **Clinician Portal:** AI-generated SOAP notes and Care Plan recommendations *must* be reviewed, modified, and explicitly approved ("Save & Sync") by a verified human clinician before affecting the patient's regimen.
*   **Override Protocols:** Clinicians have full authority to dismiss AI summaries or manually override dose calculations. The UI enforces "Unsaved Changes" warnings to ensure intentional actions.

### 2.6 Accuracy, Robustness, and Cybersecurity (Article 15)
*   **Cybersecurity:** RSA-4096 asymmetric key pairs and AES-256-GCM symmetric hybrid encryption ensure data at rest and in transit is mathematically secure against unauthorized access.
*   **Robustness:** Client-side execution (WebGPU) eliminates network latency, server-side downtime risks, and man-in-the-middle attacks.

---

## 3. QMS Processes & Controls

### 3.1 Model Validation & Pre-Deployment Testing
*   **Bias Detection:** Standardized test suites evaluating responses across diverse demographic profiles and medical histories.
*   **Clinical Grounding Tests:** Automated assertion checks ensuring the LLM does not recommend doses exceeding the LRCUG maximums or contradict RACGP protocols.

### 3.2 Continuous Monitoring (Post-Market Surveillance)
*   **Feedback Loops:** Integrated RLHF (Reinforcement Learning from Human Feedback) UI where users rate AI helpfulness (Thumbs Up/Down).
*   **Adverse Event Reporting:** Automated flagging of high adverse event rates calculated by the local deterministic feature engine, triggering manual clinical review workflows.

### 3.3 Data Subject Rights
*   **Right to Erasure (RTBF):** Patients can instantly delete their encrypted records and revoke clinician access keys, destroying the data pipeline permanently.
*   **Data Portability:** FHIR-ready JSON export functionality of the decrypted local journal.

---

## 4. Implementation Scaffold

The technical scaffold enforcing this QMS is embedded directly into the application architecture:
1.  **Integrity Validation:** `src/utils/aiWeightManager.ts` (Art. 15).
2.  **Privacy Core:** `src/hooks/useE2EE.ts` (Art. 15, GDPR).
3.  **UI Transparency:** `src/components/clinical/AiTransparencyBadge.tsx` (Art. 13).
4.  **Traceability & Safety:** `src/components/EdgeWellnessCoach.tsx` (Art. 9, Art. 12).
5.  **Human Oversight:** `src/pages/ClinicianDashboard.tsx` (Art. 14).