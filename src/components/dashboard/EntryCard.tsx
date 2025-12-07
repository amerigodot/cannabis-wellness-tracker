import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Clock, FileText, Trash2, Activity } from "lucide-react";
import { JournalEntry } from "@/types/journal";
import { calculateEffectiveness } from "@/utils/wellness";
import { getIconComponent, getMethodIcon } from "@/constants/journal";

interface EntryCardProps {
  entry: JournalEntry;
  isDemoMode: boolean;
  filterObservations: string[];
  filterActivities: string[];
  filterSideEffects: string[];
  setFilterObservations: (value: string[] | ((prev: string[]) => string[])) => void;
  setFilterActivities: (value: string[] | ((prev: string[]) => string[])) => void;
  setFilterSideEffects: (value: string[] | ((prev: string[]) => string[])) => void;
  onOpenNotesDialog: (entryId: string, notes: string) => void;
  onDelete: (entryId: string) => void;
  onOpenTimeEditDialog: (entryId: string, currentTime: string) => void;
  onCompletePendingEntry: (entryId: string) => void;
}

export const EntryCard = ({
  entry,
  isDemoMode,
  filterObservations,
  filterActivities,
  filterSideEffects,
  setFilterObservations,
  setFilterActivities,
  setFilterSideEffects,
  onOpenNotesDialog,
  onDelete,
  onOpenTimeEditDialog,
  onCompletePendingEntry,
}: EntryCardProps) => {
  const IconComponent = getIconComponent(entry.icon || 'leaf');
  const effectiveness = calculateEffectiveness(entry);

  return (
    <Card className="overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-300 animate-in fade-in slide-in-from-bottom-2">
      <div className="p-6">
        {/* Pending Status Banner */}
        {entry.entry_status === 'pending_after' && (
          <div className="mb-4 p-3 bg-accent/20 border border-accent rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-accent">Pending Completion</span>
                <Badge variant="outline" className="ml-2">
                  {(() => {
                    const consumptionTime = new Date(entry.consumption_time || entry.created_at);
                    const now = new Date();
                    const minutesElapsed = Math.floor((now.getTime() - consumptionTime.getTime()) / (1000 * 60));
                    
                    const suggestedMinutes = entry.method === 'Edible' ? 120 : 
                                           entry.method === 'Oil' || entry.method === 'Tincture' ? 60 : 30;
                    
                    if (minutesElapsed >= suggestedMinutes) {
                      return 'Ready to complete';
                    } else {
                      const remaining = suggestedMinutes - minutesElapsed;
                      return `${remaining} min remaining`;
                    }
                  })()}
                </Badge>
              </div>
              <Button
                size="sm"
                onClick={() => onCompletePendingEntry(entry.id)}
                className="gap-2"
              >
                <Activity className="h-4 w-4" />
                Complete Entry
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Log your "After" state to see effectiveness metrics
            </p>
          </div>
        )}
        
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-primary/10">
              <IconComponent className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">
                {entry.strain}
                {entry.strain_2 && <span className="text-muted-foreground"> + {entry.strain_2}</span>}
              </h3>
              <button
                onClick={() => onOpenTimeEditDialog(entry.id, entry.consumption_time || entry.created_at)}
                className="flex items-center gap-2 text-sm text-muted-foreground mt-1 hover:text-primary transition-colors cursor-pointer"
              >
                <Clock className="h-3 w-3" />
                <span className="hover:underline">{new Date(entry.consumption_time || entry.created_at).toLocaleString()}</span>
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onOpenNotesDialog(entry.id, entry.notes || "")}
              className="text-muted-foreground hover:text-primary rounded-full"
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(entry.id)}
              className="text-muted-foreground hover:text-destructive rounded-full"
              disabled={isDemoMode}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <Label className="text-xs text-muted-foreground">Dosage</Label>
            <p className="font-medium">{entry.dosage}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Method</Label>
            <div className="flex items-center gap-2 font-medium">
              {(() => {
                const MethodIcon = getMethodIcon(entry.method);
                return <MethodIcon className="h-4 w-4" />;
              })()}
              {entry.method}
            </div>
          </div>
          {entry.thc_percentage && (
            <div>
              <Label className="text-xs text-muted-foreground">THC %</Label>
              <p className="font-medium">{entry.thc_percentage}%</p>
            </div>
          )}
          {entry.cbd_percentage && (
            <div>
              <Label className="text-xs text-muted-foreground">CBD %</Label>
              <p className="font-medium">{entry.cbd_percentage}%</p>
            </div>
          )}
        </div>

        {/* Effectiveness Score */}
        {entry.entry_status === 'complete' && entry.before_mood && entry.after_mood && (
          <div className="mb-4 p-3 bg-muted/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold">Effectiveness</Label>
              <Badge className={`${effectiveness.color} text-white`}>
                {effectiveness.label} ({effectiveness.score}%)
              </Badge>
            </div>
            <div className="grid grid-cols-5 gap-2 text-xs">
              <div className="text-center">
                <p className="text-muted-foreground">Mood</p>
                <p className={entry.after_mood! > entry.before_mood! ? 'text-green-500' : entry.after_mood! < entry.before_mood! ? 'text-red-500' : ''}>
                  {entry.before_mood} → {entry.after_mood}
                  {entry.after_mood! !== entry.before_mood! && (
                    <span className="ml-1">
                      {entry.after_mood! > entry.before_mood! ? '↑' : '↓'}
                    </span>
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Pain</p>
                <p className={entry.after_pain! < entry.before_pain! ? 'text-green-500' : entry.after_pain! > entry.before_pain! ? 'text-red-500' : ''}>
                  {entry.before_pain} → {entry.after_pain}
                  {entry.after_pain! !== entry.before_pain! && (
                    <span className="ml-1">
                      {entry.after_pain! < entry.before_pain! ? '↓' : '↑'}
                    </span>
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Anxiety</p>
                <p className={entry.after_anxiety! < entry.before_anxiety! ? 'text-green-500' : entry.after_anxiety! > entry.before_anxiety! ? 'text-red-500' : ''}>
                  {entry.before_anxiety} → {entry.after_anxiety}
                  {entry.after_anxiety! !== entry.before_anxiety! && (
                    <span className="ml-1">
                      {entry.after_anxiety! < entry.before_anxiety! ? '↓' : '↑'}
                    </span>
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Energy</p>
                <p className={entry.after_energy! > entry.before_energy! ? 'text-green-500' : entry.after_energy! < entry.before_energy! ? 'text-red-500' : ''}>
                  {entry.before_energy} → {entry.after_energy}
                  {entry.after_energy! !== entry.before_energy! && (
                    <span className="ml-1">
                      {entry.after_energy! > entry.before_energy! ? '↑' : '↓'}
                    </span>
                  )}
                </p>
              </div>
              <div className="text-center">
                <p className="text-muted-foreground">Focus</p>
                <p className={entry.after_focus! > entry.before_focus! ? 'text-green-500' : entry.after_focus! < entry.before_focus! ? 'text-red-500' : ''}>
                  {entry.before_focus} → {entry.after_focus}
                  {entry.after_focus! !== entry.before_focus! && (
                    <span className="ml-1">
                      {entry.after_focus! > entry.before_focus! ? '↑' : '↓'}
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        )}

        {entry.observations.length > 0 && (
          <div className="mb-4">
            <Label className="text-xs text-muted-foreground mb-2 block">Observations</Label>
            <div className="flex flex-wrap gap-2">
              {entry.observations.map((obs) => (
              <Badge 
                key={obs} 
                className={`px-2 py-1 cursor-pointer transition-all hover:scale-105 hover:opacity-80 ${
                  filterObservations.includes(obs)
                    ? "bg-observation text-observation-foreground"
                    : "bg-observation-light text-observation-foreground"
                }`}
                onClick={() => {
                  setFilterObservations(prev => 
                    prev.includes(obs) 
                      ? prev.filter(o => o !== obs)
                      : [...prev, obs]
                  );
                }}
                title={filterObservations.includes(obs) ? "Click to remove filter" : "Click to add filter"}
              >
                  {obs}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {entry.activities.length > 0 && (
          <div className="mb-4">
            <Label className="text-xs text-muted-foreground mb-2 block">Activities</Label>
            <div className="flex flex-wrap gap-2">
              {entry.activities.map((activity) => (
              <Badge 
                key={activity} 
                className={`px-2 py-1 cursor-pointer transition-all hover:scale-105 hover:opacity-80 ${
                  filterActivities.includes(activity)
                    ? "bg-activity text-activity-foreground"
                    : "bg-activity-light text-activity-foreground"
                }`}
                onClick={() => {
                  setFilterActivities(prev => 
                    prev.includes(activity) 
                      ? prev.filter(a => a !== activity)
                      : [...prev, activity]
                  );
                }}
                title={filterActivities.includes(activity) ? "Click to remove filter" : "Click to add filter"}
              >
                  {activity}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {entry.negative_side_effects.length > 0 && (
          <div className="mb-4">
            <Label className="text-xs text-muted-foreground mb-2 block">Negative Side Effects</Label>
            <div className="flex flex-wrap gap-2">
              {entry.negative_side_effects.map((effect) => (
              <Badge 
                key={effect} 
                className={`px-2 py-1 cursor-pointer transition-all hover:scale-105 hover:opacity-80 ${
                  filterSideEffects.includes(effect)
                    ? "bg-side-effect text-side-effect-foreground"
                    : "bg-side-effect-light text-side-effect-foreground"
                }`}
                onClick={() => {
                  setFilterSideEffects(prev => 
                    prev.includes(effect) 
                      ? prev.filter(e => e !== effect)
                      : [...prev, effect]
                  );
                }}
                title={filterSideEffects.includes(effect) ? "Click to remove filter" : "Click to add filter"}
              >
                  {effect}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {entry.notes && (
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Notes</Label>
            <p className="text-sm text-muted-foreground leading-relaxed">{entry.notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
};
