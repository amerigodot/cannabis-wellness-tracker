# Cannabis Wellness Tracker

<div align="center">
  <img src="public/favicon.ico" alt="Cannabis Wellness Tracker Logo" width="120" height="120" />
  <h3>Track Your Wellness Journey, Optimize Your Experience</h3>
  <p>
    A private, intelligent journal to track medical, recreational, and wellness cannabis use. 
    Monitor effects, discover patterns, and leverage AI-powered insights to find what works best for you.
  </p>
  <a href="https://cannabis-wellness-tracker.lovable.app">View Live Demo</a>
</div>

---

## 🚨 JUDGES START HERE: [Review MedGemma Challenge Implementation](#-medgemma-impact-challenge-submission-edge-ai-track)
**Video Demo Script:** [View Script](./VIDEO_SCRIPT.md)

---

## 🏆 MedGemma Impact Challenge Submission: EDGE AI TRACK

This submission is specialized for the **Edge AI Prize ($5,000)** and the **Main Track ($75,000)**. 

### 🧠 The Case for Edge AI in Medical Cannabis
Medical cannabis patients handle extremely sensitive health and substance-use data. Privacy is not just a feature; it is a clinical requirement for honest journaling and effective shared decision-making. Our platform demonstrates that complex medical reasoning can be decentralized, preserving patient dignity while enabling professional oversight.

### 🛡️ Data Architecture & Privacy (Zero-Knowledge)
Patient journal entries are stored in an **end‑to‑end encrypted** Supabase database using asymmetric key pairs (**RSA-4096**), with the patient’s private key encrypted under their passphrase and **never leaving their device**. 

Medical guideline knowledge bases and the **Gemma‑2B** model run entirely client‑side via WebLLM/WebGPU, so day‑to‑day clinical decision support (CDS) queries **never expose raw health data** to a central server. When patients choose to share with clinicians, only aggregated summaries (e.g., trends in dose, symptom response, adherence, and adverse events) are generated on‑device and encrypted before transmission, preserving privacy while still enabling evidence‑based conversations and potential future interoperability via **FHIR exports**.

### 🏗️ Technical Implementation
1.  **Inference Engine:** Powered by `@mlc-ai/web-llm` utilizing the `gemma-2-2b-it-q4f16_1-MLC` quantized model.
2.  **Cryptography:** Native **Web Crypto API** orchestration for zero-knowledge RSA-4096 key management and AES-256-GCM data encryption.
3.  **Instruction Tuning (Simulated):** We implement **In-Context Learning (ICL)** via a rigorous System Persona and Clinical Metric injection. This forces the general-purpose Gemma model to adopt a strict "Clinical Decision Support" role.
4.  **Deterministic Feature Engineering:** Raw user logs are pre-processed into high-signal clinical metrics (e.g., "Dose Drift", "Adherence Velocity") *before* LLM inference, significantly improving reasoning reliability.
5.  **Hardware Feasibility:** Optimized for consumer-grade hardware (M1/M2/M3 Macs, NVIDIA RTX, Intel Iris Xe) utilizing WebGPU for near-zero latency.

### 🎯 Task Goals & Success Metrics
1.  **Harm Reduction:** 100% interception of emergency keywords via rule-based layers before the LLM.
2.  **Automated Documentation:** Reduce clinician chart review time by 30% via AI-generated SOAP notes.
3.  **Accuracy:** Maintain a >90% factual grounding rate against the embedded guideline knowledge base.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   WebGPU-capable browser (Chrome 113+, Edge 113+)

### Installation

1.  **Clone and Install:**
    ```bash
    git clone <repository-url>
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:8080`.

### 📝 MedGemma Reviewer Mode (Edge AI Demo)
To facilitate testing without any backend setup:
1.  Launch the app.
2.  On the Authentication page, click the green **"Enter Submission Mode (Offline)"** button.
3.  Navigate to **"Private AI Coach"** to initialize the Gemma-2-2B engine.
4.  Navigate to **"Settings"** -> **"Clinical Portal"** to test the Clinician-Patient linking flow (use code `000000` in demo).

---

## ✨ Key Features

### 🤖 Edge AI Clinical Tools
1.  **Private AI Coach:** Multi-modal analysis of effectiveness patterns grounded in clinical guidelines, running 100% on-device.
2.  **Clinician Portal:** Secure dashboard featuring multi-axis trend visualization and automated Edge AI clinical summaries.
3.  **Security Vault:** Zero-knowledge key management system for initializing and unlocking RSA-4096 encryption.
4.  **Clinical Triage System:** protocol-driven risk stratification for respiratory and inflammatory symptoms.

### 📓 Advanced Journaling
*   **Encrypted Health Logs:** Native integration of E2EE for all sensitive fields (strain, dosage, notes).
*   **Validated Scales:** Clinical-grade tracking using NRS (Pain) and GAD-7 (Anxiety) metrics.
*   **Timeline Analytics:** Adaptive visualizations showing symptom trajectory and dose-response correlation.

## 🔒 Security & Privacy
-   **Zero-Knowledge:** PHI is encrypted before it leaves the browser. We have no access to your data or keys.
-   **Asymmetric E2EE:** Industry-standard **RSA-4096** bit key pairs protected by your secret passphrase.
-   **Local-Only Inference:** Medical reasoning occurs via WebGPU/WASM in a sandboxed browser environment.
-   **Audit Compliance:** HIPAA-ready logging for clinical decision support events.

## 🛡️ Disclaimer
This application is for informational purposes only. It does not provide medical advice.

---
*MedGemma Impact Challenge - Edge AI Track Specialist Submission*