import { EdgeWellnessCoach } from "@/components/EdgeWellnessCoach";
import { Footer } from "@/components/Footer";

export default function Coach() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">AI Wellness Coach</h1>
            <p className="text-muted-foreground">
              Chat with a private, on-device AI assistant that understands your journal history.
            </p>
          </div>
          
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
