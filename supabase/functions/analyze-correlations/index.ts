import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.23.8/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting configuration
const IP_RATE_LIMIT_WINDOW_MINUTES = 60; // 1 hour
const IP_RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per hour per IP
const USER_RATE_LIMIT_WINDOW_MINUTES = 60; // 1 hour
const USER_RATE_LIMIT_MAX_REQUESTS = 10; // 10 requests per hour per user
const ACCOUNT_AGE_DAYS = 7; // Minimum account age in days

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
  entries: z.array(EntrySchema).min(50).max(1000),
});

function getClientIP(req: Request): string {
  // Check common proxy headers first
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const ips = forwardedFor.split(",");
    return ips[0].trim();
  }

  const realIP = req.headers.get("x-real-ip");
  if (realIP) {
    return realIP.trim();
  }

  // Fallback to connection info (may not work in all environments)
  return "unknown";
}

async function checkIPRateLimit(supabase: any, ipAddress: string, endpoint: string): Promise<{ allowed: boolean; error?: string }> {
  if (ipAddress === "unknown") {
    return { allowed: true }; // Fail open if IP cannot be determined
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - IP_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);

  try {
    // Get or create rate limit record for current window
    const { data: existingLimit, error: fetchError } = await supabase
      .from("ip_rate_limits")
      .select("*")
      .eq("ip_address", ipAddress)
      .eq("endpoint", endpoint)
      .gte("window_start", windowStart.toISOString())
      .maybeSingle();

    if (fetchError) {
      console.error("IP rate limit fetch error:", fetchError);
      return { allowed: true }; // Fail open on errors
    }

    if (!existingLimit) {
      // Create new rate limit record
      await supabase
        .from("ip_rate_limits")
        .insert({
          ip_address: ipAddress,
          endpoint: endpoint,
          request_count: 1,
          window_start: now.toISOString(),
        });
      return { allowed: true };
    }

    // Check if limit exceeded
    if (existingLimit.request_count >= IP_RATE_LIMIT_MAX_REQUESTS) {
      const resetTime = new Date(new Date(existingLimit.window_start).getTime() + IP_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
      const minutesRemaining = Math.ceil((resetTime.getTime() - now.getTime()) / (1000 * 60));
      return { 
        allowed: false, 
        error: `Too many requests from your IP address. Maximum ${IP_RATE_LIMIT_MAX_REQUESTS} requests per hour. Try again in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.` 
      };
    }

    // Increment counter
    await supabase
      .from("ip_rate_limits")
      .update({ request_count: existingLimit.request_count + 1 })
      .eq("id", existingLimit.id);

    return { allowed: true };
  } catch (error) {
    console.error("IP rate limit error:", error);
    return { allowed: true }; // Fail open on errors
  }
}

async function checkUserRateLimit(supabase: any, userId: string, endpoint: string): Promise<{ allowed: boolean; error?: string }> {
  const now = new Date();
  const windowStart = new Date(now.getTime() - USER_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);

  // Get or create rate limit record for current window
  const { data: existingLimit, error: fetchError } = await supabase
    .from("rate_limits")
    .select("*")
    .eq("user_id", userId)
    .eq("endpoint", endpoint)
    .gte("window_start", windowStart.toISOString())
    .maybeSingle();

  if (fetchError) {
    console.error("User rate limit fetch error:", fetchError);
    return { allowed: true }; // Fail open on errors
  }

  if (!existingLimit) {
    // Create new rate limit record
    await supabase
      .from("rate_limits")
      .insert({
        user_id: userId,
        endpoint: endpoint,
        request_count: 1,
        window_start: now.toISOString(),
      });
    return { allowed: true };
  }

  // Check if limit exceeded
  if (existingLimit.request_count >= USER_RATE_LIMIT_MAX_REQUESTS) {
    const resetTime = new Date(new Date(existingLimit.window_start).getTime() + USER_RATE_LIMIT_WINDOW_MINUTES * 60 * 1000);
    const minutesRemaining = Math.ceil((resetTime.getTime() - now.getTime()) / (1000 * 60));
    return { 
      allowed: false, 
      error: `Rate limit exceeded. Maximum ${USER_RATE_LIMIT_MAX_REQUESTS} requests per hour. Try again in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}.` 
    };
  }

  // Increment counter
  await supabase
    .from("rate_limits")
    .update({ request_count: existingLimit.request_count + 1 })
    .eq("id", existingLimit.id);

  return { allowed: true };
}

async function checkAccountAge(userCreatedAt: string): Promise<{ allowed: boolean; error?: string }> {
  const createdDate = new Date(userCreatedAt);
  const now = new Date();
  const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysSinceCreation < ACCOUNT_AGE_DAYS) {
    const daysRemaining = Math.ceil(ACCOUNT_AGE_DAYS - daysSinceCreation);
    return {
      allowed: false,
      error: `Account must be at least ${ACCOUNT_AGE_DAYS} days old to use tools. Your account will be eligible in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}.`
    };
  }

  return { allowed: true };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize admin client for rate limiting (before authentication)
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    // Check IP-based rate limit FIRST (before authentication)
    const clientIP = getClientIP(req);
    console.log(`Request from IP: ${clientIP}`);
    
    const ipRateLimitCheck = await checkIPRateLimit(supabaseAdmin, clientIP, "correlations");
    if (!ipRateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({ error: ipRateLimitCheck.error }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    const { entries } = validation.data;

    // Now authenticate user
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "No authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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

    // Check account age
    const accountAgeCheck = await checkAccountAge(user.created_at);
    if (!accountAgeCheck.allowed) {
      return new Response(
        JSON.stringify({ error: accountAgeCheck.error }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check user-based rate limit
    const userRateLimitCheck = await checkUserRateLimit(supabaseAdmin, user.id, "correlations");
    if (!userRateLimitCheck.allowed) {
      return new Response(
        JSON.stringify({ error: userRateLimitCheck.error }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check tool usage (weekly rate limit)
    const { data: usageData, error: usageError } = await supabase
      .from("tool_usage")
      .select("last_used_at")
      .eq("user_id", user.id)
      .eq("tool_id", "correlations")
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

    // Format entries with timing data
    const entriesWithTiming = entries.map((entry) => {
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

    // Record tool usage
    await supabase
      .from("tool_usage")
      .upsert({
        user_id: user.id,
        tool_id: "correlations",
        last_used_at: new Date().toISOString(),
      });

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