import React from "react";
import { Info, BrainCircuit, ShieldCheck, Scale, FileSignature } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

export const AiTransparencyBadge: React.FC = () => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Badge variant="outline" className="cursor-pointer hover:bg-primary/5 transition-colors text-xs font-medium border-primary/30 text-primary flex items-center gap-1.5 py-1">
          <BrainCircuit className="w-3 h-3" />
          AI-Generated Insight
          <Info className="w-3 h-3 ml-0.5 opacity-70" />
        </Badge>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4 space-y-4 shadow-lg border-primary/20" align="end">
        <div className="space-y-1">
          <h4 className="font-semibold flex items-center gap-2 text-primary">
            <BrainCircuit className="w-4 h-4" />
            EU AI Act Transparency Disclosure
          </h4>
          <p className="text-xs text-muted-foreground">
            System Name: MedGemma-Edge (Gemma-2B)
          </p>
        </div>
        
        <div className="space-y-3 text-sm">
          <div className="flex gap-2 items-start">
            <ShieldCheck className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Zero-Knowledge Execution</p>
              <p className="text-xs text-muted-foreground">This reasoning occurred entirely on your local device. No raw health data was sent to an external server.</p>
            </div>
          </div>
          
          <div className="flex gap-2 items-start">
            <Scale className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">System Limitations</p>
              <p className="text-xs text-muted-foreground">This is a Clinical Decision Support (CDS) tool. It provides statistical probabilities based on journal inputs and guidelines (LRCUG, Bell et al.). It may produce inaccurate outputs.</p>
            </div>
          </div>
          
          <div className="flex gap-2 items-start">
            <FileSignature className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-foreground">Human Oversight Required (Art. 14)</p>
              <p className="text-xs text-muted-foreground">Do not alter clinical regimens based solely on this insight. Mandatory human review by a qualified clinician is required.</p>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t text-[10px] text-muted-foreground flex justify-between">
          <span>QMS Version: 1.0</span>
          <a href="/docs/AI_QMS.md" className="underline hover:text-primary">View Full QMS Audit</a>
        </div>
      </PopoverContent>
    </Popover>
  );
};
