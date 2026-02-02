import {
  Calendar,
  TrendingUp,
  Bell,
  Shield,
  Lock,
  Eye,
  Sparkles,
  FileText,
  Target,
  Award,
  Clock,
  Zap,
  Heart,
  BarChart3,
  Settings,
  Trash2,
  Moon,
  Smartphone,
  BookOpen,
  CheckCircle2,
  ArrowLeft,
  Download,
  Printer,
  Brain,
  Stethoscope,
  Database,
  Activity,
  LayoutDashboard,
  Link as LinkIcon,
  ClipboardList,
  MessageSquareText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { SEO } from "@/components/SEO";

const Features = () => {
  const navigate = useNavigate();

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      <SEO
        title="Features - Cannabis Wellness Tracker"
        description="Discover all features of Cannabis Wellness Tracker: journal entries, insights, reminders, achievements, and more."
      />

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 print:bg-white">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50 print:hidden">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to App
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print / Save PDF
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12 max-w-5xl">
          {/* Hero Section */}
          <div className="text-center mb-16 print:mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Sparkles className="h-10 w-10 text-primary" />
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent print:text-primary">
                Cannabis Wellness Tracker
              </h1>
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Complete Feature Overview — Track your journey, discover patterns, and optimize your wellness experience
            </p>
            <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
              <Badge variant="secondary" className="text-sm py-1.5 px-4">
                <Lock className="h-3.5 w-3.5 mr-1.5" />
                Encrypted & Private
              </Badge>
              <Badge variant="secondary" className="text-sm py-1.5 px-4">
                <Eye className="h-3.5 w-3.5 mr-1.5" />
                You Own Your Data
              </Badge>
              <Badge variant="secondary" className="text-sm py-1.5 px-4">
                <Shield className="h-3.5 w-3.5 mr-1.5" />
                No Ads
              </Badge>
            </div>
          </div>

          {/* Core Features Section */}
          <section className="mb-12 print:mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Core Features
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Calendar className="h-5 w-5" />}
                title="Calendar Tracking"
                description="Log entries with detailed consumption info, effects, and personal notes"
                features={[
                  "Strain name & dosage tracking",
                  "Consumption method selection",
                  "Time-stamped entries",
                  "Personal notes via modal dialog"
                ]}
              />
              <FeatureCard
                icon={<TrendingUp className="h-5 w-5" />}
                title="Insights & Trends"
                description="Visualize usage patterns and understand what works best for you"
                features={[
                  "Time-based trend charts",
                  "Strain effectiveness comparisons",
                  "Badge usage analytics",
                  "Goal-based recommendations"
                ]}
              />
              <FeatureCard
                icon={<Bell className="h-5 w-5" />}
                title="Smart Reminders"
                description="Set recurring reminders to maintain consistent tracking habits"
                features={[
                  "Customizable reminder times",
                  "Browser notifications",
                  "Recurring schedules",
                  "Audio alerts"
                ]}
              />
              <FeatureCard
                icon={<BookOpen className="h-5 w-5" />}
                title="Expert Guides"
                description="Comprehensive articles on tracking, strain selection, and wellness"
                features={[
                  "THC:CBD ratio explanations",
                  "Strain selection guides",
                  "Dosage optimization tips",
                  "Wellness strategies"
                ]}
              />
            </div>
          </section>

          {/* Journal Entry Features */}
          <section className="mb-12 print:mb-8 print:break-before-page">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <FileText className="h-6 w-6 text-primary" />
              Journal Entry System
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Zap className="h-5 w-5" />}
                title="Quick Entry Mode"
                description="Fast logging when you're short on time"
                features={[
                  "Strain name & dosage only",
                  "Quick observation tags",
                  "One-tap submission",
                  "Consumption presets"
                ]}
              />
              <FeatureCard
                icon={<Target className="h-5 w-5" />}
                title="Full Tracking Mode"
                description="Comprehensive data capture for detailed insights"
                features={[
                  "Before/After wellness metrics",
                  "Mood, pain, anxiety, energy, focus scales",
                  "THC/CBD percentage tracking",
                  "Effects duration logging"
                ]}
              />
              <FeatureCard
                icon={<Heart className="h-5 w-5" />}
                title="Experience Tracking"
                description="Capture your complete experience"
                features={[
                  "Observation tags (relaxed, focused, creative)",
                  "Activity tracking (work, exercise, social)",
                  "Side effects logging",
                  "Custom notes"
                ]}
              />
              <FeatureCard
                icon={<Clock className="h-5 w-5" />}
                title="Pending Entry Workflow"
                description="Never miss logging your after-state"
                features={[
                  "Log before & consumption now",
                  "Complete after-state later",
                  "Pending entry reminders",
                  "Auto-save progress"
                ]}
              />
            </div>
          </section>

          {/* MedGemma AI Features */}
          <section className="mb-12 print:mb-8 print:break-before-page">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Brain className="h-6 w-6 text-primary" />
              Edge AI Innovation (MedGemma Challenge)
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<Database className="h-5 w-5" />}
                title="Clinical Factsheets & Protocols"
                description="Guideline-anchored medical knowledge base"
                features={[
                  "Local RAG (Retrieval Augmented Gen)",
                  "Structured dosing protocols (Start/Titrate/Max)",
                  "Numeric clinical goals & review timelines",
                  "2025 Guideline integration (ACOEM, NCSCT)"
                ]}
              />
              <FeatureCard
                icon={<Stethoscope className="h-5 w-5" />}
                title="Clinical Triage System"
                description="Secure decision support following ESI protocols"
                features={[
                  "Symptom-based risk stratification",
                  "Disposition recommendations (ER/Urgent Care)",
                  "Crisis interception state machine",
                  "Simulated FHIR export for EHR integration"
                ]}
              />
              <FeatureCard
                icon={<Activity className="h-5 w-5" />}
                title="Edge AI Benchmarks"
                description="Real-time performance and helpfulness monitoring"
                features={[
                  "User-driven response rating system",
                  "Hardware-specific inference tracking",
                  "Evaluation dashboard for judges",
                  "Privacy & Latency audit logs"
                ]}
              />
              <FeatureCard
                icon={<Shield className="h-5 w-5" />}
                title="Secure Health Pipeline"
                description="Local-first data architecture for high sensitivity"
                features={[
                  "Zero-Knowledge (ZK) inference sessions",
                  "Encrypted local storage for AI context",
                  "Deterministic feature engineering",
                  "Peer-reviewed clinical guideline grounding"
                ]}
              />
            </div>
          </section>

          {/* Clinician Portal & Care Management */}
          <section className="mb-12 print:mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Stethoscope className="h-6 w-6 text-primary" />
              Clinician Portal & Care Management
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<LayoutDashboard className="h-5 w-5" />}
                title="Medical Dashboard"
                description="Dual-interface platform connecting patients with providers"
                features={[
                  "Longitudinal symptom tracking",
                  "Adherence monitoring (Dose Drift)",
                  "Multi-axis trend visualization",
                  "Risk flag alerts (LRCUG)"
                ]}
              />
              <FeatureCard
                icon={<LinkIcon className="h-5 w-5" />}
                title="Secure Patient Linking"
                description="Privacy-preserving connection protocol"
                features={[
                  "6-digit one-time access codes",
                  "Granular consent scopes",
                  "Instant access revocation",
                  "Zero-knowledge architecture"
                ]}
              />
              <FeatureCard
                icon={<ClipboardList className="h-5 w-5" />}
                title="AI Clinical Summaries"
                description="Automated chart review via Edge AI"
                features={[
                  "SOAP-style pre-visit notes",
                  "Symptom trajectory analysis",
                  "Computed clinical metrics",
                  "Local inference (No PHI egress)"
                ]}
              />
              <FeatureCard
                icon={<MessageSquareText className="h-5 w-5" />}
                title="Care Plan Synchronization"
                description="Digital regimen management"
                features={[
                  "Prescribe products & dosages",
                  "Update instructions remotely",
                  "Syncs directly to patient app",
                  "Track protocol compliance"
                ]}
              />
            </div>
          </section>

          {/* Analytics Features */}
          <section className="mb-12 print:mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              Analytics & Insights
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <FeatureCard
                icon={<TrendingUp className="h-5 w-5" />}
                title="Trend Visualization"
                description="See your patterns over time"
                features={[
                  "Daily/weekly/monthly grouping",
                  "Adaptive time ranges",
                  "Color-coded trend lines",
                  "Interactive tooltips"
                ]}
              />
              <FeatureCard
                icon={<BarChart3 className="h-5 w-5" />}
                title="Effectiveness Dashboard"
                description="Data-driven strain optimization"
                features={[
                  "Effectiveness scores (0-100%)",
                  "Before vs After comparisons",
                  "Strain rankings",
                  "Goal-based analysis"
                ]}
              />
            </div>

            {/* Effectiveness Scoring Card */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Effectiveness Scoring System
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-center">
                  {[
                    { label: "Highly Effective", range: "80-100%", color: "bg-green-500/20 text-green-700 dark:text-green-400" },
                    { label: "Effective", range: "60-79%", color: "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400" },
                    { label: "Moderate", range: "40-59%", color: "bg-yellow-500/20 text-yellow-700 dark:text-yellow-400" },
                    { label: "Mild", range: "20-39%", color: "bg-orange-500/20 text-orange-700 dark:text-orange-400" },
                    { label: "Limited", range: "0-19%", color: "bg-red-500/20 text-red-700 dark:text-red-400" }
                  ].map((score) => (
                    <div key={score.label} className={`rounded-lg p-3 ${score.color}`}>
                      <div className="font-semibold text-sm">{score.label}</div>
                      <div className="text-xs opacity-80">{score.range}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Additional Features */}
          <section className="mb-12 print:mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Settings className="h-6 w-6 text-primary" />
              Additional Features
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <MiniFeatureCard
                icon={<Trash2 className="h-4 w-4" />}
                title="Trash & Recovery"
                description="Restore accidentally deleted entries"
              />
              <MiniFeatureCard
                icon={<Settings className="h-4 w-4" />}
                title="Settings"
                description="Email preferences & notifications"
              />
              <MiniFeatureCard
                icon={<BookOpen className="h-4 w-4" />}
                title="Blog Section"
                description="SEO-optimized wellness articles"
              />
              <MiniFeatureCard
                icon={<Smartphone className="h-4 w-4" />}
                title="Responsive Design"
                description="Works on mobile, tablet, desktop"
              />
              <MiniFeatureCard
                icon={<Moon className="h-4 w-4" />}
                title="Dark/Light Theme"
                description="System-aware theming"
              />
              <MiniFeatureCard
                icon={<Sparkles className="h-4 w-4" />}
                title="Demo Mode"
                description="Try before you sign up"
              />
            </div>
          </section>

          {/* Privacy Section */}
          <section className="mb-12 print:mb-8">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Shield className="h-6 w-6 text-primary" />
              Privacy & Security
            </h2>
            <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="pt-6">
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <Lock className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-1">End-to-End Encrypted</h3>
                    <p className="text-sm text-muted-foreground">Your data is encrypted and secure</p>
                  </div>
                  <div>
                    <Eye className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-1">You Own Your Data</h3>
                    <p className="text-sm text-muted-foreground">Complete data ownership and control</p>
                  </div>
                  <div>
                    <Shield className="h-8 w-8 mx-auto mb-3 text-primary" />
                    <h3 className="font-semibold mb-1">No Ads, No Selling</h3>
                    <p className="text-sm text-muted-foreground">We never sell your information</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>

          {/* Footer */}
          <footer className="text-center text-muted-foreground text-sm py-8 border-t border-border/50">
            <p>© {new Date().getFullYear()} Cannabis Wellness Tracker. All rights reserved.</p>
            <p className="mt-2">
              <a href="https://cannabis-wellness-tracker.lovable.app" className="text-primary hover:underline">
                cannabis-wellness-tracker.lovable.app
              </a>
            </p>
          </footer>
        </main>
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          body { 
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden { display: none !important; }
          .print\\:bg-white { background: white !important; }
          .print\\:mb-8 { margin-bottom: 2rem !important; }
          .print\\:break-before-page { break-before: page; }
          .print\\:text-primary { color: hsl(var(--primary)) !important; }
        }
      `}</style>
    </>
  );
};

// Feature Card Component
const FeatureCard = ({
  icon,
  title,
  description,
  features
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  features: string[];
}) => (
  <Card className="h-full">
    <CardHeader className="pb-3">
      <CardTitle className="text-lg flex items-center gap-2">
        <span className="text-primary">{icon}</span>
        {title}
      </CardTitle>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardHeader>
    <CardContent>
      <ul className="space-y-1.5">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </CardContent>
  </Card>
);

// Mini Feature Card Component
const MiniFeatureCard = ({
  icon,
  title,
  description
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <Card className="p-4">
    <div className="flex items-start gap-3">
      <span className="text-primary mt-0.5">{icon}</span>
      <div>
        <h3 className="font-medium text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </div>
  </Card>
);

export default Features;
