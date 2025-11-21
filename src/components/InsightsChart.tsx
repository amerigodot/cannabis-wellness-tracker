import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrendingUp, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  filterObservations: string[];
  setFilterObservations: (filters: string[]) => void;
  filterActivities: string[];
  setFilterActivities: (filters: string[]) => void;
  filterSideEffects: string[];
  setFilterSideEffects: (filters: string[]) => void;
}

export const InsightsChart = ({ 
  entries, 
  filterObservations,
  setFilterObservations,
  filterActivities,
  setFilterActivities,
  filterSideEffects,
  setFilterSideEffects
}: InsightsChartProps) => {
  const [topCount, setTopCount] = useState<3 | 5 | 10>(5);
  
  // Combine all filters into a single set for backward compatibility
  const selectedBadges = new Set([...filterObservations, ...filterActivities, ...filterSideEffects]);

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
    
    // Find date range of entries
    const dates = entries.map(e => new Date(e.created_at).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);
    const daySpan = (maxDate - minDate) / (1000 * 60 * 60 * 24);
    
    // Determine grouping: daily if < 14 days, weekly if < 90 days, monthly otherwise
    const groupBy = daySpan < 14 ? 'day' : daySpan < 90 ? 'week' : 'month';
    
    const groupedData: Record<string, Record<string, number>> = {};
    
    entries.forEach(entry => {
      const date = new Date(entry.created_at);
      let groupKey: string;
      
      if (groupBy === 'day') {
        groupKey = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (groupBy === 'week') {
        // Get the start of the week
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        groupKey = weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        // Monthly grouping
        groupKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      }
      
      if (!groupedData[groupKey]) {
        groupedData[groupKey] = {};
      }
      
      // Count all badges for this time period
      [...(entry.observations || []), ...(entry.activities || []), ...(entry.negative_side_effects || [])].forEach(badge => {
        groupedData[groupKey][badge] = (groupedData[groupKey][badge] || 0) + 1;
      });
    });
    
    // Convert to array format for recharts
    return Object.entries(groupedData)
      .map(([period, badges]) => ({
        period,
        ...badges
      }))
      .sort((a, b) => {
        const dateA = new Date(a.period);
        const dateB = new Date(b.period);
        return dateA.getTime() - dateB.getTime();
      });
  };

  const trendData = getBadgeTrends();
  
  // Get all unique badges that appear in trends
  const allTrendBadges = new Set<string>();
  trendData.forEach(dataPoint => {
    Object.keys(dataPoint).forEach(key => {
      if (key !== 'period') allTrendBadges.add(key);
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
    // Determine which category the badge belongs to and update accordingly
    if (topBadges.observations.some(([b]) => b === badge)) {
      setFilterObservations(
        filterObservations.includes(badge)
          ? filterObservations.filter(b => b !== badge)
          : [...filterObservations, badge]
      );
    } else if (topBadges.activities.some(([b]) => b === badge)) {
      setFilterActivities(
        filterActivities.includes(badge)
          ? filterActivities.filter(b => b !== badge)
          : [...filterActivities, badge]
      );
    } else {
      setFilterSideEffects(
        filterSideEffects.includes(badge)
          ? filterSideEffects.filter(b => b !== badge)
          : [...filterSideEffects, badge]
      );
    }
  };

  // Check if a badge is selected
  const isBadgeSelected = (badge: string) => {
    return selectedBadges.has(badge);
  };

  // Check if all badges in a category are selected
  const isAllCategorySelected = (badges: [string, number][]) => {
    const categoryBadges = badges.map(([badge]) => badge);
    return categoryBadges.length > 0 && categoryBadges.every(badge => selectedBadges.has(badge));
  };

  // Toggle all badges in a category
  const toggleCategory = (badges: [string, number][]) => {
    const categoryBadges = badges.map(([badge]) => badge);
    const allSelected = categoryBadges.every(badge => selectedBadges.has(badge));
    
    // Determine category type from first badge
    const firstBadge = categoryBadges[0];
    if (!firstBadge) return;
    
    if (topBadges.observations.some(([b]) => b === firstBadge)) {
      setFilterObservations(allSelected ? [] : categoryBadges);
    } else if (topBadges.activities.some(([b]) => b === firstBadge)) {
      setFilterActivities(allSelected ? [] : categoryBadges);
    } else {
      setFilterSideEffects(allSelected ? [] : categoryBadges);
    }
  };

  // Filter presets for quick analysis
  const filterPresets = {
    'energizing': {
      name: '⚡ Energizing Effects',
      observations: ['Energy Increase', 'Improved Focus', 'Mood Lift'],
      activities: ['Work', 'Exercise', 'Writing'],
      sideEffects: []
    },
    'relaxation': {
      name: '🧘 Relaxation Sessions',
      observations: ['Relaxation', 'Reduced Anxiety', 'Muscle Relaxation'],
      activities: ['Meditation', 'Relaxing', 'Reading'],
      sideEffects: []
    },
    'sleep': {
      name: '😴 Sleep Aid',
      observations: ['Better Sleep', 'Relaxation', 'Reduced Anxiety'],
      activities: ['Meditation', 'Relaxing'],
      sideEffects: []
    },
    'social': {
      name: '🎨 Social & Creative',
      observations: ['Mood Lift', 'Creativity Boost'],
      activities: ['Social', 'Painting', 'Music'],
      sideEffects: []
    },
    'pain': {
      name: '💊 Pain Management',
      observations: ['Pain Relief', 'Reduced Inflammation', 'Muscle Relaxation'],
      activities: ['Relaxing', 'Meditation'],
      sideEffects: []
    }
  };

  const applyPreset = (presetKey: keyof typeof filterPresets) => {
    const preset = filterPresets[presetKey];
    setFilterObservations(preset.observations);
    setFilterActivities(preset.activities);
    setFilterSideEffects(preset.sideEffects);
  };

  const clearAllFilters = () => {
    setFilterObservations([]);
    setFilterActivities([]);
    setFilterSideEffects([]);
  };

  const isPresetActive = (presetKey: keyof typeof filterPresets) => {
    const preset = filterPresets[presetKey];
    return (
      filterObservations.length === preset.observations.length &&
      filterActivities.length === preset.activities.length &&
      filterSideEffects.length === preset.sideEffects.length &&
      preset.observations.every(obs => filterObservations.includes(obs)) &&
      preset.activities.every(act => filterActivities.includes(act)) &&
      preset.sideEffects.every(eff => filterSideEffects.includes(eff))
    );
  };

  // Get top strains from filtered entries
  const getTopStrains = (limit: number = 5) => {
    const strainCounts: Record<string, number> = {};
    
    entries.forEach(entry => {
      strainCounts[entry.strain] = (strainCounts[entry.strain] || 0) + 1;
    });
    
    return Object.entries(strainCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);
  };

  const hasActiveFilters = selectedBadges.size > 0;
  const topStrains = hasActiveFilters ? getTopStrains(5) : [];

  return (
    <TooltipProvider>
      <Card className="p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-6">
        <TrendingUp className="w-6 h-6 text-primary" />
        <h2 className="text-2xl font-semibold">Badge Trends</h2>
      </div>

      {/* Filter Presets */}
      <div className="mb-6 p-4 bg-muted/50 rounded-lg border border-border">
        <p className="text-sm font-semibold mb-3 text-foreground">Quick Filter Presets</p>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(filterPresets) as Array<keyof typeof filterPresets>).map(presetKey => (
            <Button
              key={presetKey}
              variant={isPresetActive(presetKey) ? "default" : "outline"}
              size="sm"
              onClick={() => applyPreset(presetKey)}
              className="text-xs"
            >
              {filterPresets[presetKey].name}
            </Button>
          ))}
          {selectedBadges.size > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Top Strains for Active Filters */}
      {hasActiveFilters && topStrains.length > 0 && (
        <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <p className="text-sm font-semibold mb-3 text-foreground">
            Top Strains for Current Selection
          </p>
          <div className="flex flex-wrap gap-2">
            {topStrains.map(([strain, count]) => (
              <Badge
                key={strain}
                variant="outline"
                className="px-3 py-1.5 text-xs border-primary/30 bg-background"
              >
                <span className="font-medium">{strain}</span>
                <span className="ml-1.5 text-muted-foreground">({count})</span>
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Showing the most frequently used strains matching your current filters
          </p>
        </div>
      )}

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
                  dataKey="period" 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                  height={60}
                  angle={-45}
                  textAnchor="end"
                />
                <YAxis 
                  tick={{ fill: 'hsl(var(--muted-foreground))' }}
                  label={{ value: 'Count', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))', fontSize: 12 } }}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px',
                    color: 'hsl(var(--card-foreground))'
                  }}
                  content={({ active, payload }) => {
                    if (!active || !payload || payload.length === 0) return null;
                    return (
                      <div className="bg-card border border-border rounded-md p-3 shadow-lg">
                        {payload.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-card-foreground">
                              {entry.name}: <span className="font-semibold">{entry.value}</span>
                            </span>
                          </div>
                        ))}
                      </div>
                    );
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
            <UITooltip>
              <TooltipTrigger asChild>
                <p 
                  className={`text-xs font-medium mb-2 cursor-pointer hover:opacity-80 transition-all w-fit px-2 py-1 rounded inline-flex items-center gap-1.5 ${
                    isAllCategorySelected(topBadges.observations)
                      ? 'bg-observation text-observation-foreground'
                      : 'text-observation'
                  }`}
                  onClick={() => toggleCategory(topBadges.observations)}
                >
                  {isAllCategorySelected(topBadges.observations) && <Check className="w-3 h-3" />}
                  Observations
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to select/deselect all observations</p>
              </TooltipContent>
            </UITooltip>
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
            <UITooltip>
              <TooltipTrigger asChild>
                <p 
                  className={`text-xs font-medium mb-2 cursor-pointer hover:opacity-80 transition-all w-fit px-2 py-1 rounded inline-flex items-center gap-1.5 ${
                    isAllCategorySelected(topBadges.activities)
                      ? 'bg-activity text-activity-foreground'
                      : 'text-activity'
                  }`}
                  onClick={() => toggleCategory(topBadges.activities)}
                >
                  {isAllCategorySelected(topBadges.activities) && <Check className="w-3 h-3" />}
                  Activities
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to select/deselect all activities</p>
              </TooltipContent>
            </UITooltip>
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
            <UITooltip>
              <TooltipTrigger asChild>
                <p 
                  className={`text-xs font-medium mb-2 cursor-pointer hover:opacity-80 transition-all w-fit px-2 py-1 rounded inline-flex items-center gap-1.5 ${
                    isAllCategorySelected(topBadges.sideEffects)
                      ? 'bg-side-effect text-side-effect-foreground'
                      : 'text-side-effect'
                  }`}
                  onClick={() => toggleCategory(topBadges.sideEffects)}
                >
                  {isAllCategorySelected(topBadges.sideEffects) && <Check className="w-3 h-3" />}
                  Side Effects
                </p>
              </TooltipTrigger>
              <TooltipContent>
                <p>Click to select/deselect all side effects</p>
              </TooltipContent>
            </UITooltip>
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
              onClick={() => {
                setFilterObservations([]);
                setFilterActivities([]);
                setFilterSideEffects([]);
              }}
              className="text-xs h-7"
            >
              Clear filters
            </Button>
          </div>
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-lg bg-muted/30 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-primary mb-1">{entries.length}</p>
          <p className="text-xs text-muted-foreground text-center">Total Entries</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/30 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-primary mb-1">{Object.keys(entriesByDate).length}</p>
          <p className="text-xs text-muted-foreground text-center">Active Days</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/30 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-primary mb-1">
            {entries.length > 0 ? (entries.length / Object.keys(entriesByDate).length).toFixed(1) : 0}
          </p>
          <p className="text-xs text-muted-foreground text-center whitespace-nowrap">Avg per Day</p>
        </div>
        <div className="p-4 rounded-lg bg-muted/30 flex flex-col items-center justify-center">
          <p className="text-3xl font-bold text-primary mb-1">{avgConsumption}g</p>
          <p className="text-xs text-muted-foreground text-center whitespace-nowrap">Avg Consumption</p>
        </div>
      </div>
    </Card>
    </TooltipProvider>
  );
};
