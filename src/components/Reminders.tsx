import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bell, Trash2, Plus, X, Repeat } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";

interface Reminder {
  id: string;
  user_id: string;
  title: string;
  reminder_time: string;
  is_active: boolean;
  recurrence: string;
  created_at: string;
}

export const Reminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [recurrence, setRecurrence] = useState("none");

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    const { data, error } = await supabase
      .from("reminders")
      .select("*")
      .eq("is_active", true)
      .order("reminder_time", { ascending: true });

    if (error) {
      console.error("Error fetching reminders:", error);
    } else {
      setReminders(data || []);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !date || !time) {
      toast.error("Please fill in all fields");
      return;
    }

    const { data: user } = await supabase.auth.getUser();
    if (!user.user) return;

    const reminderDateTime = new Date(`${date}T${time}`);
    
    if (reminderDateTime <= new Date()) {
      toast.error("Reminder time must be in the future");
      return;
    }

    const { error } = await supabase.from("reminders").insert({
      user_id: user.user.id,
      title,
      reminder_time: reminderDateTime.toISOString(),
      recurrence,
    });

    if (error) {
      toast.error("Error creating reminder: " + error.message);
    } else {
      toast.success("Reminder created");
      setTitle("");
      setDate("");
      setTime("");
      setRecurrence("none");
      setShowForm(false);
      fetchReminders();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("reminders")
      .delete()
      .eq("id", id);

    if (error) {
      toast.error("Error deleting reminder: " + error.message);
    } else {
      toast.success("Reminder deleted");
      fetchReminders();
    }
  };

  return (
    <Card className="p-6 shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-hover)] transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
          <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          Reminders
        </h2>
        <Button
          onClick={() => {
            if (!showForm) {
              const now = new Date();
              const dateStr = format(now, "yyyy-MM-dd");
              const timeStr = format(now, "HH:mm");
              setDate(dateStr);
              setTime(timeStr);
            }
            setShowForm(!showForm);
          }}
          variant={showForm ? "ghost" : "default"}
          size="sm"
        >
          {showForm ? <X className="w-4 h-4 sm:mr-2" /> : <Plus className="w-4 h-4 sm:mr-2" />}
          <span className="hidden sm:inline">{showForm ? "Cancel" : "Add Reminder"}</span>
        </Button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border border-border rounded-lg bg-muted/30">
          <div className="grid gap-4">
            <div>
              <Label htmlFor="reminder-title">Reminder Title</Label>
              <Input
                id="reminder-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Take evening dose"
                className="mt-1.5"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="reminder-date">Date</Label>
                <Input
                  id="reminder-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="reminder-time">Time</Label>
                <Input
                  id="reminder-time"
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="mt-1.5"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="recurrence">Repeat</Label>
              <Select value={recurrence} onValueChange={setRecurrence}>
                <SelectTrigger id="recurrence" className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Repeat</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full">
              Create Reminder
            </Button>
          </div>
        </form>
      )}

      <div className="space-y-3">
        {reminders.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            No active reminders. Create one to get started!
          </p>
        ) : (
          reminders.map((reminder) => {
            const reminderDate = new Date(reminder.reminder_time);
            const isToday = reminderDate.toDateString() === new Date().toDateString();
            
            return (
              <div
                key={reminder.id}
                className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{reminder.title}</p>
                    {reminder.recurrence !== "none" && (
                      <Repeat className="w-4 h-4 text-primary" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={isToday ? "default" : "secondary"} className="text-xs">
                      {format(reminderDate, "MMM d, yyyy")}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {format(reminderDate, "h:mm a")}
                    </Badge>
                    {reminder.recurrence !== "none" && (
                      <Badge variant="secondary" className="text-xs capitalize">
                        {reminder.recurrence}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(reminder.id)}
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete reminder</span>
                </Button>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};
