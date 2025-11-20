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
  consumption_time: string;
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
      .order("consumption_time", { ascending: false });

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
      <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
...
      </div>
    </main>
  );
}
