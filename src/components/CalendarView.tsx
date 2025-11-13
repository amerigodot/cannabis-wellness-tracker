import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { format, isSameDay, parseISO } from "date-fns";
import { Leaf, Bell } from "lucide-react";
import { toast } from "sonner";

interface JournalEntry {
  id: string;
  created_at: string;
  strain: string;
  dosage: string;
  method: string;
}

interface Reminder {
  id: string;
  title: string;
  reminder_time: string;
  is_active: boolean;
  recurrence: string;
}

export const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    
    const { data: entriesData, error: entriesError } = await supabase
      .from("journal_entries")
      .select("id, created_at, strain, dosage, method")
      .order("created_at", { ascending: false });

    const { data: remindersData, error: remindersError } = await supabase
      .from("reminders")
      .select("*")
      .eq("is_active", true)
      .order("reminder_time", { ascending: true });

    if (entriesError) {
      toast.error("Error loading entries: " + entriesError.message);
    } else {
      setEntries(entriesData || []);
    }

    if (remindersError) {
      toast.error("Error loading reminders: " + remindersError.message);
    } else {
      setReminders(remindersData || []);
    }

    setLoading(false);
  };

  const getEntriesForDate = (date: Date) => {
    return entries.filter((entry) =>
      isSameDay(parseISO(entry.created_at), date)
    );
  };

  const getRemindersForDate = (date: Date) => {
    return reminders.filter((reminder) =>
      isSameDay(parseISO(reminder.reminder_time), date)
    );
  };

  const getDatesWithData = () => {
    const dates = new Set<string>();
    
    entries.forEach((entry) => {
      dates.add(format(parseISO(entry.created_at), "yyyy-MM-dd"));
    });
    
    reminders.forEach((reminder) => {
      dates.add(format(parseISO(reminder.reminder_time), "yyyy-MM-dd"));
    });
    
    return dates;
  };

  const datesWithData = getDatesWithData();
  const selectedDateEntries = selectedDate ? getEntriesForDate(selectedDate) : [];
  const selectedDateReminders = selectedDate ? getRemindersForDate(selectedDate) : [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border"
            modifiers={{
              hasData: (date) => datesWithData.has(format(date, "yyyy-MM-dd")),
            }}
            modifiersClassNames={{
              hasData: "font-bold relative after:absolute after:bottom-1 after:left-1/2 after:-translate-x-1/2 after:w-1 after:h-1 after:rounded-full after:bg-primary",
            }}
          />
        </CardContent>
      </Card>

      <div className="space-y-4">
        {selectedDate && (
          <Card>
            <CardHeader>
              <CardTitle>
                {format(selectedDate, "MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedDateEntries.length === 0 && selectedDateReminders.length === 0 && (
                <p className="text-muted-foreground text-sm">No entries or reminders for this date</p>
              )}

              {selectedDateReminders.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Reminders
                  </h3>
                  {selectedDateReminders.map((reminder) => (
                    <Card key={reminder.id} className="p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{reminder.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {format(parseISO(reminder.reminder_time), "h:mm a")}
                          </p>
                        </div>
                        {reminder.recurrence !== "none" && (
                          <Badge variant="secondary">{reminder.recurrence}</Badge>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}

              {selectedDateEntries.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold flex items-center gap-2">
                    <Leaf className="h-4 w-4" />
                    Journal Entries
                  </h3>
                  {selectedDateEntries.map((entry) => (
                    <Card key={entry.id} className="p-3">
                      <div className="space-y-1">
                        <p className="font-medium">{entry.strain}</p>
                        <div className="flex gap-2 text-sm text-muted-foreground">
                          <Badge variant="outline">{entry.dosage}</Badge>
                          <Badge variant="outline">{entry.method}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {format(parseISO(entry.created_at), "h:mm a")}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
