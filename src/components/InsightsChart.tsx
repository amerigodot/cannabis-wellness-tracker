import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BarChart3 } from "lucide-react";

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
  // Group entries by date
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

  // Convert to array and sort by date
  const chartData = Object.entries(entriesByDate)
    .map(([date, count]) => ({ date, count }))
    .slice(-14); // Show last 14 days

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-300">
      <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary" />
        Insights
      </h2>
      
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs text-muted-foreground"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs text-muted-foreground"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              allowDecimals={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px',
                color: 'hsl(var(--card-foreground))'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar 
              dataKey="count" 
              fill="hsl(var(--primary))" 
              radius={[8, 8, 0, 0]}
              name="Entries"
            />
          </BarChart>
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
