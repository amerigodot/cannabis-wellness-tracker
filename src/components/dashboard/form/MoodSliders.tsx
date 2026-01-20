import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Smile, AlertCircle, Brain, Zap, Target } from "lucide-react";
import { JournalEntryFormValues } from "@/schemas/journalEntry";

interface MoodSlidersProps {
  prefix: 'before' | 'after';
}

export const MoodSliders = ({ prefix }: MoodSlidersProps) => {
  const { control, watch } = useFormContext<JournalEntryFormValues>();
  
  // Watch values to display current value
  const mood = watch(`${prefix}_mood`);
  const pain = watch(`${prefix}_pain`);
  const anxiety = watch(`${prefix}_anxiety`);
  const energy = watch(`${prefix}_energy`);
  const focus = watch(`${prefix}_focus`);

  // Helper for comparative display (only for 'after')
  const getComparison = (current: number, metric: 'mood' | 'pain' | 'anxiety' | 'energy' | 'focus') => {
    if (prefix !== 'after') return null;
    const beforeValue = watch(`before_${metric}`);
    if (current === beforeValue) return null;
    
    const diff = current - beforeValue;
    const absDiff = Math.abs(diff);
    
    // For pain and anxiety, decrease is good (green), increase is bad (red)
    // For others, increase is good (green), decrease is bad (red)
    let isGood = diff > 0;
    if (metric === 'pain' || metric === 'anxiety') {
      isGood = diff < 0;
    }
    
    return (
      <span className={`text-xs font-medium ${isGood ? 'text-green-500' : 'text-red-500'}`}>
        {diff > 0 ? '↑' : '↓'}{absDiff}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Mood Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Smile className="w-4 h-4 text-primary" />
            Mood {prefix === 'after' ? 'Now' : ''}
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{mood}/10</span>
            {getComparison(mood, 'mood')}
          </div>
        </div>
        <Controller
          name={`${prefix}_mood`}
          control={control}
          defaultValue={5}
          render={({ field }) => (
            <Slider
              value={[field.value]}
              onValueChange={(val) => field.onChange(val[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Very Low</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* Pain Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-side-effect" />
            Pain Level {prefix === 'after' ? 'Now' : ''}
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{pain}/10</span>
            {getComparison(pain, 'pain')}
          </div>
        </div>
        <Controller
          name={`${prefix}_pain`}
          control={control}
          defaultValue={5}
          render={({ field }) => (
            <Slider
              value={[field.value]}
              onValueChange={(val) => field.onChange(val[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>No Pain</span>
          <span>Severe Pain</span>
        </div>
      </div>

      {/* Anxiety Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            Anxiety Level {prefix === 'after' ? 'Now' : ''}
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{anxiety}/10</span>
            {getComparison(anxiety, 'anxiety')}
          </div>
        </div>
        <Controller
          name={`${prefix}_anxiety`}
          control={control}
          defaultValue={5}
          render={({ field }) => (
            <Slider
              value={[field.value]}
              onValueChange={(val) => field.onChange(val[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>No Anxiety</span>
          <span>High Anxiety</span>
        </div>
      </div>

      {/* Energy Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Zap className="w-4 h-4 text-accent" />
            Energy Level {prefix === 'after' ? 'Now' : ''}
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{energy}/10</span>
            {getComparison(energy, 'energy')}
          </div>
        </div>
        <Controller
          name={`${prefix}_energy`}
          control={control}
          defaultValue={5}
          render={({ field }) => (
            <Slider
              value={[field.value]}
              onValueChange={(val) => field.onChange(val[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Very Low</span>
          <span>Very High</span>
        </div>
      </div>

      {/* Focus Slider */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Focus Level {prefix === 'after' ? 'Now' : ''}
          </Label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{focus}/10</span>
            {getComparison(focus, 'focus')}
          </div>
        </div>
        <Controller
          name={`${prefix}_focus`}
          control={control}
          defaultValue={5}
          render={({ field }) => (
            <Slider
              value={[field.value]}
              onValueChange={(val) => field.onChange(val[0])}
              min={1}
              max={10}
              step={1}
              className="w-full"
            />
          )}
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Can't Focus</span>
          <span>Very Focused</span>
        </div>
      </div>
    </div>
  );
};
