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

## 🏆 MedGemma Impact Challenge Submission

This project is optimized for the **MedGemma Impact Challenge**, specifically targeting:
1.  **Main Track** ($75,000)
2.  **Edge AI Prize** ($5,000)
3.  **Novel Task Prize** ($10,000)

### 🧠 Edge AI Implementation
We have integrated a **Privacy-First AI Coach** running directly in the browser using **WebLLM** and **Google's Gemma-2B** model.
-   **Why:** Medical data is sensitive. Users are often hesitant to send their substance use logs to the cloud.
-   **How:** By running inference on the client side, we ensure that **no personal health data leaves the user's device** for the coaching feature.
-   **Model:** `Gemma-2b-it-q4f32_1` (Quantized for browser performance).

### 🧪 Novel Task: Hyper-Personalized Cannabis Harm Reduction
We are defining a new task for medical LLMs: **Clinical Decision Support for Substance Use Safety**.
-   **Goal:** To move beyond generic chat to a safety-first, guideline-enforcing agent.
-   **Implementation:**
    *   **Safety Policy Layer:** A non-overrideable rule engine that intercepts critical symptoms (e.g., "chest pain", "suicide") *before* LLM inference, delivering fixed crisis protocols.
    *   **Clinical Persona:** The model is strictly prompted as a "Clinical Decision Support Agent" governed by the **Lower Risk Cannabis Use Guidelines (LRCUG)**.
    *   **In-Context Fine-Tuning:** Dynamic context injection of patient history allows the model to flag high-risk patterns (e.g., daily high-THC usage in anxious patients).

### 📚 Effective Use of HAI-DEF Models (Clinical RAG)
We implemented a **Clinical RAG System** that grounds Gemma's responses in authoritative medical sources, rejecting promotional content.
-   **Knowledge Base:** Structured extracts from **PMC10998028** (Clinical Guidelines), **RACGP** (Anxiety/PTSD), and **LRCUG** (Harm Reduction).
-   **Mechanism:** User queries are vector-matched against specific clinical chunks (e.g., "Dosing Protocols", "Contraindications").
-   **Result:** The model acts as a natural language interface to verified medical literature, reducing hallucinations and ensuring safety.

### 🏗️ Architecture & MedGemma Alignment
Our solution is designed for the **Edge AI** track while remaining fully compatible with the broader MedGemma ecosystem.

**1. Why WebLLM? (Edge AI Advantages)**
-   **Privacy-First:** Medical data (cannabis usage, symptoms) is highly sensitive. WebLLM keeps all inference **local**, meaning no data ever leaves the user's device.
-   **Zero Latency & Cost:** Once the model is cached, inference is instant and free, removing the need for expensive GPU servers.
-   **Accessibility:** Runs on consumer hardware (laptops with integrated GPUs), democratizing access to medical AI.

**2. Interchangeability with MedGemma**
While this browser-based demo uses the **Gemma 2B** base model (optimized for Edge constraints), our architecture is **Model-Agnostic**:
-   **Drop-in Replacement:** As soon as a quantized version of `MedGemma` is available in MLC format, it can be swapped into our `EdgeWellnessCoach` component by changing a single configuration line (`SELECTED_MODEL`).
-   **Prompt Engineering Bridge:** Currently, we bridge the gap by using **System Prompt Engineering** to enforce a "MedGemma Persona"—instructing the model to prioritize harm reduction, clinical tone, and medical accuracy, effectively simulating the target model's behavior for the purpose of the challenge.

### 🧠 Dual-State State Management
We designed two distinct state architectures to match the clinical workflow:

| Feature | State Model | Privacy Level | Purpose |
| :--- | :--- | :--- | :--- |
| **Clinical Triage** | **Zero-Knowledge (ZK) / Stateless** | Maximum | One-off risk assessment. No history is accessed or stored. Session destroys on exit. |
| **Safety Coach** | **Context-Aware / Stateful** | High (Local) | Longitudinal care. Accesses user journal history to identify patterns (e.g., "Anxiety increasing over weeks"). |

### 📊 Performance Metrics (Evaluation)
To demonstrate how we measure success on the Novel Task, we built an integrated **RLHF (Reinforcement Learning from Human Feedback)** loop:
1.  **Feedback UI:** Users can rate every AI response (Thumbs Up/Down).
2.  **Metrics Dashboard:** A dedicated tool (`Tools > Performance Metrics`) tracks the "Helpfulness Score" and "Safety Violation Rate" in real-time.
3.  **Feasibility:** This proves a realistic path to iteratively improving the model in a production environment.

---

## 📋 Project Overview

The **Cannabis Wellness Tracker** is a comprehensive web application designed to help users maintain a detailed log of their cannabis consumption. whether for medical symptom management, recreational enjoyment, or general wellness. By recording detailed metrics before and after consumption, the app helps users correlate specific strains, dosages, and methods with desired outcomes (e.g., pain relief, anxiety reduction, focus).

It goes beyond simple logging by offering **AI-driven tools** that analyze your data to provide personalized wellness reports, correlation analysis, and optimization strategies.

## ✨ Key Features

