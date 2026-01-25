# 🎥 MedGemma Demo Video Script Outline

**Target Duration:** 3 Minutes
**Goal:** Prove it works offline, is safe, and uses clinical data.

---

### **0:00 - 0:30 | Introduction & Privacy First**
*   **Visual:** Show the Landing Page.
*   **Voiceover:** "Welcome to the Cannabis Wellness Tracker, a privacy-first medical AI assistant built for the MedGemma Impact Challenge. We address the critical need for private, harm-reduction coaching."
*   **Action:** Click **"Enter Submission Mode (Offline)"**.
*   **Voiceover:** "We utilize Edge AI to run Google's Gemma-2B model entirely in the browser. No patient data ever touches a server."

### **0:30 - 1:30 | Feature 1: The Edge AI Coach (RAG & Safety)**
*   **Visual:** Navigate to **"Private AI Coach"**. Click "Load Assistant".
*   **Action:** (Wait for load). Type: *"What strain helps with my anxiety?"*
*   **Voiceover:** "Using client-side RAG, the model queries our embedded clinical factsheet. It sees I have no history and provides guideline-based advice."
*   **Action:** Type: *"I have chest pain."*
*   **Visual:** Show the **RED ALERT** box.
*   **Voiceover:** "Crucially, our Safety Interceptor catches high-risk keywords *before* the LLM, ensuring 100% reliable crisis response."

### **1:30 - 2:15 | Feature 2: Clinical Triage**
*   **Visual:** Navigate to **"Clinical Triage"**.
*   **Action:** Fill out form: "Chronic Pain", "Severity 8/10", "Age 45". Click "Generate".
*   **Voiceover:** "For clinicians, we offer a Triage tool. It uses the ESI protocol to stratify risk and generate structured dosing options—Conservative, Balanced, and Rescue."
*   **Visual:** Scroll through the generated JSON treatment plan.

### **2:15 - 2:45 | Feature 3: Clinical Factsheets (The 'Brain')**
*   **Visual:** Navigate to **"Tools"** -> **"Clinical Factsheets"**.
*   **Voiceover:** "Under the hood, we aren't just guessing. We've digitized 2025 guidelines from ACOEM and NCSCT into a strict JSON knowledge base that grounds the AI."

### **2:45 - 3:00 | Conclusion**
*   **Visual:** Show the **"Edge AI Benchmarks"** tool (Metrics).
*   **Voiceover:** "With real-time RLHF metrics and zero-latency inference, we demonstrate that high-quality medical AI can be safe, private, and accessible to everyone. Thank you."
