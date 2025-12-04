import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { JournalEntry } from "@/types/journal";
import { getMethodIcon } from "@/constants/journal";
import { EntryCard } from "./EntryCard";
import { Loader2 } from "lucide-react";

interface EntryListProps {
  entries: JournalEntry[];
  isDemoMode: boolean;
  sortBy: string;
  setSortBy: (value: string) => void;
  timeRangeFilter: 'all' | 'today' | 'week' | 'month';
  setTimeRangeFilter: (value: 'all' | 'today' | 'week' | 'month') => void;
  filterObservations: string[];
  filterActivities: string[];
  filterSideEffects: string[];
  filterMethods: string[];
  setFilterObservations: (value: string[] | ((prev: string[]) => string[])) => void;
  setFilterActivities: (value: string[] | ((prev: string[]) => string[])) => void;
  setFilterSideEffects: (value: string[] | ((prev: string[]) => string[])) => void;
  setFilterMethods: (value: string[] | ((prev: string[]) => string[])) => void;
  onOpenNotesDialog: (entryId: string, notes: string) => void;
  onDelete: (entryId: string) => void;
  onOpenTimeEditDialog: (entryId: string, currentTime: string) => void;
  onCompletePendingEntry: (entryId: string) => void;
  // Pagination props
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  totalCount?: number;
}

