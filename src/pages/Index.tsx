import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InsightsChart } from "@/components/InsightsChart";
import { Reminders } from "@/components/Reminders";
import { CalendarView } from "@/components/CalendarView";
import { LandingPage } from "@/components/LandingPage";
import { AchievementBadges } from "@/components/AchievementBadges";
import { EntryList } from "@/components/dashboard/EntryList";
import { JournalEntryForm } from "@/components/dashboard/JournalEntryForm";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Calendar, LogOut, List, Sparkles, Bell, Settings } from "lucide-react";
import { toast } from "sonner";

import { JournalEntry } from "@/types/journal";
import { useJournalEntries } from "@/hooks/useJournalEntries";

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // UI state
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [activeTab, setActiveTab] = useState<'list' | 'calendar'>('list');
  const [showRemindersSheet, setShowRemindersSheet] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);
  
  // Time edit dialog state
  const [editingTimeEntryId, setEditingTimeEntryId] = useState<string | null>(null);
  const [editingTime, setEditingTime] = useState<Date>(new Date());
  
  // Notes dialog state
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  
  // Mobile swipe
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Auth effect
  useEffect(() => {
    const demoMode = localStorage.getItem("demoMode") === "true";
    
    if (demoMode) {
      setAuthLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Use the custom hook for entries management
  const {
    entries,
    loading: entriesLoading,
    isDemoMode,
    filteredEntries,
    totalCount,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    createEntry,
    updateEntry,
    deleteEntry,
    updateNotes,
    updateConsumptionTime,
    filterObservations,
    setFilterObservations,
    filterActivities,
    setFilterActivities,
    filterSideEffects,
    setFilterSideEffects,
    filterMethods,
    setFilterMethods,
    timeRangeFilter,
    setTimeRangeFilter,
  } = useJournalEntries(user);

  const handleDelete = (entryId: string) => {
    setDeleteEntryId(entryId);
    setShowDeleteDialog(true);
  };

  const handlePermanentDelete = async () => {
    if (!deleteEntryId) return;
    await deleteEntry(deleteEntryId);
    setShowDeleteDialog(false);
    setDeleteEntryId(null);
  };

  const handleSignOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem("demoMode");
      navigate("/auth");
      return;
    }
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const openNotesDialog = (entryId?: string, existingNotes?: string) => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to add or edit notes!");
      return;
    }
    
    if (entryId) {
      setEditingEntryId(entryId);
      setTempNotes(existingNotes || "");
    } else {
      setEditingEntryId(null);
      setTempNotes("");
    }
    setNotesDialogOpen(true);
  };

  const saveNotes = async () => {
    if (editingEntryId) {
      await updateNotes(editingEntryId, tempNotes);
    }
    setNotesDialogOpen(false);
    setEditingEntryId(null);
    setTempNotes("");
  };

  const openTimeEditDialog = (entryId: string, currentTime: string) => {
    setEditingTimeEntryId(entryId);
    setEditingTime(new Date(currentTime));
  };

  const saveTimeEdit = async () => {
    if (!editingTimeEntryId) return;
    await updateConsumptionTime(editingTimeEntryId, editingTime);
    setEditingTimeEntryId(null);
  };

  const handleCompletePendingEntry = async (entryId: string) => {
    if (isDemoMode) {
      toast.error("Demo mode is read-only. Sign up to complete entries!");
      return;
    }
    
    // Navigate to the form and populate with entry data
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    
    // Delete the pending entry, user will re-create with after data
    await supabase.from("journal_entries").delete().eq("id", entryId);
    
    document.getElementById('new-entry-card')?.scrollIntoView({ behavior: 'smooth' });
    toast.info("Complete the 'After' state to finish this entry");
  };

  // Mobile swipe handlers
  const minSwipeDistance = 50;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && activeTab === 'list') {
      setActiveTab('calendar');
    }
    if (isRightSwipe && activeTab === 'calendar') {
      setActiveTab('list');
    }
  };

  if (authLoading || entriesLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }
  
  if (!user && !isDemoMode) {
    return <LandingPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          {isDemoMode && (
            <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">
                  🎭 Demo Mode - Exploring with sample data (read-only)
                </p>
                <Button 
                  variant="default" 
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem("demoMode");
                    navigate("/auth");
                  }}
                >
                  Sign Up to Save Your Data
                </Button>
              </div>
            </div>
          )}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              {entries.length >= 10 && (
                <Button 
                  variant="outline" 
                  onClick={() => navigate("/tools")}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Wellness Tools
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/settings")}
                className="rounded-full"
              >
                <Settings className="h-5 w-5" />
                <span className="sr-only">Settings</span>
              </Button>
              <ThemeToggle />
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">{isDemoMode ? "Exit demo" : "Sign out"}</span>
              </Button>
            </div>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center mb-4">
              <Leaf className="w-12 h-12 text-primary" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-3">
              Medical Marijuana Journal
            </h1>
            <p className="text-muted-foreground text-lg">Track your wellness journey with ease</p>
          </div>
        </header>

        {/* Achievement Badges */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
          <AchievementBadges entryCount={entries.length} />
        </div>

        {/* Entry Form */}
        <JournalEntryForm 
          isDemoMode={isDemoMode}
          onSubmit={createEntry}
          lastEntry={entries[0] || null}
        />

        {/* Insights Chart */}
        {entries.length > 0 && (
          <div id="insights-section" className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <InsightsChart 
              entries={filteredEntries}
              filterObservations={filterObservations}
              setFilterObservations={setFilterObservations}
              filterActivities={filterActivities}
              setFilterActivities={setFilterActivities}
              filterSideEffects={filterSideEffects}
              setFilterSideEffects={setFilterSideEffects}
            />
          </div>
        )}

        {/* Entries List and Calendar View */}
        {entries.length > 0 && (
          <div 
            className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'list' | 'calendar')} className="w-full">
              <TabsList className="grid w-full max-w-md mx-auto mb-6 grid-cols-2">
                <TabsTrigger value="list" className="flex items-center gap-2">
                  <List className="h-4 w-4" />
                  List View
                </TabsTrigger>
                <TabsTrigger value="calendar" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Calendar View
                </TabsTrigger>
              </TabsList>

              <TabsContent value="list" className="space-y-4">
                <EntryList
                  entries={filteredEntries}
                  isDemoMode={isDemoMode}
                  sortBy={sortBy}
                  setSortBy={setSortBy}
                  timeRangeFilter={timeRangeFilter}
                  setTimeRangeFilter={setTimeRangeFilter}
                  filterObservations={filterObservations}
                  setFilterObservations={setFilterObservations}
                  filterActivities={filterActivities}
                  setFilterActivities={setFilterActivities}
                  filterSideEffects={filterSideEffects}
                  setFilterSideEffects={setFilterSideEffects}
                  filterMethods={filterMethods}
                  setFilterMethods={setFilterMethods}
                  onDelete={handleDelete}
                  onOpenNotesDialog={openNotesDialog}
                  onOpenTimeEditDialog={openTimeEditDialog}
                  onCompletePendingEntry={handleCompletePendingEntry}
                  hasNextPage={hasNextPage}
                  isFetchingNextPage={isFetchingNextPage}
                  fetchNextPage={fetchNextPage}
                  totalCount={totalCount}
                />
              </TabsContent>

              <TabsContent value="calendar">
                <CalendarView 
                  filterObservations={filterObservations}
                  setFilterObservations={setFilterObservations}
                  filterActivities={filterActivities}
                  setFilterActivities={setFilterActivities}
                  filterSideEffects={filterSideEffects}
                  setFilterSideEffects={setFilterSideEffects}
                  filterMethods={filterMethods}
                  setFilterMethods={setFilterMethods}
                  isDemoMode={isDemoMode}
                  demoEntries={isDemoMode ? filteredEntries : undefined}
                />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Reminders FAB */}
        {!isDemoMode && (
          <Sheet open={showRemindersSheet} onOpenChange={setShowRemindersSheet}>
            <SheetTrigger asChild>
              <Button
                className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
                size="icon"
              >
                <Bell className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Reminders
                </SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <Reminders />
              </div>
            </SheetContent>
          </Sheet>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Entry</AlertDialogTitle>
              <AlertDialogDescription>
                This will move the entry to trash. You can restore it later from the trash.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handlePermanentDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Time Edit Dialog */}
        <Dialog open={!!editingTimeEntryId} onOpenChange={(open) => !open && setEditingTimeEntryId(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Consumption Time</DialogTitle>
              <DialogDescription>
                Adjust when you consumed this entry.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input
                  type="date"
                  value={editingTime.toISOString().split('T')[0]}
                  onChange={(e) => {
                    const newDate = new Date(e.target.value);
                    newDate.setHours(editingTime.getHours(), editingTime.getMinutes());
                    setEditingTime(newDate);
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label>Time</Label>
                <Input
                  type="time"
                  value={editingTime.toTimeString().slice(0, 5)}
                  onChange={(e) => {
                    const [hours, minutes] = e.target.value.split(':').map(Number);
                    const newTime = new Date(editingTime);
                    newTime.setHours(hours, minutes);
                    setEditingTime(newTime);
                  }}
                />
              </div>
              <Button onClick={saveTimeEdit} className="w-full">
                Save Time
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Index;
