import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

// Allowed origins for CORS - restrict to known domains
const ALLOWED_ORIGINS = [
  "https://cannabis-wellness-tracker.lovable.app",
  "https://id-preview--71a51820-93cb-44f1-8bb9-105d41643cf2.lovable.app",
];

// Helper to get CORS headers with origin validation
const getCorsHeaders = (origin: string | null): Record<string, string> => {
  // Check if origin is in allowed list, or allow localhost for development
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

serve(async (req) => {
  const origin = req.headers.get("Origin");
  const corsHeaders = getCorsHeaders(origin);
  
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create a Supabase client with the user's auth token
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        auth: {
          persistSession: false,
        },
        global: {
          headers: {
            Authorization: authHeader,
          },
        },
      }
    );

    // Verify the user is authenticated
    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      console.warn("[delete-account] Auth verification failed:", userError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const userId = user.id;

    // Create admin client for user deletion
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // Delete all user data (CASCADE foreign keys should handle this automatically,
    // but we'll be explicit for safety and logging)
    
    console.log(`[delete-account] Deleting data for user ${userId}`);

    // Delete journal entries
    const { error: entriesError } = await supabaseAdmin
      .from("journal_entries")
      .delete()
      .eq("user_id", userId);

    if (entriesError) {
      console.error("[delete-account] Error deleting journal entries:", entriesError);
    }

    // Delete reminders
    const { error: remindersError } = await supabaseAdmin
      .from("reminders")
      .delete()
      .eq("user_id", userId);

    if (remindersError) {
      console.error("[delete-account] Error deleting reminders:", remindersError);
    }

    // Delete email preferences
    const { error: emailPrefsError } = await supabaseAdmin
      .from("email_preferences")
      .delete()
      .eq("user_id", userId);

    if (emailPrefsError) {
      console.error("[delete-account] Error deleting email preferences:", emailPrefsError);
    }

    // Delete tool usage
    const { error: toolUsageError } = await supabaseAdmin
      .from("tool_usage")
      .delete()
      .eq("user_id", userId);

    if (toolUsageError) {
      console.error("[delete-account] Error deleting tool usage:", toolUsageError);
    }

    // Finally, delete the user account from auth.users
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (deleteError) {
      console.error("[delete-account] Error deleting user account:", deleteError);
      // Return generic error - don't expose internal error details
      return new Response(
        JSON.stringify({ error: "Failed to delete account. Please try again or contact support.", code: "ACC_DEL_001" }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`[delete-account] Successfully deleted account for user ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Log detailed error server-side only
    console.error("[delete-account] Error in function:", error);
    
    // Return generic error to client - no internal details exposed
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred. Please try again.", code: "ACC_DEL_500" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
