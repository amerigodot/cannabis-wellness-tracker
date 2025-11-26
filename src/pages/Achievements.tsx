import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Award, ArrowLeft, Lock, Sparkles, TrendingUp, Trophy, Calendar, Activity, Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";

interface JournalEntry {
  id: string;
  created_at: string;
}

const MILESTONES = [
  {
    count: 10,
    title: "Awareness Builder",
    description: "Build awareness of your patterns and responses",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
    benefits: [
      "Start recognizing patterns in your experiences",
      "Understand which strains work best for you",
      "Identify optimal dosages and methods",
    ],
  },
  {
    count: 50,
    title: "Insight Seeker",
    description: "Unlock valuable insights and optimize your experience",
    icon: TrendingUp,
    color: "from-blue-500 to-cyan-500",
    benefits: [
      "Deep understanding of your wellness patterns",
      "Identify correlations between activities and effects",
      "Optimize timing and dosage for desired outcomes",
    ],
  },
  {
    count: 100,
    title: "Wellness Master",
    description: "Master your wellness journey with comprehensive data",
    icon: Trophy,
    color: "from-amber-500 to-orange-500",
    benefits: [
      "Complete mastery of your wellness journey",
      "Expert-level pattern recognition",
      "Fully personalized optimization strategies",
    ],
  },
];

