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

## 🚨 JUDGES START HERE: [Read Full Submission Documentation (SUBMISSION.md)](./SUBMISSION.md)
**Video Demo Script:** [View Script](./VIDEO_SCRIPT.md)

---

## 🏆 MedGemma Impact Challenge Submission: EDGE AI TRACK

This submission is specialized for the **Edge AI Prize ($5,000)** and the **Main Track ($75,000)**. 

### 🧠 The Case for Edge AI in Medical Cannabis
Medical cannabis patients handle extremely sensitive health and substance-use data. Privacy is not just a feature; it is a clinical requirement for honest journaling and effective shared decision-making. Our platform demonstrates that complex medical reasoning can be decentralized, preserving patient dignity while enabling professional oversight.

### 🛡️ Privacy-First Architecture (Zero-Knowledge)
Our solution implements **Local-Only Inference** using **WebLLM** and **Google's Gemma-2-2B** model.
-   **Zero Data Leakage:** All medical reasoning, journal analysis, and clinician summarization occur entirely within the user's browser (WASM/WebGPU). Raw PHI never leaves the device.
-   **Local RAG (Retrieval Augmented Generation):** The AI grounds its advice in medical literature (Bell et al. 2024, ACOEM) stored locally on the client, ensuring clinical accuracy without cloud calls.
-   **Secure Clinician Linking:** A privacy-preserving protocol using 6-digit one-time codes and granular consent scopes allows clinicians to view trends and summaries without centralizing raw data.

### 🏗️ Technical Implementation
1.  **Engine:** Powered by `@mlc-ai/web-llm` utilizing the `gemma-2-2b-it-q4f16_1-MLC` quantized model.
2.  **Instruction Tuning (Simulated):** We implement **In-Context Learning (ICL)** via a rigorous System Persona and Clinical Metric injection. This forces the general-purpose Gemma model to adopt a strict "Clinical Decision Support" role.
3.  **Deterministic Feature Engineering:** Raw user logs are pre-processed into high-signal clinical metrics (e.g., "Dose Drift", "Adherence Velocity") *before* LLM inference, significantly improving reasoning reliability.
4.  **Hardware Feasibility:** Optimized for consumer-grade hardware (M1/M2/M3 Macs, NVIDIA RTX, Intel Iris Xe) utilizing WebGPU for near-zero latency.

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
1.  **Private AI Coach:** Multi-modal analysis of effectiveness patterns grounded in Bell et al. 2024 guidelines.
2.  **Clinician Portal:** Secure dashboard featuring multi-axis trend visualization and AI-generated clinical summaries.
3.  **Clinical Triage System:** protocol-driven risk stratification for respiratory and inflammation symptoms.
4.  **Performance Dashboard:** Real-time monitoring of inference latency and helpfulness metrics.

### 📓 Advanced Journaling
*   **Split-Weight Tracking:** Dedicated inputs for THC and CBD weight with dynamic total calculation.
*   **Validated Scales:** Integration of NRS (Pain) and GAD-7 (Anxiety) for clinical-grade outcomes.
*   **Timeline Analytics:** Unified calendar with effectiveness scoring and dose-response correlation.

## 🔒 Security & Regulatory Maturity
-   **Zero-Knowledge:** Sensitive data is encrypted at rest and in transit using RSA-4096 E2EE.
-   **Local-First:** All AI inference is client-side, eliminating cloud-based PHI leaks.
-   **AI Act Alignment:** Engineered to align with **EU AI Act** requirements for **High-Risk AI Systems** in healthcare, prioritizing transparency, robustness, and human-in-the-loop oversight.
-   **Audit Logs:** HIPAA-ready logging for all clinical decision support events.

## 🛡️ Disclaimer
This application is for informational purposes only. It does not provide medical advice.

---
*MedGemma Impact Challenge - Edge AI Track Specialist Submission*