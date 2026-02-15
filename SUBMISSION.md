# 🏆 MedGemma Impact Challenge: Edge AI Architecture

**Project Name:** Cannabis Wellness Tracker (MedGemma-Edge Edition)  
**Track:** Main Track + Edge AI Prize  
**Model:** Gemma-2B (Quantized via WebLLM)  
**Live Demo:** [cannabis-wellness-tracker.lovable.app](https://cannabis-wellness-tracker.lovable.app)

---

## 1. Clinical Narrative & Architectural Philosophy

The **Cannabis Wellness Tracker** reimagines the patient-provider relationship through the lens of **Zero-Knowledge (ZK) AI**. In the delicate domain of cannabinoid medicine, where patient privacy is paramount and data sovereignty is a clinical necessity, traditional cloud-based AI architectures introduce unacceptable risk.

Our solution moves the entire clinical decision support pipeline—from symptom tracking to triage and physician summarization—directly to the **Edge**. By running Google’s **Gemma-2B** model entirely within the browser via WebGPU, we achieve a breakthrough in privacy-preserving healthcare: a system that can reason about sensitive substance use patterns, detect adverse events, and generate SOAP notes without a single byte of Protected Health Information (PHI) ever leaving the patient’s device.

This is not merely a tracking app; it is a **dual-interface clinical platform**. Patients maintain a granular, private journal of their regimen, while clinicians access a synthesized, AI-generated dashboard that highlights "Dose Drift," adherence to safety protocols, and symptom trajectories. The bridge between these two worlds is built on a "Verify, Don't Trust" model, where connection is established via ephemeral, offline-first linking codes, ensuring that the patient remains the sole custodian of their medical narrative.

---

## 2. Technical & Clinical Stack

We have engineered a high-performance, local-first stack optimized for consumer hardware, demonstrating the viability of Edge AI for complex medical reasoning.

| Layer | Component | Implementation Detail | Role |
| :--- | :--- | :--- | :--- |
| **Inference** | **WebLLM (MLC)** | `Gemma-2b-it-q4f32_1` (WASM/WebGPU) | Runs the LLM locally on the client GPU. |
| **Orchestration** | **Virtual Fine-Tuning** | In-Context Learning (ICL) | Injects rigorous "System Persona" & "Few-Shot" clinical examples into the context window at runtime, forcing the model to adhere to medical protocols without weight modification. |
| **Retrieval (RAG)** | **Local Vector Store** | Client-Side JSON Knowledge Base | Embeds 2025 Clinical Guidelines (ACOEM, NCSCT, Bell et al.) for real-time citation and grounding. |
| **Data Eng.** | **Feature Engine** | `computeClinicalFeatures.ts` | Deterministic pre-processing of raw logs into high-signal metrics (e.g., "Adverse Event Rate," "Combustion %") *before* LLM ingestion. |
| **Safety** | **State Machine** | `SafetyInterceptor.ts` | Regex/Rule-based pre-filter that catches emergency keywords (e.g., "chest pain") with 100% deterministic reliability, bypassing the LLM for immediate crisis triage. |
| **Persistence** | **Local Storage** | `IndexedDB` / `localStorage` | Encrypted at rest. No cloud database required for the core AI loop. |

---

## 3. The Edge AI Pipeline: From Raw Data to Clinical Insight

Our pipeline transforms noisy, subjective patient logs into structured, actionable clinical intelligence using a multi-stage process that leverages the strengths of both deterministic code and probabilistic AI.

### Stage 1: Deterministic Feature Engineering
Before the LLM is invoked, raw journal entries are processed by our local feature engine. This transforms unstructured data into rigorous clinical metrics:
*   **Dose Drift:** Calculates the percentage deviation from the prescribed THC target.
*   **Adherence Rate:** Measures compliance with the dosing schedule (e.g., BID vs. PRN).
*   **Risk Flagging:** Applies the **Lower Risk Cannabis Use Guidelines (LRCUG)** rules to detect patterns like "Early Morning Use" or "High THC Velocity."

### Stage 2: Virtual Fine-Tuning & RAG Injection
We overcome the limitation of unable to fine-tune weights in the browser by constructing a dynamic system prompt for every inference call. This prompt injects:
1.  **The System Persona:** "You are an expert Clinical Assistant specializing in Harm Reduction..."
2.  **The Patient Context:** The pre-calculated metrics from Stage 1.
3.  **The Evidence Basis:** Relevant chunks of clinical guidelines (e.g., *Bell et al. 2024* for dosing, *NCSCT* for respiratory risks) retrieved via local keyword matching.

### Stage 3: Zero-Knowledge Inference
The constructed prompt is sent to the local Gemma-2B instance. The model generates a response—whether a patient chat reply or a clinician SOAP note—completely offline. This architecture ensures that the "reasoning" happens on data that the server never sees.

---

## 4. Clinical Evidence Basis

The system’s reasoning is strictly anchored in peer-reviewed protocols, ensuring that the "AI Hallucination" risk is mitigated by rigid citation requirements.

*   **ACOEM 2025:** *Guidance for the Medical Use of Cannabis* (Chronic Pain protocols).
*   **Bell et al. 2024:** *Clinical Practice Guidelines for Cannabis-Based Medicines* (Integration of NRS Pain Scale & GAD-7 Anxiety scores).
*   **NCSCT 2025:** *Harm Reduction Briefing* (Respiratory risk mitigation).
*   **LRCUG:** *Lower Risk Cannabis Use Guidelines* (Dosing thresholds and frequency limits).
*   **RACGP:** *Prescribing Medical Cannabis in General Practice* (Contraindications for anxiety/psychosis).

---



## 5. Regulatory Maturity & AI Act Alignment



This project is engineered with a proactive focus on evolving global AI regulations, specifically aligning with the **EU AI Act** frameworks for **High-Risk AI Systems** in healthcare (Annex III). 



*   **Transparency & Explainability:** Our local RAG architecture ensures that every clinical recommendation is traceable back to peer-reviewed source material, mitigating "black box" risks.

*   **Technical Robustness & Safety:** By implementing a deterministic safety interceptor and local-only inference, we eliminate cloud-based vulnerabilities and ensure consistent performance in safety-critical environments.

*   **Data Sovereignty:** Our RSA-4096 E2EE architecture exceeds standard GDPR/HIPAA requirements, ensuring that the patient retains absolute control over their sensitive medical data.

*   **Human Oversight:** The system is designed as a **Clinical Decision Support (CDS)** tool, emphasizing clinician verification and shared decision-making rather than autonomous medical diagnosis.



---

*Submitted by Amerigo Di Maria & Team for the Kaggle MedGemma Impact Challenge.*
