# Cannabis Wellness Tracker

<div align="center">
  <img src="public/placeholder.svg" alt="Cannabis Wellness Tracker Logo" width="120" height="120" />
  <h3>Track Your Wellness Journey, Optimize Your Experience</h3>
  <p>
    A private, intelligent journal to track medical, recreational, and wellness cannabis use. 
    Monitor effects, discover patterns, and leverage AI-powered insights to find what works best for you.
  </p>
  <a href="https://cannabis-wellness-tracker.lovable.app">View Live Demo</a>
</div>

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
1.  **Comprehensive Wellness Report** (Unlocks at 10 entries): Generates an in-depth analysis of your usage patterns and effectiveness.
2.  **Correlation & Timing Analysis** (Unlocks at 50 entries): Discovers temporal patterns and optimal timing strategies.
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
*   **State Management:** [TanStack Query](https://tanstack.com/query/latest)
*   **Forms:** React Hook Form + Zod

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   npm or bun

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

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add your Supabase credentials (required for the backend connection):
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The app will be available at `http://localhost:8080`.

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
