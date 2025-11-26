import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ArrowLeft, FileText, TrendingUp, Target, Lock, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface JournalEntry {
  id: string;
  created_at: string;
  consumption_time: string;
  strain: string;
  dosage: string;
  method: string;
  observations: string[];
  activities: string[];
  negative_side_effects: string[];
}

const TOOLS = [
  {
    id: "report",
    title: "Comprehensive Wellness Report",
    description: "Generate an in-depth analysis of your usage patterns, effectiveness, and personalized recommendations",
    icon: FileText,
    requiredEntries: 10,
    badge: "Awareness Builder",
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "correlations",
    title: "Correlation & Timing Analysis",
    description: "Discover temporal patterns and optimal timing strategies for maximum effectiveness",
    icon: TrendingUp,
    requiredEntries: 50,
    badge: "Insight Seeker",
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "optimize",
    title: "Goal-Based Optimization Strategy",
    description: "Get a personalized wellness optimization plan tailored to your specific goals",
    icon: Target,
    requiredEntries: 100,
    badge: "Wellness Master",
    color: "from-amber-500 to-orange-500",
  },
];

export default function Tools() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeToolId, setActiveToolId] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string>("");
  const [goals, setGoals] = useState<string>("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        fetchEntries(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
        fetchEntries(session.user.id);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchEntries = async (userId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching entries:", error);
      toast.error("Failed to load entries");
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    setResult("");

    try {
      const { data, error } = await supabase.functions.invoke("generate-wellness-report", {
        body: { entries },
      });

      if (error) {
        if (error.message.includes("429") || error.message.includes("rate limit")) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (error.message.includes("402") || error.message.includes("credits")) {
          toast.error("AI credits required. Please add funds to continue.");
        } else {
          toast.error("Failed to generate report");
        }
        console.error("Error generating report:", error);
        return;
      }

      setResult(data.report);
      toast.success("Report generated successfully!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while generating the report");
    } finally {
      setGenerating(false);
    }
  };

  const handleAnalyzeCorrelations = async () => {
    setGenerating(true);
    setResult("");

    try {
      const { data, error } = await supabase.functions.invoke("analyze-correlations", {
        body: { entries },
      });

      if (error) {
        if (error.message.includes("429") || error.message.includes("rate limit")) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (error.message.includes("402") || error.message.includes("credits")) {
          toast.error("AI credits required. Please add funds to continue.");
        } else {
          toast.error("Failed to analyze correlations");
        }
        console.error("Error analyzing correlations:", error);
        return;
      }

      setResult(data.analysis);
      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred during analysis");
    } finally {
      setGenerating(false);
    }
  };

  const handleOptimizeWellness = async () => {
    if (!goals.trim()) {
      toast.error("Please enter your wellness goals");
      return;
    }

    setGenerating(true);
    setResult("");

    try {
      const { data, error } = await supabase.functions.invoke("optimize-wellness", {
        body: { entries, goals },
      });

      if (error) {
        if (error.message.includes("429") || error.message.includes("rate limit")) {
          toast.error("Rate limit exceeded. Please try again in a moment.");
        } else if (error.message.includes("402") || error.message.includes("credits")) {
          toast.error("AI credits required. Please add funds to continue.");
        } else {
          toast.error("Failed to generate optimization strategy");
        }
        console.error("Error optimizing wellness:", error);
        return;
      }

      setResult(data.strategy);
      toast.success("Optimization strategy generated!");
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred while generating strategy");
    } finally {
      setGenerating(false);
    }
  };

  const handleToolAction = async (toolId: string) => {
    setActiveToolId(toolId);
    setResult("");

    switch (toolId) {
      case "report":
        await handleGenerateReport();
        break;
      case "correlations":
        await handleAnalyzeCorrelations();
        break;
      case "optimize":
        // Don't generate immediately, let user enter goals first
        break;
    }
  };

  const entryCount = entries.length;

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center justify-between mb-6">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <ThemeToggle />
          </div>

          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <Sparkles className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
              Wellness Tools
            </h1>
            <p className="text-muted-foreground text-lg">
              AI-powered insights unlock as you progress
            </p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6 mb-8">
          {TOOLS.map((tool) => {
            const isUnlocked = entryCount >= tool.requiredEntries;
            const IconComponent = tool.icon;
            const isActive = activeToolId === tool.id;

            return (
              <Card
                key={tool.id}
                className={`${
                  isUnlocked
                    ? "shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow"
                    : "opacity-60"
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div
                        className={`p-3 rounded-full ${
                          isUnlocked
                            ? `bg-gradient-to-br ${tool.color} text-white shadow-lg`
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isUnlocked ? <IconComponent className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-1">{tool.title}</CardTitle>
                        <CardDescription className="mb-2">{tool.description}</CardDescription>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>Unlocks with {tool.badge} badge</span>
                          <span className="text-xs">
                            ({tool.requiredEntries} entries)
                          </span>
                        </div>
                      </div>
                    </div>
                    {isUnlocked && (
                      <Button
                        onClick={() => handleToolAction(tool.id)}
                        disabled={generating}
                        className={`bg-gradient-to-r ${tool.color} hover:opacity-90`}
                      >
                        {generating && isActive ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          "Use Tool"
                        )}
                      </Button>
                    )}
                  </div>
                </CardHeader>

                {isActive && tool.id === "optimize" && !result && (
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Your Wellness Goals
                        </label>
                        <Textarea
                          value={goals}
                          onChange={(e) => setGoals(e.target.value)}
                          placeholder="E.g., Better sleep, reduced anxiety, improved focus, pain management, energy throughout the day..."
                          className="min-h-[120px]"
                        />
                      </div>
                      <Button
                        onClick={handleOptimizeWellness}
                        disabled={generating || !goals.trim()}
                        className={`w-full bg-gradient-to-r ${tool.color} hover:opacity-90`}
                      >
                        {generating ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Generating Strategy...
                          </>
                        ) : (
                          "Generate Optimization Strategy"
                        )}
                      </Button>
                    </div>
                  </CardContent>
                )}

                {isActive && result && (
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown>{result}</ReactMarkdown>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
