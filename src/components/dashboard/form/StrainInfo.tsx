import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { JournalEntryFormValues } from "@/schemas/journalEntry";

export const StrainInfo = () => {
  const { register, formState: { errors } } = useFormContext<JournalEntryFormValues>();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="strain">Strain Name</Label>
          <Input
            id="strain"
            placeholder="e.g., Blue Dream"
            className="mt-1.5"
            {...register("strain")}
          />
          {errors.strain && (
            <p className="text-xs text-destructive mt-1">{errors.strain.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="strain_2">Second Strain (Optional)</Label>
          <Input
            id="strain_2"
            placeholder="e.g., OG Kush"
            className="mt-1.5"
            {...register("strain_2")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="thc_percentage">THC % (Optional)</Label>
          <Input
            id="thc_percentage"
            type="number"
            step="0.1"
            min="0"
            max="100"
            placeholder="e.g., 24.5"
            className="mt-1.5"
            {...register("thc_percentage")}
          />
        </div>
        <div>
          <Label htmlFor="cbd_percentage">CBD % (Optional)</Label>
          <Input
            id="cbd_percentage"
            type="number"
            step="0.1"
            min="0"
            max="100"
            placeholder="e.g., 0.5"
            className="mt-1.5"
            {...register("cbd_percentage")}
          />
        </div>
      </div>
    </div>
  );
};
