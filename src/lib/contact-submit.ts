export type ContactPayload = Record<string, FormDataEntryValue>;
const endpoint = "https://ovmwpsuwauoowalfwzlf.supabase.co/functions/v1/submit-contact";
const publishableKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im92bXdwc3V3YXVvb3dhbGZ3emxmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2OTUwMjcsImV4cCI6MjA5OTI3MTAyN30.BE7xGHSoUTG7oN5Ceb4yYwRNcSr5sh31Gpys7wDcG8A";

export async function submitContact(payload: ContactPayload) {
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: publishableKey,
      Authorization: `Bearer ${publishableKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`Contact service returned ${response.status}.`);
}

/** Keep qualification details in the existing message field for email and storage. */
export function contactPayload(form: FormData): ContactPayload {
  const payload = Object.fromEntries(
    ["fullName", "email", "phone", "company", "service"].map((key) => [
      key,
      String(form.get(key) ?? ""),
    ]),
  );
  const details = [
    ["Business goal", "goal"],
    ["Target market", "market"],
    ["Current website", "website"],
    ["Timeline", "timeline"],
    ["Budget", "budget"],
  ]
    .map(([label, key]) => {
      const value = String(form.get(key) ?? "").trim();
      return value ? `${label}: ${value}` : "";
    })
    .filter(Boolean);
  return {
    ...payload,
    message: [...details, "", "Project details:", String(form.get("message") ?? "").trim()]
      .join("\n")
      .slice(0, 5000),
  };
}
