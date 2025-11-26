import confetti from "canvas-confetti";

export const MILESTONES = [10, 50, 100];

export const MILESTONE_DETAILS = {
  10: {
    title: "Awareness Builder",
    message: "You've unlocked the Awareness Builder badge! 🌟",
    icon: "✨",
  },
  50: {
    title: "Insight Seeker",
    message: "Amazing! You've unlocked the Insight Seeker badge! 📊",
    icon: "📈",
  },
  100: {
    title: "Wellness Master",
    message: "Incredible! You've unlocked the Wellness Master badge! 🏆",
    icon: "🏆",
  },
};

export const triggerMilestoneCelebration = (milestone: number) => {
  const details = MILESTONE_DETAILS[milestone as keyof typeof MILESTONE_DETAILS];
  
  if (!details) return;

  // Trigger confetti animation
  const duration = 3000;
  const end = Date.now() + duration;

  const colors = milestone === 10 
    ? ['#9b87f5', '#F97FEF'] 
    : milestone === 50 
    ? ['#0EA5E9', '#06B6D4'] 
    : ['#F59E0B', '#F97316'];

  const frame = () => {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 55,
      origin: { x: 0 },
      colors: colors,
    });
    
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 55,
      origin: { x: 1 },
      colors: colors,
    });

    if (Date.now() < end) {
      requestAnimationFrame(frame);
    }
  };

  frame();

  // Big burst in the center
  setTimeout(() => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
    });
  }, 300);
};
