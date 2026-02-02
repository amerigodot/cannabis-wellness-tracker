import { useState, useEffect, useCallback } from "react";
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
  FileText, 
  Calendar,
  Activity,
  ShieldCheck,
  Search,
  ChevronRight,
  Filter,
  AlertCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ConsentScope, CannabisRegimen } from "@/types/patient";
import { useClinicalSummarizer } from "@/hooks/useClinicalSummarizer";
import { computeClinicalFeatures, ClinicalMetrics } from "@/utils/clinicalAugmentation";
import { JournalEntry } from "@/types/journal";
import { Loader2, RefreshCw } from "lucide-react";
import { CarePlanEditor } from "@/components/clinical/CarePlanEditor";
import { AdvancedTrendChart } from "@/components/clinical/AdvancedTrendChart";
import { toast } from "sonner";
import { SAMPLE_ENTRIES } from "@/data/sampleEntries";

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
  
  // Clinical Data State
  const [patientMetrics, setPatientMetrics] = useState<ClinicalMetrics | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [activeRegimen, setActiveRegimen] = useState<CannabisRegimen | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  
  // AI Summarizer Hook
  const { generateSummary, summary, isLoading: isAiLoading, isModelLoading, progress } = useClinicalSummarizer();

  const loadPatients = useCallback(async (demo: boolean) => {
    // ... existing loadPatients implementation ...
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

  // Fetch journal entries and compute metrics when patient changes
  useEffect(() => {
    if (!selectedPatientId) {
      setPatientMetrics(null);
      setActiveRegimen(null);
      return;
    }

    const fetchPatientData = async () => {
      setMetricsLoading(true);
      try {
        if (isDemoMode) {
          // Simulate fetch delay
          await new Promise(r => setTimeout(r, 500));
          
          let mockEntries: JournalEntry[] = [];
          
          if (selectedPatientId === 'demo-p1') {
            // John Doe uses the full SAMPLE_ENTRIES set (consistent with Journal view)
            mockEntries = SAMPLE_ENTRIES;
          } else {
            // Jane Roe gets a filtered/modified subset for variety
            mockEntries = SAMPLE_ENTRIES.filter((_, i) => i % 2 === 0).map(e => ({
              ...e,
              before_pain: Math.min(10, (e.before_pain || 0) + 2), // Jane has higher pain
              user_id: 'demo-p2'
            }));
          }

          setPatientMetrics(computeClinicalFeatures(mockEntries));
          
          // Process trends for chart (Demo)
          const trends = mockEntries
            .sort((a, b) => new Date(a.consumption_time).getTime() - new Date(b.consumption_time).getTime())
            .map(e => ({
              date: e.consumption_time,
              pain: e.before_pain || 0,
              anxiety: e.before_anxiety || 0,
              thc: e.thc_percentage ? (parseFloat(e.dosage) || 0.5) * (e.thc_percentage / 100) * 1000 : 10
            }));
          setChartData(trends);

          // Set mock regimen
          setActiveRegimen({
            products: [
              { name: "CBD Oil 20:1", strain: "ACDC", type: "oil", thcContent: 1, cbdContent: 20 },
              { name: "Night Flower", strain: "GSC", type: "flower", thcContent: 18, cbdContent: 1 }
            ],
            dosing: {
              frequency: "bid",
              targetTHC: 20,
              targetCBD: 40,
              instructions: "Take oil in morning. Vaporize flower only for breakthrough pain."
            },
            route: "sublingual",
            startDate: new Date(),
            prescribingClinician: "Dr. Demo"
          });
        } else {
          // Fetch real entries from Supabase
          const { data: entriesData, error: entriesError } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', selectedPatientId)
            .order('created_at', { ascending: false })
            .limit(50);

          if (entriesError) throw entriesError;
          const realEntries = entriesData as unknown as JournalEntry[];
          setPatientMetrics(computeClinicalFeatures(realEntries));
          
          // Process trends for chart (Real)
          const trends = realEntries
            .sort((a, b) => new Date(a.consumption_time || a.created_at).getTime() - new Date(b.consumption_time || b.created_at).getTime())
            .map(e => ({
              date: e.consumption_time || e.created_at,
              pain: e.before_pain || 0,
              anxiety: e.before_anxiety || 0,
              thc: e.thc_percentage ? (parseFloat(e.dosage) || 0.5) * (e.thc_percentage / 100) * 1000 : 
                   (e.dosage.includes('mg') ? parseFloat(e.dosage) : 5) // Fallback logic
            }));
          setChartData(trends);
        }
      } catch (error) {
        console.error("Error fetching patient metrics:", error);
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchPatientData();
  }, [selectedPatientId, isDemoMode]);

  const handleUpdateRegimen = async (newRegimen: CannabisRegimen) => {
    // In a real app, save to Supabase 'care_plans' table
    if (isDemoMode) {
      await new Promise(r => setTimeout(r, 800)); // Sim network
      setActiveRegimen(newRegimen);
    } else {
      console.log("Saving to DB:", newRegimen);
      // Implementation pending DB schema for care_plans
      toast.info("Backend sync pending Phase 4 implementation");
    }
  };

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

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
                    {metricsLoading ? (
                       <div className="flex justify-center p-12">
                         <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                       </div>
                    ) : patientMetrics ? (
                      <>
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                          <Card>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Mean Daily THC
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="text-2xl font-bold">{patientMetrics.doseMetrics.meanDailyTHC.toFixed(1)} mg</div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Target: 20mg/day
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
                              <div className="text-2xl font-bold">{patientMetrics.doseMetrics.adherenceRate.toFixed(0)}%</div>
                              <p className="text-xs text-muted-foreground mt-1">
                                Based on recent logs
                              </p>
                            </CardContent>
                          </Card>
                          <Card className={`border-l-4 ${patientMetrics.doseMetrics.doseDrift > 10 ? "border-amber-500 bg-amber-50 dark:bg-amber-950/20" : "border-l-transparent"}`}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                                Dose Drift
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className={`text-2xl font-bold ${patientMetrics.doseMetrics.doseDrift > 10 ? "text-amber-700 dark:text-amber-500" : ""}`}>
                                {patientMetrics.doseMetrics.doseDrift > 0 ? "+" : ""}{patientMetrics.doseMetrics.doseDrift.toFixed(0)}%
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">
                                From prescribed target
                              </p>
                            </CardContent>
                          </Card>
                        </div>

                        <Card>
                          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                            <div className="space-y-1">
                              <CardTitle className="text-lg">Edge AI Clinical Summary</CardTitle>
                              <CardDescription>
                                Automated SOAP note generation using local Gemma-2B (WebGPU).
                              </CardDescription>
                            </div>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              onClick={() => selectedPatient && generateSummary(selectedPatient.full_name, patientMetrics)}
                              disabled={isAiLoading || !selectedPatient}
                            >
                              {isAiLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                              Generate Summary
                            </Button>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-4">
                            {isModelLoading && (
                              <div className="flex items-center gap-2 text-sm text-muted-foreground p-2 bg-muted/50 rounded-md">
                                <Loader2 className="w-3 h-3 animate-spin" />
                                {progress}
                              </div>
                            )}
                            
                            {summary ? (
                              <div className="p-4 rounded-lg bg-primary/5 border border-primary/10 prose prose-sm dark:prose-invert max-w-none">
                                <div className="whitespace-pre-wrap font-medium text-foreground/90">{summary}</div>
                              </div>
                            ) : (
                              <div className="p-8 text-center border-2 border-dashed rounded-lg text-muted-foreground text-sm">
                                Click "Generate Summary" to process patient metrics locally.
                                <br />
                                <span className="text-xs opacity-70">No data leaves this device.</span>
                              </div>
                            )}

                            {summary && (
                              <div className="flex items-center gap-2 pt-2">
                                <Badge variant="outline" className="text-[10px]">LRCUG Cited</Badge>
                                <Badge variant="outline" className="text-[10px]">Risk Analysis</Badge>
                                <Badge variant="secondary" className="text-[10px]">Updated Just Now</Badge>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        No clinical data available for this period.
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="trends" className="mt-6 space-y-6">
                    <AdvancedTrendChart data={chartData} />
                  </TabsContent>

                  <TabsContent value="regimen" className="mt-6">
                    {activeRegimen ? (
                      <CarePlanEditor 
                        initialRegimen={activeRegimen}
                        onSave={handleUpdateRegimen}
                      />
                    ) : (
                      <Card>
                        <CardHeader>
                          <CardTitle>No Active Care Plan</CardTitle>
                          <CardDescription>Create a care plan to track patient adherence.</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
                            <FileText className="w-8 h-8 mb-2 opacity-50" />
                            <p>Care plans are available in Demo Mode or after Phase 4 backend integration.</p>
                          </div>
                        </CardContent>
                      </Card>
                    )}
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
                          {patientMetrics && patientMetrics.riskFlags.length > 0 ? (
                            patientMetrics.riskFlags.map((flag, idx) => (
                              <div key={idx} className="flex items-start gap-3 p-4 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900/50">
                                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-semibold text-sm text-amber-800 dark:text-amber-400">{flag}</p>
                                    <Badge className="h-4 text-[10px] bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">RISK DETECTED</Badge>
                                  </div>
                                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                                    Flagged by LRCUG/clinical rule engine based on recent logs.
                                  </p>
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="flex items-start gap-3 p-4 rounded-lg border bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900/50">
                              <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                              <div>
                                <p className="font-semibold text-sm text-green-800 dark:text-green-400">No Active Risk Flags</p>
                                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                                  Patient usage patterns align with safety guidelines.
                                </p>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-3 p-4 rounded-lg border bg-card">
                            <Activity className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-sm">Adverse Event Rate</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {patientMetrics?.adverseEventRate.toFixed(1)} events per week (avg).
                                {patientMetrics && patientMetrics.adverseEventRate === 0 && " No negative side effects reported."}
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
