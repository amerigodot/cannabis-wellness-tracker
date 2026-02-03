import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format, parseISO } from "date-fns";

interface TrendDataPoint {
  date: string;
  pain?: number;
  anxiety?: number;
  sleep?: number;
  thc?: number;
  cbd?: number;
}

interface AdvancedTrendChartProps {
  data: TrendDataPoint[];
}

export function AdvancedTrendChart({ data }: AdvancedTrendChartProps) {
  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  console.log("[TrendChart] Rendering with data:", sortedData.length, "points", sortedData);

  // Show placeholder if no valid data points
  if (sortedData.length === 0) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>Symptom vs. Dosage Correlations</CardTitle>
          <CardDescription>No data available to display.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex items-center justify-center text-muted-foreground">
          <p>Select a patient with journal entries to see trends.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Symptom vs. Dosage Correlations</CardTitle>
        <CardDescription>
          Visualize how changing cannabinoid doses impacts reported symptom severity over time.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 min-h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={sortedData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPain" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAnxiety" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis 
              dataKey="date" 
              tickFormatter={(str) => format(parseISO(str), 'MMM d')}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            {/* Left Y-Axis: Symptoms (0-10) */}
            <YAxis 
              yAxisId="left" 
              domain={[0, 10]} 
              label={{ value: 'Severity (0-10)', angle: -90, position: 'insideLeft', style: { fill: 'hsl(var(--muted-foreground))' } }}
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
            />
            {/* Right Y-Axis: Dosage (mg) */}
            <YAxis 
              yAxisId="right" 
              orientation="right" 
              domain={[0, 'auto']} 
              label={{ value: 'THC Dose (mg)', angle: 90, position: 'insideRight', style: { fill: 'hsl(var(--primary))' } }}
              stroke="hsl(var(--primary))"
              fontSize={12}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: 'var(--radius)' }}
              itemStyle={{ color: 'hsl(var(--foreground))' }}
              labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
              labelFormatter={(label) => format(parseISO(label), 'PPP')}
            />
            <Legend verticalAlign="top" height={36} />
            
            {/* Symptom Areas (Background Context) */}
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="pain" 
              stroke="#ef4444" 
              fillOpacity={1} 
              fill="url(#colorPain)" 
              name="Pain Score"
              strokeWidth={2}
            />
            <Area 
              yAxisId="left"
              type="monotone" 
              dataKey="anxiety" 
              stroke="#f59e0b" 
              fillOpacity={1} 
              fill="url(#colorAnxiety)" 
              name="Anxiety Score"
              strokeWidth={2}
            />
            
            {/* Dose Line (Overlay) */}
            <Line 
              yAxisId="right"
              type="stepAfter" 
              dataKey="thc" 
              stroke="hsl(var(--primary))" 
              name="Daily THC (mg)" 
              strokeWidth={3}
              dot={{ r: 4, fill: 'hsl(var(--primary))' }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}