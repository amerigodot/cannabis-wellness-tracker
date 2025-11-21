import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Shield, Lock, EyeOff, Calendar, LineChart, Bell, Sparkles } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState<'calendar' | 'insights' | 'reminders' | null>(null);

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/");
      }
    });
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
      },
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Welcome! Redirecting to your dashboard...",
      });
      // Redirect to main page after successful signup
      navigate("/");
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      navigate("/");
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDemoMode = () => {
    localStorage.setItem("demoMode", "true");
    navigate("/");
  };

  const features = ['calendar', 'insights', 'reminders'] as const;
  
  const handleNextFeature = () => {
    const currentIndex = features.indexOf(activeFeature!);
    if (currentIndex < features.length - 1) {
      setActiveFeature(features[currentIndex + 1]);
    }
  };
  
  const handlePreviousFeature = () => {
    const currentIndex = features.indexOf(activeFeature!);
    if (currentIndex > 0) {
      setActiveFeature(features[currentIndex - 1]);
    }
  };
  
  const getCurrentStep = () => {
    if (!activeFeature) return 0;
    return features.indexOf(activeFeature) + 1;
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      {/* Feature Detail Dialogs */}
      <Dialog open={activeFeature === 'calendar'} onOpenChange={() => setActiveFeature(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">Feature {getCurrentStep()} of 3</span>
              <div className="flex gap-1">
                {features.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1.5 w-8 rounded-full transition-colors",
                      index < getCurrentStep() ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl text-center">Calendar Tracking</DialogTitle>
            <DialogDescription className="text-base space-y-4 pt-4">
              <p>
                <strong className="text-foreground">Comprehensive Journal Entries:</strong> Record every detail of your cannabis consumption in one place. Log the strain name, dosage amount with units (grams, milliliters, or milligrams), and consumption method (vape, smoke, oil, edible, tincture, or topical).
              </p>
              <p>
                <strong className="text-foreground">Track Your Experience:</strong> Document how you feel with customizable observations like pain relief, relaxation, focus, or creativity. Note what activities you engaged in—whether social, creative, exercise, or meditation. Keep track of any negative side effects such as dry mouth, dizziness, or anxiety.
              </p>
              <p>
                <strong className="text-foreground">Personal Notes & Timestamps:</strong> Add private notes to any entry for context you want to remember later. Each entry automatically records when it was created, and you can also specify the exact time of consumption for accurate tracking.
              </p>
              <p>
                <strong className="text-foreground">Unified Calendar View:</strong> See all your journal entries and reminders together in a visual calendar interface. Quickly identify patterns by viewing entries from specific dates, and access all your historical data in one organized timeline.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => setActiveFeature(null)}
            >
              Close
            </Button>
            <Button
              onClick={handleNextFeature}
            >
              Next: Insights & Trends →
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeFeature === 'insights'} onOpenChange={() => setActiveFeature(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">Feature {getCurrentStep()} of 3</span>
              <div className="flex gap-1">
                {features.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1.5 w-8 rounded-full transition-colors",
                      index < getCurrentStep() ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <LineChart className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl text-center">Insights & Trends</DialogTitle>
            <DialogDescription className="text-base space-y-4 pt-4">
              <p>
                <strong className="text-foreground">Visualize Your Patterns:</strong> Transform your journal entries into meaningful charts and graphs. See how your observations, activities, and side effects trend over time with intuitive visualizations that make complex data easy to understand.
              </p>
              <p>
                <strong className="text-foreground">Smart Filtering:</strong> Focus on what matters most by filtering your data by specific badges (observations, activities, or side effects), consumption methods (vape, smoke, edible, etc.), or time ranges (today, this week, this month, or all time).
              </p>
              <p>
                <strong className="text-foreground">Adaptive Time Grouping:</strong> The insights chart automatically adjusts its time scale based on your data. Short-term data is grouped by day for precision, mid-term by week for weekly patterns, and long-term by month for broader trends—ensuring you always see the most relevant view.
              </p>
              <p>
                <strong className="text-foreground">Discover What Works:</strong> Identify which strains, methods, and dosages correlate with your desired effects. Understand when negative side effects occur and adjust your approach accordingly. Use these insights to optimize your wellness journey and make informed decisions.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePreviousFeature}
            >
              ← Back: Calendar
            </Button>
            <Button
              onClick={handleNextFeature}
            >
              Next: Smart Reminders →
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={activeFeature === 'reminders'} onOpenChange={() => setActiveFeature(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground font-medium">Feature {getCurrentStep()} of 3</span>
              <div className="flex gap-1">
                {features.map((_, index) => (
                  <div
                    key={index}
                    className={cn(
                      "h-1.5 w-8 rounded-full transition-colors",
                      index < getCurrentStep() ? "bg-primary" : "bg-muted"
                    )}
                  />
                ))}
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-primary" />
            </div>
            <DialogTitle className="text-2xl text-center">Smart Reminders</DialogTitle>
            <DialogDescription className="text-base space-y-4 pt-4">
              <p>
                <strong className="text-foreground">Stay Consistent:</strong> Build a reliable tracking habit with customizable reminders. Set notifications to prompt you when it's time to log a new journal entry, take your medication, or review your progress.
              </p>
              <p>
                <strong className="text-foreground">Flexible Scheduling:</strong> Create reminders with custom titles and specific times that fit your routine. Choose from multiple recurrence options: one-time reminders for special occasions, daily reminders for regular habits, weekly check-ins, or monthly reviews.
              </p>
              <p>
                <strong className="text-foreground">Easy Management:</strong> View all your active reminders in one place. Toggle reminders on or off as your needs change without deleting them permanently. Delete reminders you no longer need with a single click.
              </p>
              <p>
                <strong className="text-foreground">Calendar Integration:</strong> See your upcoming reminders directly in the calendar view alongside your journal entries. This unified view helps you plan ahead and ensures you never miss an important tracking moment or medication schedule.
              </p>
              <p>
                <strong className="text-foreground">Browser Notifications:</strong> Receive timely toast notifications when reminders trigger, keeping you on track even when you're not actively viewing the app. Stay consistent with your wellness routine effortlessly.
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-between items-center pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePreviousFeature}
            >
              ← Back: Insights
            </Button>
            <Button
              onClick={() => setActiveFeature(null)}
            >
              Got it!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <main className="w-full max-w-4xl">
        {/* Features Preview Section */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Track Your Cannabis Wellness Journey
          </h1>
          <p className="text-muted-foreground text-lg mb-8">
            Discover patterns, optimize your experience, and take control of your wellness
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <button 
              onClick={() => setActiveFeature('calendar')}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-card border-2 border-border shadow-soft hover:border-primary hover:shadow-hover transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Calendar Tracking</h3>
              <p className="text-sm text-muted-foreground">
                Log entries with detailed consumption info, effects, and personal notes
              </p>
              <p className="text-xs text-primary mt-2 font-medium">Click to learn more →</p>
            </button>
            
            <button 
              onClick={() => setActiveFeature('insights')}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-card border-2 border-border shadow-soft hover:border-primary hover:shadow-hover transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <LineChart className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Insights & Trends</h3>
              <p className="text-sm text-muted-foreground">
                Visualize your usage patterns and understand what works best for you
              </p>
              <p className="text-xs text-primary mt-2 font-medium">Click to learn more →</p>
            </button>
            
            <button 
              onClick={() => setActiveFeature('reminders')}
              className="flex flex-col items-center text-center p-6 rounded-lg bg-card border-2 border-border shadow-soft hover:border-primary hover:shadow-hover transition-all cursor-pointer"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Bell className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Smart Reminders</h3>
              <p className="text-sm text-muted-foreground">
                Set recurring reminders to maintain consistent tracking habits
              </p>
              <p className="text-xs text-primary mt-2 font-medium">Click to learn more →</p>
            </button>
          </div>
          
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <Button 
                variant="outline" 
                size="lg"
                className="w-full max-w-xs mx-auto hover:border-primary hover:bg-primary/5 hover:text-foreground transition-colors relative" 
                onClick={handleDemoMode}
              >
                <Sparkles className="w-5 h-5 mr-2 text-accent" />
                Try Demo Mode
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-semibold px-2 py-0.5 rounded-full animate-pulse">
                  Take a look
                </span>
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Explore the app with sample data (read-only)
            </p>
          </div>
        </div>
        
        <Card className="w-full max-w-md mx-auto shadow-hover border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Medical Marijuana Journal</CardTitle>
            <CardDescription className="text-center text-base">
              Start tracking your wellness journey
            </CardDescription>
            <p className="text-center text-sm text-muted-foreground">
              Discover patterns, optimize your experience
            </p>
          </CardHeader>
          <CardContent>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={loading}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with email
                </span>
              </div>
            </div>
            
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing up..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            
            <div className="mt-6 pt-6 border-t">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex items-start gap-2">
                  <Shield className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">Your data is encrypted & private</p>
                    <p className="text-muted-foreground text-xs">End-to-end security for your wellness data</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">You own your data</p>
                    <p className="text-muted-foreground text-xs">Full control over your information</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <EyeOff className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-foreground">No ads, no data selling</p>
                    <p className="text-muted-foreground text-xs">Your privacy is our priority</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
