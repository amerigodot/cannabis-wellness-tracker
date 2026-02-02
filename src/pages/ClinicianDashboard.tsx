import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Users, 
  User, 
  LineChart, 
  AlertCircle, 
  FileText, 
  Calendar,
  Activity,
  ShieldCheck,
  Search,
  ChevronRight,
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { 
  LineChart as RechartsLineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts';
import { ThemeToggle } from "@/components/ThemeToggle";
import { ConsentScope } from "@/types/patient";

interface Patient {
  id: string;
  full_name: string;
  last_sync: string;
  status: 'active' | 'pending' | 'revoked';
  consent_scope: ConsentScope;
}

export default function ClinicianDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadPatients = useCallback(async (demo: boolean) => {
    if (demo) {
      setPatients([
        { 
          id: 'demo-p1', 
          full_name: 'John Doe', 
          last_sync: new Date().toISOString(), 
          status: 'active',
          consent_scope: { 
            share_symptom_scores: true, 
            share_regimen: true, 
            share_adverse_events: true,
            share_notes: false 
          }
        },
        { 
          id: 'demo-p2', 
          full_name: 'Jane Roe', 
          last_sync: new Date(Date.now() - 86400000).toISOString(), 
          status: 'active',
          consent_scope: { 
            share_symptom_scores: true, 
            share_regimen: true, 
            share_adverse_events: false,
            share_notes: false 
          }
        }
      ]);
      setLoading(false);
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from('clinician_patient_links')
        .select(`
          patient_id,
          status,
          consent_scope,
          updated_at,
          patient_profile:profiles!clinician_patient_links_patient_id_fkey(full_name)
        `)
        .eq('clinician_id', user.id);

      if (error) throw error;

      const formattedPatients = (data as unknown as Array<{
        patient_id: string;
        status: 'active' | 'pending' | 'revoked';
        consent_scope: ConsentScope;
        updated_at: string;
        patient_profile: { full_name: string } | null;
      }>).map((d) => ({
        id: d.patient_id,
        full_name: d.patient_profile?.full_name || "Unknown Patient",
        last_sync: d.updated_at,
        status: d.status,
        consent_scope: d.consent_scope
      }));

      setPatients(formattedPatients);
    } catch (error) {
      console.error("Error loading patients:", error);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const demo = localStorage.getItem("demoMode") === "true";
    setIsDemoMode(demo);
    loadPatients(demo);
  }, [loadPatients]);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const mockTrendData = [
    { date: '2026-01-26', pain: 8, mood: 4, thc: 10 },
    { date: '2026-01-27', pain: 7, mood: 5, thc: 15 },
    { date: '2026-01-28', pain: 6, mood: 6, thc: 10 },
    { date: '2026-01-29', pain: 7, mood: 5, thc: 20 },
    { date: '2026-01-30', pain: 5, mood: 7, thc: 15 },
    { date: '2026-01-31', pain: 4, mood: 8, thc: 10 },
    { date: '2026-02-01', pain: 3, mood: 8, thc: 5 },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b bg-card px-4 h-16 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold hidden sm:block">Clinician Dashboard</h1>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isDemoMode && <Badge variant="secondary">Demo Mode</Badge>}
          <ThemeToggle />
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Patient List */}
        <aside className="w-80 border-r bg-card/50 flex flex-col shrink-0">
          <div className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">
                All Patients ({patients.length})
              </span>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Filter className="w-3 h-3" />
              </Button>
            </div>
          </div>
          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {patients.filter(p => p.full_name.toLowerCase().includes(searchQuery.toLowerCase())).map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => setSelectedPatientId(patient.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-md transition-colors text-left ${
                    selectedPatientId === patient.id 
                      ? 'bg-primary/10 border-primary/20 border' 
                      : 'hover:bg-accent'
                  }`}
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{patient.full_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      Last sync: {new Date(patient.last_sync).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-muted-foreground ${selectedPatientId === patient.id ? 'opacity-100' : 'opacity-0'}`} />
                </button>
              ))}
            </div>
          </ScrollArea>
        </aside>

        {/* Main Content - Patient Detail */}
        <main className="flex-1 flex flex-col overflow-hidden bg-accent/5">
          {selectedPatient ? (
            <ScrollArea className="flex-1 p-6">
              <div className="max-w-5xl mx-auto space-y-6">
                {/* Patient Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold">{selectedPatient.full_name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">ID: {selectedPatient.id.split('-')[0]}...</Badge>
                        <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800">
                          Active Care Plan
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <FileText className="w-4 h-4 mr-2" />
                      Export Clinical Report
                    </Button>
                    <Button size="sm">
                      <Activity className="w-4 h-4 mr-2" />
                      Update Care Plan
                    </Button>
                  </div>
                </div>

                <Separator />

                {/* Dashboard Tabs */}
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="trends">Trends</TabsTrigger>
                    <TabsTrigger value="regimen">Regimen</TabsTrigger>
                    <TabsTrigger value="safety">Safety</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6 space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Mean Pain Score
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">4.2 / 10</div>
                          <p className="text-xs text-green-600 flex items-center mt-1">
                            -1.5 from last week
                          </p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                            Adherence Rate
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">87%</div>
                          <p className="text-xs text-muted-foreground mt-1">
                            Based on 14/16 expected logs
                          </p>
                        </CardContent>
                      </Card>
                      <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                            Dose Drift
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold text-amber-700 dark:text-amber-500">+12%</div>
                          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                            Higher THC usage than target
                          </p>
                        </CardContent>
                      </Card>
                    </div>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Edge AI Clinical Summary</CardTitle>
                        <CardDescription>
                          Automated analysis of patient trends and guideline adherence (Gemma-2B).
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 prose prose-sm dark:prose-invert">
                          <p>
                            Patient demonstrates <strong>improving pain management trajectory</strong> (-1.5 NRS change) with high adherence to sublingual oil regimen. 
                            However, daily THC intake has drifted 12% above prescribed levels, now averaging 45mg/day. 
                          </p>
                          <p>
                            <em>Suggested Action:</em> Review dosing intervals for nighttime sleep hygiene. 
                            Current usage aligns with [LRCUG Section 4] regarding frequency but exceeds [RACGP 2022] starting dose recommendations for chronic pain.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px]">LRCUG Cited</Badge>
                          <Badge variant="outline" className="text-[10px]">RACGP Cited</Badge>
                          <Badge variant="outline" className="text-[10px]">Dose Alert</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="trends" className="mt-6 space-y-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <LineChart className="w-5 h-5 text-primary" />
                          Symptom & Dosage Correlation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-[400px] w-full mt-4">
                          <ResponsiveContainer width="100%" height="100%">
                            <RechartsLineChart data={mockTrendData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="date" />
                              <YAxis yAxisId="left" orientation="left" domain={[0, 10]} />
                              <YAxis yAxisId="right" orientation="right" domain={[0, 30]} />
                              <Tooltip />
                              <Legend />
                              <Line 
                                yAxisId="left"
                                type="monotone" 
                                dataKey="pain" 
                                stroke="#ef4444" 
                                name="Pain (0-10)" 
                                strokeWidth={3}
                                dot={{ r: 4 }}
                              />
                              <Line 
                                yAxisId="left"
                                type="monotone" 
                                dataKey="mood" 
                                stroke="#10b981" 
                                name="Mood (0-10)" 
                                strokeWidth={3}
                                dot={{ r: 4 }}
                              />
                              <Line 
                                yAxisId="right"
                                type="stepAfter" 
                                dataKey="thc" 
                                stroke="#8b5cf6" 
                                name="THC Dose (mg)" 
                                strokeWidth={2}
                                strokeDasharray="5 5"
                              />
                            </RechartsLineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="regimen" className="mt-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Current Cannabis Care Plan</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid gap-6 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Product Recommendations</Label>
                            <div className="p-3 rounded-md bg-accent/50 border">
                              <p className="font-semibold text-sm">CBD-Dominant Oil (20:1)</p>
                              <p className="text-xs text-muted-foreground mt-1">Target: 20mg CBD, 1mg THC per dose</p>
                            </div>
                            <div className="p-3 rounded-md bg-accent/50 border">
                              <p className="font-semibold text-sm">Balanced Hybrid Flower</p>
                              <p className="text-xs text-muted-foreground mt-1">Target: 5mg-10mg THC for breakthrough pain</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label className="text-muted-foreground">Dosing Schedule</Label>
                            <div className="p-3 rounded-md bg-accent/50 border">
                              <p className="font-semibold text-sm">Twice Daily (BID)</p>
                              <p className="text-xs text-muted-foreground mt-1">0.5ml sublingual morning and night</p>
                            </div>
                            <div className="p-3 rounded-md bg-accent/50 border">
                              <p className="font-semibold text-sm">As Needed (PRN)</p>
                              <p className="text-xs text-muted-foreground mt-1">Vaporized as required, max 3 times daily</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="safety" className="mt-6">
                    <Card className="border-destructive/20">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <AlertCircle className="w-5 h-5 text-destructive" />
                          Safety Flags & Adverse Events
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          <div className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50">
                            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-sm text-amber-800 dark:text-amber-400">High THC Usage Detected</p>
                                <Badge className="h-4 text-[10px] bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">WARNING</Badge>
                              </div>
                              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                Patient exceeded 40mg THC daily limit on 4 of the last 7 days.
                              </p>
                              <p className="text-[10px] text-amber-600 dark:text-amber-500 mt-2 uppercase font-bold">
                                Detected on 2026-02-01
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                            <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-sm">No Acute Side Effects</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                No reports of anxiety, tachycardia, or respiratory distress in the last 30 days.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="h-20 w-20 rounded-full bg-primary/5 flex items-center justify-center mb-4">
                <Users className="w-10 h-10 text-muted-foreground/40" />
              </div>
              <h3 className="text-xl font-bold">Select a Patient</h3>
              <p className="text-muted-foreground max-w-xs mt-2">
                Choose a patient from the list on the left to view their clinical data and care plan.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
