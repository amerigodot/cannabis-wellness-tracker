import { Brain } from "lucide-react";
import { EdgeWellnessCoach } from "@/components/EdgeWellnessCoach";
import { Footer } from "@/components/Footer";
import { PageHeader } from "@/components/PageHeader";

export default function Coach() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-6 sm:py-8">
        <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
          <PageHeader
            title="AI Wellness Coach"
            description="Chat with a private, on-device AI assistant that understands your journal history."
            breadcrumbs={[{ label: "Coach" }]}
            icon={<Brain className="h-6 w-6 sm:h-7 sm:w-7" />}
          />
          
          <EdgeWellnessCoach />
          
          <div className="grid md:grid-cols-3 gap-4 text-sm text-muted-foreground">
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold text-foreground mb-1">Privacy First</h3>
              <p>Your data never leaves your device. The AI model runs entirely in your browser.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold text-foreground mb-1">Context Aware</h3>
              <p>The coach analyzes your journal entries to provide personalized advice.</p>
            </div>
            <div className="p-4 rounded-lg bg-muted/50">
              <h3 className="font-semibold text-foreground mb-1">Powered by Gemma</h3>
              <p>Utilizing Google's open-weight Gemma model for high-quality medical reasoning.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
