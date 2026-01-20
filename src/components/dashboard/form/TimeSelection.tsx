import { useFormContext, Controller } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { formatTimeAgo } from "@/utils/wellness";
import { JournalEntryFormValues } from "@/schemas/journalEntry";

export const TimeSelection = () => {
  const { control, watch } = useFormContext<JournalEntryFormValues>();
  const minutesAgo = watch("minutesAgo");

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Time Since Consumption</Label>
        <span className="text-sm text-muted-foreground">
          {formatTimeAgo(minutesAgo)}
        </span>
      </div>
      <div className="relative">
        <Controller
          name="minutesAgo"
          control={control}
          defaultValue={0}
          render={({ field }) => (
            <Slider
              value={[field.value]}
              onValueChange={(val) => field.onChange(val[0])}
              max={1440}
              step={1}
              className="w-full"
            />
          )}
        />
      </div>
      <div className="relative text-xs text-muted-foreground h-4 mt-1">
        <span className="absolute left-0">Now</span>
        <span className="absolute left-[25%] -translate-x-1/2">1h</span>
        <span className="absolute left-[50%] -translate-x-1/2 font-medium">2h</span>
        <span className="absolute left-[59.09%] -translate-x-1/2 hidden sm:inline">6h</span>
        <span className="absolute left-[72.73%] -translate-x-1/2">12h</span>
        <span className="absolute right-0">24h</span>
      </div>
    </div>
  );
};
