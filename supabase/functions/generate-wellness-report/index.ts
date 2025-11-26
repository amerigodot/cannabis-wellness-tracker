import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    
    if (!entries || entries.length === 0) {
      return new Response(
        JSON.stringify({ error: "No entries provided" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Format entries for analysis
    const entriesSummary = entries.map((entry: any, index: number) => ({
      number: index + 1,
      date: new Date(entry.created_at).toLocaleDateString(),
      strain: entry.strain,
      dosage: entry.dosage,
      method: entry.method,
      observations: entry.observations,
      activities: entry.activities,
      negative_side_effects: entry.negative_side_effects,
    }));

    const prompt = `You are a wellness analytics expert. Analyze the following ${entries.length} medical marijuana journal entries and generate a comprehensive wellness report.

Entries:
${JSON.stringify(entriesSummary, null, 2)}

Create a detailed report with the following sections:
1. **Usage Overview**: Summary of total entries, most common strains, dosages, and consumption methods
2. **Pattern Recognition**: Identify recurring patterns in observations, activities, and side effects
3. **Effectiveness Analysis**: Which strains/methods/dosages provided the best results for specific needs
4. **Side Effects Summary**: Overview of negative side effects and their frequency
5. **Recommendations**: Actionable insights for optimizing future wellness experiences

Format the report in clear markdown with appropriate headings, bullet points, and emphasis. Be specific and reference the data. Keep it professional and informative.`;

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
            content: "You are a professional wellness analytics expert specializing in medical marijuana usage patterns and personalized insights.",
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
      throw new Error("Failed to generate report");
    }

    const data = await response.json();
    const report = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ report }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-wellness-report:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
