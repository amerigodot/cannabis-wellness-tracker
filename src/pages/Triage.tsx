import { useState, useEffect } from "react";
import { CreateMLCEngine, MLCEngine } from "@mlc-ai/web-llm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { ShieldAlert, Stethoscope, Activity, Lock, Loader2, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";
import { PageHeader } from "@/components/PageHeader";
import { Footer } from "@/components/Footer";
import { CLINICAL_GUIDELINES } from "@/data/knowledgeBase";

const SELECTED_MODEL = "gemma-2b-it-q4f32_1-MLC";

interface TreatmentOption {
  name: string;
  product: string;
  dosing: string;
  rationale: string;
}

interface TriageResult {
  status: "APPROVED" | "REJECTED" | "REQUIRES_REVIEW";
  risk_level: string;
  clinical_summary: string;
  treatment_options: TreatmentOption[];
  monitoring_plan: string[];
}

const INDICATIONS = [
  { value: "chronic_pain", label: "Chronic Pain (Neuropathic/Non-cancer)", guidelineId: "pain-01" },
  { value: "anxiety", label: "Anxiety / PTSD", guidelineId: "anxiety-01" },
  { value: "insomnia", label: "Refractory Insomnia", guidelineId: "pain-01" }, // Using pain/general for now
  { value: "spasticity", label: "Spasticity (MS/Spinal Cord)", guidelineId: "pain-01" },
  { value: "nausea", label: "Chemotherapy-Induced Nausea", guidelineId: "pain-01" },
  { value: "palliative", label: "Palliative Care Symptoms", guidelineId: "pain-01" },
  { value: "other", label: "Other", guidelineId: "lrcug-01" },
];

