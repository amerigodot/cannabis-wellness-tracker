import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/ThemeToggle";
import { InsightsChart } from "@/components/InsightsChart";
import { Reminders } from "@/components/Reminders";
import { CalendarView } from "@/components/CalendarView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Leaf, Calendar, Clock, LogOut, Trash2, List, FileText, Pill, Droplet, Cigarette, Cookie, Coffee, Sparkles, Heart, Brain, Zap } from "lucide-react";
import { toast } from "sonner";

interface JournalEntry {
  id: string;
  user_id: string;
  created_at: string;
  strain: string;
  dosage: string;
  method: string;
  observations: string[];
  activities: string[];
  negative_side_effects: string[];
  notes: string | null;
  icon: string;
}

const COMMON_OBSERVATIONS = [
  "Pain Relief",
  "Relaxation",
  "Better Sleep",
  "Reduced Anxiety",
  "Improved Focus",
  "Appetite Increase",
  "Mood Lift",
  "Reduced Inflammation",
  "Muscle Relaxation",
  "Creativity Boost",
  "Nausea Relief",
  "Energy Increase",
];

const COMMON_ACTIVITIES = [
  "Social",
  "Music",
  "Painting",
  "Gaming",
  "Exercise",
  "Cooking",
  "Reading",
  "Writing",
  "Meditation",
  "Movies",
  "Work",
  "Relaxing",
];

const NEGATIVE_SIDE_EFFECTS = [
  "Dry Mouth",
  "Dry Eyes",
  "Dizziness",
  "Paranoia",
  "Anxiety",
  "Headache",
  "Fatigue",
  "Increased Heart Rate",
  "Coughing",
  "Nausea",
  "Memory Issues",
  "Confusion",
];