### 📓 Advanced Journaling
*   **Flexible Tracking Modes:**
    *   **Quick Entry:** Log consumption details and observations in seconds.
    *   **Full Tracking:** Record "Before" and "After" states (Mood, Pain, Anxiety, Energy, Focus) to calculate an **Effectiveness Score**.
*   **Detailed Metrics:**
    *   **Consumption:** Strain names (primary & secondary), Dosage (g, mg, ml), Method (Vape, Smoke, Edible, Oil, Tincture, Topical), and Cannabinoid profile (THC%, CBD%).
    *   **Context:** Log Activities (Music, Social, Gaming, Work) and Observations (Relaxation, Creativity, Sleep).
    *   **Side Effects:** Track negative effects like Dry Mouth or Dizziness to avoid them in the future.
*   **Retroactive Logging:** Easily log past sessions with an intuitive "Time Since Consumption" slider.

### 📊 Insights & Visualization
*   **Unified Calendar View:** Visualize your consumption habits over time.
*   **Effectiveness Scoring:** Automatically calculates how effective a session was based on the improvement in your tracked symptoms.
*   **Trend Analysis:** (Coming Soon) Visualize correlations between strains and positive outcomes.

### 🤖 AI-Powered Wellness Tools
Unlock powerful insights as you build your journal:
1.  **Edge AI Coach (NEW):** Chat with a private, on-device wellness assistant powered by **Gemma 2B**. It analyzes your logs locally to answer questions like "Which strain helped my anxiety most?".
2.  **Comprehensive Wellness Report** (Unlocks at 10 entries): Generates an in-depth analysis of your usage patterns and effectiveness.
3.  **Correlation & Timing Analysis** (Unlocks at 50 entries): Discovers temporal patterns and optimal timing strategies.
3.  **Goal-Based Optimization Strategy** (Unlocks at 100 entries): Creates a personalized plan tailored to specific goals like "Better Sleep" or "Chronic Pain Management".

### 🏆 Gamification & Habits
*   **Achievement Badges:** Earn badges like "Awareness Builder" and "Wellness Master" as you log more entries.
*   **Smart Reminders:** Set custom recurring reminders to maintain a consistent tracking habit.

### 🔒 Privacy & Security
*   **Private & Encrypted:** Your health data is sensitive. This app relies on Supabase's robust security model.
*   **Demo Mode:** Explore the full functionality with sample data before creating an account.

## 🛠️ Tech Stack

This project is built with a modern, performance-oriented stack:

*   **Frontend:** [React](https://react.dev/) (v18), [Vite](https://vitejs.dev/)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **UI Components:** [shadcn/ui](https://ui.shadcn.com/) (based on Radix UI)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Charts:** [Recharts](https://recharts.org/)
*   **Backend & Auth:** [Supabase](https://supabase.com/) (PostgreSQL, Auth, Edge Functions)
*   **Edge AI:** [WebLLM](https://webllm.mlc.ai/) (In-browser inference) + **Gemma 2B**
*   **State Management:** [TanStack Query](https://tanstack.com/query/latest)
*   **Forms:** React Hook Form + Zod

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

3.  **Environment Setup (Optional for Reviewers):**
    For a full production experience, create a `.env` file with Supabase credentials. **However, for the MedGemma Challenge Review, you can skip this step and use "Submission Mode".**
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:8080`.

### 📝 MedGemma Reviewer Mode (No Setup Required)
To review the application without configuring a backend:
1.  Launch the app using `npm run dev`.
2.  On the login screen, click the green **"Enter Submission Mode (Offline)"** button.
3.  This activates the local storage engine, bypassing the need for Supabase while keeping all AI features (Edge Coach, Triage) fully functional.

## ❤️ Support the Project

If you find this project useful, please consider supporting its development. Your contribution helps keep the app free, private, and ad-free for everyone.

### PayPal
*   [☕ **Supporter ($5)**](https://www.paypal.com/donate/?business=3N6GXCZYQH6U6&amount=5&no_recurring=0&item_name=Cannabis+Wellness+Tracker)
*   [❤️ **Contributor ($15)**](https://www.paypal.com/donate/?business=3N6GXCZYQH6U6&amount=15&no_recurring=0&item_name=Cannabis+Wellness+Tracker)
*   [👑 **Champion ($50)**](https://www.paypal.com/donate/?business=3N6GXCZYQH6U6&amount=50&no_recurring=0&item_name=Cannabis+Wellness+Tracker)

### Cryptocurrency
*   **Bitcoin (BTC):** `3F5zzXzgu4CZo1ioVUvTabhKoj6BuEWzmz`
*   **Ethereum (ETH):** `0xC55Bf0f3dc882E6FF4Dc2e25B4b95a135A38C38b`
*   **Monero (XMR):** `86xExcT5MESGR9X2bQ7NwAheWUZK8bmu7KjBCTxo1Msm5s9UeufjbsHAQmhmsbuyXHg7PtNyhXMakgty4noFwQ7ULAx1RSe`

## 🛡️ Disclaimer

This application is for informational and educational purposes only. It does not provide medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1.  Fork the project
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request
