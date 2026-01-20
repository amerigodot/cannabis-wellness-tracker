import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wind, Cigarette, Droplet, Beaker, Pipette, Cookie } from "lucide-react";
import { JournalEntryFormValues } from "@/schemas/journalEntry";
import { getMethodIcon } from "@/constants/journal";

export const DosageInfo = () => {
  const { register, control, watch, formState: { errors } } = useFormContext<JournalEntryFormValues>();
  const method = watch("method");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <Label htmlFor="dosageAmount">Dosage</Label>
        <div className="flex gap-2 mt-1.5">
          <div className="flex-1">
            <Input
              id="dosageAmount"
              type="number"
              step="0.1"
              placeholder="e.g., 0.5"
              {...register("dosageAmount")}
            />
          </div>
          <Controller
            name="dosageUnit"
            control={control}
            defaultValue="g"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="mg">mg</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>
        {errors.dosageAmount && (
          <p className="text-xs text-destructive mt-1">{errors.dosageAmount.message}</p>
        )}
      </div>
      
      <div>
        <Label htmlFor="method">Method</Label>
        <Controller
          name="method"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Select method">
                  {field.value && (
                    <div className="flex items-center gap-2">
                      {getMethodIcon(field.value)({ className: "h-4 w-4" })}
                      <span>{field.value}</span>
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Vape">
                  <div className="flex items-center gap-2">
                    <Wind className="h-4 w-4" />
                    <span>Vape</span>
                  </div>
                </SelectItem>
                <SelectItem value="Smoke">
                  <div className="flex items-center gap-2">
                    <Cigarette className="h-4 w-4" />
                    <span>Smoke</span>
                  </div>
                </SelectItem>
                <SelectItem value="Oil">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4" />
                    <span>Oil</span>
                  </div>
                </SelectItem>
                <SelectItem value="Tincture">
                  <div className="flex items-center gap-2">
                    <Beaker className="h-4 w-4" />
                    <span>Tincture</span>
                  </div>
                </SelectItem>
                <SelectItem value="Topical">
                  <div className="flex items-center gap-2">
                    <Pipette className="h-4 w-4" />
                    <span>Topical</span>
                  </div>
                </SelectItem>
                <SelectItem value="Edible">
                  <div className="flex items-center gap-2">
                    <Cookie className="h-4 w-4" />
                    <span>Edible</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        {errors.method && (
          <p className="text-xs text-destructive mt-1">{errors.method.message}</p>
        )}
      </div>
    </div>
  );
};