export default function Achievements() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check for demo mode
    const demoMode = localStorage.getItem("demoMode");
    if (demoMode) {
      setIsDemoMode(true);
      setLoading(false);
      return;
    }

    // Check authentication
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
      .select("id, created_at")
      .eq("user_id", userId)
      .eq("is_deleted", false)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching entries:", error);
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const entryCount = entries.length;
  const nextMilestone = MILESTONES.find((m) => m.count > entryCount);
  const lastUnlockedMilestone = [...MILESTONES]
    .reverse()
    .find((m) => m.count <= entryCount);

  // Calculate progress history
  const progressHistory = MILESTONES.map((milestone) => {
    const milestoneEntry = entries.find((_, index) => index + 1 === milestone.count);
    return {
      ...milestone,
      unlockedAt: milestoneEntry ? milestoneEntry.created_at : null,
      isUnlocked: entryCount >= milestone.count,
    };
  });

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (isDemoMode) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          <div className="mb-6 flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <ThemeToggle />
          </div>

          <Card className="p-8 text-center">
            <Award className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Achievements Available After Sign Up</h2>
            <p className="text-muted-foreground mb-6">
              Track your progress and unlock achievement badges as you build your wellness journal.
            </p>
            <Button onClick={() => navigate("/auth")}>
              Sign Up to Track Progress
            </Button>
          </Card>
        </div>
      </div>
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
              <Award className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
              Your Achievements
            </h1>
            <p className="text-muted-foreground text-lg">
              Track your wellness journey milestones
            </p>
          </div>
        </div>

        {/* Overall Statistics */}
        <Card className="mb-8 shadow-[var(--shadow-soft)] animate-in fade-in slide-in-from-bottom-2 duration-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Your Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                <p className="text-4xl font-bold text-primary mb-1">{entryCount}</p>
                <p className="text-sm text-muted-foreground">Total Entries</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-secondary/10 to-secondary/5 border border-secondary/20">
                <p className="text-4xl font-bold text-secondary mb-1">
                  {progressHistory.filter((p) => p.isUnlocked).length}
                </p>
                <p className="text-sm text-muted-foreground">Badges Unlocked</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20">
                <p className="text-4xl font-bold text-accent mb-1">
                  {nextMilestone ? nextMilestone.count - entryCount : 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  {nextMilestone ? "To Next Badge" : "All Unlocked!"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Next Milestone */}
        {nextMilestone && (
          <Card className="mb-8 shadow-[var(--shadow-soft)] animate-in fade-in slide-in-from-bottom-3 duration-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary" />
                Next Milestone
              </CardTitle>
              <CardDescription>Keep tracking to unlock your next achievement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "p-3 rounded-full shrink-0",
                    `bg-gradient-to-br ${nextMilestone.color} text-white shadow-lg`
                  )}
                >
                  <nextMilestone.icon className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-1">{nextMilestone.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {nextMilestone.description}
                  </p>
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {entryCount} / {nextMilestone.count} entries
                      </span>
                    </div>
                    <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-500 rounded-full",
                          `bg-gradient-to-r ${nextMilestone.color}`
                        )}
                        style={{
                          width: `${(entryCount / nextMilestone.count) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">What you'll unlock:</p>
                    <ul className="space-y-1.5">
                      {nextMilestone.benefits.map((benefit, index) => (
                        <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-0.5">•</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* All Achievements */}
        <Card className="mb-8 shadow-[var(--shadow-soft)] animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-primary" />
              All Achievements
            </CardTitle>
            <CardDescription>Your complete milestone collection</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {progressHistory.map((achievement) => {
              const IconComponent = achievement.icon;
              return (
                <div
                  key={achievement.count}
                  className={cn(
                    "relative p-6 rounded-lg border-2 transition-all duration-300",
                    achievement.isUnlocked
                      ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5"
                      : "border-muted bg-muted/30 opacity-60"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "p-3 rounded-full shrink-0",
                        achievement.isUnlocked
                          ? `bg-gradient-to-br ${achievement.color} text-white shadow-lg`
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      {achievement.isUnlocked ? (
                        <IconComponent className="w-6 h-6" />
                      ) : (
                        <Lock className="w-6 h-6" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="text-xl font-semibold mb-1">
                            {achievement.title}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {achievement.description}
                          </p>
                        </div>
                        {achievement.isUnlocked && (
                          <Badge
                            variant="secondary"
                            className={cn(
                              "bg-gradient-to-r text-white",
                              achievement.color
                            )}
                          >
                            Unlocked
                          </Badge>
                        )}
                      </div>

                      {achievement.unlockedAt && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Unlocked on {format(parseISO(achievement.unlockedAt), "MMMM d, yyyy")}
                          </span>
                        </div>
                      )}

                      <div className="bg-background/50 rounded-lg p-4">
                        <p className="text-sm font-medium mb-2">Benefits:</p>
                        <ul className="space-y-1.5">
                          {achievement.benefits.map((benefit, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-0.5">✓</span>
                              {benefit}
                            </li>
                          ))}
                        </ul>
                      </div>

                      {!achievement.isUnlocked && (
                        <div className="mt-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Progress</span>
                            <span className="text-sm text-muted-foreground">
                              {entryCount} / {achievement.count} entries
                            </span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-muted-foreground/30 transition-all duration-500 rounded-full"
                              style={{
                                width: `${Math.min((entryCount / achievement.count) * 100, 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Motivational Section */}
        {entryCount < 100 && (
          <Card className="shadow-[var(--shadow-soft)] animate-in fade-in slide-in-from-bottom-5 duration-700">
            <CardContent className="p-6 text-center">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-lg font-semibold mb-2">Keep Going!</h3>
              <p className="text-muted-foreground">
                {lastUnlockedMilestone
                  ? `You've unlocked ${lastUnlockedMilestone.title}! Continue tracking to reach the next milestone.`
                  : "Start your journey by tracking your first 10 entries to unlock your first achievement."}
              </p>
            </CardContent>
          </Card>
        )}

        {entryCount >= 100 && (
          <Card className="shadow-[var(--shadow-soft)] animate-in fade-in slide-in-from-bottom-5 duration-700 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardContent className="p-6 text-center">
              <Trophy className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h3 className="text-2xl font-bold mb-2">Congratulations!</h3>
              <p className="text-muted-foreground">
                You've unlocked all achievements and mastered your wellness journey. Keep tracking to maintain your insights and continue optimizing your experience.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
