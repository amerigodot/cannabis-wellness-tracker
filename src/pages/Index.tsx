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
import { ThemeToggle } from "@/components/ThemeToggle";
import { Leaf, Calendar, Clock, LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface JournalEntry {
  id: string;
  user_id: string;
  created_at: string;
  strain: string;
  dosage: string;
  method: string;
  observations: string[];
  notes: string | null;
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

const Index = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [strain, setStrain] = useState("");
  const [dosage, setDosage] = useState("");
  const [method, setMethod] = useState("");
  const [selectedObservations, setSelectedObservations] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);

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
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error loading entries: " + error.message);
    } else {
      setEntries(data || []);
    }
  };

  const toggleObservation = (obs: string) => {
    setSelectedObservations((prev) =>
      prev.includes(obs) ? prev.filter((o) => o !== obs) : [...prev, obs]
    );
  };

  const handleSubmit = async () => {
    if (!strain || !dosage || !method) {
      toast.error("Please fill in strain, dosage, and method");
      return;
    }

    if (!user) return;

    const { error } = await supabase.from("journal_entries").insert({
      user_id: user.id,
      strain,
      dosage,
      method,
      observations: selectedObservations,
      notes: notes || null,
    });

    if (error) {
      toast.error("Error saving entry: " + error.message);
    } else {
      toast.success("Entry saved successfully");
      
      // Reset form
      setStrain("");
      setDosage("");
      setMethod("");
      setSelectedObservations([]);
      setNotes("");
      
      // Refresh entries
      fetchEntries();
    }
  };

  const handleDelete = async (entryId: string) => {
    const { error } = await supabase
      .from("journal_entries")
      .update({ is_deleted: true })
      .eq("id", entryId);

    if (error) {
      toast.error("Error deleting entry: " + error.message);
    } else {
      toast.success("Entry deleted");
      fetchEntries();
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
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
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-primary" />
            New Entry
          </h2>

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
                <Input
                  id="dosage"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g., 10mg, 0.5g"
                  className="mt-1.5"
                />
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

            {/* Personal Notes */}
            <div>
              <Label htmlFor="notes">Personal Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How are you feeling? Any additional observations or context..."
                className="mt-1.5 min-h-[120px] resize-none"
              />
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

        {/* Entries List */}
        {entries.length > 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <h2 className="text-2xl font-semibold mb-6">Recent Entries</h2>
            <div className="space-y-4">
              {entries.map((entry) => (
                <Card
                  key={entry.id}
                  className="p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 hover:scale-[1.01]"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-primary mb-1">{entry.strain}</h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {new Date(entry.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {new Date(entry.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 text-sm items-start">
                      <Badge variant="secondary">{entry.dosage}</Badge>
                      <Badge variant="secondary">{entry.method}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(entry.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete entry</span>
                      </Button>
                    </div>
                  </div>

                  {entry.observations.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-2">
                        {entry.observations.map((obs) => (
                          <Badge key={obs} variant="outline" className="bg-primary/5">
                            {obs}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {entry.notes && (
                    <p className="text-sm text-foreground/80 leading-relaxed bg-muted/30 p-3 rounded-md">
                      {entry.notes}
                    </p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}

        {entries.length === 0 && (
          <div className="text-center py-12 text-muted-foreground animate-in fade-in duration-700">
            <Leaf className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg">No entries yet. Start your wellness journey above!</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
