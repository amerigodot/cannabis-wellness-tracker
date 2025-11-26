import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@4.0.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const TOOLS = [
  { id: "wellness-report", name: "Awareness Builder Report", milestone: 10 },
  { id: "correlations", name: "Insight Seeker Analysis", milestone: 50 },
  { id: "optimize", name: "Wellness Master Optimization", milestone: 100 },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const resendKey = Deno.env.get("RESEND_API_KEY")!;

    const supabase = createClient(supabaseUrl, supabaseKey);
    const resend = new Resend(resendKey);

    // Get all users with tool notifications enabled
    const { data: preferences, error: prefsError } = await supabase
      .from("email_preferences")
      .select("user_id, email")
      .eq("tool_notifications_enabled", true);

    if (prefsError) {
      console.error("Error fetching preferences:", prefsError);
      return new Response(JSON.stringify({ error: prefsError.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Checking tool availability for ${preferences?.length || 0} users`);

    const results = [];
    for (const pref of preferences || []) {
      try {
        // Get user's entry count to determine unlocked tools
        const { count: entryCount } = await supabase
          .from("journal_entries")
          .select("*", { count: "exact", head: true })
          .eq("user_id", pref.user_id)
          .eq("is_deleted", false);

        // Get all tool usage for this user
        const { data: toolUsage, error: usageError } = await supabase
          .from("tool_usage")
          .select("tool_id, last_used_at")
          .eq("user_id", pref.user_id);

        if (usageError) {
          console.error(`Error fetching tool usage for ${pref.user_id}:`, usageError);
          continue;
        }

        // Check which tools are available (unlocked + cooldown passed)
        const availableTools = [];
        const now = new Date();

        for (const tool of TOOLS) {
          // Check if tool is unlocked
          if ((entryCount || 0) < tool.milestone) continue;

          // Check cooldown
          const usage = toolUsage?.find(u => u.tool_id === tool.id);
          if (!usage) {
            availableTools.push(tool);
            continue;
          }

          const lastUsed = new Date(usage.last_used_at);
          const daysSinceUse = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24);

          // Tool became available in the last 24 hours
          if (daysSinceUse >= 7 && daysSinceUse < 8) {
            availableTools.push(tool);
          }
        }

        // Send notification if any tools became available
        if (availableTools.length > 0) {
          const toolList = availableTools.map(t => `<li><strong>${t.name}</strong></li>`).join("");
          
          const emailHtml = `
            <h2>Your Wellness Tools Are Ready! 🎉</h2>
            <p>Great news! The following wellness tools are now available for you to use:</p>
            
            <ul>
              ${toolList}
            </ul>

            <p>These AI-powered tools provide personalized insights based on your journal entries. Use them to deepen your understanding of your wellness journey.</p>

            <p style="margin-top: 30px;">
              <a href="${supabaseUrl.replace('supabase.co', 'lovable.app')}/tools" style="background: #9b87f5; color: white; padding: 10px 20px; border-radius: 6px; text-decoration: none; display: inline-block;">
                Use Your Tools Now
              </a>
            </p>

            <p style="color: #666; font-size: 12px; margin-top: 30px;">
              Tools can be used once per week. 
              <a href="${supabaseUrl.replace('supabase.co', 'lovable.app')}/settings">Manage notification preferences</a>
            </p>
          `;

          const { error: emailError } = await resend.emails.send({
            from: "Wellness Journal <onboarding@resend.dev>",
            to: [pref.email],
            subject: `${availableTools.length} Wellness Tool${availableTools.length > 1 ? 's' : ''} Available!`,
            html: emailHtml,
          });

          if (emailError) {
            console.error(`Email error for ${pref.email}:`, emailError);
            results.push({ email: pref.email, status: "failed", error: emailError.message });
          } else {
            console.log(`Sent tool notification to ${pref.email} (${availableTools.length} tools)`);
            results.push({ email: pref.email, status: "sent", tools: availableTools.length });
          }
        }
      } catch (error) {
        console.error(`Error processing user ${pref.user_id}:`, error);
        results.push({ 
          email: pref.email, 
          status: "failed", 
          error: error instanceof Error ? error.message : "Unknown error" 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        notificationsSent: results.filter(r => r.status === "sent").length,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in send-tool-notifications:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
