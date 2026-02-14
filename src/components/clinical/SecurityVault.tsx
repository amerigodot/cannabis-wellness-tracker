import React, { useState } from "react";
import { useE2EE } from "@/hooks/useE2EE";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Unlock, AlertTriangle, Key, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export const SecurityVault: React.FC = () => {
  const { hasVault, isUnlocked, setupVault, unlockVault, loading } = useE2EE();
  const [passphrase, setPassphrase] = useState("");
  const [confirmPassphrase, setConfirmPassphrase] = useState("");
  const [isSettingUp, setIsSettingUp] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passphrase !== confirmPassphrase) {
      toast.error("Passphrases do not match");
      return;
    }
    if (passphrase.length < 12) {
      toast.error("Passphrase must be at least 12 characters for strong security");
      return;
    }

    setActionLoading(true);
    const success = await setupVault(passphrase);
    setActionLoading(false);
    if (success) {
      setPassphrase("");
      setConfirmPassphrase("");
      setIsSettingUp(false);
    }
  };

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    const success = await unlockVault(passphrase);
    setActionLoading(false);
    if (success) {
      setPassphrase("");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Checking security status...</div>;
  }

  // 1. Vault is active and unlocked
  if (hasVault && isUnlocked) {
    return (
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <CardTitle>Security Vault Unlocked</CardTitle>
          </div>
          <CardDescription>
            Your end-to-end encryption keys are loaded. Your journal entries are being decrypted in real-time.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-3 bg-background/50 rounded-lg border text-sm flex items-start gap-3">
            <Shield className="w-4 h-4 text-primary mt-0.5" />
            <p>
              Your 4096-bit private key is safely stored in your browser's memory and will be cleared when you close the tab.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 2. Vault is active but locked
  if (hasVault && !isUnlocked) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" />
            <CardTitle>Security Vault Locked</CardTitle>
          </div>
          <CardDescription>
            Enter your passphrase to decrypt your medical records and access the AI Coach.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUnlock} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="passphrase">Vault Passphrase</Label>
              <Input
                id="passphrase"
                type="password"
                placeholder="Enter your secret passphrase"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                disabled={actionLoading}
              />
            </div>
            <Button type="submit" className="w-full bg-amber-600 hover:bg-amber-700 text-white" disabled={actionLoading}>
              {actionLoading ? "Decrypting..." : "Unlock Vault"}
              {!actionLoading && <Unlock className="w-4 h-4 ml-2" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    );
  }

  // 3. Setup flow
  if (isSettingUp) {
    return (
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <CardTitle>Initialize 4096-bit Encryption</CardTitle>
          </div>
          <CardDescription>
            Create a unique passphrase to protect your medical data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-passphrase">Secret Passphrase</Label>
              <Input
                id="new-passphrase"
                type="password"
                placeholder="Make it long and unique"
                value={passphrase}
                onChange={(e) => setPassphrase(e.target.value)}
                disabled={actionLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-passphrase">Confirm Passphrase</Label>
              <Input
                id="confirm-passphrase"
                type="password"
                placeholder="Confirm your secret passphrase"
                value={confirmPassphrase}
                onChange={(e) => setConfirmPassphrase(e.target.value)}
                disabled={actionLoading}
              />
            </div>
            <div className="p-3 bg-destructive/10 text-destructive text-xs rounded-md flex items-start gap-2 border border-destructive/20">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <p>
                <strong>Warning:</strong> If you lose this passphrase, your medical records can <strong>never</strong> be recovered. We do not store your passphrase.
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsSettingUp(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={actionLoading}>
                {actionLoading ? "Generating Keys..." : "Setup Vault"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  // 4. Default: No vault found
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <CardTitle>Zero-Knowledge Privacy</CardTitle>
        </div>
        <CardDescription>
          Upgrade your account to End-to-End Encryption (E2EE).
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          With E2EE enabled, your medical history is encrypted using asymmetric RSA-4096 keys. Not even our database administrators can see what you log.
        </p>
        <ul className="space-y-2 text-xs text-muted-foreground">
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary" />
            RSA-4096 bit asymmetric key pairs
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary" />
            AES-256-GCM symmetric encryption for data
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-primary" />
            Passphrase-protected private key (Device local)
          </li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button onClick={() => setIsSettingUp(true)} className="w-full">
          Enable End-to-End Encryption
        </Button>
      </CardFooter>
    </Card>
  );
};
