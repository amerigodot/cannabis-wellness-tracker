import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Bell, Mail, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";

interface NotificationPreferences {
  browserNotifications: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
}

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    browserNotifications: true,
    emailNotifications: true,
    soundEnabled: false,
  });
  const [email, setEmail] = useState("");

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setEmail(user.email || "");

      // Load browser notification preferences from localStorage
      const browserNotifs = localStorage.getItem("browserNotificationsEnabled");
      const soundEnabled = localStorage.getItem("notificationSoundEnabled");

      // Load email preferences from database
      const { data: emailPrefs } = await supabase
        .from("email_preferences")
        .select("tool_notifications_enabled")
        .eq("user_id", user.id)
        .single();

      setPreferences({
        browserNotifications: browserNotifs !== "false",
        emailNotifications: emailPrefs?.tool_notifications_enabled ?? true,
        soundEnabled: soundEnabled === "true",
      });
    } catch (error) {
      console.error("Error loading preferences:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleBrowserNotificationToggle = async (enabled: boolean) => {
    if (enabled && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.error("Browser notifications permission denied");
        return;
      }
    }

    localStorage.setItem("browserNotificationsEnabled", String(enabled));
    setPreferences(prev => ({ ...prev, browserNotifications: enabled }));
    toast.success(enabled ? "Browser notifications enabled" : "Browser notifications disabled");
  };

  const handleEmailNotificationToggle = async (enabled: boolean) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from("email_preferences")
        .upsert({
          user_id: user.id,
          email: user.email || "",
          tool_notifications_enabled: enabled,
        });

      if (error) throw error;

      setPreferences(prev => ({ ...prev, emailNotifications: enabled }));
      toast.success(enabled ? "Email notifications enabled" : "Email notifications disabled");
    } catch (error) {
      console.error("Error updating email preferences:", error);
      toast.error("Failed to update email preferences");
    }
  };

  const handleSoundToggle = (enabled: boolean) => {
    localStorage.setItem("notificationSoundEnabled", String(enabled));
    setPreferences(prev => ({ ...prev, soundEnabled: enabled }));
    toast.success(enabled ? "Notification sound enabled" : "Notification sound disabled");
  };

  const testNotification = () => {
    if (preferences.browserNotifications && Notification.permission === "granted") {
      new Notification("Medical Cannabis Log", {
        body: "This is a test notification",
        icon: "/favicon.ico",
      });
      toast.success("Test notification sent!");
    } else {
      toast.error("Browser notifications are not enabled");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/")}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your preferences</p>
          </div>
          <ThemeToggle />
        </div>

        {/* Account Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>Your account information</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-sm text-muted-foreground">{email}</p>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Control how you receive reminder notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Browser Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Bell className="w-5 h-5 text-primary mt-0.5" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor="browser-notifications" className="text-base font-medium">
                    Browser Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Show system notifications when reminders are due
                  </p>
                </div>
              </div>
              <Switch
                id="browser-notifications"
                checked={preferences.browserNotifications}
                onCheckedChange={handleBrowserNotificationToggle}
              />
            </div>

            <Separator />

            {/* Email Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Mail className="w-5 h-5 text-primary mt-0.5" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor="email-notifications" className="text-base font-medium">
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for tool availability and weekly summaries
                  </p>
                </div>
              </div>
              <Switch
                id="email-notifications"
                checked={preferences.emailNotifications}
                onCheckedChange={handleEmailNotificationToggle}
              />
            </div>

            <Separator />

            {/* Sound */}
            <div className="flex items-center justify-between">
              <div className="flex items-start gap-3 flex-1">
                <Volume2 className="w-5 h-5 text-primary mt-0.5" />
                <div className="space-y-1 flex-1">
                  <Label htmlFor="notification-sound" className="text-base font-medium">
                    Notification Sound
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Play a sound when browser notifications appear
                  </p>
                </div>
              </div>
              <Switch
                id="notification-sound"
                checked={preferences.soundEnabled}
                onCheckedChange={handleSoundToggle}
              />
            </div>

            {/* Test Notification Button */}
            <div className="pt-4">
              <Button
                variant="outline"
                onClick={testNotification}
                className="w-full sm:w-auto"
              >
                <Bell className="w-4 h-4 mr-2" />
                Send Test Notification
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Browser Permission Info */}
        {Notification.permission === "denied" && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Browser notifications blocked:</strong> To enable browser notifications, 
                you need to allow them in your browser settings. Look for the site settings 
                in your browser's address bar or settings menu.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
