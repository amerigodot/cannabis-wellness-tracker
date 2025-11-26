import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Reminder {
  id: string;
  user_id: string;
  title: string;
  reminder_time: string;
  is_active: boolean;
  recurrence: string;
}

const requestNotificationPermission = async () => {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

const showBrowserNotification = (title: string, onDismiss: () => void) => {
  if (Notification.permission === "granted") {
    const notification = new Notification("Medical Cannabis Log", {
      body: title,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "reminder",
      requireInteraction: true,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      onDismiss();
    };

    // Auto-dismiss after 30 seconds
    setTimeout(() => notification.close(), 30000);
  }
};

export const useGlobalReminders = () => {
  const processedReminders = useRef<Set<string>>(new Set());
  const notificationPermissionRequested = useRef(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let channel: ReturnType<typeof supabase.channel> | null = null;

    const checkDueReminders = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const now = new Date();
      const { data, error } = await supabase
        .from("reminders")
        .select("*")
        .eq("is_active", true)
        .lte("reminder_time", now.toISOString());

      if (!error && data && data.length > 0) {
        const newReminders = data.filter(
          (reminder) => !processedReminders.current.has(reminder.id)
        );

        for (const reminder of newReminders) {
          processedReminders.current.add(reminder.id);

          const dismissAction = () => dismissReminder(reminder.id);

          // Show browser notification (system notification)
          showBrowserNotification(reminder.title, dismissAction);

          // Also show toast notification as fallback/backup
          toast.info(`Reminder: ${reminder.title}`, {
            duration: 10000,
            action: {
              label: "Dismiss",
              onClick: dismissAction,
            },
          });

          // Handle recurring reminders
          if (reminder.recurrence !== "none") {
            await createNextRecurrence(reminder);
          }

          // Mark reminder as inactive
          await supabase
            .from("reminders")
            .update({ is_active: false })
            .eq("id", reminder.id);
        }
      }
    };

    const createNextRecurrence = async (reminder: Reminder) => {
      const currentTime = new Date(reminder.reminder_time);
      let nextTime = new Date(currentTime);

      switch (reminder.recurrence) {
        case "daily":
          nextTime.setDate(nextTime.getDate() + 1);
          break;
        case "weekly":
          nextTime.setDate(nextTime.getDate() + 7);
          break;
        case "monthly":
          nextTime.setMonth(nextTime.getMonth() + 1);
          break;
      }

      await supabase.from("reminders").insert({
        user_id: reminder.user_id,
        title: reminder.title,
        reminder_time: nextTime.toISOString(),
        recurrence: reminder.recurrence,
      });
    };

    const dismissReminder = async (id: string) => {
      await supabase
        .from("reminders")
        .update({ is_active: false })
        .eq("id", id);
    };

    const setupRealtimeSubscription = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to reminder changes for real-time updates
      channel = supabase
        .channel("reminders-channel")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "reminders",
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // When reminders are created/updated, check immediately
            checkDueReminders();
          }
        )
        .subscribe();
    };

    const initializeReminders = async () => {
      // Request notification permission once
      if (!notificationPermissionRequested.current) {
        notificationPermissionRequested.current = true;
        const granted = await requestNotificationPermission();
        
        if (granted) {
          toast.success("Browser notifications enabled for reminders");
        } else if (Notification.permission === "denied") {
          toast.info("Enable browser notifications in settings to receive reminders when this tab is in background", {
            duration: 6000,
          });
        }
      }

      // Check immediately on mount
      await checkDueReminders();
      
      // Set up realtime subscription
      await setupRealtimeSubscription();
      
      // Check every minute
      interval = setInterval(checkDueReminders, 60000);
    };

    initializeReminders();

    return () => {
      if (interval) clearInterval(interval);
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);
};
