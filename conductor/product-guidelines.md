# Product Guidelines

## 1. Tone and Voice
- **Professional yet Accessible:** Maintain a clinical standard of precision without using overwhelming jargon. The tone should be authoritative enough to instill trust but empathetic toward the patient's wellness journey.
- **Privacy-Centric:** Every interaction should reinforce the project's "privacy-first" ethos. Use clear language to explain when and why data is being processed locally.
- **Non-Judgmental:** Cannabis use can be a sensitive topic; the application should provide a neutral, supportive environment for honest journaling.

## 2. Visual Identity & UX
- **Clean and Medical:** Utilize a modern, "MedTech" aesthetic. Lean on white space, soft greens, and professional typography (Inter/Geist).
- **High-Signal Data Visualization:** Charts and insights should be clear and actionable. Use Recharts to show trends like "Dose Drift" or "Symptom Relief" without clutter.
- **Accessibility First:** Ensure the UI is easy to navigate for patients who may be experiencing symptoms. High contrast and large touch targets are empty.
- **Mobile-Optimized:** The journaling experience must be seamless on mobile devices for real-time tracking.

## 3. Privacy and Trust
- **Local-First Disclosure:** Always inform the user that AI analysis is happening on-device.
- **Granular Consent:** Clinician sharing must be opt-in and easily revocable. Clearly state what data is being shared (e.g., "Summaries only").
- **Zero-Knowledge Evidence:** Avoid any UI patterns that suggest centralized storage of PHI (Protected Health Information).

## 4. AI Interaction Guidelines
- **Clinical Decision Support, Not Diagnosis:** AI responses must always include a disclaimer that they are for informational purposes and should be discussed with a doctor.
- **Grounding and Attribution:** When providing advice, the AI should ideally reference the clinical protocols it is using (e.g., "Based on ACOEM guidelines...").
- **Graceful Hardware Fallback:** If WebGPU is unavailable, provide clear messaging and fallback to non-AI insights rather than failing silently.
