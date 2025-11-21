import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Bell, LineChart, ArrowRight, Check } from "lucide-react";

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
}

const STEPS = [
  {
    icon: Calendar,
    title: "Create Your First Entry",
    description: "Start by logging your first cannabis consumption. Add details like strain, dosage, method, and how you're feeling. The more you track, the more insights you'll gain.",
    highlight: "Look for the 'New Entry' card on your dashboard to get started.",
  },
  {
    icon: Bell,
    title: "Set Up Reminders",
    description: "Stay consistent with smart reminders. Set up daily, weekly, or monthly notifications to help you remember to track your usage and maintain valuable data.",
    highlight: "Find the Reminders tab to schedule your first reminder.",
  },
  {
    icon: LineChart,
    title: "View Your Insights",
    description: "Discover patterns in your usage with visual trends and analytics. See which strains work best, track effects over time, and optimize your experience.",
    highlight: "Check the Insights tab to explore your personalized data.",
  },
];

export const OnboardingTour = ({ isOpen, onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const handleNext = () => {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const handleSkip = () => {
    onComplete();
  };
  
  const step = STEPS[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === STEPS.length - 1;
  
  return (
    <Dialog open={isOpen} onOpenChange={handleSkip}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <StepIcon className="w-8 h-8 text-primary" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">{step.title}</DialogTitle>
          <DialogDescription className="text-center text-base pt-2">
            {step.description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="bg-muted/50 rounded-lg p-4 my-4">
          <p className="text-sm text-muted-foreground text-center">
            💡 <span className="font-medium">{step.highlight}</span>
          </p>
        </div>
        
        <div className="flex justify-center gap-2 mb-4">
          {STEPS.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === currentStep 
                  ? "w-8 bg-primary" 
                  : index < currentStep 
                  ? "w-2 bg-primary/50" 
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>
        
        <DialogFooter className="flex-row gap-2 sm:justify-between">
          <Button variant="ghost" onClick={handleSkip}>
            Skip Tour
          </Button>
          <Button onClick={handleNext}>
            {isLastStep ? (
              <>
                Get Started <Check className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Next <ArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