const AVAILABLE_ICONS = [
  { name: "Leaf", value: "leaf" },
  { name: "Pill", value: "pill" },
  { name: "Droplet", value: "droplet" },
  { name: "Cigarette", value: "cigarette" },
  { name: "Cookie", value: "cookie" },
  { name: "Coffee", value: "coffee" },
  { name: "Sparkles", value: "sparkles" },
  { name: "Heart", value: "heart" },
  { name: "Brain", value: "brain" },
  { name: "Zap", value: "zap" },
];

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [strain, setStrain] = useState("");
  const [dosageAmount, setDosageAmount] = useState("");
  const [dosageUnit, setDosageUnit] = useState("g");
  const [method, setMethod] = useState("");
  const [selectedObservations, setSelectedObservations] = useState<string[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [selectedNegativeSideEffects, setSelectedNegativeSideEffects] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("date-desc");
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [tempNotes, setTempNotes] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("leaf");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (!session) {
          navigate("/auth");
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/auth");
      } else {
        setLoading(false);
        fetchEntries();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchEntries = async () => {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error loading entries: " + error.message);
    } else {
      setEntries(data || []);
      
      // Set form defaults from last entry (strain, dosage, method only)
      if (data && data.length > 0) {
        const lastEntry = data[0];
        setStrain(lastEntry.strain);
        setMethod(lastEntry.method);
        
        // Parse dosage (e.g., "0.5g" -> amount: "0.5", unit: "g")
        const dosageMatch = lastEntry.dosage.match(/^([\d.]+)(\w+)$/);
        if (dosageMatch) {
          setDosageAmount(dosageMatch[1]);
          setDosageUnit(dosageMatch[2]);
        }
      }
    }
  };

  const toggleObservation = (obs: string) => {
    setSelectedObservations((prev) =>
      prev.includes(obs) ? prev.filter((o) => o !== obs) : [...prev, obs]
    );
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities((prev) =>
      prev.includes(activity) ? prev.filter((a) => a !== activity) : [...prev, activity]
    );
  };

  const toggleNegativeSideEffect = (effect: string) => {
    setSelectedNegativeSideEffects((prev) =>
      prev.includes(effect) ? prev.filter((e) => e !== effect) : [...prev, effect]
    );
  };

  const handleSubmit = async () => {
    if (!strain || !dosageAmount || !method) {
      toast.error("Please fill in strain, dosage, and method");
      return;
    }

    if (!user) return;

    const dosage = `${dosageAmount}${dosageUnit}`;

    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      strain,
      dosage,
      method,
      observations: selectedObservations,
      activities: selectedActivities,
      negative_side_effects: selectedNegativeSideEffects,
      notes: notes || null,
      icon: selectedIcon,
    });

    if (error) {
      toast.error("Error saving entry: " + error.message);
    } else {
      toast.success("Entry saved successfully");
      
      // Clear notes, activities, observations, and negative side effects
      setNotes("");
      setSelectedActivities([]);
      setSelectedObservations([]);
      setSelectedNegativeSideEffects([]);
      
      // Refresh entries
      fetchEntries();
    }
  };

  const handleDelete = (entryId: string) => {
    setDeleteEntryId(entryId);
    setShowDeleteDialog(true);
  };

  const handleMoveToTrash = async () => {
    if (!deleteEntryId) return;
    
    const { error } = await supabase
      .from("journal_entries")
      .update({ is_deleted: true })
      .eq("id", deleteEntryId);

    if (error) {
      toast.error("Error moving entry to trash: " + error.message);
    } else {
      toast.success("Entry moved to trash");
      fetchEntries();
    }
    
    setShowDeleteDialog(false);
    setDeleteEntryId(null);
  };

  const handlePermanentDelete = async () => {
    if (!deleteEntryId) return;
    
    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", deleteEntryId);

    if (error) {
      toast.error("Error deleting entry permanently: " + error.message);
    } else {
      toast.success("Entry permanently deleted");
      fetchEntries();
    }
    
    setShowDeleteDialog(false);
    setDeleteEntryId(null);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const openNotesDialog = (entryId?: string, existingNotes?: string) => {
    if (entryId) {
      setEditingEntryId(entryId);
      setTempNotes(existingNotes || "");
    } else {
      setEditingEntryId(null);
      setTempNotes(notes);
    }
    setNotesDialogOpen(true);
  };

  const saveNotes = async () => {
    if (editingEntryId) {
      // Update existing entry
      const { error } = await supabase
        .from("journal_entries")
        .update({ notes: tempNotes })
        .eq("id", editingEntryId);

      if (error) {
        toast.error("Error updating notes: " + error.message);
      } else {
        toast.success("Notes updated successfully!");
        fetchEntries();
      }
    } else {
      // Update new entry notes
      setNotes(tempNotes);
    }
    setNotesDialogOpen(false);
    setEditingEntryId(null);
    setTempNotes("");
  };

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, typeof Leaf> = {
      leaf: Leaf,
      pill: Pill,
      droplet: Droplet,
      cigarette: Cigarette,
      cookie: Cookie,
      coffee: Coffee,
      sparkles: Sparkles,
      heart: Heart,
      brain: Brain,
      zap: Zap,
    };
    return iconMap[iconName] || Leaf;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Header */}
        <header className="mb-12 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1"></div>
            <div className="flex gap-2">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate("/trash")} 
                className="rounded-full"
                title="View Trash"
              >
                <Trash2 className="h-5 w-5" />
                <span className="sr-only">Trash</span>
              </Button>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full">
                <LogOut className="h-5 w-5" />
                <span className="sr-only">Sign out</span>
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

        {/* Entry Form */}
        <Card className="p-6 md:p-8 mb-8 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-300 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary" />
              New Entry
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  {(() => {
                    const IconComponent = getIconComponent(selectedIcon);
                    return <IconComponent className="h-4 w-4" />;
                  })()}
                  Select Icon
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="grid grid-cols-5 gap-1 p-2">
                  {AVAILABLE_ICONS.map((icon) => {
                    const IconComponent = getIconComponent(icon.value);
                    return (
                      <DropdownMenuItem
                        key={icon.value}
                        onClick={() => setSelectedIcon(icon.value)}
                        className={`p-3 justify-center cursor-pointer ${
                          selectedIcon === icon.value ? 'bg-primary/10' : ''
                        }`}
                        title={icon.name}
                      >
                        <IconComponent className="h-5 w-5" />
                      </DropdownMenuItem>
                    );
                  })}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid gap-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="strain">Strain Name</Label>
                <Input
                  id="strain"
                  value={strain}
                  onChange={(e) => setStrain(e.target.value)}
                  placeholder="e.g., Blue Dream"
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="dosage">Dosage</Label>
                <div className="flex gap-2 mt-1.5">
                  <Input
                    id="dosage"
                    type="number"
                    step="0.1"
                    value={dosageAmount}
                    onChange={(e) => setDosageAmount(e.target.value)}
                    placeholder="e.g., 0.5"
                    className="flex-1"
                  />
                  <Select value={dosageUnit} onValueChange={setDosageUnit}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="ml">ml</SelectItem>
                      <SelectItem value="mg">mg</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="method">Method</Label>
                <Input
                  id="method"
                  value={method}
                  onChange={(e) => setMethod(e.target.value)}
                  placeholder="e.g., Vape, Edible"
                  className="mt-1.5"
                />
              </div>
            </div>

            {/* Activities */}
            <div>
              <Label className="mb-3 block">Activities</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_ACTIVITIES.map((activity) => (
                  <Badge
                    key={activity}
                    variant={selectedActivities.includes(activity) ? "default" : "outline"}
                    className="cursor-pointer transition-all duration-200 hover:scale-105"
                    onClick={() => toggleActivity(activity)}
                  >
                    {activity}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Observations */}
            <div>
              <Label className="mb-3 block">Observations</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_OBSERVATIONS.map((obs) => (
                  <Badge
                    key={obs}
                    variant={selectedObservations.includes(obs) ? "default" : "outline"}
                    className="cursor-pointer transition-all duration-200 hover:scale-105"
                    onClick={() => toggleObservation(obs)}
                  >
                    {obs}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Negative Side Effects */}
            <div>
              <Label className="mb-3 block">Negative Side Effects</Label>
              <div className="flex flex-wrap gap-2">
                {NEGATIVE_SIDE_EFFECTS.map((effect) => (
                  <Badge
                    key={effect}
                    variant={selectedNegativeSideEffects.includes(effect) ? "destructive" : "outline"}
                    className="cursor-pointer transition-all duration-200 hover:scale-105"
                    onClick={() => toggleNegativeSideEffect(effect)}
                  >
                    {effect}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Personal Notes */}
            <div>
              <Sheet open={notesDialogOpen} onOpenChange={setNotesDialogOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start gap-2"
                    onClick={() => openNotesDialog()}
                  >
                    <FileText className="h-4 w-4" />
                    {notes ? "Edit Notes" : "Add Notes"}
                    {notes && <Badge variant="secondary" className="ml-auto">{notes.length} chars</Badge>}
                  </Button>
                </SheetTrigger>
                <SheetContent onCloseAutoFocus={(e) => e.preventDefault()}>
                  <SheetHeader>
                    <SheetTitle>Personal Notes</SheetTitle>
                    <SheetDescription>
                      Add any additional observations, feelings, or context about this entry.
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-6">
                    <Textarea
                      value={tempNotes}
                      onChange={(e) => setTempNotes(e.target.value)}
                      placeholder="How are you feeling? Any additional observations or context..."
                      className="min-h-[300px] resize-none"
                    />
                    <Button
                      onClick={saveNotes}
                      className="w-full mt-4"
                    >
                      Save Notes
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full md:w-auto md:ml-auto"
              size="lg"
            >
              Save Entry
            </Button>
          </div>
        </Card>

        {/* Reminders */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <Reminders />
        </div>

        {/* Insights Chart */}
        {entries.length > 0 && (
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <InsightsChart entries={entries} />
          </div>
        )}

        {/* Entries List and Calendar View */}
        {entries.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <Tabs defaultValue="list" className="w-full">
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
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-semibold">Recent Entries</h2>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="sort" className="text-sm text-muted-foreground">Sort by:</Label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger id="sort" className="w-[180px]">
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
                <div className="space-y-4">
                  {[...entries].sort((a, b) => {
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
                  }).map((entry, index) => {
                    const IconComponent = getIconComponent(entry.icon || 'leaf');
                    
                    return (
                    <Card 
                      key={entry.id} 
                      className="overflow-hidden hover:shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                    >
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-full bg-primary/10">
                              <IconComponent className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{entry.strain}</h3>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(entry.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openNotesDialog(entry.id, entry.notes || "")}
                              className="text-muted-foreground hover:text-primary rounded-full"
                            >
                              <FileText className="h-4 w-4" />
                              <span className="sr-only">Add/Edit notes</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(entry.id)}
                              className="text-muted-foreground hover:text-destructive rounded-full"
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete entry</span>
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <div>
                            <Label className="text-xs text-muted-foreground">Dosage</Label>
                            <p className="font-medium">{entry.dosage}</p>
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Method</Label>
                            <p className="font-medium">{entry.method}</p>
                          </div>
                        </div>

                        {entry.observations.length > 0 && (
                          <div className="mb-4">
                            <Label className="text-xs text-muted-foreground mb-2 block">Observations</Label>
                            <div className="flex flex-wrap gap-2">
                              {entry.observations.map((obs) => (
                                <Badge key={obs} variant="secondary" className="px-2 py-1">
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
                                <Badge key={activity} variant="outline" className="px-2 py-1">
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
                                <Badge key={effect} variant="destructive" className="px-2 py-1">
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
                  })}
                </div>
              </TabsContent>

              <TabsContent value="calendar">
                <CalendarView />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-12 text-muted-foreground animate-in fade-in duration-700">
            <Leaf className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No entries yet. Start your wellness journey above!</p>
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Entry</AlertDialogTitle>
              <AlertDialogDescription>
                How would you like to delete this entry?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col sm:flex-row gap-2">
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </AlertDialogCancel>
              <Button
                variant="outline"
                onClick={handleMoveToTrash}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Move to Trash
              </Button>
              <AlertDialogAction
                onClick={handlePermanentDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
              >
                Delete Permanently
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
};

export default Index;
