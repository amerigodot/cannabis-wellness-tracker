import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

// Allowed origins for CORS - restrict to known domains
const ALLOWED_ORIGINS = [
  "https://cannabis-wellness-tracker.lovable.app",
  "https://id-preview--71a51820-93cb-44f1-8bb9-105d41643cf2.lovable.app",
];

// Helper to get CORS headers with origin validation
const getCorsHeaders = (origin: string | null): Record<string, string> => {
  const isAllowed = origin && (
    ALLOWED_ORIGINS.includes(origin) ||
    origin.startsWith("http://localhost:") ||
    origin.endsWith(".lovable.app")
  );
  
  return {
    "Access-Control-Allow-Origin": isAllowed && origin ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
};

// Shared secret for cron job authentication
const CRON_SECRET = Deno.env.get("CRON_SECRET");

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);
  
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

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendKey);

    // Get all users with weekly summaries enabled
    const { data: preferences, error: prefsError } = await supabase
      .from("email_preferences")
      .select("user_id, privacy_mode_enabled")
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
        // Get user email from auth.users table
        const { data: userData, error: userError } = await supabase.auth.admin.getUserById(pref.user_id);
        
        if (userError || !userData?.user?.email) {
          console.error(`Error fetching user email for ${pref.user_id}:`, userError);
          continue;
        }
        
        const userEmail = userData.user.email;

        // Get entries from the past week (only count, don't read content for privacy)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const { count: weeklyCount, error: weeklyError } = await supabase
          .from("journal_entries")
          .select("*", { count: "exact", head: true })
          .eq("user_id", pref.user_id)
          .eq("is_deleted", false)
          .gte("created_at", oneWeekAgo.toISOString());

        if (weeklyError) {
          console.error(`Error counting entries for ${pref.user_id}:`, weeklyError);
          continue;
        }

        const entriesThisWeek = weeklyCount || 0;

        // Skip if no entries this week
        if (entriesThisWeek === 0) {
          console.log(`No entries for user ${pref.user_id} this week`);
          continue;
        }

        // Get total entry count for milestone progress
        const { count: totalCount } = await supabase
          .from("journal_entries")
          .select("*", { count: "exact", head: true })
          .eq("user_id", pref.user_id)
          .eq("is_deleted", false);

        const total = totalCount || 0;

        // Calculate next milestone
        const milestones = [10, 50, 100, 250, 500];
        const nextMilestone = milestones.find(m => total < m) || 500;
        const remainingToMilestone = nextMilestone - total;

        // Privacy-first email: Only counts, no content analysis
        // User's data is encrypted client-side, server cannot read it
        const isPrivacyMode = pref.privacy_mode_enabled;

        const emailHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #9b87f5;">Your Weekly Wellness Summary 🌿</h2>
            <p>Hi! Here's your wellness summary for the past week.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #333;">📊 Week in Review</h3>
              <ul style="list-style: none; padding: 0; margin: 0;">
                <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                  <strong>${entriesThisWeek}</strong> entries logged this week
                </li>
                <li style="padding: 8px 0; border-bottom: 1px solid #eee;">
                  <strong>${total}</strong> total entries in your journal
                </li>
                <li style="padding: 8px 0;">
                  <strong>${remainingToMilestone}</strong> entries until your next milestone (${nextMilestone})
                </li>
              </ul>
            </div>

            ${isPrivacyMode ? `
            <div style="background: #e8f5e9; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #2e7d32;">
                <strong>🔒 Privacy Mode Active</strong><br>
                <span style="font-size: 14px;">Your journal data is encrypted end-to-end. Only you can read your entries.</span>
              </p>
            </div>
            ` : `
            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; color: #e65100;">
                <strong>💡 Enable Privacy Mode</strong><br>
                <span style="font-size: 14px;">Encrypt your journal for complete privacy. Visit Settings to enable.</span>
              </p>
            </div>
            `}

            ${remainingToMilestone <= 10 ? `
              <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-top: 20px;">
                <strong>🎯 Almost there!</strong><br>
                You're just ${remainingToMilestone} entries away from unlocking new wellness achievements at ${nextMilestone} entries!
              </div>
            ` : ''}

            <div style="text-align: center; margin-top: 30px;">
              <a href="https://cannabis-wellness-tracker.lovable.app" 
                 style="background: #9b87f5; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; display: inline-block; font-weight: 500;">
                Open Your Journal
              </a>
            </div>

            <p style="color: #666; font-size: 12px; margin-top: 30px; text-align: center;">
              You're receiving this because you have weekly summaries enabled.<br>
              <a href="https://cannabis-wellness-tracker.lovable.app/settings" style="color: #9b87f5;">Manage email preferences</a>
            </p>
          </div>
        `;

        const { error: emailError } = await resend.emails.send({
          from: "Wellness Journal <onboarding@resend.dev>",
          to: [userEmail],
          subject: `Your Weekly Wellness Summary - ${entriesThisWeek} Entries`,
          html: emailHtml,
        });

        if (emailError) {
          console.error(`Email error for ${userEmail}:`, emailError);
        } else {
          console.log(`Sent weekly summary to ${userEmail}`);
          results.push({ email: userEmail, status: "sent" });
        }
      } catch (error) {
        console.error(`Error processing user ${pref.user_id}:`, error);
        results.push({ userId: pref.user_id, status: "failed", error: error instanceof Error ? error.message : "Unknown error" });
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
      { status: 500, headers: { "Content-Type": "application/json", ...getCorsHeaders(null) } }
    );
  }
});
