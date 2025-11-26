import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { entries } = await req.json();
    
    if (!entries || entries.length < 50) {
      return new Response(
        JSON.stringify({ error: "Minimum 50 entries required for correlation analysis" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Format entries with timing data
    const entriesWithTiming = entries.map((entry: any) => {
      const date = new Date(entry.consumption_time || entry.created_at);
      return {
        date: date.toLocaleDateString(),
        dayOfWeek: date.toLocaleDateString('en-US', { weekday: 'long' }),
        timeOfDay: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        hour: date.getHours(),
        strain: entry.strain,
        dosage: entry.dosage,
        method: entry.method,
        observations: entry.observations,
        activities: entry.activities,
        negative_side_effects: entry.negative_side_effects,
      };
    });

    const prompt = `You are an expert in pattern analysis and temporal correlations for medical marijuana usage. Analyze these ${entries.length} journal entries to identify timing patterns and correlations.

Entries with timing data:
${JSON.stringify(entriesWithTiming.slice(-100), null, 2)}

Provide a detailed correlation analysis with the following sections:

1. **Temporal Patterns**:
   - Best times of day for specific effects (morning/afternoon/evening/night)
   - Day of week patterns
   - Optimal timing for specific activities

2. **Strain-Time Correlations**:
   - Which strains work best at what times
   - Dosage timing patterns
   - Method effectiveness by time of day

3. **Activity-Time Insights**:
   - Best times for social activities, work, relaxation, etc.
   - Timing patterns that minimize side effects
   - Optimal schedules for different wellness goals

4. **Recommendations**:
   - Personalized timing strategies
   - Suggested consumption schedules
   - Time-based optimization tips

Format in clear markdown with specific data references, times, and actionable insights.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are a temporal pattern analysis expert specializing in medical marijuana usage correlations and timing optimization.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits required. Please add funds to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("Failed to analyze correlations");
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-correlations:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
