import { useFormContext, Controller } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Wind, Cigarette, Droplet, Beaker, Pipette, Cookie } from "lucide-react";
import { JournalEntryFormValues } from "@/schemas/journalEntry";
import { getMethodIcon } from "@/constants/journal";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";

export const DosageInfo = () => {
  const { register, control, watch, formState: { errors } } = useFormContext<JournalEntryFormValues>();
  const thcWeightAmount = watch("thcWeightAmount");
  const cbdWeightAmount = watch("cbdWeightAmount");
  const dosageUnit = watch("dosageUnit");

  const totalWeight = useMemo(() => {
    const thc = parseFloat(thcWeightAmount) || 0;
    const cbd = parseFloat(cbdWeightAmount) || 0;
    return (thc + cbd).toFixed(2);
  }, [thcWeightAmount, cbdWeightAmount]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="dosage">Dosage Weights</Label>
          <Badge variant="secondary" className="font-mono">
            Total: {totalWeight}{dosageUnit}
          </Badge>
        </div>
        
        <div className="grid grid-cols-2 gap-3 mt-1.5">
          <div className="space-y-1.5">
            <Label htmlFor="thcWeight" className="text-xs text-muted-foreground">THC Weight</Label>
            <Input
              id="thcWeight"
              type="number"
              step="0.01"
              placeholder="THC"
              {...register("thcWeightAmount")}
            />
          </div>
          
          <div className="space-y-1.5">
            <Label htmlFor="cbdWeight" className="text-xs text-muted-foreground">CBD Weight</Label>
            <Input
              id="cbdWeight"
              type="number"
              step="0.01"
              placeholder="CBD"
              {...register("cbdWeightAmount")}
            />
          </div>
        </div>

        <div className="flex gap-2 items-center">
          <Label className="text-xs text-muted-foreground">Unit:</Label>
          <Controller
            name="dosageUnit"
            control={control}
            defaultValue="g"
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger className="w-full">
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
        {errors.thcWeightAmount && (
          <p className="text-xs text-destructive mt-1">{errors.thcWeightAmount.message}</p>
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