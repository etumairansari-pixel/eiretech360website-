import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const getRequiredEnv = (name: string) => {
  const value = Deno.env.get(name) ?? Deno.env.get(`const ${name}`);
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST")
    return Response.json({ error: "Method not allowed" }, { status: 405, headers: corsHeaders });

  try {
    const body = await request.json();
    const submission = {
      full_name: clean(body.fullName, 100),
      email: clean(body.email, 254).toLowerCase(),
      phone: clean(body.phone, 40) || null,
      company: clean(body.company, 120) || null,
      service: clean(body.service, 100),
      message: clean(body.message, 5000),
    };
    if (
      submission.full_name.length < 2 ||
      !emailPattern.test(submission.email) ||
      !submission.service ||
      submission.message.length < 10
    ) {
      return Response.json(
        { error: "Please check the required fields." },
        { status: 400, headers: corsHeaders },
      );
    }

    const secretKeys = JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS") ?? "{}");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      secretKeys.default ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { error: databaseError } = await supabase.from("contact_submissions").insert(submission);
    if (databaseError) throw databaseError;

    const emailJsPrivateKey = getRequiredEnv("EMAILJS_PRIVATE_KEY");
    const emailResponse = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: getRequiredEnv("EMAILJS_SERVICE_ID"),
        template_id: getRequiredEnv("EMAILJS_TEMPLATE_ID"),
        user_id: getRequiredEnv("EMAILJS_PUBLIC_KEY"),
        accessToken: emailJsPrivateKey,
        template_params: {
          full_name: submission.full_name,
          name: submission.full_name,
          email: submission.email,
          phone: submission.phone ?? "Not provided",
          company: submission.company ?? "Not provided",
          service: submission.service,
          title: submission.service,
          message: submission.message,
          time: new Date().toLocaleString("en-GB", { timeZone: "UTC" }) + " UTC",
        },
      }),
    });
    if (!emailResponse.ok) {
      const emailError = await emailResponse.text();
      console.error("EmailJS delivery failed", emailResponse.status, emailError);
      throw new Error(`Email provider returned ${emailResponse.status}`);
    }
    return Response.json(
      { success: true },
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "We could not send your message. Please try again shortly." },
      { status: 500, headers: corsHeaders },
    );
  }
});
