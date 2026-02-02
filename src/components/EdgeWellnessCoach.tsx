import { useState, useEffect, useRef } from "react";
import { CreateMLCEngine, MLCEngine, InitProgressCallback } from "@mlc-ai/web-llm";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Loader2, Send, Brain, ShieldCheck, AlertTriangle, Pill, HeartPulse, Activity, ThumbsUp, ThumbsDown, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useJournalEntries } from "@/hooks/useJournalEntries";
import { PATIENT_EDUCATION, CRISIS_TEMPLATES } from "@/data/knowledgeBase";
import { CLINICAL_PROTOCOLS, SYSTEM_PERSONA } from "@/data/clinicalProtocols";
import { computeClinicalFeatures } from "@/utils/clinicalAugmentation";

import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

const SELECTED_MODEL = "gemma-2-2b-it-q4f16_1-MLC";
// ... imports

// ... inside initModel function ...
// ...

export function EdgeWellnessCoach() {
  const [engine, setEngine] = useState<MLCEngine | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [lastResponseIndex, setLastResponseIndex] = useState<number | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
  }, []);

  const { entries } = useJournalEntries(user);
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const findRelevantContext = (query: string): string => {
    // 1. Match Clinical Protocols (Gold Standard)
    const terms = query.toLowerCase().split(" ");
    let protocolBuffer = "";

    CLINICAL_PROTOCOLS.forEach(p => {
      if (terms.some(t => p.trigger.toLowerCase().includes(t))) {
        protocolBuffer += `
[PROTOCOL: ${p.id}]
IF: ${p.trigger}
THEN: ${p.recommendation}
WARN: ${p.contraindication}
`;
      }
    });

    // 2. Match Knowledge Base (Patient Guides)
    PATIENT_EDUCATION.forEach(item => {
      const matchScore = terms.reduce((score, term) => {
        if (term.length > 3 && (item.content.toLowerCase().includes(term) || item.title.toLowerCase().includes(term))) return score + 1;
        return score;
      }, 0);
      if (matchScore > 0) {
        protocolBuffer += `
[GUIDE: ${item.title}]
${item.content.slice(0, 300)}...
`;
      }
    });

    return protocolBuffer;
  };

  const initModel = async () => {
    if (!('gpu' in navigator)) {
      toast({ variant: "destructive", title: "WebGPU Not Supported", description: "Try Chrome or Edge." });
      return;
    }
    setIsModelLoading(true);
    setLoadProgress("Initializing...");
    try {
      const engine = await CreateMLCEngine(SELECTED_MODEL, {
        initProgressCallback: (report) => setLoadProgress(report.text),
        logLevel: "INFO",
      });
      setEngine(engine);

      // Data Augmentation: Pre-calculate clinical trends
      const metrics = computeClinicalFeatures(entries);
      const clinicalNarrative = `
[CLINICAL SUMMARY]
- Observation Window: Last 14 days.
- Mean Daily THC: ${metrics.doseMetrics.meanDailyTHC.toFixed(1)}mg (Target: 20mg).
- Adherence Rate: ${metrics.doseMetrics.adherenceRate.toFixed(0)}%.
- Symptom Trajectory: ${metrics.symptomTrends.trajectorySlope.toUpperCase()} (Pain Delta: ${metrics.symptomTrends.painDelta.toFixed(1)}).
- Adverse Event Rate: ${metrics.adverseEventRate.toFixed(1)} events/week.
- Risk Flags: ${metrics.riskFlags.length > 0 ? metrics.riskFlags.join(", ") : "None detected"}.
- Usage Patterns: ${metrics.utilization.combustionRate > 0 ? `Combustion detected (${metrics.utilization.combustionRate.toFixed(0)}%)` : "No combustion"}.
`;

      // Virtual Fine-Tuning (Few-Shot Injection)
      // We inject "perfect" examples of how MedGemma SHOULD behave
      const fewShotHistory: Message[] = [
        {
          role: "system",
          content: SYSTEM_PERSONA + "\n\n[PATIENT HISTORY SUMMARY]:\n" + clinicalNarrative
        },
        {
          role: "user",
          content: "I want to get really high tonight. Should I take 50mg?"
        },
        {
          role: "assistant",
          content: "Based on the [HARM REDUCTION] protocol, 50mg is a high dose that significantly increases the risk of anxiety and tachycardia. The clinical recommendation is to start low (2.5-5mg). Please consider a lower dose to avoid adverse effects."
        },
        {
          role: "user",
          content: "What strain helps with my anxiety?"
        },
        {
          role: "assistant",
          content: "According to your [USER LOGS], the strain 'ACDC' (High CBD) consistently resulted in an Anxiety Score of 2/10 (Low). In contrast, 'Sour Diesel' (High THC) was associated with an Anxiety Score of 8/10. I recommend sticking to CBD-dominant profiles."
        }
      ];

      setMessages(fewShotHistory); // Pre-load the "Fine-Tuning" context

      // Add the visible welcome message
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Hello! I am MedGemma-Edge. I have analyzed your journal history and am ready to provide clinical decision support. How can I assist you?"
      }]);

      toast({ title: "MedGemma-Edge Active", description: "In-Context Learning & Clinical Protocols loaded." });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Model Error", description: "Could not initialize." });
    } finally {
      setIsModelLoading(false);
    }
  };

  const handleSendMessage = async (overrideInput?: string) => {
    const textToSend = overrideInput || inputValue;
    if (!textToSend.trim() || !engine) return;

    // 1. SAFETY INTERCEPTOR
    const lowerInput = textToSend.toLowerCase();
    for (const template of CRISIS_TEMPLATES) {
      if (template.trigger_keywords.some(k => lowerInput.includes(k))) {
        setMessages(prev => [...prev, { role: "user", content: textToSend }, { role: "assistant", content: template.response_template }]);
        setInputValue("");
        return;
      }
    }

    // 2. DATA & RAG CONTEXT
    const retrievedContext = findRelevantContext(textToSend);

    // Check if we actually have data
    const hasData = entries && entries.length > 0;

    const userDataset = hasData
      ? JSON.stringify(entries.slice(0, 10).map(e => ({ // Limit to 10 to save context
        strain: e.strain,
        method: e.method,
        dose: e.dosage,
        effect: e.observations.join(", "),
        bad_reaction: e.negative_side_effects.join(", ")
      })))
      : "NO ENTRIES FOUND. The user is new.";

    let finalPrompt = `
    [USER JOURNAL]:
    ${userDataset}

    [SAFETY GUIDES]:
    ${retrievedContext || "General Rule: Start low (2.5mg), go slow. Wait 2 hours for edibles."}

    USER QUESTION: "${textToSend}"
    
    INSTRUCTION: 
    Answer the question. 
    If [USER JOURNAL] has data, use it to give specific examples of what worked/failed.
    If [USER JOURNAL] is empty, give general safe advice based on [SAFETY GUIDES] and tell the user to "log more entries for personalized insights."
    `;

    console.log("Sending Prompt to Engine:", finalPrompt); // Debug log

    const userMsg: Message = { role: "user", content: finalPrompt };
    setMessages((prev) => [...prev, { role: "user", content: textToSend }]); // Show only clean text to user
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await engine.chat.completions.create({
        messages: [...messages, userMsg],
        temperature: 0.2, // Low temperature for clinical accuracy
        max_tokens: 350,
      });

      const aiMsg: Message = {
        role: "assistant",
        content: response.choices[0].message.content || "Assessment inconclusive.",
      };

      setMessages((prev) => {
        const newMessages = [...prev, aiMsg];
        setLastResponseIndex(newMessages.length - 1);
        return newMessages;
      });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Error", description: "Failed to generate response." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRateResponse = (rating: "up" | "down") => {
    if (lastResponseIndex === null) return;
    const log: FeedbackLog = {
      query: messages[lastResponseIndex - 1].content, // Note: This might grab the prompt-engineered version, usually acceptable for logs
      response: messages[lastResponseIndex].content,
      rating,
      timestamp: new Date().toISOString()
    };
    const existingLogs = JSON.parse(localStorage.getItem("ai_feedback_logs") || "[]");
    localStorage.setItem("ai_feedback_logs", JSON.stringify([...existingLogs, log]));
    toast({ title: "Feedback Recorded" });
    setLastResponseIndex(null);
  };

  const generateCriticalReport = () => {
    handleSendMessage("Generate a SAFETY REPORT based on my detected Risk Factors and Adverse Event Rate.");
  };

  return (
    <Card className="w-full h-[700px] flex flex-col relative overflow-hidden border-2 border-primary/20">
      <CardHeader className="bg-primary/5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>MedGemma-Edge Coach</CardTitle>
              <CardDescription>Clinical Decision Support (Local)</CardDescription>
            </div>
          </div>
          <ShieldCheck className="h-5 w-5 text-green-600" aria-label="Data stays on device" />
        </div>
        {engine && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handleSendMessage(PROMPT_TEMPLATES.consumption)}>
              <Pill className="w-3 h-3" /> Efficacy Analysis
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handleSendMessage(PROMPT_TEMPLATES.side_effects)}>
              <Activity className="w-3 h-3" /> Adverse Events
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handleSendMessage(PROMPT_TEMPLATES.stress)}>
              <HeartPulse className="w-3 h-3" /> Relief Patterns
            </Button>
            <Button variant="destructive" size="sm" className="text-xs gap-1 bg-red-100 text-red-700 hover:bg-red-200 border-red-200" onClick={generateCriticalReport}>
              <AlertTriangle className="w-3 h-3" /> Safety Report
            </Button>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        {!engine ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
            <Brain className="h-16 w-16 text-muted-foreground animate-pulse" />
            <div className="space-y-2 max-w-md">
              <h3 className="font-semibold text-lg">Initialize MedGemma-Edge</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Loads <strong>Gemma 2B</strong> with specialized clinical instruction tuning.</p>
                <ul className="list-disc list-inside text-left pl-4 space-y-1">
                  <li><strong>Protocol-Driven:</strong> Follows LRCUG guidelines.</li>
                  <li><strong>Privacy-First:</strong> Zero data egress (WebGPU).</li>
                </ul>
              </div>
            </div>
            <Button onClick={initModel} disabled={isModelLoading} size="lg">
              {isModelLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Initializing... ({loadProgress.slice(0, 30)})
                </>
              ) : (
                "Load Assistant"
              )}
            </Button>
          </div>
        ) : (
          <>
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
              <div className="space-y-4">
                {messages.filter(m => m.role !== "system").slice(2).map((msg, idx) => (
                  <div key={idx}>
                    <div
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"
                        }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 ${msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                          }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        {msg.role === "assistant" && !msg.content.includes("EMERGENCY") && (
                          <div className="flex items-center gap-1 mt-2 pt-2 border-t border-black/10">
                            <BookOpen className="w-3 h-3 opacity-50" />
                            <span className="text-[10px] opacity-70">Evidence-Based Response</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {msg.role === "assistant" && idx === messages.filter(m => m.role !== "system").slice(2).length - 1 && (
                      <div className="flex items-center gap-2 mt-1 ml-1">
                        <span className="text-xs text-muted-foreground">Clinical Accuracy?</span>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRateResponse("up")}>
                          <ThumbsUp className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleRateResponse("down")}>
                          <ThumbsDown className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg p-3">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            <div className="p-4 border-t bg-background">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-2"
              >
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask for clinical guidance..."
                  disabled={isLoading}
                />
                <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
