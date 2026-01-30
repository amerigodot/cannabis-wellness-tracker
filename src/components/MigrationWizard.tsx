import React, { useState } from "react";
import { useEncryption } from "@/contexts/EncryptionContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Shield, Lock, AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { SensitiveJournalFields } from "@/lib/crypto";

interface MigrationWizardProps {
  onComplete?: () => void;
  onSkip?: () => void;
}

type MigrationStep = "intro" | "password" | "migrating" | "complete";

export const MigrationWizard: React.FC<MigrationWizardProps> = ({ onComplete, onSkip }) => {
  const { setupEncryption, encrypt, encryptionEnabled, isUnlocked, unlockWithPassword } = useEncryption();
  const [step, setStep] = useState<MigrationStep>("intro");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [progress, setProgress] = useState(0);
  const [totalEntries, setTotalEntries] = useState(0);
  const [migratedCount, setMigratedCount] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSetupAndMigrate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!encryptionEnabled && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);

    try {
      // Set up encryption or unlock
      let success = false;
      if (!encryptionEnabled) {
        success = await setupEncryption(password);
      } else if (!isUnlocked) {
        success = await unlockWithPassword(password);
      } else {
        success = true;
      }

      if (!success) {
        setError("Failed to set up encryption. Please check your password.");
        setLoading(false);
        return;
      }

      // Start migration
      setStep("migrating");
      await migrateEntries();
    } catch (err) {
      console.error("Migration error:", err);
      setError("An error occurred during migration.");
      setLoading(false);
    }
  };

  const migrateEntries = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        setError("Not authenticated");
        return;
      }

      // Get all unencrypted entries
      const { data: entries, error: fetchError } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", session.user.id)
        .is("encrypted_data", null);

      if (fetchError) {
        setError("Failed to fetch entries");
        return;
      }

      if (!entries || entries.length === 0) {
        setStep("complete");
        return;
      }

      setTotalEntries(entries.length);

      // Migrate each entry
      for (let i = 0; i < entries.length; i++) {
        const entry = entries[i];

        // Extract sensitive fields
        const sensitiveData: SensitiveJournalFields = {
          strain: entry.strain,
          strain_2: entry.strain_2,
          notes: entry.notes,
          before_notes: entry.before_notes,
          observations: entry.observations || [],
          activities: entry.activities || [],
          negative_side_effects: entry.negative_side_effects || [],
          dosage: entry.dosage,
          before_mood: entry.before_mood,
          before_pain: entry.before_pain,
          before_anxiety: entry.before_anxiety,
          before_energy: entry.before_energy,
          before_focus: entry.before_focus,
          after_mood: entry.after_mood,
          after_pain: entry.after_pain,
          after_anxiety: entry.after_anxiety,
          after_energy: entry.after_energy,
          after_focus: entry.after_focus,
          effects_duration_minutes: entry.effects_duration_minutes,
          thc_percentage: entry.thc_percentage,
          cbd_percentage: entry.cbd_percentage,
          method: entry.method,
          icon: entry.icon || "leaf",
        };

        // Encrypt
        const encryptedData = await encrypt(sensitiveData);
        if (!encryptedData) {
          console.error("Failed to encrypt entry:", entry.id);
          continue;
        }

        // Update entry with encrypted data and clear plaintext
        const { error: updateError } = await supabase
          .from("journal_entries")
          .update({
            encrypted_data: JSON.stringify(encryptedData),
            encryption_version: 1,
            // Clear sensitive plaintext fields
            strain: "[encrypted]",
            strain_2: null,
            notes: null,
            before_notes: null,
            observations: [],
            activities: [],
            negative_side_effects: [],
            dosage: "[encrypted]",
            before_mood: null,
            before_pain: null,
            before_anxiety: null,
            before_energy: null,
            before_focus: null,
            after_mood: null,
            after_pain: null,
            after_anxiety: null,
            after_energy: null,
            after_focus: null,
            effects_duration_minutes: null,
            thc_percentage: null,
            cbd_percentage: null,
            method: "[encrypted]",
            icon: null,
          })
          .eq("id", entry.id);

        if (updateError) {
          console.error("Failed to update entry:", entry.id, updateError);
        }

        setMigratedCount(i + 1);
        setProgress(Math.round(((i + 1) / entries.length) * 100));
      }

      // Mark migration complete in preferences
      await supabase
        .from("email_preferences")
        .upsert({
          user_id: session.user.id,
          privacy_mode_enabled: true,
          data_migrated_at: new Date().toISOString(),
        }, {
          onConflict: "user_id",
        });

      setStep("complete");
      toast.success("Migration complete! Your data is now encrypted.");
    } catch (err) {
      console.error("Migration error:", err);
      setError("An error occurred during migration.");
    }
  };

  if (step === "intro") {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Enable Privacy Protection</CardTitle>
          <CardDescription className="text-base">
            Encrypt your journal entries so only you can read them
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Lock className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Client-Side Encryption</p>
                <p className="text-xs text-muted-foreground">
                  Your data is encrypted before it leaves your browser
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Shield className="w-5 h-5 text-primary mt-0.5" />
              <div>
                <p className="font-medium text-sm">Zero-Knowledge Server</p>
                <p className="text-xs text-muted-foreground">
                  We can't read your entries—only you have the key
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
            <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              <strong>Important:</strong> If you forget your password, your encrypted data cannot be recovered.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <Button onClick={() => setStep("password")} className="w-full">
            Set Up Encryption
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          <Button variant="ghost" onClick={onSkip} className="w-full">
            Maybe Later
          </Button>
        </CardFooter>
      </Card>
    );
  }

  if (step === "password") {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader>
          <CardTitle>Create Encryption Password</CardTitle>
          <CardDescription>
            This password will be used to encrypt and decrypt your journal entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetupAndMigrate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="encryption-password">Password</Label>
              <Input
                id="encryption-password"
                type="password"
                placeholder="Enter a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 8 characters. Use a unique password you'll remember.
              </p>
            </div>

            {!encryptionEnabled && (
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            )}

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || !password || (!encryptionEnabled && !confirmPassword)}
            >
              {loading ? "Setting up..." : "Encrypt My Data"}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  if (step === "migrating") {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle>Encrypting Your Entries</CardTitle>
          <CardDescription>
            Please wait while we encrypt your journal entries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Progress value={progress} className="h-3" />
          <p className="text-center text-sm text-muted-foreground">
            {migratedCount} of {totalEntries} entries encrypted
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Do not close this page
          </p>
        </CardContent>
      </Card>
    );
  }

  if (step === "complete") {
    return (
      <Card className="max-w-lg mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
            <CheckCircle2 className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Encryption Complete!</CardTitle>
          <CardDescription>
            Your journal entries are now protected with end-to-end encryption
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center text-sm text-muted-foreground">
            {totalEntries > 0 ? (
              <p>{totalEntries} entries have been encrypted</p>
            ) : (
              <p>All new entries will be encrypted automatically</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onComplete} className="w-full">
            Continue to Journal
          </Button>
        </CardFooter>
      </Card>
    );
  }

  return null;
};

export default MigrationWizard;
