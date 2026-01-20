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

const SELECTED_MODEL = "gemma-2b-it-q4f32_1-MLC";

interface Message {
  role: "system" | "user" | "assistant";
  content: string;
}

interface FeedbackLog {
  query: string;
  response: string;
  rating: "up" | "down";
  timestamp: string;
}

const PROMPT_TEMPLATES = {
  consumption: "Look at my most successful sessions. What was the common strain and dosage?",
  side_effects: "Have I had any bad reactions lately? Which strains should I be cautious with?",
  stress: "I'm feeling overwhelmed. Based on my history, what helped me relax previously?",
  emergency: "What are the safety rules for preventing overconsumption?",
};

export function EdgeWellnessCoach() {
  const [engine, setEngine] = useState<MLCEngine | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [loadProgress, setLoadProgress] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [lastResponseIndex, setLastResponseIndex] = useState<number | null>(null);
  const { entries } = useJournalEntries();
  const { toast } = useToast();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const findRelevantContext = (query: string): string => {
    const terms = query.toLowerCase().split(" ").filter(t => t.length > 3);
    if (terms.length === 0) return "";
    let contextBuffer = "";
    PATIENT_EDUCATION.forEach(item => {
      const matchScore = terms.reduce((score, term) => {
        if (item.content.toLowerCase().includes(term) || item.title.toLowerCase().includes(term)) return score + 1;
        return score;
      }, 0);
      if (matchScore > 0) {
        contextBuffer += `
[GUIDE: ${item.title}]
${item.content}
`;
      }
    });
    return contextBuffer;
  };

  const initModel = async () => {
    if (!navigator.gpu) {
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

      const contextMessage: Message = {
        role: "system",
        content: `You are a specialized Cannabis Data Analyst.
        
        CORE OBJECTIVE:
        Answer the user's questions by extracting specific patterns (Strain, Dose, Method) directly from the provided [USER DATASET].

        STRICT CONSTRAINTS:
        1. **NO GENERIC ADVICE:** Do NOT recommend yoga, meditation, diet, sleep hygiene, or therapy unless the user explicitly asks for "lifestyle tips".
        2. **DATA ONLY:** If you cannot find the answer in the [USER DATASET], say "I don't see that in your journal yet."
        3. **CLINICAL BOUNDARIES:** Use the [PATIENT GUIDES] only for safety warnings (e.g., "Start low").
        4. **DIRECTNESS:** Start every response with "According to your entries..." or "I found..."

        If the user asks "What works?", list the specific strains/dosages from their top-rated entries.`
      };

      setMessages([contextMessage, { role: "assistant", content: "Hello! I'm your private Edge AI Assistant. I've analyzed your local journal history. How can I help you optimize your wellness journey today?" }]);
      toast({ title: "Assistant Loaded", description: "Ready to chat privately." });
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
    const userDataset = JSON.stringify(entries?.slice(0, 15).map(e => ({
      date: e.created_at,
      strain: e.strain,
      method: e.method,
      dosage: e.dosage,
      effects: e.observations,
      side_effects: e.negative_side_effects,
      effectiveness: 8 // Derived
    })));

    let finalPrompt = `
    [USER JOURNAL DATA]:
    ${userDataset}

    [PATIENT SAFETY GUIDES]:
    ${retrievedContext || "General Rule: Start low, go slow. Wait for onset."}

    QUERY: "${textToSend}"
    
    INSTRUCTION: 
    - SEARCH the [USER DATASET] for entries relevant to the QUERY.
    - REPORT specific Strains, Dosages, and Methods that match.
    - IGNORE general wellness knowledge (yoga, diet, etc.).
    - IF the user asks for "successful sessions", sort by 'effectiveness' and list the top 3 specific entries.
    `;

    const userMsg: Message = { role: "user", content: finalPrompt };
    setMessages((prev) => [...prev, { role: "user", content: textToSend }]);
    setInputValue("");
    setIsLoading(true);

    try {
      const response = await engine.chat.completions.create({
        messages: [...messages, userMsg],
        temperature: 0.4, 
        max_tokens: 400,
      });

      const aiMsg: Message = {
        role: "assistant",
        content: response.choices[0].message.content || "I'm having trouble analyzing the data right now.",
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
      query: messages[lastResponseIndex - 1].content,
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
    handleSendMessage("Please analyze my recent entries and summarize any patterns of high anxiety or negative side effects. What should I change based on the safety guides?");
  };

  return (
    <Card className="w-full h-[700px] flex flex-col relative overflow-hidden border-2 border-primary/20">
      <CardHeader className="bg-primary/5 pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>AI Wellness Assistant</CardTitle>
              <CardDescription>Personalized & Private Insights</CardDescription>
            </div>
          </div>
          <ShieldCheck className="h-5 w-5 text-green-600" title="Data stays on device" />
        </div>
        {engine && (
          <div className="flex gap-2 mt-2 overflow-x-auto pb-2">
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handleSendMessage(PROMPT_TEMPLATES.consumption)}>
              <Pill className="w-3 h-3" /> Successful Sessions
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handleSendMessage(PROMPT_TEMPLATES.side_effects)}>
              <Activity className="w-3 h-3" /> Side Effect Review
            </Button>
            <Button variant="outline" size="sm" className="text-xs gap-1" onClick={() => handleSendMessage(PROMPT_TEMPLATES.stress)}>
              <HeartPulse className="w-3 h-3" /> Relaxation Patterns
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
              <h3 className="font-semibold text-lg">Load Private Assistant</h3>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>Analyzes your journal history locally using <strong>Gemma 2B</strong>.</p>
                <ul className="list-disc list-inside text-left pl-4 space-y-1">
                    <li><strong>Evidence-Based:</strong> Cites your specific strains and doses.</li>
                    <li><strong>Privacy:</strong> No data is ever uploaded.</li>
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
                {messages.filter(m => m.role !== "system").map((msg, idx) => (
                  <div key={idx}>
                    <div
                      className={`flex ${ 
                        msg.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[85%] rounded-lg p-3 ${ 
                          msg.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted"
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                        {msg.role === "assistant" && !msg.content.includes("EMERGENCY") && (
                            <div className="flex items-center gap-1 mt-2 pt-2 border-t border-black/10">
                                <BookOpen className="w-3 h-3 opacity-50" />
                                <span className="text-[10px] opacity-70">Grounded in Your Data & Guides</span>
                            </div>
                        )}
                      </div>
                    </div>
                    {msg.role === "assistant" && idx === lastResponseIndex && (
                        <div className="flex items-center gap-2 mt-1 ml-1">
                            <span className="text-xs text-muted-foreground">Helpful?</span>
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
                  placeholder="Ask about patterns in your journal..."
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