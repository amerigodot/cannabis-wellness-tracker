import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Bell, Mail, Volume2, Trash2, AlertTriangle, Loader2, Download, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotificationPreferences {
  browserNotifications: boolean;
  emailNotifications: boolean;
  soundEnabled: boolean;
}

interface AccountInfo {
  email: string;
  createdAt: string;
  totalEntries: number;
}

export default function Settings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    browserNotifications: true,
    emailNotifications: true,
    soundEnabled: false,
  });
  const [accountInfo, setAccountInfo] = useState<AccountInfo>({
    email: "",
    createdAt: "",
    totalEntries: 0,
  });

  const loadPreferences = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Get account creation date
      const createdAt = user.created_at || "";

      // Get total entries count
      const { count } = await supabase
        .from("journal_entries")
        .select("*", { count: "exact", head: true });

      setAccountInfo({
        email: user.email || "",
        createdAt: createdAt,
        totalEntries: count || 0,
      });

      // Load notification preferences from localStorage
      const browserNotifications = localStorage.getItem("browserNotificationsEnabled") !== "false";
      const soundEnabled = localStorage.getItem("notificationSoundEnabled") === "true";
      
      // Check email preferences from database
      const { data: emailPrefs } = await supabase
        .from("email_preferences")
        .select("tool_notifications_enabled")
        .eq("user_id", user.id)
        .single();

      setPreferences({
        browserNotifications,
        emailNotifications: emailPrefs?.tool_notifications_enabled ?? true,
        soundEnabled,
      });
      
      setLoading(false);
    } catch (error) {
      console.error("Error loading preferences:", error);
      toast.error("Failed to load preferences.");
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    loadPreferences();
  }, [loadPreferences]);

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

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error("No active session found");
        return;
      }

      // Call edge function to delete account
      const { data, error } = await supabase.functions.invoke("delete-account", {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw error;
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to delete account");
      }

      // Sign out and clear local storage
      await supabase.auth.signOut();
      localStorage.clear();

      toast.success("Account deleted successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error((error as Error).message || "Failed to delete account. Please try again or contact support.");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleExportData = async (format: "json" | "csv") => {
    setExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("No user found");
        return;
      }

      // Fetch all journal entries
      const { data: entries, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!entries || entries.length === 0) {
        toast.error("No journal entries to export");
        return;
      }

      let fileContent: string;
      let fileName: string;
      let mimeType: string;

      if (format === "json") {
        // Export as JSON
        fileContent = JSON.stringify(entries, null, 2);
        fileName = `journal-entries-${new Date().toISOString().split("T")[0]}.json`;
        mimeType = "application/json";
      } else {
        // Export as CSV
        const headers = [
          "ID",
          "Created At",
          "Consumption Time",
          "Strain",
          "Dosage",
          "Method",
          "Observations",
          "Activities",
          "Negative Side Effects",
          "Notes",
          "Icon",
        ];

        const csvRows = entries.map((entry) => [
          entry.id,
          entry.created_at,
          entry.consumption_time || "",
          entry.strain,
          entry.dosage,
          entry.method,
          (entry.observations || []).join("; "),
          (entry.activities || []).join("; "),
          (entry.negative_side_effects || []).join("; "),
          entry.notes || "",
          entry.icon || "",
        ]);

        fileContent =
          headers.join(",") +
          "\n" +
          csvRows
            .map((row) =>
              row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
            )
            .join("\n");

        fileName = `journal-entries-${new Date().toISOString().split("T")[0]}.csv`;
        mimeType = "text/csv";
      }

      // Create and trigger download
      const blob = new Blob([fileContent], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(`Data exported successfully as ${format.toUpperCase()}`);
    } catch (error) {
      console.error("Error exporting data:", error);
      toast.error((error as Error).message || "Failed to export data");
    } finally {
      setExporting(false);
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
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                <p className="text-sm font-medium">{accountInfo.email}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                <p className="text-sm font-medium">
                  {accountInfo.createdAt ? new Date(accountInfo.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  }) : "N/A"}
                </p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-between pt-2">
              <div className="space-y-1">
                <Label className="text-sm font-medium text-muted-foreground">Total Journal Entries</Label>
                <p className="text-2xl font-bold text-primary">{accountInfo.totalEntries}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => navigate("/")}
              >
                View Journal
              </Button>
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
          <Card className="border-destructive/50 bg-destructive/5 mb-6">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                <strong>Browser notifications blocked:</strong> To enable browser notifications, 
                you need to allow them in your browser settings. Look for the site settings 
                in your browser's address bar or settings menu.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>
              Irreversible and destructive actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Export Data */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold mb-1">Export Your Data</h3>
                <p className="text-sm text-muted-foreground">
                  Download all your journal entries before deleting your account. 
                  Choose between JSON or CSV format.
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    disabled={exporting || accountInfo.totalEntries === 0}
                    className="w-full sm:w-auto"
                  >
                    {exporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => handleExportData("json")}>
                    Export as JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExportData("csv")}>
                    Export as CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {accountInfo.totalEntries === 0 && (
                <p className="text-xs text-muted-foreground">
                  No journal entries to export
                </p>
              )}
            </div>

            <Separator />

            {/* Delete Account */}
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold mb-1">Delete Account</h3>
                <p className="text-sm text-muted-foreground">
                  Permanently remove all your data including journal entries, 
                  reminders, settings, and preferences. This action cannot be undone.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Delete Account Permanently?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-2">
              <p className="font-semibold text-foreground">
                This action cannot be undone. This will permanently delete:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>All {accountInfo.totalEntries} journal entries</li>
                <li>All reminders and notifications</li>
                <li>All settings and preferences</li>
                <li>Your account and profile data</li>
              </ul>
              <p className="text-destructive font-medium pt-2">
                Are you absolutely sure you want to delete your account?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
