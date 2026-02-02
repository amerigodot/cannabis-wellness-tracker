import { useState, useEffect } from "react";
import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import { ClinicalMetrics } from "@/utils/clinicalAugmentation";
import { toast } from "sonner";

const SUMMARY_MODEL = "gemma-2-2b-it-q4f16_1-MLC";

export interface SummaryState {
  isLoading: boolean;
  isModelLoading: boolean;
  progress: string;
  summary: string;
}

export function useClinicalSummarizer() {
  const [engine, setEngine] = useState<MLCEngine | null>(null);
  const [state, setState] = useState<SummaryState>({
    isLoading: false,
    isModelLoading: false,
    progress: "",
    summary: ""
  });

  // Cleanup engine on unmount
  useEffect(() => {
    return () => {
      if (engine) {
        console.log("Unloading Clinical Summarizer Engine...");
        engine.unload();
      }
    };
  }, [engine]);

  const initModel = async () => {
    if (engine) return engine;
    
    setState(prev => ({ ...prev, isModelLoading: true, progress: "Initializing Edge AI..." }));
    
    try {
      if (!navigator.gpu) {
        throw new Error("WebGPU not supported");
      }

      const newEngine = await CreateMLCEngine(SUMMARY_MODEL, {
        initProgressCallback: (report) => {
          setState(prev => ({ ...prev, progress: report.text }));
        },
        logLevel: "INFO",
      });
      
      setEngine(newEngine);
      setState(prev => ({ ...prev, isModelLoading: false, progress: "Ready" }));
      return newEngine;
    } catch (error) {
      console.error("Model init error:", error);
      toast.error("Failed to load clinical model");
      setState(prev => ({ ...prev, isModelLoading: false, progress: "Error loading model" }));
      return null;
    }
  };

  const generateSummary = async (patientName: string, metrics: ClinicalMetrics) => {
    let currentEngine = engine;
    if (!currentEngine) {
      currentEngine = await initModel();
    }
    
    if (!currentEngine) return;

    setState(prev => ({ ...prev, isLoading: true, summary: "" }));

    const prompt = `
    You are an expert Clinical Assistant specializing in Cannabis Medicine.
    Generate a concise SOAP-style Pre-Visit Summary for the physician.
    
    PATIENT: ${patientName}
    
    CLINICAL METRICS (Last 14 Days):
    - Mean Daily THC: ${metrics.doseMetrics.meanDailyTHC.toFixed(1)}mg (Target: 20mg)
    - Adherence: ${metrics.doseMetrics.adherenceRate.toFixed(0)}%
    - Symptom Trajectory: ${metrics.symptomTrends.trajectorySlope.toUpperCase()}
    - Pain Change: ${metrics.symptomTrends.painDelta.toFixed(1)} points
    - Adverse Events: ${metrics.adverseEventRate.toFixed(1)}/week
    - Risk Flags: ${metrics.riskFlags.join(", ") || "None"}
    - Combustion Rate: ${metrics.utilization.combustionRate.toFixed(0)}%

    INSTRUCTIONS:
    1. Summarize adherence and effectiveness.
    2. Highlight any safety risks (Risk Flags).
    3. Suggest 1-2 specific questions for the clinician to ask.
    4. Keep it professional, objective, and under 150 words.
    `;

    try {
      const chunks = await currentEngine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1, // Very low temp for factual consistency
        stream: true,
      });

      let fullText = "";
      for await (const chunk of chunks) {
        const content = chunk.choices[0]?.delta?.content || "";
        fullText += content;
        setState(prev => ({ ...prev, summary: fullText }));
      }
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate summary");
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  return {
    generateSummary,
    ...state
  };
}
