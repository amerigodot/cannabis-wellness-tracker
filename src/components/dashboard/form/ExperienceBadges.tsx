import { useFormContext } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Smile, Activity, AlertCircle, ChevronDown, Trash2 } from "lucide-react";
import { JournalEntryFormValues } from "@/schemas/journalEntry";
import { COMMON_OBSERVATIONS, COMMON_ACTIVITIES, NEGATIVE_SIDE_EFFECTS } from "@/constants/journal";

interface ExperienceBadgesProps {
  observationsOpen: boolean;
  setObservationsOpen: (open: boolean) => void;
  activitiesOpen: boolean;
  setActivitiesOpen: (open: boolean) => void;
  sideEffectsOpen: boolean;
  setSideEffectsOpen: (open: boolean) => void;
  highlightObservations: boolean;
  highlightActivities: boolean;
}

export const ExperienceBadges = ({
  observationsOpen,
  setObservationsOpen,
  activitiesOpen,
  setActivitiesOpen,
  sideEffectsOpen,
  setSideEffectsOpen,
  highlightObservations,
  highlightActivities,
}: ExperienceBadgesProps) => {
  const { watch, setValue } = useFormContext<JournalEntryFormValues>();
  
  const selectedObservations = watch("observations");
  const selectedActivities = watch("activities");
  const selectedNegativeSideEffects = watch("negative_side_effects");

  const toggleSelection = (
    current: string[],
    item: string,
    fieldName: "observations" | "activities" | "negative_side_effects"
  ) => {
    const newSelection = current.includes(item)
      ? current.filter((i) => i !== item)
      : [...current, item];
    setValue(fieldName, newSelection, { shouldDirty: true });
  };

  const clearAllSelections = () => {
    setValue("observations", []);
    setValue("activities", []);
    setValue("negative_side_effects", []);
  };

  const hasSelections = selectedObservations.length > 0 || 
                        selectedActivities.length > 0 || 
                        selectedNegativeSideEffects.length > 0;

  return (
    <div className="space-y-4">
      {hasSelections && (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllSelections}
            className="text-muted-foreground hover:text-foreground gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All Selections
          </Button>
        </div>
      )}

      {/* Observations */}
      <Collapsible open={observationsOpen} onOpenChange={setObservationsOpen}>
        <div className={`border border-observation/30 rounded-lg bg-observation/5 hover:bg-observation/10 transition-all duration-300 ${
          highlightObservations ? 'ring-2 ring-observation shadow-lg scale-[1.02]' : ''
        }`}>
          <CollapsibleTrigger asChild>
            <button className="w-full p-4 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-observation/20">
                    <Smile className="w-4 h-4 text-observation" />
                  </div>
                  <Label className="text-base font-semibold text-foreground cursor-pointer">Positive Observations</Label>
                </div>
                <div className="flex items-center gap-2">
                  {selectedObservations.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedObservations.length} selected
                    </Badge>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${observationsOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <p className="text-xs text-muted-foreground mb-3">What positive effects are you experiencing?</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_OBSERVATIONS.map((obs) => (
                  <Badge
                    key={obs}
                    variant="outline"
                    className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-observation ${
                      selectedObservations.includes(obs) 
                        ? "bg-observation text-observation-foreground border-observation scale-105" 
                        : "bg-background hover:bg-observation/10"
                    }`}
                    onClick={() => toggleSelection(selectedObservations, obs, "observations")}
                  >
                    {obs}
                  </Badge>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Activities */}
      <Collapsible open={activitiesOpen} onOpenChange={setActivitiesOpen}>
        <div className={`border border-activity/30 rounded-lg bg-activity/5 hover:bg-activity/10 transition-all duration-300 ${
          highlightActivities ? 'ring-2 ring-activity shadow-lg scale-[1.02]' : ''
        }`}>
          <CollapsibleTrigger asChild>
            <button className="w-full p-4 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-activity/20">
                    <Activity className="w-4 h-4 text-activity" />
                  </div>
                  <Label className="text-base font-semibold text-foreground cursor-pointer">Activities</Label>
                </div>
                <div className="flex items-center gap-2">
                  {selectedActivities.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedActivities.length} selected
                    </Badge>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${activitiesOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <p className="text-xs text-muted-foreground mb-3">What are you doing during or after use?</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_ACTIVITIES.map((activity) => (
                  <Badge
                    key={activity}
                    variant="outline"
                    className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-activity ${
                      selectedActivities.includes(activity) 
                        ? "bg-activity text-activity-foreground border-activity scale-105" 
                        : "bg-background hover:bg-activity/10"
                    }`}
                    onClick={() => toggleSelection(selectedActivities, activity, "activities")}
                  >
                    {activity}
                  </Badge>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>

      {/* Negative Side Effects */}
      <Collapsible open={sideEffectsOpen} onOpenChange={setSideEffectsOpen}>
        <div className="border border-side-effect/30 rounded-lg bg-side-effect/5 hover:bg-side-effect/10 transition-colors duration-200">
          <CollapsibleTrigger asChild>
            <button className="w-full p-4 text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-side-effect/20">
                    <AlertCircle className="w-4 h-4 text-side-effect" />
                  </div>
                  <Label className="text-base font-semibold text-foreground cursor-pointer">Negative Side Effects</Label>
                </div>
                <div className="flex items-center gap-2">
                  {selectedNegativeSideEffects.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedNegativeSideEffects.length} selected
                    </Badge>
                  )}
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${sideEffectsOpen ? 'rotate-180' : ''}`} />
                </div>
              </div>
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="px-4 pb-4">
              <p className="text-xs text-muted-foreground mb-3">Any unwanted effects?</p>
              <div className="flex flex-wrap gap-2">
                {NEGATIVE_SIDE_EFFECTS.map((effect) => (
                  <Badge
                    key={effect}
                    variant="outline"
                    className={`cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-md hover:border-side-effect ${
                      selectedNegativeSideEffects.includes(effect) 
                        ? "bg-side-effect text-side-effect-foreground border-side-effect scale-105" 
                        : "bg-background hover:bg-side-effect/10"
                    }`}
                    onClick={() => toggleSelection(selectedNegativeSideEffects, effect, "negative_side_effects")}
                  >
                    {effect}
                  </Badge>
                ))}
              </div>
            </div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </div>
  );
};
