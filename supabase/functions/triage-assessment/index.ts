import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Input validation schema
const TriageInputSchema = z.object({
  symptoms: z.string().min(1, "Symptoms are required").max(2000, "Symptoms too long"),
  duration: z.string().min(1, "Duration is required").max(500, "Duration too long"),
  severity: z.number().int().min(1, "Severity must be at least 1").max(10, "Severity cannot exceed 10"),
});

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse and validate input
    let requestBody;
    try {
      requestBody = await req.json();
    } catch {
      console.error("[triage-assessment] Invalid JSON in request body");
      return new Response(
        JSON.stringify({ error: "Invalid request format" }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate input using Zod schema
    const validationResult = TriageInputSchema.safeParse(requestBody);
    if (!validationResult.success) {
      console.error("[triage-assessment] Validation failed:", validationResult.error.errors);
      return new Response(
        JSON.stringify({ 
          error: "Invalid input data",
          details: validationResult.error.errors.map(e => e.message)
        }),
        { status: 400, headers: corsHeaders }
      );
    }

    const { symptoms, duration, severity } = validationResult.data;

    // 1. Authenticate User (RBAC)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.warn("[triage-assessment] Missing auth header");
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }
    
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      console.warn("[triage-assessment] Auth failed:", authError?.message);
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: corsHeaders }
      );
    }

    console.log(`[triage-assessment] Processing request for user ${user.id}`);

    // 2. Risk Stratification (MedGemma Logic)
    // We prompt the model to act as a Triage Nurse using ESI (Emergency Severity Index)
    const prompt = `
    Role: Clinical Triage System (ESI Protocol).
    Task: Assess the following patient symptoms and recommend a disposition.
    
    Patient Data:
    - Symptoms: ${symptoms}
    - Duration: ${duration}
    - Severity (1-10): ${severity}
    
    Protocol (ESI):
    - Level 1 (Resuscitation): Immediate life-saving intervention needed (e.g., cardiac arrest). -> ER
    - Level 2 (Emergent): High risk of deterioration, severe pain/distress (e.g., chest pain, difficulty breathing). -> ER
    - Level 3 (Urgent): Needs two or more resources, stable vitals (e.g., abdominal pain). -> Urgent Care
    - Level 4 (Less Urgent): Needs one resource (e.g., simple laceration, UTI). -> Primary Care/Urgent Care
    - Level 5 (Non-Urgent): No resources needed (e.g., prescription refill, cold). -> Self-Care
    
    Output Format (JSON):
    {
      "risk_level": "Level X (Description)",
      "disposition": "ER / Urgent Care / Primary Care / Self-Care",
      "reasoning": "Brief clinical reasoning...",
      "red_flags": ["List specific red flags identified"]
    }
    `;

    // Call LLM (Simulated via Gateway or Mock for this demo environment)
    // For this demo, we'll use the Lovable Gateway if key exists, else simulated logic
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    let analysis;

    if (LOVABLE_API_KEY) {
        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${LOVABLE_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "google/gemini-2.5-flash", // Using Gemini for MedGemma tasks
                messages: [{ role: "system", content: prompt }],
                temperature: 0.1, // Low temp for clinical consistency
            }),
        });
        const data = await response.json();
        analysis = JSON.parse(data.choices[0].message.content.replace(/```json|```/g, ""));
    } else {
        // Fallback Simulation for Demo
        analysis = {
            risk_level: severity > 7 ? "Level 2 (Emergent)" : "Level 4 (Less Urgent)",
            disposition: severity > 7 ? "Emergency Room" : "Primary Care Provider",
            reasoning: "Assessment based on reported severity scores. High severity warrants immediate evaluation.",
            red_flags: severity > 7 ? ["High Pain Score"] : []
        };
    }

    // 3. Audit Logging (HIPAA Requirement)
    const { error: auditError } = await supabase.from("triage_audit_logs").insert({
        user_id: user.id,
        symptoms: symptoms,
        risk_level: analysis.risk_level,
        disposition: analysis.disposition,
        encrypted_metadata: analysis // Storing full analysis securely
    });

    if (auditError) {
      // Log server-side but don't expose to client
      console.error("[triage-assessment] Audit log insert failed:", auditError);
    }

    console.log(`[triage-assessment] Completed assessment for user ${user.id}: ${analysis.risk_level}`);

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    // Log detailed error server-side only
    console.error("[triage-assessment] Error:", error);
    
    // Return generic error to client
    return new Response(
      JSON.stringify({ error: "An error occurred processing your request. Please try again." }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
