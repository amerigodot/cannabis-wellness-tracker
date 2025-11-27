import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const EntrySchema = z.object({
  consumption_time: z.string().optional(),
  created_at: z.string(),
  strain: z.string().min(1).max(200),
  dosage: z.string().min(1).max(100),
  method: z.string().min(1).max(100),
  observations: z.array(z.string().max(200)).max(50),
  activities: z.array(z.string().max(200)).max(50),
  negative_side_effects: z.array(z.string().max(200)).max(50),
});

const RequestSchema = z.object({
  entries: z.array(EntrySchema).min(100).max(1000),
  goals: z.string().min(10).max(2000).trim(),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch (error) {
      console.error("Invalid JSON:", error);
      return new Response(
        JSON.stringify({ error: "Invalid JSON in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate input schema
    const validation = RequestSchema.safeParse(body);
    if (!validation.success) {
      console.error("Validation error:", validation.error.format());
      return new Response(
        JSON.stringify({ 
          error: "Invalid input data", 
          details: validation.error.flatten().fieldErrors 
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { entries, goals } = validation.data;

    // Initialize Supabase client
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check tool usage (weekly rate limit)
    const { data: usageData, error: usageError } = await supabase
      .from("tool_usage")
      .select("last_used_at")
      .eq("user_id", user.id)
      .eq("tool_id", "optimize")
      .maybeSingle();

    if (usageError) {
      console.error("Error checking tool usage:", usageError);
    }

    if (usageData) {
      const lastUsed = new Date(usageData.last_used_at);
      const now = new Date();
      const daysSinceLastUse = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24);
      
      if (daysSinceLastUse < 7) {
        const daysRemaining = Math.ceil(7 - daysSinceLastUse);
        return new Response(
          JSON.stringify({ 
            error: `Tool can only be used once per week. Available again in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}`,
            availableAt: new Date(lastUsed.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString()
          }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Analyze comprehensive entry data
    const entriesAnalysis = entries.map((entry) => {
      const date = new Date(entry.consumption_time || entry.created_at);
      return {
        date: date.toLocaleDateString(),
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

    const prompt = `You are a wellness optimization expert with deep knowledge of medical marijuana usage patterns. Based on ${entries.length} journal entries and the user's stated goals, create a comprehensive optimization strategy.

User's Wellness Goals:
${goals}

Historical Data Summary (last 100 entries):
${JSON.stringify(entriesAnalysis.slice(-100), null, 2)}

Create a detailed wellness optimization strategy with these sections:

1. **Goal-Aligned Analysis**:
   - How current usage patterns align with stated goals
   - Success rates for achieving desired effects
   - Gaps between goals and outcomes

2. **Optimized Protocol**:
   - Recommended strains specifically for user's goals
   - Optimal dosages and methods
   - Best timing schedules
   - Activity pairings for maximum benefit

3. **Personalized Strategy**:
   - Week-by-week implementation plan
   - Morning, afternoon, and evening routines
   - Strain rotation schedule
   - Dosage adjustment guidelines

4. **Risk Mitigation**:
   - Strategies to minimize negative side effects
   - Alternative approaches for different scenarios
   - Backup plans for sub-optimal responses

5. **Progress Tracking**:
   - Key metrics to monitor
   - Success indicators
   - Adjustment triggers
   - Expected timeline for results

6. **Advanced Recommendations**:
   - Cutting-edge optimization techniques
   - Combinations that maximize effectiveness
   - Lifestyle factors to enhance results

Format in detailed markdown with specific, actionable steps. Reference data patterns and provide concrete guidance.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          {
            role: "system",
            content: "You are a master wellness optimization strategist specializing in personalized medical marijuana protocols based on comprehensive data analysis and individual goals.",
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
      throw new Error("Failed to generate optimization strategy");
    }

    const data = await response.json();
    const strategy = data.choices[0].message.content;

    // Record tool usage
    await supabase
      .from("tool_usage")
      .upsert({
        user_id: user.id,
        tool_id: "optimize",
        last_used_at: new Date().toISOString(),
      });

    return new Response(
      JSON.stringify({ strategy }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in optimize-wellness:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error occurred" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});