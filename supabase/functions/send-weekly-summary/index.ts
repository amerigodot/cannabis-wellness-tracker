import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Shared secret for cron job authentication
const CRON_SECRET = Deno.env.get("CRON_SECRET");

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authentication check - require either service role key or cron secret
    const authHeader = req.headers.get("Authorization");
    const cronSecretHeader = req.headers.get("X-Cron-Secret");
    
    // Validate service role key if Authorization header is present
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      
      // Only service role key can access this endpoint
      if (token !== supabaseServiceKey) {
        console.error("Unauthorized: Invalid service role key");
        return new Response(JSON.stringify({ error: "Unauthorized - service role required" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } 
    // Validate cron secret if X-Cron-Secret header is present
    else if (cronSecretHeader) {
      if (!CRON_SECRET || cronSecretHeader !== CRON_SECRET) {
        console.error("Unauthorized: Invalid cron secret");
        return new Response(JSON.stringify({ error: "Unauthorized - invalid cron secret" }), {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }
    // No valid authentication provided
    else {
      console.error("Unauthorized: No authentication provided");
      return new Response(JSON.stringify({ error: "Unauthorized - authentication required" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Authentication successful - processing weekly summaries");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY")!;
    const lovableKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendKey);

    // Get all users with weekly summaries enabled
    const { data: preferences, error: prefsError } = await supabase
      .from("email_preferences")
      .select("user_id, email")
      .eq("weekly_summary_enabled", true);

    if (prefsError) {
      console.error("Error fetching preferences:", prefsError);
      return new Response(JSON.stringify({ error: prefsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Processing ${preferences?.length || 0} users for weekly summaries`);

    const results = [];
    for (const pref of preferences || []) {
      try {
        // Get entries from the past week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { data: entries, error: entriesError } = await supabase
          .from("journal_entries")
          .select("*")
          .eq("user_id", pref.user_id)
          .eq("is_deleted", false)
          .gte("created_at", oneWeekAgo.toISOString())
          .order("created_at", { ascending: false });

        if (entriesError || !entries || entries.length === 0) {
          console.log(`No entries for user ${pref.user_id}`);
          continue;
        }

        // Get total entry count for milestone progress
        const { count } = await supabase
          .from("journal_entries")
          .select("*", { count: "exact", head: true })
          .eq("user_id", pref.user_id)
          .eq("is_deleted", false);

        // Calculate next milestone
        const milestones = [10, 50, 100];
        const nextMilestone = milestones.find(m => (count || 0) < m) || 100;
        const remainingToMilestone = nextMilestone - (count || 0);

        // Generate mini-insights using Lovable AI
        const prompt = `Analyze these ${entries.length} wellness journal entries from the past week and provide 3-5 brief, actionable insights. Focus on patterns, positive trends, and gentle recommendations.

Entries: ${JSON.stringify(entries.slice(0, 20).map(e => ({
  strain: e.strain,
  dosage: e.dosage,
  method: e.method,
  observations: e.observations,
  activities: e.activities,
})))}

Format as HTML bullet points, keep each insight to 1-2 sentences. Be encouraging and supportive.`;

        const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${lovableKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are a supportive wellness coach providing brief insights." },
              { role: "user", content: prompt },
            ],
            temperature: 0.7,
          }),
        });

        if (!aiResponse.ok) {
          console.error(`AI error for user ${pref.user_id}:`, aiResponse.status);
          continue;
        }

        const aiData = await aiResponse.json();
        const insights = aiData.choices[0].message.content;

        // Send email
        const emailHtml = `
          <h2>Your Weekly Wellness Summary 🌿</h2>
          <p>Hi! Here's your wellness summary for the past week.</p>
          
          <h3>📊 Week in Review</h3>
          <ul>
            <li><strong>${entries.length}</strong> entries logged this week</li>
            <li><strong>${count}</strong> total entries</li>
            <li><strong>${remainingToMilestone}</strong> entries until your next milestone (${nextMilestone})</li>
          </ul>

          <h3>💡 Mini-Insights</h3>
          ${insights}

          ${remainingToMilestone <= 10 ? `
            <p style="background: #f0f9ff; padding: 15px; border-radius: 8px; margin-top: 20px;">
              <strong>🎯 Almost there!</strong><br>
              You're just ${remainingToMilestone} entries away from unlocking new wellness tools at ${nextMilestone} entries!
            </p>
          ` : ''}

          <p style="margin-top: 30px;">
            <a href="${supabaseUrl.replace('supabase.co', 'lovable.app')}" style="background: #9b87f5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">
              View Full Dashboard
            </a>
          </p>

          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            You're receiving this because you have weekly summaries enabled. 
            <a href="${supabaseUrl.replace('supabase.co', 'lovable.app')}/settings">Manage preferences</a>
          </p>
        `;

        const { error: emailError } = await resend.emails.send({
          from: "Wellness Journal <onboarding@resend.dev>",
          to: [pref.email],
          subject: `Your Weekly Wellness Summary - ${entries.length} Entries`,
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Email error for ${pref.email}:`, emailError);
        } else {
          console.log(`Sent weekly summary to ${pref.email}`);
          results.push({ email: pref.email, status: "sent" });
        }
      } catch (error) {
        console.error(`Error processing user ${pref.user_id}:`, error);
        results.push({ email: pref.email, status: "failed", error: error instanceof Error ? error.message : "Unknown error" });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: results.length,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-weekly-summary:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
