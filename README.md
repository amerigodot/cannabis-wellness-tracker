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

## 🏆 MedGemma Impact Challenge Submission: EDGE AI TRACK

This submission is specialized for the **Edge AI Prize ($5,000)** and the **Main Track ($75,000)**. 

### 🧠 The Case for Edge AI in Medical Cannabis
Medical cannabis patients handle extremely sensitive health and substance-use data. Privacy is not just a feature; it is a clinical requirement for honest journaling and effective symptom management.

### 🛡️ Privacy-First Architecture
Our solution implements **Local-Only Inference** using **WebLLM** and **Google's Gemma-2B** model.
-   **Zero Data Leakage:** All medical reasoning, journal analysis, and triage occur entirely within the user's browser (WASM/WebGPU).
-   **Local RAG (Retrieval Augmented Generation):** The AI grounds its advice in medical literature stored locally on the client, ensuring accuracy without cloud calls.
-   **Offline-First:** Once cached, the Wellness Coach and Triage systems work in Airplane Mode, crucial for users in remote areas or high-privacy environments.

### 🏗️ Technical Implementation
1.  **Engine:** Powered by `@mlc-ai/web-llm` utilizing the `Gemma-2b-it-q4f32_1` quantized model.
2.  **Hardware Feasibility:** Optimized for consumer-grade laptops and desktops. The model requires ~1.5GB of VRAM, making it accessible on integrated GPUs (M1/M2/M3 Macs, Intel Iris Xe).
3.  **Auditable Pipeline:** We implement a local audit log for clinical interactions, satisfying HIPAA accountability standards while maintaining local-first storage.

### 📊 Edge AI Performance & Evaluation
To prove the feasibility and impact of our Edge AI implementation, we have built-in evaluation tools:
-   **Helpfulness Metrics (RLHF):** Integrated feedback loop to measure local model performance.
-   **Safety Protocols:** Rule-based pre-processing to ensure 100% reliable emergency detection (intervening before the LLM for chest pain/respiratory distress).
-   **Benchmarks:** The app measures and logs inference latency to demonstrate production readiness.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm, bun, or pnpm

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd cannabis-wellness-tracker
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:8080`.

### 📝 MedGemma Reviewer Mode (Edge AI Demo)
To facilitate testing without any backend setup:
1.  Launch the app.
2.  On the Authentication page, click the green **"Enter Submission Mode (Offline)"** button.
3.  Navigate to **"Private AI Coach"** to initialize the Edge AI model (Gemma-2B).
4.  Navigate to **"Clinical Triage"** to test the ESI risk-stratification logic.

---

## ✨ Key Features

### 🤖 Edge AI Wellness Tools
1.  **Private AI Coach:** Chat with a local Gemma model that analyzes your history to discover effectiveness patterns.
2.  **Clinical Triage System:** Secure, protocol-driven triage for respiratory and inflammation symptoms with disposition recommendations.
3.  **Performance Metrics:** Real-time dashboard to view model helpfulness scores and safety statistics.

### 📓 Advanced Journaling
*   **Flexible Tracking Modes:** Quick Entry and Full "Before/After" tracking.
*   **Detailed Metrics:** Strain, Dosage, Method, Cannabinoid profile, and Side Effects.
*   **Insights:** Unified calendar and effectiveness scoring.

## 🔒 Security
-   **Encrypted:** Sensitive data is encrypted at rest and in transit.
-   **Local-First:** All AI inference is client-side.
-   **Audit Logs:** HIPAA-compliant logging for all clinical decision support events.

## 🛡️ Disclaimer
This application is for informational purposes only. It does not provide medical advice.

---
*MedGemma Impact Challenge - Edge AI Track Specialist Submission*