export const EntryList = ({
  entries,
  isDemoMode,
  sortBy,
  setSortBy,
  timeRangeFilter,
  setTimeRangeFilter,
  filterObservations,
  filterActivities,
  filterSideEffects,
  filterMethods,
  setFilterObservations,
  setFilterActivities,
  setFilterSideEffects,
  setFilterMethods,
  onOpenNotesDialog,
  onDelete,
  onOpenTimeEditDialog,
  onCompletePendingEntry,
  hasNextPage = false,
  isFetchingNextPage = false,
  fetchNextPage,
  totalCount = 0,
}: EntryListProps) => {
  const sortedEntries = [...entries].sort((a, b) => {
    switch (sortBy) {
      case "date-asc":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      case "date-desc":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      case "strain-asc":
        return a.strain.localeCompare(b.strain);
      case "strain-desc":
        return b.strain.localeCompare(a.strain);
      case "dosage-asc":
        return parseFloat(a.dosage) - parseFloat(b.dosage);
      case "dosage-desc":
        return parseFloat(b.dosage) - parseFloat(a.dosage);
      default:
        return 0;
    }
  });

  return (
    <div className="space-y-4">
      {/* Active Filters */}
      {(filterObservations.length > 0 || filterActivities.length > 0 || filterSideEffects.length > 0 || filterMethods.length > 0) && (
        <Card className="p-4 mb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <Label className="text-sm font-semibold mb-2 block">Active Filters:</Label>
              <div className="flex flex-wrap gap-2">
                {filterObservations.map(obs => (
                  <Badge 
                    key={obs} 
                    className="bg-observation text-observation-foreground cursor-pointer hover:opacity-70 hover:scale-95 transition-all min-h-[36px] px-3 touch-manipulation"
                    onClick={() => setFilterObservations(prev => prev.filter(o => o !== obs))}
                    title="Click to remove filter"
                  >
                    {obs} ×
                  </Badge>
                ))}
                {filterActivities.map(act => (
                  <Badge 
                    key={act} 
                    className="bg-activity text-activity-foreground cursor-pointer hover:opacity-70 hover:scale-95 transition-all min-h-[36px] px-3 touch-manipulation"
                    onClick={() => setFilterActivities(prev => prev.filter(a => a !== act))}
                    title="Click to remove filter"
                  >
                    {act} ×
                  </Badge>
                ))}
                {filterSideEffects.map(eff => (
                  <Badge 
                    key={eff} 
                    className="bg-side-effect text-side-effect-foreground cursor-pointer hover:opacity-70 hover:scale-95 transition-all min-h-[36px] px-3 touch-manipulation"
                    onClick={() => setFilterSideEffects(prev => prev.filter(e => e !== eff))}
                    title="Click to remove filter"
                  >
                    {eff} ×
                  </Badge>
                ))}
                {filterMethods.map(method => (
                  <Badge 
                    key={method} 
                    variant="default"
                    className="flex items-center gap-1 cursor-pointer hover:opacity-70 hover:scale-95 transition-all min-h-[36px] px-3 touch-manipulation"
                    onClick={() => setFilterMethods(prev => prev.filter(m => m !== method))}
                    title="Click to remove filter"
                  >
                    {(() => {
                      const MethodIcon = getMethodIcon(method);
                      return <MethodIcon className="h-3 w-3" />;
                    })()}
                    {method} ×
                  </Badge>
                ))}
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="min-h-[40px] touch-manipulation"
              onClick={() => {
                setFilterObservations([]);
                setFilterActivities([]);
                setFilterSideEffects([]);
                setFilterMethods([]);
              }}
            >
              Clear All
            </Button>
          </div>
        </Card>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-xl sm:text-2xl font-semibold">Recent Entries</h2>
          {totalCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {entries.length} of {totalCount}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="sort" className="text-sm text-muted-foreground whitespace-nowrap">Sort by:</Label>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger id="sort" className="w-[160px] sm:w-[180px] min-h-[40px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="strain-asc">Strain (A-Z)</SelectItem>
              <SelectItem value="strain-desc">Strain (Z-A)</SelectItem>
              <SelectItem value="dosage-asc">Dosage (Low-High)</SelectItem>
              <SelectItem value="dosage-desc">Dosage (High-Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Time Range Filter */}
      <Card className="p-4 mb-6">
        <div className="flex flex-col gap-2">
          <Label className="text-sm font-semibold">Filter by Time:</Label>
          <div className="grid grid-cols-2 sm:flex gap-2">
            <Button
              variant={timeRangeFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRangeFilter('all')}
              className="sm:flex-1 min-h-[40px] touch-manipulation"
            >
              All Time
            </Button>
            <Button
              variant={timeRangeFilter === 'today' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRangeFilter('today')}
              className="sm:flex-1 min-h-[40px] touch-manipulation"
            >
              Today
            </Button>
            <Button
              variant={timeRangeFilter === 'week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRangeFilter('week')}
              className="sm:flex-1 min-h-[40px] touch-manipulation"
            >
              This Week
            </Button>
            <Button
              variant={timeRangeFilter === 'month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setTimeRangeFilter('month')}
              className="sm:flex-1 min-h-[40px] touch-manipulation"
            >
              This Month
            </Button>
          </div>
        </div>
      </Card>
      
      <div className="space-y-4">
        {sortedEntries.map((entry) => (
          <EntryCard
            key={entry.id}
            entry={entry}
            isDemoMode={isDemoMode}
            filterObservations={filterObservations}
            filterActivities={filterActivities}
            filterSideEffects={filterSideEffects}
            setFilterObservations={setFilterObservations}
            setFilterActivities={setFilterActivities}
            setFilterSideEffects={setFilterSideEffects}
            onOpenNotesDialog={onOpenNotesDialog}
            onDelete={onDelete}
            onOpenTimeEditDialog={onOpenTimeEditDialog}
            onCompletePendingEntry={onCompletePendingEntry}
          />
        ))}
      </div>

      {/* Load More Button */}
      {hasNextPage && fetchNextPage && (
        <div className="flex justify-center pt-6">
          <Button
            variant="outline"
            size="lg"
            onClick={fetchNextPage}
            disabled={isFetchingNextPage}
            className="min-h-[48px] min-w-[200px] touch-manipulation"
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Loading more...
              </>
            ) : (
              `Load More Entries`
            )}
          </Button>
        </div>
      )}

      {/* No more entries message */}
      {!hasNextPage && entries.length > 0 && totalCount > 20 && (
        <p className="text-center text-sm text-muted-foreground pt-4">
          All {totalCount} entries loaded
        </p>
      )}
    </div>
  );
};
