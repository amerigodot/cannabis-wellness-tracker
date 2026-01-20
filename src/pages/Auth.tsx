import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SEO } from "@/components/SEO";
import { ArrowLeft, Target, TrendingUp, Sparkles, Award, Calendar, BarChart3, Bell, Shield, Lock, ChevronRight, ChevronLeft } from "lucide-react";

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [featureDialogOpen, setFeatureDialogOpen] = useState(false);
  const [currentFeature, setCurrentFeature] = useState(0);

  const features = [
    {
      icon: Calendar,
      title: "Before & After Tracking",
      description: "Measure actual wellness improvements",
      details: "Track wellness metrics (mood, pain, anxiety, energy, focus) before and after each session on a 1-10 scale. See real deltas (+3 mood, -5 pain) and effectiveness scores (87% Highly Effective) that quantify how well each strain works for your specific needs."
    },
    {
      icon: BarChart3,
      title: "Effectiveness Dashboard",
      description: "Data-driven strain optimization",
      details: "Visualize before vs. after comparisons across all wellness metrics. Automatically ranks strains by measured effectiveness and provides goal-based analysis showing which strains excel for pain relief, mood enhancement, anxiety reduction, energy boost, and focus improvement."
    },
    {
      icon: Bell,
      title: "Pending Entry Workflow",
      description: "Never miss the after-state",
      details: "Log before metrics and consumption details now, complete after-state later with automatic reminders based on consumption method (30-120 minutes). Ensures accurate effectiveness data captured at optimal timing without relying on memory."
    }
  ];

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

  return (
    <>
      <SEO 
        title="Sign Up - Medical Marijuana Journal"
        description="Join thousands tracking their wellness journey. Private, encrypted journal to monitor THC/CBD levels and discover patterns that work for you. Try demo mode first!"
        keywords="medical marijuana signup, cannabis journal signup, wellness tracker, private health journal"
        canonicalUrl="https://medical-marijuana-journal.lovable.app/auth"
      />
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <div className="absolute top-4 left-4 flex gap-2">
          <Button variant="ghost" onClick={() => navigate("/")} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <Button variant="ghost" onClick={() => navigate("/blog")} className="gap-2">
            Blog
          </Button>
        </div>
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
      
        <main className="w-full max-w-md space-y-6">
        {/* Hero Section */}
        <div className="text-center space-y-3 animate-in fade-in slide-in-from-top-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Start tracking your wellness journey
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover patterns, optimize your experience
          </p>
          
          {/* Trust Signals */}
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-foreground">Your data is encrypted & private</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/30">
              <Lock className="w-4 h-4 text-primary" />
              <span className="text-xs font-medium text-foreground">No ads, no data selling</span>
            </div>
          </div>
        </div>

        {/* Auth Card */}
        <Card className="w-full shadow-hover border-2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Get Started</CardTitle>
            <CardDescription className="text-center text-base">
              Create your account or sign in
            </CardDescription>
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

            <Button
              type="button"
              variant="default"
              className="w-full mt-3 bg-green-600 hover:bg-green-700"
              onClick={() => {
                localStorage.setItem("demoMode", "true");
                // Reset local data to samples if empty
                if (!localStorage.getItem("local_journal_entries")) {
                  // We'll let the hook handle initialization, just ensure flag is set
                }
                toast({
                  title: "Submission Mode Enabled",
                  description: "You are now using the app in offline mode with local storage.",
                });
                navigate("/");
              }}
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Enter Submission Mode (Offline)
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
              </div>
            </div>
            
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
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
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
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
                      disabled={loading}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Features Preview Section */}
        <Card className="w-full shadow-hover border-2 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold">Explore Features</CardTitle>
            <CardDescription>
              See what makes your wellness journey powerful
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Button
                  key={index}
                  variant="ghost"
                  className="w-full justify-start h-auto p-3 hover:bg-background hover:ring-2 hover:ring-primary/30 hover:text-foreground transition-all"
                  onClick={() => {
                    setCurrentFeature(index);
                    setFeatureDialogOpen(true);
                  }}
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="p-2 rounded-full bg-primary/10">
                      <IconComponent className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <p className="font-medium text-sm text-foreground">{feature.title}</p>
                      <p className="text-xs text-muted-foreground">{feature.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </Button>
              );
            })}
          </CardContent>
        </Card>

        {/* Journaling Milestones Promotion Card */}
        <Card className="w-full shadow-hover border-2 bg-gradient-to-br from-primary/5 to-accent/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Target className="w-5 h-5 text-primary" />
              Your Journey to Wellness
            </CardTitle>
            <CardDescription>
              Track measurable progress with every entry
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-full bg-primary/15 border border-primary/20">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">10 Entries</p>
                <p className="text-xs text-muted-foreground">Build awareness of your patterns and responses</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-full bg-primary/15 border border-primary/20">
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">50 Entries</p>
                <p className="text-xs text-muted-foreground">Unlock valuable insights and optimize your experience</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-1 p-2 rounded-full bg-primary/15 border border-primary/20">
                <Award className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">100+ Entries</p>
                <p className="text-xs text-muted-foreground">Master your wellness journey with comprehensive data</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Features Dialog */}
        <Dialog open={featureDialogOpen} onOpenChange={setFeatureDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <div className="flex items-center gap-3 mb-2">
                {(() => {
                  const IconComponent = features[currentFeature].icon;
                  return (
                    <div className="p-3 rounded-full bg-primary/10">
                      <IconComponent className="w-6 h-6 text-primary" />
                    </div>
                  );
                })()}
                <div className="flex-1">
                  <DialogTitle>{features[currentFeature].title}</DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    Feature {currentFeature + 1} of {features.length}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {features[currentFeature].details}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentFeature((prev) => (prev === 0 ? features.length - 1 : prev - 1))}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </Button>
                <div className="flex gap-1">
                  {features.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 w-1.5 rounded-full transition-colors ${
                        index === currentFeature ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCurrentFeature((prev) => (prev === features.length - 1 ? 0 : prev + 1))}
                  className="gap-2"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>
      </div>
    </>
  );
}
