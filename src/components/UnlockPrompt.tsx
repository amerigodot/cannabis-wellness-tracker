import React, { useState } from "react";
import { useEncryption } from "@/contexts/EncryptionContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Lock, Shield, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface UnlockPromptProps {
  onUnlocked?: () => void;
  className?: string;
}

export const UnlockPrompt: React.FC<UnlockPromptProps> = ({ onUnlocked, className }) => {
  const { unlockWithPassword, encryptionEnabled } = useEncryption();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const success = await unlockWithPassword(password);
      if (success) {
        toast.success("Journal unlocked successfully!");
        setPassword("");
        onUnlocked?.();
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Failed to unlock. Please try again.");
    }

    setLoading(false);
  };

  if (!encryptionEnabled) {
    return null;
  }

  return (
    <Card className={`max-w-md mx-auto ${className}`}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-4 rounded-full bg-primary/10">
          <Lock className="w-8 h-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Unlock Your Journal</CardTitle>
        <CardDescription>
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
            />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm">
              <AlertTriangle className="w-4 h-4" />
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading || !password}>
            {loading ? "Unlocking..." : "Unlock Journal"}
          </Button>

          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted p-3 rounded-lg">
            <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Your data is encrypted client-side. We cannot recover your password or data if you forget it.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default UnlockPrompt;
