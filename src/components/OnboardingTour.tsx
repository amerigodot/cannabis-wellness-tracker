import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Bell, LineChart, ArrowRight, Check, X } from "lucide-react";

interface OnboardingTourProps {
  isOpen: boolean;
  onComplete: () => void;
}

const STEPS = [
  {
    icon: Calendar,
    title: "Create Your First Entry",
    description: "Start by logging your first cannabis consumption. Add details like strain, dosage, method, and how you're feeling.",
    target: "new-entry-card",
    position: "bottom" as const,
  },
  {
    icon: Bell,
    title: "Set Up Reminders",
    description: "Stay consistent with smart reminders. Set up daily, weekly, or monthly notifications to help you remember to track your usage.",
    target: "reminders-section",
    position: "top" as const,
  },
  {
    icon: LineChart,
    title: "View Your Insights",
    description: "Discover patterns in your usage with visual trends and analytics. See which strains work best and track effects over time.",
    target: "insights-section",
    position: "top" as const,
  },
];

export const OnboardingTour = ({ isOpen, onComplete }: OnboardingTourProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  
  useEffect(() => {
    if (!isOpen) return;
    
    const updatePosition = () => {
      const step = STEPS[currentStep];
      const targetElement = document.getElementById(step.target);
      
      if (targetElement) {
        const rect = targetElement.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
        
        setTooltipPosition({
          top: rect.top + scrollTop + (step.position === "bottom" ? rect.height + 20 : -20),
          left: rect.left + scrollLeft + rect.width / 2,
        });
        
        // Scroll element into view
        targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition);
    
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition);
    };
  }, [currentStep, isOpen]);
  
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
  
  if (!isOpen) return null;
  
  const step = STEPS[currentStep];
  const StepIcon = step.icon;
  const isLastStep = currentStep === STEPS.length - 1;
  
  return (
    <>
      {/* Backdrop with spotlight effect */}
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" onClick={handleSkip} />
      
      {/* Highlight ring around target element */}
      <style>
        {`
          #${step.target} {
            position: relative;
            z-index: 51;
            box-shadow: 0 0 0 4px hsl(var(--primary)), 0 0 0 9999px rgba(0, 0, 0, 0.5);
            border-radius: 0.5rem;
          }
        `}
      </style>
      
      {/* Tooltip card */}
      <Card 
        className="fixed z-[52] w-[90vw] max-w-md shadow-lg animate-in fade-in-0 zoom-in-95"
        style={{
          top: `${tooltipPosition.top}px`,
          left: `${tooltipPosition.left}px`,
          transform: step.position === "bottom" ? "translateX(-50%)" : "translate(-50%, -100%)",
        }}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <StepIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{step.title}</CardTitle>
                <CardDescription className="text-xs mt-1">
                  Step {currentStep + 1} of {STEPS.length}
                </CardDescription>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 -mt-1 -mr-2" onClick={handleSkip}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            {step.description}
          </p>
          
          <div className="flex justify-center gap-2">
            {STEPS.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 rounded-full transition-all ${
                  index === currentStep 
                    ? "w-8 bg-primary" 
                    : index < currentStep 
                    ? "w-1.5 bg-primary/50" 
                    : "w-1.5 bg-muted"
                }`}
              />
            ))}
          </div>
          
          <div className="flex gap-2 justify-between">
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
          </div>
        </CardContent>
      </Card>
    </>
  );
};
