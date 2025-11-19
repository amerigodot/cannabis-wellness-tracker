import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface DeletedEntry {
  id: string;
  created_at: string;
  strain: string;
  dosage: string;
  method: string;
  observations: string[];
  negative_side_effects: string[];
  notes: string | null;
  activities: string[];
  icon: string;
}

export default function Trash() {
  const navigate = useNavigate();
  const [deletedEntries, setDeletedEntries] = useState<DeletedEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDeletedEntries();
  }, []);

  const fetchDeletedEntries = async () => {
    const { data, error } = await supabase
      .from("journal_entries")
      .select("*")
      .eq("is_deleted", true)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Error loading deleted entries: " + error.message);
    } else {
      setDeletedEntries(data || []);
    }
    setLoading(false);
  };

  const handleRestore = async (entryId: string) => {
    const { error } = await supabase
      .from("journal_entries")
      .update({ is_deleted: false })
      .eq("id", entryId);

    if (error) {
      toast.error("Error restoring entry: " + error.message);
    } else {
      toast.success("Entry restored successfully");
      fetchDeletedEntries();
    }
  };

  const handlePermanentDelete = async (entryId: string) => {
    if (!confirm("Are you sure you want to permanently delete this entry? This cannot be undone.")) {
      return;
    }

    const { error } = await supabase
      .from("journal_entries")
      .delete()
      .eq("id", entryId);

    if (error) {
      toast.error("Error deleting entry: " + error.message);
    } else {
      toast.success("Entry permanently deleted");
      fetchDeletedEntries();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Trash
            </h1>
            <p className="text-muted-foreground mt-1">
              {deletedEntries.length} deleted {deletedEntries.length === 1 ? "entry" : "entries"}
            </p>
          </div>
        </div>

        {/* Deleted Entries */}
        {deletedEntries.length === 0 ? (
          <Card className="p-12 text-center">
            <Trash2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No deleted entries</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {deletedEntries.map((entry) => (
              <Card key={entry.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(entry.created_at), "PPP 'at' p")}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Strain</span>
                        <p className="font-medium">{entry.strain}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Dosage</span>
                        <p className="font-medium">{entry.dosage}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-muted-foreground">Method</span>
                        <p className="font-medium">{entry.method}</p>
                      </div>
                    </div>

                    {entry.observations.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-muted-foreground block mb-2">
                          Observations
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {entry.observations.map((obs, i) => (
                            <Badge key={i} variant="secondary">
                              {obs}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.negative_side_effects.length > 0 && (
                      <div className="mb-3">
                        <span className="text-sm font-medium text-muted-foreground block mb-2">
                          Negative Side Effects
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {entry.negative_side_effects.map((effect, i) => (
                            <Badge key={i} variant="destructive">
                              {effect}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {entry.notes && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <span className="text-sm font-medium text-muted-foreground block mb-1">
                          Notes
                        </span>
                        <p className="text-sm">{entry.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRestore(entry.id)}
                      className="gap-2"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Restore
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handlePermanentDelete(entry.id)}
                      className="gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
