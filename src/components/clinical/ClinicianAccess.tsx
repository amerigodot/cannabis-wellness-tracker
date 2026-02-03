import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Stethoscope, UserPlus, ShieldCheck, AlertCircle } from "lucide-react";

interface ClinicianAccessProps {
  onLinkSuccess?: () => void;
}

export function ClinicianAccess({ onLinkSuccess }: ClinicianAccessProps) {
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [isClinician, setIsClinician] = useState(false);
  const [linkCode, setLinkCode] = useState("");
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    const demo = localStorage.getItem("demoMode") === "true";
    setIsDemoMode(demo);
    
    // In demo mode, always grant clinician access
    if (demo) {
      setIsClinician(true);
      setVerifying(false);
    } else {
      // For now, non-demo mode shows access required message
      // Backend tables for clinician roles don't exist yet
      setIsClinician(false);
      setVerifying(false);
    }
  }, []);

  const handleLinkPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (linkCode.length !== 6) {
      toast.error("Please enter a valid 6-digit code");
      return;
    }

    setLoading(true);
    try {
      if (isDemoMode) {
        // Simulate link success in demo mode
        await new Promise(r => setTimeout(r, 500));
        toast.success("Demo: Patient linked successfully!");
        setLinkCode("");
        onLinkSuccess?.();
        return;
      }

      // Non-demo mode - backend tables don't exist yet
      toast.info("Patient linking requires backend setup (coming in Phase 4)");
    } catch (error) {
      console.error("Linking error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to link patient");
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="flex justify-center p-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isClinician && !isDemoMode) {
    return (
      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50">
        <CardHeader>
          <div className="flex items-center gap-2 text-amber-600 dark:text-amber-500">
            <AlertCircle className="w-5 h-5" />
            <CardTitle>Professional Access Required</CardTitle>
          </div>
          <CardDescription className="text-amber-800/80 dark:text-amber-200/80">
            This section is reserved for verified healthcare professionals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm mb-4">
            Clinician portal features are available in Demo Mode. Enable demo mode to explore the full clinician dashboard experience.
          </p>
          <Button variant="outline" onClick={() => window.location.href = '/auth'}>
            Try Demo Mode
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-primary" />
          <CardTitle>Add New Patient</CardTitle>
        </div>
        <CardDescription>
          Enter the 6-digit linking code provided by your patient to access their clinical dashboard.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLinkPatient} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="link-code">6-Digit Access Code</Label>
            <div className="flex gap-2">
              <Input
                id="link-code"
                placeholder="000000"
                className="text-center text-2xl font-mono tracking-[0.5em]"
                maxLength={6}
                value={linkCode}
                onChange={(e) => setLinkCode(e.target.value.replace(/[^0-9]/g, ''))}
                disabled={loading}
              />
              <Button type="submit" disabled={loading || linkCode.length !== 6}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 mr-2" />}
                Link Patient
              </Button>
            </div>
          </div>
          <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-md border border-blue-200 dark:border-blue-900/50">
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800 dark:text-blue-200">
              Linking allows you to view patient-consented symptom trends, cannabis regimen, and safety flags. Data is end-to-end encrypted.
            </p>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
