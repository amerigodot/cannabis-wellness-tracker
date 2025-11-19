import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface JournalEntry {
  id: string;
  created_at: string;
  dosage: string;
  strain: string;
  observations?: string[];
  activities?: string[];
  negative_side_effects?: string[];
}

interface InsightsChartProps {
  entries: JournalEntry[];
}

export const InsightsChart = ({ entries }: InsightsChartProps) => {
  const [selectedBadges, setSelectedBadges] = useState<Set<string>>(new Set());
  const [topCount, setTopCount] = useState<3 | 5 | 10>(5);

  // Calculate top N most used badges by type
  const getTopBadgesByType = () => {
    const observationCounts: Record<string, number> = {};
    const activityCounts: Record<string, number> = {};
    const sideEffectCounts: Record<string, number> = {};
    
    entries.forEach(entry => {
      (entry.observations || []).forEach(obs => {
        observationCounts[obs] = (observationCounts[obs] || 0) + 1;
      });
      
      (entry.activities || []).forEach(act => {
        activityCounts[act] = (activityCounts[act] || 0) + 1;
      });
      
      (entry.negative_side_effects || []).forEach(eff => {
        sideEffectCounts[eff] = (sideEffectCounts[eff] || 0) + 1;
      });
    });
    
    const sortAndLimit = (counts: Record<string, number>) => 
      Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, topCount);
    
    return {
      observations: sortAndLimit(observationCounts),
      activities: sortAndLimit(activityCounts),
      sideEffects: sortAndLimit(sideEffectCounts)
    };
  };

  const topBadges = getTopBadgesByType();

  // Calculate badge trends over time
  const getBadgeTrends = () => {
    if (entries.length === 0) return [];
    
    // Group entries by week
    const weeklyData: Record<string, Record<string, number>> = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.created_at);
      // Get the start of the week
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {};
      }
      
      // Count all badges for this week
      [...(entry.observations || []), ...(entry.activities || []), ...(entry.negative_side_effects || [])].forEach(badge => {
        weeklyData[weekKey][badge] = (weeklyData[weekKey][badge] || 0) + 1;
      });
    });
    
    // Convert to array format for recharts
    return Object.entries(weeklyData)
      .map(([week, badges]) => ({
        week,
        ...badges
      }))
      .sort((a, b) => {
        const dateA = new Date(a.week);
        const dateB = new Date(b.week);
        return dateA.getTime() - dateB.getTime();
      });
  };

  const trendData = getBadgeTrends();
  
  // Get all unique badges that appear in trends
  const allTrendBadges = new Set<string>();
  trendData.forEach(week => {
    Object.keys(week).forEach(key => {
      if (key !== 'week') allTrendBadges.add(key);
    });
  });
  
  // Filter to show only selected badges or top badges based on topCount if none selected
  const badgesToShow = selectedBadges.size > 0 
    ? Array.from(selectedBadges)
    : [
        ...topBadges.observations.map(([badge]) => badge),
        ...topBadges.activities.map(([badge]) => badge),
        ...topBadges.sideEffects.map(([badge]) => badge)
      ].slice(0, topCount);
  
  // Get badge type for coloring
  const getBadgeType = (badge: string): 'observation' | 'activity' | 'side-effect' => {
    if (topBadges.observations.some(([b]) => b === badge)) return 'observation';
    if (topBadges.activities.some(([b]) => b === badge)) return 'activity';
    return 'side-effect';
  };
  
  // Generate colors for trend lines
  const getTrendColor = (badge: string): string => {
    const type = getBadgeType(badge);
    const colors = {
      'observation': ['hsl(268, 50%, 65%)', 'hsl(268, 50%, 75%)', 'hsl(268, 50%, 55%)'],
      'activity': ['hsl(220, 70%, 55%)', 'hsl(220, 70%, 65%)', 'hsl(220, 70%, 45%)'],
      'side-effect': ['hsl(0, 72%, 51%)', 'hsl(0, 72%, 61%)', 'hsl(0, 72%, 41%)']
    };
    const colorArray = colors[type];
    const index = badgesToShow.indexOf(badge) % colorArray.length;
    return colorArray[index];
  };

  // Group entries by date for stats
  const entriesByDate = entries.reduce((acc, entry) => {
    const date = new Date(entry.created_at).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate average consumption
  const calculateAverageConsumption = () => {
    let totalGrams = 0;
    let count = 0;

    entries.forEach(entry => {
      const match = entry.dosage.match(/^([\d.]+)(g|ml|mg)$/);
      if (match) {
        const amount = parseFloat(match[1]);
        const unit = match[2];
        
        // Convert to grams
        if (unit === 'g') {
          totalGrams += amount;
        } else if (unit === 'mg') {
          totalGrams += amount / 1000;
        } else if (unit === 'ml') {
          totalGrams += amount; // Assuming 1ml ≈ 1g for simplicity
        }
        count++;
      }
    });

    return count > 0 ? (totalGrams / count).toFixed(2) : '0';
  };

  const avgConsumption = calculateAverageConsumption();

  // Toggle badge filter
  const toggleBadge = (badge: string) => {
    setSelectedBadges(prev => {
      const newSet = new Set(prev);
      if (newSet.has(badge)) {
        newSet.delete(badge);
      } else {
        newSet.add(badge);
      }
      return newSet;
    });
  };

  // Check if a badge is selected
  const isBadgeSelected = (badge: string) => {
    return selectedBadges.has(badge);
  };

  // Toggle all badges in a category
  const toggleCategory = (badges: [string, number][]) => {
    const categoryBadges = badges.map(([badge]) => badge);
    const allSelected = categoryBadges.every(badge => selectedBadges.has(badge));
    
    setSelectedBadges(prev => {
      const newSet = new Set(prev);
      if (allSelected) {
        // Remove all if all are selected
        categoryBadges.forEach(badge => newSet.delete(badge));
      } else {
        // Add all if not all are selected
        categoryBadges.forEach(badge => newSet.add(badge));
      }
      return newSet;
    });
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Badge Trends</h2>
      </div>

      {/* Trends Chart - Main Chart */}
      {trendData.length > 1 && badgesToShow.length > 0 && (
        <div className="mb-6">
          <p className="text-xs text-muted-foreground mb-4">
            {selectedBadges.size > 0 
              ? "Showing trends for selected badges" 
              : `Showing trends for top ${topCount} most common badges`}
          </p>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="week" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  height={60}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 } }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                />
                <Legend 
                  wrapperStyle={{ fontSize: '12px' }}
                  iconType="line"
                />
                {badgesToShow.map(badge => (
                  <Line
                    key={badge}
                    type="monotone"
                    dataKey={badge}
                    stroke={getTrendColor(badge)}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                    activeDot={{ r: 5 }}
                    name={badge}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {trendData.length <= 1 && (
        <div className="text-center py-12 text-muted-foreground">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <p className="text-lg">Not enough data to show trends yet</p>
          <p className="text-sm">Add more entries over time to see patterns</p>
        </div>
      )}

      {/* Badge Filters */}
      <div className="mt-6 border-t border-border pt-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-foreground">Filter by Most Common</p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Show top:</span>
            <div className="flex gap-1">
              {([3, 5, 10] as const).map(count => (
                <button
                  key={count}
                  onClick={() => setTopCount(count)}
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    topCount === count
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {count}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Observations Section */}
        {topBadges.observations.length > 0 && (
          <div className="mb-4">
            <p 
              className="text-xs font-medium text-observation mb-2 cursor-pointer hover:opacity-80 transition-opacity inline-flex items-center gap-1"
              onClick={() => toggleCategory(topBadges.observations)}
            >
              Observations
              <span className="text-[10px] opacity-60">(click to select all)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {topBadges.observations.map(([badge, count]) => {
                const isSelected = isBadgeSelected(badge);
                return (
                  <Badge
                    key={badge}
                    className="cursor-pointer hover:scale-105 transition-transform px-3 py-1.5 text-xs"
                    style={{
                      backgroundColor: isSelected ? 'hsl(var(--observation))' : 'transparent',
                      borderColor: 'hsl(var(--observation))',
                      color: isSelected ? 'hsl(var(--observation-foreground))' : 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--observation))',
                      opacity: isSelected ? 1 : 0.6
                    }}
                    onClick={() => toggleBadge(badge)}
                  >
                    {badge} ({count})
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Activities Section */}
        {topBadges.activities.length > 0 && (
          <div className="mb-4">
            <p 
              className="text-xs font-medium text-activity mb-2 cursor-pointer hover:opacity-80 transition-opacity inline-flex items-center gap-1"
              onClick={() => toggleCategory(topBadges.activities)}
            >
              Activities
              <span className="text-[10px] opacity-60">(click to select all)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {topBadges.activities.map(([badge, count]) => {
                const isSelected = isBadgeSelected(badge);
                return (
                  <Badge
                    key={badge}
                    className="cursor-pointer hover:scale-105 transition-transform px-3 py-1.5 text-xs"
                    style={{
                      backgroundColor: isSelected ? 'hsl(var(--activity))' : 'transparent',
                      borderColor: 'hsl(var(--activity))',
                      color: isSelected ? 'hsl(var(--activity-foreground))' : 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--activity))',
                      opacity: isSelected ? 1 : 0.6
                    }}
                    onClick={() => toggleBadge(badge)}
                  >
                    {badge} ({count})
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {/* Side Effects Section */}
        {topBadges.sideEffects.length > 0 && (
          <div className="mb-4">
            <p 
              className="text-xs font-medium text-side-effect mb-2 cursor-pointer hover:opacity-80 transition-opacity inline-flex items-center gap-1"
              onClick={() => toggleCategory(topBadges.sideEffects)}
            >
              Side Effects
              <span className="text-[10px] opacity-60">(click to select all)</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {topBadges.sideEffects.map(([badge, count]) => {
                const isSelected = isBadgeSelected(badge);
                return (
                  <Badge
                    key={badge}
                    className="cursor-pointer hover:scale-105 transition-transform px-3 py-1.5 text-xs"
                    style={{
                      backgroundColor: isSelected ? 'hsl(var(--side-effect))' : 'transparent',
                      borderColor: 'hsl(var(--side-effect))',
                      color: isSelected ? 'hsl(var(--side-effect-foreground))' : 'hsl(var(--foreground))',
                      border: '1px solid hsl(var(--side-effect))',
                      opacity: isSelected ? 1 : 0.6
                    }}
                    onClick={() => toggleBadge(badge)}
                  >
                    {badge} ({count})
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        {selectedBadges.size > 0 && (
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-border">
            <p className="text-xs text-muted-foreground">
              {selectedBadges.size} filter{selectedBadges.size > 1 ? 's' : ''} active
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedBadges(new Set())}
              className="text-xs h-7"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      <div className="mt-4 grid grid-cols-4 gap-4 text-center">
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-2xl font-bold text-primary">{entries.length}</p>
          <p className="text-sm text-muted-foreground">Total Entries</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-2xl font-bold text-primary">{Object.keys(entriesByDate).length}</p>
          <p className="text-sm text-muted-foreground">Active Days</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-2xl font-bold text-primary">
            {entries.length > 0 ? (entries.length / Object.keys(entriesByDate).length).toFixed(1) : 0}
          </p>
          <p className="text-sm text-muted-foreground">Avg per Day</p>
        </div>
        <div className="p-3 rounded-lg bg-muted/30">
          <p className="text-2xl font-bold text-primary">{avgConsumption}g</p>
          <p className="text-sm text-muted-foreground">Avg Consumption</p>
        </div>
      </div>
    </Card>
  );
};
