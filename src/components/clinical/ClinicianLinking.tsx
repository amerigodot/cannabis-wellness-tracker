import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Key, Users, RefreshCw, Trash2, CheckCircle2, ShieldAlert } from "lucide-react";

interface LinkCode {
  code: string;
  expires_at: string;
}

interface ClinicianLink {
  id: string;
  clinician_id: string;
  status: 'pending' | 'active' | 'revoked';
  consent_scope: {
    share_symptom_scores: boolean;
    share_notes: boolean;
    share_adverse_events: boolean;
    share_regimen: boolean;
  };
  created_at: string;
  clinician_profile?: {
    full_name: string;
  };
}

export function ClinicianLinking() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [currentCode, setCurrentCode] = useState<LinkCode | null>(null);
  const [links, setLinks] = useState<ClinicianLink[]>([]);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    setIsDemoMode(localStorage.getItem("demoMode") === "true");
    loadLinks();
    loadCurrentCode();
  }, []);

  const loadLinks = async () => {
    if (localStorage.getItem("demoMode") === "true") {
      setLinks([
        {
          id: 'demo-link-1',
          clinician_id: 'demo-clinician',
          status: 'active',
          consent_scope: {
            share_symptom_scores: true,
            share_notes: false,
            share_adverse_events: true,
            share_regimen: true
          },
          created_at: new Date().toISOString(),
          clinician_profile: { full_name: "Dr. Jane Smith (Demo)" }
        }
      ]);
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('clinician_patient_links')
        .select(`
          *,
          clinician_profile:profiles!clinician_patient_links_clinician_id_fkey(full_name)
        `)
        .eq('patient_id', user.id);

      if (error) throw error;
      setLinks(data as ClinicianLink[]);
    } catch (error) {
      console.error("Error loading links:", error);
      toast.error("Failed to load clinician links");
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentCode = async () => {
    if (localStorage.getItem("demoMode") === "true") return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('link_codes')
        .select('code, expires_at')
        .eq('user_id', user.id)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setCurrentCode(data);
    } catch (error) {
      console.error("Error loading code:", error);
    }
  };

  const generateCode = async () => {
    if (isDemoMode) {
      const mockCode = Math.floor(100000 + Math.random() * 900000).toString();
      setCurrentCode({
        code: mockCode,
        expires_at: new Date(Date.now() + 15 * 60000).toISOString()
      });
      toast.success("Demo code generated!");
      return;
    }

    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 15 * 60000).toISOString();

      const { error } = await supabase
        .from('link_codes')
        .insert([{ user_id: user.id, code, expires_at: expiresAt }]);

      if (error) throw error;

      setCurrentCode({ code, expires_at: expiresAt });
      toast.success("New access code generated");
    } catch (error) {
      console.error("Error generating code:", error);
      toast.error("Failed to generate code");
    } finally {
      setGenerating(false);
    }
  };

  const updateConsent = async (linkId: string, scopeKey: keyof ClinicianLink['consent_scope'], value: boolean) => {
    if (isDemoMode) {
      setLinks(prev => prev.map(l => 
        l.id === linkId ? { ...l, consent_scope: { ...l.consent_scope, [scopeKey]: value } } : l
      ));
      toast.success("Consent updated (Demo)");
      return;
    }

    try {
      const link = links.find(l => l.id === linkId);
      if (!link) return;

      const newScope = { ...link.consent_scope, [scopeKey]: value };

      const { error } = await supabase
        .from('clinician_patient_links')
        .update({ consent_scope: newScope })
        .eq('id', linkId);

      if (error) throw error;

      setLinks(prev => prev.map(l => l.id === linkId ? { ...l, consent_scope: newScope } : l));
      toast.success("Consent preferences updated");
    } catch (error) {
      console.error("Error updating consent:", error);
      toast.error("Failed to update consent");
    }
  };

  const revokeLink = async (linkId: string) => {
    if (isDemoMode) {
      setLinks(prev => prev.filter(l => l.id !== linkId));
      toast.success("Link revoked (Demo)");
      return;
    }

    try {
      const { error } = await supabase
        .from('clinician_patient_links')
        .delete()
        .eq('id', linkId);

      if (error) throw error;

      setLinks(prev => prev.filter(l => l.id !== linkId));
      toast.success("Clinician access revoked");
    } catch (error) {
      console.error("Error revoking link:", error);
      toast.error("Failed to revoke access");
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            <CardTitle>Clinician Access Code</CardTitle>
          </div>
          <CardDescription>
            Generate a secure, one-time code to link your account with your healthcare provider.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentCode ? (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg bg-primary/5">
              <span className="text-4xl font-mono font-bold tracking-widest text-primary mb-2">
                {currentCode.code}
              </span>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                Expires at {new Date(currentCode.expires_at).toLocaleTimeString()}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={generateCode}
                disabled={generating}
              >
                Generate New Code
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg">
              <p className="text-sm text-muted-foreground mb-4">No active code</p>
              <Button onClick={generateCode} disabled={generating}>
                {generating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Generate Linking Code
              </Button>
            </div>
          )}
          <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-900/50">
            <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              Only share this code with a verified healthcare professional you trust. The code expires in 15 minutes.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <CardTitle>Linked Clinicians</CardTitle>
          </div>
          <CardDescription>
            Manage who has access to your data and what they can see.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : links.length > 0 ? (
            <div className="space-y-6">
              {links.map((link) => (
                <div key={link.id} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {link.clinician_profile?.full_name || "Unknown Clinician"}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={link.status === 'active' ? 'default' : 'secondary'} className="text-[10px] h-4">
                          {link.status.toUpperCase()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Linked on {new Date(link.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => revokeLink(link.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Revoke
                    </Button>
                  </div>

                  <div className="grid gap-3 p-4 rounded-lg bg-muted/50 border">
                    <h5 className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                      Consent & Data Sharing
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`symptoms-${link.id}`} className="text-sm cursor-pointer">
                          Share Symptom Scores (NRS/GAD-7)
                        </Label>
                        <Switch 
                          id={`symptoms-${link.id}`}
                          checked={link.consent_scope.share_symptom_scores}
                          onCheckedChange={(v) => updateConsent(link.id, 'share_symptom_scores', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`regimen-${link.id}`} className="text-sm cursor-pointer">
                          Share Cannabis Regimen & Products
                        </Label>
                        <Switch 
                          id={`regimen-${link.id}`}
                          checked={link.consent_scope.share_regimen}
                          onCheckedChange={(v) => updateConsent(link.id, 'share_regimen', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`adverse-${link.id}`} className="text-sm cursor-pointer">
                          Share Adverse Events & Safety Flags
                        </Label>
                        <Switch 
                          id={`adverse-${link.id}`}
                          checked={link.consent_scope.share_adverse_events}
                          onCheckedChange={(v) => updateConsent(link.id, 'share_adverse_events', v)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor={`notes-${link.id}`} className="text-sm cursor-pointer">
                          Share Detailed Journal Notes
                        </Label>
                        <Switch 
                          id={`notes-${link.id}`}
                          checked={link.consent_scope.share_notes}
                          onCheckedChange={(v) => updateConsent(link.id, 'share_notes', v)}
                        />
                      </div>
                    </div>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">No clinicians linked yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}