export default function Triage() {
  const [engine, setEngine] = useState<MLCEngine | null>(null);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState("");
  
  // Structured Form State
  const [indication, setIndication] = useState<string>("");
  const [symptomDetails, setSymptomDetails] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState([5]);
  
  const [age, setAge] = useState("");
  const [isPregnant, setIsPregnant] = useState(false);
  const [hasPsychosisHistory, setHasPsychosisHistory] = useState(false);
  const [hasHeartCondition, setHasHeartCondition] = useState(false);
  const [failedPriorTreatments, setFailedPriorTreatments] = useState(false);
  
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const initModel = async () => {
    if (!('gpu' in navigator)) {
      toast({ variant: "destructive", title: "Error", description: "WebGPU not supported." });
      return;
    }
    setIsModelLoading(true);
    try {
      const engine = await CreateMLCEngine(SELECTED_MODEL, {
        initProgressCallback: (report) => setLoadProgress(report.text),
        logLevel: "INFO",
      });
      setEngine(engine);
      toast({ title: "Triage Engine Ready", description: "Clinical logic loaded locally." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Model Error", description: "Failed to load Triage Engine." });
    } finally {
      setIsModelLoading(false);
    }
  };

  // Helper to safely extract JSON from model output
  const extractJSON = (text: string): any => {
    try {
      // 1. Try direct parse
      return JSON.parse(text);
    } catch (e) {
      // 2. Try Markdown Code Block
      const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (markdownMatch && markdownMatch[1]) {
        try { return JSON.parse(markdownMatch[1]); } catch (e2) { }
      }
      
      // 3. Try finding the outermost JSON object
      const firstBrace = text.indexOf('{');
      const lastBrace = text.lastIndexOf('}');
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const potentialJson = text.substring(firstBrace, lastBrace + 1);
        try { return JSON.parse(potentialJson); } catch (e3) { }
      }
      
      return null;
    }
  };

  const runTriage = async (retryCount = 0) => {
    if (!engine) return;
    setAnalyzing(true);
    if (retryCount === 0) setResult(null);

    // 1. Deterministic Rule-Based Exclusion
    const redFlags = [];
    if (parseInt(age) < 25) redFlags.push("Age < 25");
    if (isPregnant) redFlags.push("Pregnancy");
    if (hasPsychosisHistory) redFlags.push("Psychosis History");
    if (hasHeartCondition) redFlags.push("Unstable Heart");

    if (redFlags.length > 0) {
      setResult({
        status: "REJECTED",
        risk_level: "High",
        clinical_summary: `Contraindicated due to: ${redFlags.join(", ")}.`,
        treatment_options: [],
        monitoring_plan: ["Refer to specialist"]
      });
      setAnalyzing(false);
      return;
    }

    if (!failedPriorTreatments) {
        setResult({
            status: "REJECTED",
            risk_level: "Moderate",
            clinical_summary: "Standard therapies not exhausted.",
            treatment_options: [],
            monitoring_plan: ["Optimize first-line care"]
        });
        setAnalyzing(false);
        return;
    }

    // 2. Clinical Reasoning Prompt (Enhanced)
    try {
      // Find the specific guideline for this indication
      const selectedIndicationObj = INDICATIONS.find(i => i.value === indication);
      const specificGuideline = CLINICAL_GUIDELINES.find(g => g.id === selectedIndicationObj?.guidelineId);
      
      const guidelineContext = specificGuideline ? JSON.stringify(specificGuideline.content) : "Use general harm reduction principles.";

      const prompt = `
      ACT AS: Senior Clinical Specialist.
      
      PATIENT PROFILE:
      - Indication: ${selectedIndicationObj?.label || indication}
      - Specific Symptoms: "${symptomDetails}"
      - Duration: ${duration}
      - Severity: ${severity[0]}/10
      - Age: ${age} (Adjust dosing if >60)
      
      CLINICAL GUIDELINE (${specificGuideline?.source}):
      ${guidelineContext}

      TASK:
      Create a specific treatment plan.
      1. **Clinical Summary**: Write 2 sentences specific to THIS patient's age and symptom severity. Do NOT use generic templates. Mention the specific symptom.
      2. **Dosing**: You MUST calculate a specific starting dose (e.g., "2.5mg", "5mg", "0.1ml") based on the guideline provided. 
         - If Age > 60, reduce start dose by 50%.
         - If Naive, start at lowest range.
      3. **Options**: Provide 3 distinct options (Conservative, Balanced, Advanced).

      OUTPUT JSON ONLY. Do not include markdown formatting or explanations outside the JSON.
      {
        "status": "APPROVED",
        "risk_level": "Low" | "Moderate",
        "clinical_summary": "Specific summary mentioning ${symptomDetails}...",
        "treatment_options": [
          {
            "name": "Option 1: Conservative (Start Here)",
            "product": "Specific Type (e.g. CBD Oil 50mg/ml)",
            "dosing": "EXACT START DOSE (e.g. '0.05ml (2.5mg) at night')",
            "rationale": "Why this specific dose for age ${age}?"
          },
          {
            "name": "Option 2: Balanced",
            "product": "Specific Type (e.g. THC:CBD 1:1)",
            "dosing": "EXACT START DOSE",
            "rationale": "For moderate symptoms."
          },
          {
            "name": "Option 3: Advanced/Rescue",
            "product": "Specific Type (e.g. Flower Vaporizer)",
            "dosing": "EXACT START DOSE (e.g. '1 inhalation, wait 15m')",
            "rationale": "For severe breakthrough."
          }
        ],
        "monitoring_plan": ["Specific goal 1...", "Stop rule..."]
      }
      `;

      const response = await engine.chat.completions.create({
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1 + (retryCount * 0.1), 
        response_format: { type: "json_object" }
      });

      const rawText = response.choices[0].message.content || "";
      console.log("Raw LLM Output:", rawText); // Debugging

      const json = extractJSON(rawText);

      // Validation: Ensure we at least have treatment options
      if (!json || !json.treatment_options || json.treatment_options.length === 0) {
        throw new Error("Invalid JSON structure or missing options");
      }

      setResult(json);

    } catch (error) {
      console.error("Triage Error:", error);
      
      if (retryCount < 2) {
        toast({ title: `Refining Protocols... (Attempt ${retryCount + 2}/3)`, description: "Calculating precise dosing." });
        await runTriage(retryCount + 1); 
        return;
      }

      toast({ variant: "destructive", title: "Assessment Failed", description: "Please try rephrasing the symptoms." });
    } finally {
      if (retryCount === 2 || result) setAnalyzing(false); 
    }
  };

  const renderList = (items: string | string[] | undefined) => {
      if (!items) return null;
      const list = Array.isArray(items) ? items : [items];
      return list.map((item, i) => <li key={i}>{item}</li>);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Clinical Triage - Edge AI" description="Privacy-first clinical decision support." />
      
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-5xl">
        <PageHeader
          title="Clinical Triage"
          description="Privacy-first clinical decision support running locally on your device"
          breadcrumbs={[{ label: "Clinical Triage" }]}
          icon={<Stethoscope className="h-6 w-6 sm:h-7 sm:w-7" />}
          actions={
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700">
              <Lock className="w-3 h-3 mr-1" />
              Zero-Knowledge
            </span>
          }
        />

        <div className="space-y-6">

        {!engine && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="pt-6 flex flex-col items-center text-center gap-4">
              <ShieldAlert className="h-12 w-12 text-primary opacity-50" />
              <div>
                <h3 className="font-bold text-lg">Initialize Secure Environment</h3>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  This Triage Tool runs 100% locally to protect patient privacy.
                </p>
              </div>
              <Button onClick={initModel} disabled={isModelLoading}>
                {isModelLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Load Clinical Engine"}
              </Button>
              {loadProgress && <p className="text-xs font-mono text-muted-foreground">{loadProgress.slice(0, 50)}...</p>}
            </CardContent>
          </Card>
        )}

        {engine && (
          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Patient Intake</CardTitle>
                <CardDescription>Clinical intake for risk stratification.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                
                {/* 1. Indication */}
                <div className="space-y-2">
                  <Label>Primary Indication</Label>
                  <Select onValueChange={setIndication} value={indication}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select diagnosis..." />
                    </SelectTrigger>
                    <SelectContent>
                      {INDICATIONS.map(i => (
                        <SelectItem key={i.value} value={i.value}>{i.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 2. Specifics */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Symptom Duration</Label>
                        <Input 
                            placeholder="e.g. 6 months" 
                            value={duration} 
                            onChange={(e) => setDuration(e.target.value)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Patient Age</Label>
                        <Input 
                            type="number" 
                            value={age} 
                            onChange={(e) => setAge(e.target.value)} 
                        />
                    </div>
                </div>

                <div className="space-y-2">
                  <Label>Symptom Details</Label>
                  <Textarea 
                    value={symptomDetails}
                    onChange={(e) => setSymptomDetails(e.target.value)}
                    placeholder="Describe nature of symptoms, triggers, and impact on function..."
                    rows={2}
                  />
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between">
                        <Label>Severity Impact (0-10)</Label>
                        <span className="font-mono font-bold text-primary">{severity[0]}</span>
                    </div>
                    <Slider value={severity} onValueChange={setSeverity} max={10} step={1} />
                </div>

                {/* 3. Red Flags */}
                <div className="space-y-3 border rounded-lg p-4 bg-muted/20">
                    <Label className="font-semibold text-sm uppercase text-muted-foreground">Safety Checklist</Label>
                    
                    <div className="flex items-center justify-between">
                        <Label htmlFor="prior" className="cursor-pointer font-medium text-primary">Standard Treatments Failed?</Label>
                        <Switch id="prior" checked={failedPriorTreatments} onCheckedChange={setFailedPriorTreatments} />
                    </div>
                    
                    <div className="h-px bg-border my-2" />

                    <div className="grid grid-cols-1 gap-2 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="preg" className="cursor-pointer text-xs">Pregnant / Breastfeeding</Label>
                            <Switch id="preg" checked={isPregnant} onCheckedChange={setIsPregnant} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="psy" className="cursor-pointer text-xs">History of Psychosis</Label>
                            <Switch id="psy" checked={hasPsychosisHistory} onCheckedChange={setHasPsychosisHistory} />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label htmlFor="heart" className="cursor-pointer text-xs">Unstable Cardiac Disease</Label>
                            <Switch id="heart" checked={hasHeartCondition} onCheckedChange={setHasHeartCondition} />
                        </div>
                    </div>
                </div>

                <Button className="w-full" onClick={() => runTriage(0)} disabled={analyzing || !indication || !age}>
                  {analyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Generate Treatment Plans"}
                </Button>
              </CardContent>
            </Card>

            <Card className="flex flex-col h-full border-l-4 border-l-primary/20">
                <CardHeader>
                    <CardTitle>Decision Support</CardTitle>
                    <CardDescription>AI-Generated Protocol (ESI Guidelines)</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto max-h-[700px]">
                    {result ? (
                        <div className="space-y-5 animate-in fade-in slide-in-from-bottom-2">
                            <div className={`p-4 rounded-lg border-2 text-center ${
                                result.status === "APPROVED" ? "bg-green-50 border-green-200 text-green-900" :
                                result.status === "REJECTED" ? "bg-red-50 border-red-200 text-red-900" :
                                "bg-yellow-50 border-yellow-200 text-yellow-900"
                            }`}>
                                {result.status === "APPROVED" && <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />}
                                {result.status === "REJECTED" && <XCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />}
                                <h2 className="text-xl font-bold tracking-tight">{result.status}</h2>
                                <p className="text-sm font-medium mt-1 uppercase opacity-80">Risk: {result.risk_level}</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs uppercase font-bold text-muted-foreground">Clinical Summary</Label>
                                <p className="text-sm leading-relaxed">{result.clinical_summary}</p>
                            </div>

                            {/* Treatment Options Grid */}
                            {result.treatment_options?.length > 0 && (
                                <div className="space-y-3">
                                    <Label className="text-xs uppercase font-bold text-primary">Proposed Treatment Plans</Label>
                                    <div className="grid gap-3">
                                        {result.treatment_options.map((option, idx) => (
                                            <div key={idx} className="p-3 border rounded-lg bg-card hover:bg-accent/5 transition-colors">
                                                <div className="flex justify-between items-start mb-1">
                                                    <strong className="text-sm font-bold text-foreground">{option.name}</strong>
                                                    <span className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded">{option.product}</span>
                                                </div>
                                                <div className="text-xs text-muted-foreground mb-1.5">
                                                    <span className="font-semibold text-foreground/80">Dosing:</span> {option.dosing}
                                                </div>
                                                <p className="text-xs italic opacity-80">{option.rationale}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {result.monitoring_plan && (
                                <div className="p-3 bg-amber-50 border border-amber-100 rounded text-xs text-amber-900">
                                    <strong className="block mb-1 text-amber-700">Monitoring & Stop Rules:</strong>
                                    <ul className="list-disc list-inside space-y-0.5">
                                        {result.monitoring_plan.map((item, i) => (
                                            <li key={i}>{item}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            
                            <Button variant="outline" size="sm" className="w-full mt-2" onClick={() => runTriage(0)}>
                                <RefreshCw className="w-3 h-3 mr-2" /> Regenerate Analysis
                            </Button>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-30 min-h-[300px]">
                            <Activity className="h-16 w-16 mb-4" />
                            <p>Awaiting Data...</p>
                        </div>
                    )}
                </CardContent>
            </Card>
          </div>
        )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
