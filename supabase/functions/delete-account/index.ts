import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
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
    
    console.log(`Deleting data for user ${userId}`);

    // Delete journal entries
    const { error: entriesError } = await supabaseAdmin
      .from("journal_entries")
      .delete()
      .eq("user_id", userId);

    if (entriesError) {
      console.error("Error deleting journal entries:", entriesError);
    }

    // Delete reminders
    const { error: remindersError } = await supabaseAdmin
      .from("reminders")
      .delete()
      .eq("user_id", userId);

    if (remindersError) {
      console.error("Error deleting reminders:", remindersError);
    }

    // Delete email preferences
    const { error: emailPrefsError } = await supabaseAdmin
      .from("email_preferences")
      .delete()
      .eq("user_id", userId);

    if (emailPrefsError) {
      console.error("Error deleting email preferences:", emailPrefsError);
    }

    // Delete tool usage
    const { error: toolUsageError } = await supabaseAdmin
      .from("tool_usage")
      .delete()
      .eq("user_id", userId);

    if (toolUsageError) {
      console.error("Error deleting tool usage:", toolUsageError);
    }

    // Finally, delete the user account from auth.users
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      userId
    );

    if (deleteError) {
      console.error("Error deleting user account:", deleteError);
      return new Response(
        JSON.stringify({ error: "Failed to delete user account", details: deleteError.message }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log(`Successfully deleted account for user ${userId}`);

    return new Response(
      JSON.stringify({ success: true, message: "Account deleted successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in delete-account function:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
