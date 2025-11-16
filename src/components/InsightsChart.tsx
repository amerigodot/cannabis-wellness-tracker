import { Card } from "@/components/ui/card";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis } from "recharts";
import { ScatterChart as ScatterChartIcon } from "lucide-react";

interface JournalEntry {
  id: string;
  created_at: string;
  dosage: string;
  activities?: string[];
  negative_side_effects?: string[];
}

interface InsightsChartProps {
  entries: JournalEntry[];
}

export const InsightsChart = ({ entries }: InsightsChartProps) => {
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
      strain: entry.dosage
    };
  }).sort((a, b) => a.timestamp - b.timestamp);

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
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
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
              name="Time"
              domain={['dataMin', 'dataMax']}
              tickFormatter={formatTimestamp}
              className="text-xs text-muted-foreground"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              type="number"
              dataKey="dosage" 
              name="Dosage"
              unit="g"
              className="text-xs text-muted-foreground"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <ZAxis range={[60, 60]} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--card-foreground))'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number, name: string) => {
                if (name === 'dosage') return [`${value.toFixed(2)}g`, 'Dosage'];
                return [value, name];
              }}
              labelFormatter={formatTimestamp}
            />
            <Scatter 
              data={scatterData} 
              fill="hsl(var(--primary))"
              opacity={0.7}
            />
          </ScatterChart>
        </ResponsiveContainer>
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
