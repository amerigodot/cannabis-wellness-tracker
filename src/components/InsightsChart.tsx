import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, BarChart, Bar } from "recharts";
import { TrendingUp, Check, Pill, Target } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface JournalEntry {
  id: string;
  created_at: string;
  dosage: string;
  strain: string;
  strain_2?: string | null;
  thc_percentage?: number | null;
  cbd_percentage?: number | null;
  observations?: string[];
  activities?: string[];
  negative_side_effects?: string[];
  entry_status?: string | null;
  before_mood?: number | null;
  before_pain?: number | null;
  before_anxiety?: number | null;
  before_energy?: number | null;
  before_focus?: number | null;
  after_mood?: number | null;
  after_pain?: number | null;
  after_anxiety?: number | null;
  after_energy?: number | null;
  after_focus?: number | null;
  effects_duration_minutes?: number | null;
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
  const [activeTab, setActiveTab] = useState<'trends' | 'cannabinoids' | 'effectiveness'>('trends');
  
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

  // Calculate cannabinoid correlations
  const getCannabinoidCorrelations = () => {
    // Filter entries that have cannabinoid data
    const entriesWithCannabinoids = entries.filter(e => 
      e.thc_percentage != null || e.cbd_percentage != null
    );

    if (entriesWithCannabinoids.length === 0) return [];

    const observationStats: Record<string, { thcTotal: number; cbdTotal: number; count: number }> = {};

    entriesWithCannabinoids.forEach(entry => {
      (entry.observations || []).forEach(obs => {
        if (!observationStats[obs]) {
          observationStats[obs] = { thcTotal: 0, cbdTotal: 0, count: 0 };
        }
        observationStats[obs].thcTotal += entry.thc_percentage || 0;
        observationStats[obs].cbdTotal += entry.cbd_percentage || 0;
        observationStats[obs].count += 1;
      });
    });

    return Object.entries(observationStats)
      .map(([observation, stats]) => ({
        observation,
        avgTHC: parseFloat((stats.thcTotal / stats.count).toFixed(1)),
        avgCBD: parseFloat((stats.cbdTotal / stats.count).toFixed(1)),
        count: stats.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  };

  const cannabinoidData = getCannabinoidCorrelations();
  const hasEntriesWithCannabinoids = entries.some(e => 
    e.thc_percentage != null || e.cbd_percentage != null
  );

  // Calculate effectiveness score for an entry
  const calculateEffectiveness = (entry: JournalEntry): number => {
    if (!entry.before_mood || !entry.after_mood || entry.entry_status === 'pending_after') {
      return 0;
    }

    const moodDelta = entry.after_mood - entry.before_mood;
    const painDelta = entry.before_pain! - entry.after_pain!;
    const anxietyDelta = entry.before_anxiety! - entry.after_anxiety!;
    const energyDelta = entry.after_energy! - entry.before_energy!;
    const focusDelta = entry.after_focus! - entry.before_focus!;

    const totalDelta = (moodDelta * 1.2 + painDelta * 1.5 + anxietyDelta * 1.5 + energyDelta + focusDelta) / 6.2;
    return Math.round(((totalDelta + 9) / 18) * 100);
  };

  // Get entries with effectiveness data
  const effectivenessEntries = entries.filter(e => 
    e.before_mood && e.after_mood && e.entry_status !== 'pending_after'
  );

  // Calculate before/after comparison data
  const getBeforeAfterComparison = () => {
    if (effectivenessEntries.length === 0) return [];

    const metrics = ['Mood', 'Pain', 'Anxiety', 'Energy', 'Focus'];
    return metrics.map(metric => {
      const beforeKey = `before_${metric.toLowerCase()}` as keyof JournalEntry;
      const afterKey = `after_${metric.toLowerCase()}` as keyof JournalEntry;

      const beforeAvg = effectivenessEntries.reduce((sum, e) => sum + (e[beforeKey] as number || 0), 0) / effectivenessEntries.length;
      const afterAvg = effectivenessEntries.reduce((sum, e) => sum + (e[afterKey] as number || 0), 0) / effectivenessEntries.length;

      return {
        metric,
        before: parseFloat(beforeAvg.toFixed(1)),
        after: parseFloat(afterAvg.toFixed(1)),
        improvement: parseFloat((afterAvg - beforeAvg).toFixed(1))
      };
    });
  };

  // Get best strains by effectiveness
  const getBestStrainsByEffectiveness = () => {
    const strainScores: Record<string, { total: number; count: number; entries: JournalEntry[] }> = {};

    effectivenessEntries.forEach(entry => {
      const score = calculateEffectiveness(entry);
      if (!strainScores[entry.strain]) {
        strainScores[entry.strain] = { total: 0, count: 0, entries: [] };
      }
      strainScores[entry.strain].total += score;
      strainScores[entry.strain].count += 1;
      strainScores[entry.strain].entries.push(entry);
    });

    return Object.entries(strainScores)
      .map(([strain, data]) => ({
        strain,
        avgScore: Math.round(data.total / data.count),
        count: data.count,
        entries: data.entries
      }))
      .sort((a, b) => b.avgScore - a.avgScore)
      .slice(0, 10);
  };

  // Get best strains for specific goals
  const getBestStrainsForGoal = (goal: 'pain' | 'mood' | 'anxiety' | 'energy' | 'focus') => {
    const beforeKey = `before_${goal}` as keyof JournalEntry;
    const afterKey = `after_${goal}` as keyof JournalEntry;

    const strainImpact: Record<string, { totalDelta: number; count: number }> = {};

    effectivenessEntries.forEach(entry => {
      const before = entry[beforeKey] as number;
      const after = entry[afterKey] as number;
      
      if (before && after) {
        let delta = after - before;
        // For pain and anxiety, improvement is a decrease
        if (goal === 'pain' || goal === 'anxiety') {
          delta = before - after;
        }

        if (!strainImpact[entry.strain]) {
          strainImpact[entry.strain] = { totalDelta: 0, count: 0 };
        }
        strainImpact[entry.strain].totalDelta += delta;
        strainImpact[entry.strain].count += 1;
      }
    });

    return Object.entries(strainImpact)
      .map(([strain, data]) => ({
        strain,
        avgImprovement: parseFloat((data.totalDelta / data.count).toFixed(1)),
        count: data.count
      }))
      .filter(item => item.avgImprovement > 0)
      .sort((a, b) => b.avgImprovement - a.avgImprovement)
      .slice(0, 5);
  };

  const beforeAfterData = getBeforeAfterComparison();
  const topStrainsByEffectiveness = getBestStrainsByEffectiveness();
  const hasEffectivenessData = effectivenessEntries.length > 0;

  return (
    <TooltipProvider>
      <Card className="p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-300">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'trends' | 'cannabinoids' | 'effectiveness')} className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-semibold">Insights</h2>
          </div>
          <TabsList>
            <TabsTrigger value="trends">Badge Trends</TabsTrigger>
            {hasEntriesWithCannabinoids && (
              <TabsTrigger value="cannabinoids" className="flex items-center gap-1.5">
                <Pill className="w-3.5 h-3.5" />
                THC/CBD
              </TabsTrigger>
            )}
            {hasEffectivenessData && (
              <TabsTrigger value="effectiveness" className="flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5" />
                Effectiveness
              </TabsTrigger>
            )}
          </TabsList>
        </div>

        <TabsContent value="trends" className="mt-0">
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
        </TabsContent>

        <TabsContent value="cannabinoids" className="mt-0">
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm font-semibold mb-2 text-foreground">Cannabinoid-Effect Correlation</p>
              <p className="text-xs text-muted-foreground">
                This chart shows the average THC and CBD percentages for entries reporting specific observations. 
                Higher bars indicate stronger correlations between cannabinoid levels and reported effects.
              </p>
            </div>

            {cannabinoidData.length > 0 ? (
              <>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={cannabinoidData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                      <XAxis 
                        dataKey="observation" 
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 11 }}
                      />
                      <YAxis 
                        label={{ value: 'Average %', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--foreground))' } }}
                        tick={{ fill: 'hsl(var(--foreground))' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--background))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          color: 'hsl(var(--foreground))'
                        }}
                        formatter={(value: number) => [`${value}%`, '']}
                        labelFormatter={(label) => `${label}`}
                      />
                      <Legend 
                        wrapperStyle={{ paddingTop: '20px' }}
                        iconType="circle"
                      />
                      <Bar 
                        dataKey="avgTHC" 
                        fill="hsl(142, 71%, 45%)" 
                        name="Avg THC %"
                        radius={[8, 8, 0, 0]}
                      />
                      <Bar 
                        dataKey="avgCBD" 
                        fill="hsl(217, 91%, 60%)" 
                        name="Avg CBD %"
                        radius={[8, 8, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <p className="text-sm font-semibold text-foreground">THC Insights</p>
                    </div>
                    {cannabinoidData.length > 0 && (() => {
                      const highestTHC = cannabinoidData.reduce((max, item) => 
                        item.avgTHC > max.avgTHC ? item : max
                      );
                      return (
                        <p className="text-xs text-muted-foreground">
                          Highest average THC: <span className="font-medium text-foreground">{highestTHC.observation}</span> ({highestTHC.avgTHC}%)
                        </p>
                      );
                    })()}
                  </div>

                  <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <p className="text-sm font-semibold text-foreground">CBD Insights</p>
                    </div>
                    {cannabinoidData.length > 0 && (() => {
                      const highestCBD = cannabinoidData.reduce((max, item) => 
                        item.avgCBD > max.avgCBD ? item : max
                      );
                      return (
                        <p className="text-xs text-muted-foreground">
                          Highest average CBD: <span className="font-medium text-foreground">{highestCBD.observation}</span> ({highestCBD.avgCBD}%)
                        </p>
                      );
                    })()}
                  </div>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <p className="text-xs font-semibold mb-2 text-foreground">Top 10 Observations by Entry Count</p>
                  <div className="flex flex-wrap gap-2">
                    {cannabinoidData.map(item => (
                      <Badge key={item.observation} variant="outline" className="text-xs">
                        {item.observation} <span className="ml-1 text-muted-foreground">({item.count})</span>
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <Pill className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No cannabinoid data available yet. Start tracking THC and CBD percentages in your entries to see correlations with effects.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="effectiveness" className="mt-0">
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg border border-border">
              <p className="text-sm font-semibold mb-2 text-foreground">Effectiveness Analysis</p>
              <p className="text-xs text-muted-foreground">
                Compare before and after states to understand how different strains impact your wellness metrics.
                Based on {effectivenessEntries.length} entries with complete before/after tracking.
              </p>
            </div>

            {hasEffectivenessData ? (
              <>
                {/* Before vs After Comparison Chart */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Before vs After Comparison</h3>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={beforeAfterData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                        <XAxis 
                          dataKey="metric" 
                          tick={{ fill: 'hsl(var(--foreground))', fontSize: 12 }}
                        />
                        <YAxis 
                          domain={[0, 10]}
                          label={{ value: 'Score (1-10)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--foreground))' } }}
                          tick={{ fill: 'hsl(var(--foreground))' }}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--background))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                            color: 'hsl(var(--foreground))'
                          }}
                          formatter={(value: number) => [value.toFixed(1), '']}
                        />
                        <Legend 
                          wrapperStyle={{ paddingTop: '20px' }}
                          iconType="circle"
                        />
                        <Bar 
                          dataKey="before" 
                          fill="hsl(var(--muted-foreground))" 
                          name="Before"
                          radius={[8, 8, 0, 0]}
                        />
                        <Bar 
                          dataKey="after" 
                          fill="hsl(var(--primary))" 
                          name="After"
                          radius={[8, 8, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-4">
                    {beforeAfterData.map(data => (
                      <div key={data.metric} className={`p-3 rounded-lg border ${
                        data.improvement > 0 ? 'bg-green-500/10 border-green-500/30' : 
                        data.improvement < 0 ? 'bg-red-500/10 border-red-500/30' : 
                        'bg-muted/30 border-border'
                      }`}>
                        <p className="text-xs font-semibold mb-1">{data.metric}</p>
                        <div className="flex items-center gap-1">
                          <span className={`text-lg font-bold ${
                            data.improvement > 0 ? 'text-green-500' : 
                            data.improvement < 0 ? 'text-red-500' : 
                            'text-muted-foreground'
                          }`}>
                            {data.improvement > 0 ? '↑' : data.improvement < 0 ? '↓' : '→'}
                            {Math.abs(data.improvement).toFixed(1)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Performing Strains */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Best Performing Strains by Effectiveness</h3>
                  <div className="space-y-2">
                    {topStrainsByEffectiveness.map((strain, index) => (
                      <div 
                        key={strain.strain}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
                            index === 0 ? 'bg-yellow-500/20 text-yellow-600' :
                            index === 1 ? 'bg-gray-400/20 text-gray-600' :
                            index === 2 ? 'bg-orange-500/20 text-orange-600' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            #{index + 1}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm">{strain.strain}</p>
                            <p className="text-xs text-muted-foreground">{strain.count} entries</p>
                          </div>
                        </div>
                        <Badge className={`
                          ${strain.avgScore >= 75 ? 'bg-green-500' :
                            strain.avgScore >= 60 ? 'bg-green-400' :
                            strain.avgScore >= 45 ? 'bg-yellow-500' :
                            strain.avgScore >= 30 ? 'bg-orange-500' :
                            'bg-red-500'
                          } text-white
                        `}>
                          {strain.avgScore}% Effective
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Goal-Based Analysis */}
                <div>
                  <h3 className="text-sm font-semibold mb-3">Goal-Based Analysis</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Pain Relief */}
                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        💊 Best for Pain Relief
                      </p>
                      <div className="space-y-2">
                        {getBestStrainsForGoal('pain').slice(0, 3).map(item => (
                          <div key={item.strain} className="flex items-center justify-between text-xs">
                            <span className="font-medium">{item.strain}</span>
                            <Badge variant="outline" className="text-xs">
                              ↓{item.avgImprovement} avg
                            </Badge>
                          </div>
                        ))}
                        {getBestStrainsForGoal('pain').length === 0 && (
                          <p className="text-xs text-muted-foreground">No data yet</p>
                        )}
                      </div>
                    </div>

                    {/* Mood Boost */}
                    <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/30">
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        😊 Best for Mood Boost
                      </p>
                      <div className="space-y-2">
                        {getBestStrainsForGoal('mood').slice(0, 3).map(item => (
                          <div key={item.strain} className="flex items-center justify-between text-xs">
                            <span className="font-medium">{item.strain}</span>
                            <Badge variant="outline" className="text-xs">
                              ↑{item.avgImprovement} avg
                            </Badge>
                          </div>
                        ))}
                        {getBestStrainsForGoal('mood').length === 0 && (
                          <p className="text-xs text-muted-foreground">No data yet</p>
                        )}
                      </div>
                    </div>

                    {/* Anxiety Reduction */}
                    <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        🧘 Best for Anxiety Reduction
                      </p>
                      <div className="space-y-2">
                        {getBestStrainsForGoal('anxiety').slice(0, 3).map(item => (
                          <div key={item.strain} className="flex items-center justify-between text-xs">
                            <span className="font-medium">{item.strain}</span>
                            <Badge variant="outline" className="text-xs">
                              ↓{item.avgImprovement} avg
                            </Badge>
                          </div>
                        ))}
                        {getBestStrainsForGoal('anxiety').length === 0 && (
                          <p className="text-xs text-muted-foreground">No data yet</p>
                        )}
                      </div>
                    </div>

                    {/* Energy Boost */}
                    <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                      <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                        ⚡ Best for Energy Boost
                      </p>
                      <div className="space-y-2">
                        {getBestStrainsForGoal('energy').slice(0, 3).map(item => (
                          <div key={item.strain} className="flex items-center justify-between text-xs">
                            <span className="font-medium">{item.strain}</span>
                            <Badge variant="outline" className="text-xs">
                              ↑{item.avgImprovement} avg
                            </Badge>
                          </div>
                        ))}
                        {getBestStrainsForGoal('energy').length === 0 && (
                          <p className="text-xs text-muted-foreground">No data yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-lg bg-muted/30 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-primary mb-1">{effectivenessEntries.length}</p>
                    <p className="text-xs text-muted-foreground text-center">Complete Entries</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-primary mb-1">
                      {topStrainsByEffectiveness.length > 0 ? topStrainsByEffectiveness[0].avgScore : 0}%
                    </p>
                    <p className="text-xs text-muted-foreground text-center">Top Score</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-primary mb-1">
                      {beforeAfterData.reduce((sum, d) => sum + d.improvement, 0).toFixed(1)}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">Total Improvement</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-primary mb-1">
                      {topStrainsByEffectiveness.length}
                    </p>
                    <p className="text-xs text-muted-foreground text-center">Tested Strains</p>
                  </div>
                </div>
              </>
            ) : (
              <div className="p-8 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-3 text-muted-foreground opacity-50" />
                <p className="text-sm text-muted-foreground">
                  No effectiveness data available yet. Use Full Tracking mode and complete before/after states to see effectiveness analysis.
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </Card>
    </TooltipProvider>
  );
};
