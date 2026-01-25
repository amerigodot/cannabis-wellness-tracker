import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, AlertTriangle, Clock, Target, BookOpen, Activity } from "lucide-react";
import { CLINICAL_FACTSHEETS, ClinicalFactsheet } from "@/data/knowledgeBase";

interface FactsheetProps {
  conditionId: keyof typeof CLINICAL_FACTSHEETS;
}

export function ClinicalFactsheetView({ conditionId }: FactsheetProps) {
  const data: ClinicalFactsheet = CLINICAL_FACTSHEETS[conditionId];

  if (!data) return <div className="p-4">Factsheet not found for ID: {conditionId}</div>;

  return (
    <Card className="w-full max-w-3xl border-l-4 border-l-blue-600 shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant={data.indication_status === 'Approved' ? 'default' : 'secondary'}>
                {data.indication_status.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {data.source}
              </Badge>
            </div>
            <CardTitle className="text-2xl">{data.condition}</CardTitle>
            <CardDescription className="flex items-center gap-1 mt-1">
              <Clock className="w-3 h-3" /> Last Updated: {data.last_updated}
            </CardDescription>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">Evidence Level</span>
            <span className={`font-bold ${
              data.evidence_level === 'High' ? 'text-green-600' : 'text-amber-600'
            }`}>
              {data.evidence_level}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {/* 1. Protocol Section */}
        <section className="grid md:grid-cols-2 gap-4">
          <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
            <h3 className="font-semibold flex items-center gap-2 mb-3 text-primary">
              <Activity className="w-4 h-4" /> Dosing Protocol
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">Start</span>
                <span className="font-medium">{data.protocol.initial_dose}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">Titrate</span>
                <span className="font-medium text-right">{data.protocol.titration_step}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-muted-foreground">Max Daily</span>
                <span className="font-medium text-red-600">{data.protocol.max_daily_dose}</span>
              </div>
              {data.protocol.ceiling_dose && (
                 <div className="flex justify-between pt-1">
                    <span className="text-muted-foreground text-xs">Ceiling</span>
                    <span className="font-mono text-xs text-red-500">{data.protocol.ceiling_dose}</span>
                 </div>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800">
              <h4 className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-1 flex items-center gap-1">
                <Target className="w-3 h-3" /> Clinical Goal
              </h4>
              <p className="text-sm">{data.primary_goal}</p>
            </div>
            <div className="bg-slate-50 dark:bg-slate-900/20 p-3 rounded-lg border border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1 flex items-center gap-1">
                <Clock className="w-3 h-3" /> Review Cycle
              </h4>
              <p className="text-sm">{data.review_timeline}</p>
            </div>
          </div>
        </section>

        {/* 2. Safety Section */}
        <section className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2 text-primary border-b pb-2">
            <AlertTriangle className="w-4 h-4" /> Safety & Contraindications
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase block mb-2">Absolute Contraindications</span>
              <ul className="list-disc list-inside text-sm space-y-1 text-red-700 dark:text-red-400">
                {data.contraindications.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
            <div>
              <span className="text-xs font-bold text-muted-foreground uppercase block mb-2">Drug Interactions (CYP450)</span>
              <ul className="list-disc list-inside text-sm space-y-1">
                {data.drug_interactions.map((d, i) => (
                  <li key={i}>{d}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* 3. Footer / Bioavailability */}
        <div className="text-xs text-muted-foreground bg-muted p-2 rounded text-center">
          <strong>Bioavailability Note:</strong> {data.protocol.bioavailability_note}
        </div>
      </CardContent>
    </Card>
  );
}
