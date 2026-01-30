import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InsightsChart } from "@/components/InsightsChart";
import { Reminders } from "@/components/Reminders";

import { LandingPage } from "@/components/LandingPage";
import { AchievementBadges } from "@/components/AchievementBadges";
import { EntryList } from "@/components/dashboard/EntryList";
import { JournalEntryForm } from "@/components/dashboard/JournalEntryForm";
import { UnlockPrompt } from "@/components/UnlockPrompt";
import { MigrationWizard } from "@/components/MigrationWizard";
import { useEncryption } from "@/contexts/EncryptionContext";


import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, LogOut, Sparkles, Bell, Settings, Brain, ShieldCheck, Stethoscope, Lock } from "lucide-react";
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
  
  // Pending entry completion state
  const [pendingEntryToComplete, setPendingEntryToComplete] = useState<JournalEntry | null>(null);
  
  // Encryption/Privacy state
  const { 
    encryptionEnabled, 
    isUnlocked, 
    isLoading: encryptionLoading, 
    needsMigration, 
    setNeedsMigration 
  } = useEncryption();
  const [showMigrationWizard, setShowMigrationWizard] = useState(false);
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

  // Prompt for migration if user has unencrypted entries
  useEffect(() => {
    if (!isDemoMode && user && needsMigration && !encryptionEnabled) {
      // Delay showing to not overwhelm on first load
      const timer = setTimeout(() => {
        setShowMigrationWizard(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isDemoMode, user, needsMigration, encryptionEnabled]);

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
    
    // Find the entry and set it for completion
    const entry = entries.find(e => e.id === entryId);
    if (!entry) return;
    
    // Set the entry for completion - form will handle updating it
    setPendingEntryToComplete(entry);
    
    // Scroll to form
    document.getElementById('new-entry-card')?.scrollIntoView({ behavior: 'smooth' });
    toast.info("Complete the 'After' state to finish this entry");
  };
  
  const handleCancelPendingCompletion = () => {
    setPendingEntryToComplete(null);
  };



  if (authLoading || entriesLoading || encryptionLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }
  
  if (!user && !isDemoMode) {
    return <LandingPage />;
  }

  // Show unlock prompt if encryption is enabled but not unlocked
  if (!isDemoMode && encryptionEnabled && !isUnlocked) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <UnlockPrompt />
      </div>
    );
  }

  // Show migration wizard if prompted
  if (showMigrationWizard && !encryptionEnabled) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <MigrationWizard 
          onComplete={() => {
            setShowMigrationWizard(false);
            setNeedsMigration(false);
          }}
          onSkip={() => setShowMigrationWizard(false)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          {isDemoMode && (
            <div className="mb-4 p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-green-600" />
                  Submission Mode (Offline) - All data is stored locally in your browser.
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    localStorage.removeItem("demoMode");
                    navigate("/auth");
                  }}
                >
                  Exit Submission Mode
                </Button>
              </div>
            </div>
          )}
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1 flex gap-2">
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
              <Button 
                variant="outline" 
                onClick={() => navigate("/coach")}
                className="gap-2 border-primary/20 bg-primary/5 hover:bg-primary/10"
              >
                <Brain className="h-4 w-4 text-primary" />
                Private AI Coach
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate("/triage")}
                className="gap-2 border-red-200 bg-red-50 hover:bg-red-100 text-red-700"
              >
                <Stethoscope className="h-4 w-4" />
                Clinical Triage
              </Button>
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
          onUpdate={updateEntry}
          lastEntry={entries[0] || null}
          pendingEntryToComplete={pendingEntryToComplete}
          onCancelPendingCompletion={handleCancelPendingCompletion}
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

        {/* Entries List */}
        {entries.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100 space-y-4">
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
