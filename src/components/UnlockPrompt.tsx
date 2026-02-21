import React, { useState } from "react";
import { useE2EEContext } from "@/contexts/E2EEContext"; // Use the context instead of the raw hook
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Shield, AlertTriangle, LogOut } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client"; // Import supabase

interface UnlockPromptProps {
  onUnlocked?: () => void;
  className?: string;
}

export const UnlockPrompt: React.FC<UnlockPromptProps> = ({ onUnlocked, className }) => {
  const { unlockVault, hasVault, isUnlocked: e2eeIsUnlocked } = useE2EEContext(); // Use the context hook
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const success = await unlockVault(password);
      if (success) {
        toast.success("Journal unlocked successfully!");
        setPassword("");
        onUnlocked?.();
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch (err) {
      console.error("Error unlocking journal:", err);
      setError("Failed to unlock. Please try again.");
    }

    setLoading(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    navigate("/auth");
    setLoading(false);
  };

  if (!hasVault || e2eeIsUnlocked) {
    return null;
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <div className="absolute -top-12 left-0 animate-in fade-in slide-in-from-left-4 duration-500">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut} // Connect to handleSignOut
          className="gap-2 text-muted-foreground hover:text-foreground transition-colors"
          disabled={loading}
        >
          <LogOut className="w-4 h-4" /> {/* LogOut icon */}
          Sign Out {/* Button text */}
        </Button>
      </div>

      <Card className={`shadow-lg border-2 ${className}`}>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Unlock Your Journal</CardTitle>
          <CardDescription className="text-base">
            Your journal is encrypted for privacy. Enter your password to access your entries.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unlock-password">Password</Label>
              <Input
                id="unlock-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoFocus
                className="h-11"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg animate-in shake duration-300">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading || !password}>
              {loading ? "Unlocking..." : "Unlock Journal"}
            </Button>

            <div className="flex items-start gap-3 text-xs text-muted-foreground bg-muted/50 p-4 rounded-lg border border-border/50">
              <Shield className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <p className="leading-relaxed">
                Your data is protected by industry-standard **RSA-4096** asymmetric encryption. All decryption happens locally in your browser. We never see your password or your data.
              </p>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UnlockPrompt;
