import { Award, Lock, Sparkles, TrendingUp, Trophy } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AchievementBadgesProps {
  entryCount: number;
}

const MILESTONES = [
  {
    count: 10,
    title: "Awareness Builder",
    description: "Build awareness of your patterns",
    icon: Sparkles,
    color: "from-purple-500 to-pink-500",
  },
  {
    count: 50,
    title: "Insight Seeker",
    description: "Unlock valuable insights",
    icon: TrendingUp,
    color: "from-blue-500 to-cyan-500",
  },
  {
    count: 100,
    title: "Wellness Master",
    description: "Master your wellness journey",
    icon: Trophy,
    color: "from-amber-500 to-orange-500",
  },
];

export function AchievementBadges({ entryCount }: AchievementBadgesProps) {
  return (
    <Card className="mb-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Your Achievements
        </CardTitle>
        <CardDescription>
          {entryCount} {entryCount === 1 ? 'entry' : 'entries'} logged
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {MILESTONES.map((milestone) => {
            const isUnlocked = entryCount >= milestone.count;
            const IconComponent = milestone.icon;
            
            return (
              <div
                key={milestone.count}
                className={cn(
                  "relative p-4 rounded-lg border-2 transition-all duration-300",
                  isUnlocked
                    ? "border-primary bg-gradient-to-br from-primary/10 to-primary/5 animate-in fade-in scale-in"
                    : "border-muted bg-muted/30 opacity-60"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "p-2.5 rounded-full shrink-0",
                      isUnlocked
                        ? `bg-gradient-to-br ${milestone.color} text-white shadow-lg`
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isUnlocked ? (
                      <IconComponent className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm mb-0.5">
                      {milestone.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {milestone.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all duration-500 rounded-full",
                            isUnlocked
                              ? `bg-gradient-to-r ${milestone.color}`
                              : "bg-muted-foreground/30"
                          )}
                          style={{
                            width: `${Math.min((entryCount / milestone.count) * 100, 100)}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground shrink-0">
                        {isUnlocked ? "✓" : `${milestone.count}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
