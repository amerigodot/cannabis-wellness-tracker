import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";
import { cn } from "@/lib/utils";
import { Calendar, LineChart, Bell, Sparkles } from "lucide-react";

export function LandingPage() {
  const navigate = useNavigate();
  const [activeFeature, setActiveFeature] = useState<'calendar' | 'insights' | 'reminders' | null>(null);

  const handleDemoMode = () => {
    localStorage.setItem("demoMode", "true");
    window.location.reload(); // Reload to trigger the demo mode
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
    <>
      <SEO 
        title="Medical Marijuana Journal - Track Your Wellness Journey"
        description="Private, encrypted journal to track medical marijuana use. Monitor THC/CBD levels, discover patterns, and optimize your wellness with smart insights and AI-powered analysis."
        keywords="medical marijuana journal, cannabis tracker, THC CBD tracking, wellness journal, strain tracking, private health journal"
        canonicalUrl="https://medical-marijuana-journal.lovable.app/"
      />
      <div className="min-h-screen flex flex-col bg-background">
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

      <main className="flex-1 flex flex-col">
        {/* Hero Section - Demo Mode Emphasized */}
        <section className="flex items-center justify-center px-4 py-12 md:py-16">
          <div className="w-full max-w-4xl text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Track Your Cannabis Wellness Journey
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl mb-10 max-w-2xl mx-auto">
              Discover patterns, optimize your experience, and take control of your wellness with private, encrypted tracking
            </p>
            
            {/* Demo Mode - Primary CTA */}
            <div className="mb-6">
              <Button 
                size="lg"
                className="text-lg px-8 py-6 h-auto relative animate-scale-in hover:scale-105 transition-transform shadow-lg"
                onClick={handleDemoMode}
              >
                <Sparkles className="w-6 h-6 mr-2 text-accent-foreground" />
                Try Demo Mode - No Signup Required
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-semibold px-3 py-1 rounded-full animate-pulse">
                  Free
                </span>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mb-6">
              Explore the full app with sample data • Read-only mode • See all features instantly
            </p>
            
            <Button 
              variant="outline"
              size="lg"
              onClick={() => navigate("/auth")}
              className="hover:border-primary hover:text-primary transition-colors"
            >
              Or Create Your Free Account
            </Button>
          </div>
        </section>

        {/* App Functionality Section */}
        <section className="px-4 py-12 bg-muted/30">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-4">Everything You Need to Optimize Your Wellness</h2>
            <p className="text-center text-muted-foreground mb-10 max-w-2xl mx-auto">
              Comprehensive tracking tools with powerful insights to help you discover what works best
            </p>
            
            <div className="grid md:grid-cols-3 gap-6">
              <button 
                onClick={() => setActiveFeature('calendar')}
                className="flex flex-col items-center text-center p-8 rounded-lg bg-card border-2 border-border shadow-soft hover:border-primary hover:shadow-hover transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Calendar className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Calendar Tracking</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Log entries with detailed consumption info, effects, and personal notes
                </p>
                <p className="text-xs text-primary font-medium group-hover:underline">Click to learn more →</p>
              </button>
              
              <button 
                onClick={() => setActiveFeature('insights')}
                className="flex flex-col items-center text-center p-8 rounded-lg bg-card border-2 border-border shadow-soft hover:border-primary hover:shadow-hover transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <LineChart className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Insights & Trends</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Visualize your usage patterns and understand what works best for you
                </p>
                <p className="text-xs text-primary font-medium group-hover:underline">Click to learn more →</p>
              </button>
              
              <button 
                onClick={() => setActiveFeature('reminders')}
                className="flex flex-col items-center text-center p-8 rounded-lg bg-card border-2 border-border shadow-soft hover:border-primary hover:shadow-hover transition-all cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Bell className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Smart Reminders</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Set recurring reminders to maintain consistent tracking habits
                </p>
                <p className="text-xs text-primary font-medium group-hover:underline">Click to learn more →</p>
              </button>
            </div>
          </div>
        </section>

        {/* Resources & Learning Section */}
        <section className="px-4 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Expert Guides & Resources</h2>
              <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
                Learn from comprehensive guides on tracking, strain selection, dosage optimization, and wellness strategies
              </p>
              <Button
                size="lg"
                onClick={() => navigate('/blog')}
                className="gap-2"
              >
                Explore All Articles
                <Sparkles className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <button 
                onClick={() => navigate('/blog/complete-guide-tracking-medical-marijuana')}
                className="flex flex-col text-left p-6 rounded-lg bg-card border-2 border-border shadow-soft hover:border-primary hover:shadow-hover transition-all cursor-pointer group"
              >
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">Complete Tracking Guide</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Learn why tracking is essential and how to do it effectively
                </p>
                <span className="text-xs text-primary font-medium">8 min read →</span>
              </button>

              <button 
                onClick={() => navigate('/blog/understanding-thc-cbd-ratios-wellness')}
                className="flex flex-col text-left p-6 rounded-lg bg-card border-2 border-border shadow-soft hover:border-primary hover:shadow-hover transition-all cursor-pointer group"
              >
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">THC:CBD Ratios Explained</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Discover which cannabinoid ratios work best for your wellness goals
                </p>
                <span className="text-xs text-primary font-medium">6 min read →</span>
              </button>

              <button 
                onClick={() => navigate('/blog/top-strains-chronic-pain-relief')}
                className="flex flex-col text-left p-6 rounded-lg bg-card border-2 border-border shadow-soft hover:border-primary hover:shadow-hover transition-all cursor-pointer group"
              >
                <h3 className="font-semibold mb-2 group-hover:text-primary transition-colors">Top Pain Relief Strains</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  Comprehensive guide to the most effective strains for chronic pain
                </p>
                <span className="text-xs text-primary font-medium">10 min read →</span>
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
      </div>
    </>
  );
}
