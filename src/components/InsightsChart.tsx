import { useState } from "react";
import { Card } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";
import { ScatterChart as ScatterChartIcon } from "lucide-react";
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

  // Calculate top 5 most used badges
  const getTopBadges = () => {
    const badgeCounts: Record<string, { count: number; type: 'observation' | 'activity' | 'side-effect' }> = {};
    
    entries.forEach(entry => {
      (entry.observations || []).forEach(obs => {
        if (!badgeCounts[obs]) {
          badgeCounts[obs] = { count: 0, type: 'observation' };
        }
        badgeCounts[obs].count++;
      });
      
      (entry.activities || []).forEach(act => {
        if (!badgeCounts[act]) {
          badgeCounts[act] = { count: 0, type: 'activity' };
        }
        badgeCounts[act].count++;
      });
      
      (entry.negative_side_effects || []).forEach(eff => {
        if (!badgeCounts[eff]) {
          badgeCounts[eff] = { count: 0, type: 'side-effect' };
        }
        badgeCounts[eff].count++;
      });
    });
    
    return Object.entries(badgeCounts)
      .sort((a, b) => b[1].count - a[1].count)
      .slice(0, 5)
      .map(([badge, data]) => ({ badge, ...data }));
  };

  const topBadges = getTopBadges();

  // Categorize strain type (for coloring only)
  const getStrainType = (strain: string): string => {
    const lowerStrain = strain.toLowerCase();
    
    if (lowerStrain.includes('sativa') || lowerStrain.includes('energizing') || lowerStrain.includes('uplifting')) {
      return 'Sativa';
    } else if (lowerStrain.includes('indica') || lowerStrain.includes('relax') || lowerStrain.includes('sleep')) {
      return 'Indica';
    } else if (lowerStrain.includes('hybrid')) {
      return 'Hybrid';
    } else if (lowerStrain.includes('cbd')) {
      return 'CBD';
    } else if (lowerStrain.includes('thc')) {
      return 'THC';
    }
    return 'Sativa'; // Default to Sativa instead of Balanced
  };

  // Convert entries to scatter plot data
  const scatterData = entries.map(entry => {
    const date = new Date(entry.created_at);
    const timestamp = date.getTime();
    
    // Parse dosage to grams
    const match = entry.dosage.match(/^([\d.]+)(g|ml|mg)$/);
    let dosageInGrams = 0;
    
    if (match) {
      const amount = parseFloat(match[1]);
      const unit = match[2];
      
      if (unit === 'g') {
        dosageInGrams = amount;
      } else if (unit === 'mg') {
        dosageInGrams = amount / 1000;
      } else if (unit === 'ml') {
        dosageInGrams = amount; // Assuming 1ml ≈ 1g
      }
    }
    
    return {
      timestamp,
      dosage: dosageInGrams,
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      strain: entry.strain,
      strainType: getStrainType(entry.strain),
      observations: (entry as any).observations || [],
      activities: entry.activities || [],
      negative_side_effects: entry.negative_side_effects || []
    };
  }).sort((a, b) => a.timestamp - b.timestamp);

  // Group data by strain type (for coloring)
  const strainTypeColors = {
    'Sativa': 'hsl(var(--strain-sativa))',
    'Indica': 'hsl(var(--strain-indica))',
    'Hybrid': 'hsl(var(--strain-hybrid))',
    'CBD': 'hsl(var(--strain-cbd))',
    'THC': 'hsl(var(--strain-thc))'
  };

  // Filter data based on selected badges
  const getFilteredData = () => {
    if (selectedBadges.size === 0) {
      return scatterData;
    }
    
    return scatterData.filter(point => {
      const allBadges = [
        ...point.observations,
        ...point.activities,
        ...point.negative_side_effects
      ];
      return Array.from(selectedBadges).some(badge => allBadges.includes(badge));
    });
  };

  const filteredData = getFilteredData();

  const groupedData = filteredData.reduce((acc, point) => {
    if (!acc[point.strainType]) {
      acc[point.strainType] = [];
    }
    acc[point.strainType].push(point);
    return acc;
  }, {} as Record<string, typeof scatterData>);

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

  if (scatterData.length === 0) {
    return null;
  }

  // Format timestamp for display
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatTooltipTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

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

  // Get badge color based on type
  const getBadgeColor = (type: 'observation' | 'activity' | 'side-effect') => {
    switch (type) {
      case 'observation':
        return { bg: 'hsl(var(--observation))', fg: 'hsl(var(--observation-foreground))' };
      case 'activity':
        return { bg: 'hsl(var(--activity))', fg: 'hsl(var(--activity-foreground))' };
      case 'side-effect':
        return { bg: 'hsl(var(--side-effect))', fg: 'hsl(var(--side-effect-foreground))' };
    }
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-lg z-50 max-w-xs">
          <p className="text-foreground font-semibold mb-2">
            {data.date} {data.time}
          </p>
          <div className="space-y-1 mb-2">
            <p className="text-foreground">
              <span className="font-medium">Dosage:</span> {data.dosage.toFixed(2)}g
            </p>
            <p className="text-foreground">
              <span className="font-medium">Strain:</span> {data.strain}
            </p>
          </div>
          
          {data.observations && data.observations.length > 0 && (
            <div className="mt-3 pt-2 border-t border-border">
              <p className="text-foreground font-medium text-xs mb-1">Observations:</p>
              <div className="flex flex-wrap gap-1">
                {data.observations.map((obs: string, idx: number) => (
                  <Badge key={idx} className="text-xs bg-observation text-observation-foreground">
                    {obs}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {data.activities && data.activities.length > 0 && (
            <div className="mt-2">
              <p className="text-foreground font-medium text-xs mb-1">Activities:</p>
              <div className="flex flex-wrap gap-1">
                {data.activities.map((activity: string, idx: number) => (
                  <Badge key={idx} className="text-xs bg-activity text-activity-foreground">
                    {activity}
                  </Badge>
                ))}
              </div>
            </div>
          )}
          
          {data.negative_side_effects && data.negative_side_effects.length > 0 && (
            <div className="mt-2">
              <p className="text-foreground font-medium text-xs mb-1">Side Effects:</p>
              <div className="flex flex-wrap gap-1">
                {data.negative_side_effects.map((effect: string, idx: number) => (
                  <Badge key={idx} className="text-xs bg-side-effect text-side-effect-foreground">
                    {effect}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-300">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <ScatterChartIcon className="w-6 h-6 text-primary" />
        Insights
      </h2>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <ScatterChart>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              type="number"
              dataKey="timestamp" 
              name="Date"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatTimestamp}
              className="text-xs text-muted-foreground"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
              height={60}
            />
            <YAxis 
              type="number"
              dataKey="dosage" 
              name="Dosage"
              unit="g"
              className="text-xs text-muted-foreground"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <ZAxis range={[80, 80]} />
            <Tooltip content={<CustomTooltip />} />
            {Object.entries(groupedData).map(([strainType, data]) => (
              <Scatter 
                key={strainType}
                name={strainType}
                data={data} 
                fill={strainTypeColors[strainType as keyof typeof strainTypeColors]}
                opacity={0.8}
              />
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Badge Filters */}
      {topBadges.length > 0 && (
        <div className="mt-6">
          <p className="text-sm text-muted-foreground mb-3 text-center">Filter by most common:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {topBadges.map(({ badge, count, type }) => {
              const colors = getBadgeColor(type);
              const isSelected = isBadgeSelected(badge);
              
              return (
                <Badge
                  key={badge}
                  className="cursor-pointer hover:scale-105 transition-transform px-3 py-1.5 text-xs"
                  style={{
                    backgroundColor: isSelected ? colors.bg : 'transparent',
                    borderColor: colors.bg,
                    color: isSelected ? colors.fg : 'hsl(var(--foreground))',
                    border: `1px solid ${colors.bg}`,
                    opacity: isSelected ? 1 : 0.6
                  }}
                  onClick={() => toggleBadge(badge)}
                >
                  {badge} ({count})
                </Badge>
              );
            })}
          </div>
          {selectedBadges.size > 0 && (
            <p className="text-xs text-center mt-2 text-muted-foreground">
              Showing {filteredData.length} of {scatterData.length} entries
            </p>
          )}
        </div>
      )}

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
