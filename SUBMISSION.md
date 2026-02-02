# 🏆 MedGemma Impact Challenge: Submission Documentation

**Project Name:** Cannabis Wellness Tracker (MedGemma-Edge Edition)  
**Track:** Main Track + Edge AI Prize  
**Model:** Gemma-2B (Quantized via WebLLM)  
**Live Demo:** [cannabis-wellness-tracker.lovable.app](https://cannabis-wellness-tracker.lovable.app)

---

## 1. Executive Summary
This project redefines **Medical AI Privacy** by moving the entire clinical decision support pipeline to the **Edge**. We leverage **Google's Gemma-2B** model running directly in the browser via WebGPU to provide HIPAA-compliant harm reduction coaching and clinician-ready summaries without a single byte of patient data leaving the device.

**Key Innovations:**
*   **Zero-Knowledge Architecture:** Combining `localStorage` for records and `WebLLM` for inference means we achieve 100% data sovereignty.
*   **Clinician-Patient Shared Dashboard:** A dual-interface platform where patients can securely link their data to healthcare providers using one-time codes and granular consent scopes.
*   **Clinical RAG on the Edge:** We embedded a structured JSON knowledge base of 2025 Clinical Guidelines (ACOEM, NCSCT, Bell et al. 2024) that the local model queries in real-time to ground its advice.
*   **Safety Interceptor:** A deterministic state machine intercepts high-risk inputs (e.g., "chest pain", "suicide") *before* they reach the LLM, ensuring absolute safety compliance.

---

## 2. Edge AI Implementation (Edge AI Prize)

We optimized the application for consumer hardware to democratize access to medical AI.

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Inference Engine** | **WebLLM (MLC-LLM)** | Runs `Gemma-2b-it-q4f32_1` in the browser using WebGPU/WASM. |
| **Storage** | **IndexedDB / LocalStorage** | Stores patient journal logs locally. No cloud DB required. |
| **Retrieval (RAG)** | **Client-Side Vector/Keyword** | Matches user queries against embedded `ClinicalFactsheets` JSON. |
| **Clinical Summarization** | **Local Gemma-2B** | Converts raw patient logs into structured pre-visit summaries for clinicians. |
| **Orchestration** | **React + Vite** | Manages the "Virtual Fine-Tuning" context injection. |

**Feasibility:**
*   **Download Size:** ~1.5GB (One-time cached).
*   **Inference Speed:** ~15-20 tokens/sec on M1 MacBook Air (Integrated GPU).
*   **Offline Capable:** Fully functional in Airplane Mode after initial load.

---

## 3. Novel Task: Clinical Harm Reduction

We defined a new medical task: **"Hyper-Personalized Cannabis Harm Reduction"**.
Generic LLMs often give vague advice. Our system is engineered to be:

1.  **Protocol-Driven:** It doesn't just "chat"; it enforces the **Lower Risk Cannabis Use Guidelines (LRCUG)**.
    *   *User:* "I want to get super high."
    *   *MedGemma-Edge:* "Based on the Harm Reduction Protocol, high doses increase risk of tachycardia. Start low (2.5mg)."
2.  **Data-Augmented:** We pre-process raw user logs into a "Clinical Narrative" (e.g., calculating "Adverse Event Rate: 20%") *before* feeding it to the LLM. This allows the small 2B model to "reason" about complex trends it couldn't calculate on its own.

---

## 4. Reviewer Instructions (Verification)

**Step 1: Activate Offline Mode**
1.  Open the app.
2.  On the Login screen, click the green **"Enter Submission Mode (Offline)"** button.
3.  *Optional:* Disconnect your internet connection (after step 2).

**Step 2: Test the Edge AI Coach**
1.  Navigate to **"Private AI Coach"**.
2.  Click **"Load Assistant"** (Wait for Gemma-2B to initialize via WebGPU).
3.  **Test RAG:** Ask *"What is the dosing protocol for anxiety?"* -> Observe it citing the `RACGP` guideline from `ClinicalFactsheets`.
4.  **Test Safety:** Type *"I have chest pain."* -> Observe the immediate "MEDICAL ALERT" interception (Red Box).

**Step 3: Clinical Triage**
1.  Navigate to **"Clinical Triage"**.
2.  Enter symptoms (e.g., "Severe anxiety, duration 2 weeks").
3.  Click "Generate Treatment Plans".
4.  Observe the AI generating a structured JSON response with "Conservative", "Balanced", and "Advanced" options based on the ESI protocol.

**Step 4: Wellness Tools (Local Analysis)**
1.  Navigate to **"Tools"**.
2.  Click **"Comprehensive Wellness Report"**.
3.  Observe the AI analyzing your local journal entries (even if just samples) and generating a Markdown report instantly, without any server calls.

**Step 5: Clinician Portal & Patient Linking**
1.  Navigate to **"Settings"**.
2.  Find the **"Clinical Portal"** card (Highlighted in Green/Blue).
3.  **Patient Flow:** Click **"Generate Linking Code"** -> Observe the secure 6-digit code.
4.  **Clinician Flow:** Switch to **"Professional Access"** tab -> Enter the code (or use 000000 in Demo Mode) -> Observe the link success.
5.  Click **"Go to Dashboard"** (Clinician only) to view the medical timeline and Edge AI summaries for the linked patient.

**Step 6: View Clinical Basis**
1.  Navigate to **"Tools"** -> **"Clinical Factsheets"**.
2.  Review the embedded 2025 ACOEM/NCSCT guidelines that power the RAG system.

---

## 5. Clinical Evidence Basis
The system is anchored in the following embedded guidelines (visible in `src/data/knowledgeBase.ts`):
*   **ACOEM 2025:** Guidance for the Medical Use of Cannabis (Chronic Pain protocols).
*   **Bell et al. 2024:** Clinical Practice Guidelines for Cannabis-Based Medicines (NRS/GAD-7 integration).
*   **UK Medical Cannabis Registry:** Standardized outcome measures for real-world evidence.
*   **NCSCT 2025:** Harm Reduction briefing (Respiratory risks).
*   **LRCUG:** Lower Risk Cannabis Use Guidelines (Dosing/Safety).
*   **RACGP:** Prescribing medical cannabis in general practice (Anxiety contraindications).

---
*Submitted by Amerigo Di Maria & Team for the Kaggle MedGemma Impact Challenge.*
