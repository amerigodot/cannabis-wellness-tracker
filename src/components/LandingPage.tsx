import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { cn } from "@/lib/utils";
import { Calendar, LineChart, Bell, Sparkles, Shield, Lock, EyeOff } from "lucide-react";

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

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl text-center">
          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Track Your Cannabis Wellness Journey
          </h1>
          <p className="text-muted-foreground text-lg mb-8 text-justify max-w-2xl mx-auto">
            Discover patterns, optimize your experience, and take control of your wellness
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button 
              size="lg"
              onClick={() => navigate("/auth")}
              className="w-full sm:w-auto"
            >
              Get Started
            </Button>
            
            <div className="relative">
              <Button 
                variant="outline" 
                size="lg"
                className="w-full sm:w-auto hover:border-primary hover:bg-primary/5 hover:text-foreground transition-colors relative" 
                onClick={handleDemoMode}
              >
                <Sparkles className="w-5 h-5 mr-2 text-accent" />
                Try Demo Mode
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-semibold px-2 py-0.5 rounded-full">
                  Take a look
                </span>
              </Button>
            </div>
          </div>
          
          <p className="text-xs text-muted-foreground mb-8">
            Explore the app with sample data (read-only) • No signup required
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
          
          {/* Trust Signals */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Lock className="w-4 h-4" />
              <span>Encrypted & Private</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>You Own Your Data</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <EyeOff className="w-4 h-4" />
              <span>No Ads</span>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="w-full border-t border-border py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row justify-center items-center gap-6 text-sm text-muted-foreground">
            <a 
              href="/privacy" 
              className="hover:text-foreground transition-colors"
            >
              Privacy Policy
            </a>
            <a 
              href="/terms" 
              className="hover:text-foreground transition-colors"
            >
              Terms of Service
            </a>
            <a 
              href="/donate" 
              className="hover:text-foreground transition-colors"
            >
              Support Us
            </a>
          </div>
          <p className="text-center text-xs text-muted-foreground mt-4">
            © {new Date().getFullYear()} Cannabis Wellness Tracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
