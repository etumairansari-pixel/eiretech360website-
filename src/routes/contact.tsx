import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Mail, Phone, Send, ShieldCheck } from "lucide-react";
import { Shell, PageHero } from "@/components/site/Shell";
import { SectionLabel } from "@/components/site/primitives";
import { office, serviceOptions } from "@/components/site/data";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/contact")({ component: ContactPage });

// The office address + map are intentionally not shown yet — see data.ts.
const details = [
  { icon: Mail, label: "Email", value: office.email, href: `mailto:${office.email}` },
  { icon: Phone, label: "Phone", value: office.phone, href: office.phoneHref },
];
const input =
  "mt-2 w-full rounded-xl border border-brand-line bg-brand-bg px-4 py-3.5 placeholder:text-brand-muted/60 disabled:opacity-60";

type State = "idle" | "submitting" | "success" | "error";

function ContactPage() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isSupabaseConfigured) {
      setState("error");
      setError("The contact service is being connected. Please email us directly for now.");
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = Object.fromEntries(data.entries());
    setState("submitting");
    setError("");
    const supabase = await getSupabase();
    if (!supabase) {
      setState("error");
      setError("The contact service is being connected. Please email us directly for now.");
      return;
    }
    const { error: invokeError } = await supabase.functions.invoke("submit-contact", {
      body: payload,
    });
    if (invokeError) {
      setState("error");
      setError("We couldn’t send your message. Please try again or email us directly.");
      return;
    }
    form.reset();
    setState("success");
  }

  const disabled = state === "submitting" || state === "success";
  return (
    <Shell>
      <PageHero
        eyebrow="Contact Us"
        title={
          <>
            Let’s build something <span className="brand-gradient-text">exceptional together.</span>
          </>
        }
        subtitle="Tell us where you want to go next. We’ll review your enquiry and respond with practical next steps."
      />
      <section className="pb-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1.25fr_.75fr]">
          <div>
            <form
              className="relative overflow-hidden rounded-3xl border border-brand-line bg-brand-surface p-7 shadow-2xl shadow-brand-primary/5 md:p-10"
              onSubmit={submit}
              autoComplete="off"
            >
              <div className="absolute right-0 top-0 h-1 w-full brand-gradient-bg" />
              <SectionLabel>Tell Us About Your Project</SectionLabel>
              <h2 className="text-3xl font-extrabold tracking-tight">Start with a few details.</h2>
              <p className="mt-2 text-sm text-brand-muted">
                Fields marked with * are required. Your details are stored securely.
              </p>
              {state === "success" ? (
                <div className="mt-10 rounded-2xl border border-brand-accent/30 bg-brand-accent/10 p-8 text-center">
                  <CheckCircle2 className="mx-auto size-12 text-brand-accent" />
                  <h3 className="mt-4 text-2xl font-bold">Message received</h3>
                  <p className="mx-auto mt-2 max-w-md text-brand-muted">
                    Thank you. Our team has received your enquiry and will contact you within one
                    business day.
                  </p>
                  <button
                    type="button"
                    onClick={() => setState("idle")}
                    className="mt-6 font-bold text-brand-primary"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-7 grid gap-5 sm:grid-cols-2">
                    <label className="text-sm font-semibold">
                      Full Name *
                      <input
                        required
                        minLength={2}
                        maxLength={100}
                        name="fullName"
                        disabled={disabled}
                        autoComplete="off"
                        className={input}
                        placeholder="Your full name"
                      />
                    </label>
                    <label className="text-sm font-semibold">
                      Email Address *
                      <input
                        required
                        maxLength={254}
                        type="email"
                        name="email"
                        disabled={disabled}
                        autoComplete="off"
                        className={input}
                        placeholder="you@company.com"
                      />
                    </label>
                    <label className="text-sm font-semibold">
                      Phone Number
                      <input
                        maxLength={40}
                        type="tel"
                        name="phone"
                        disabled={disabled}
                        autoComplete="off"
                        className={input}
                        placeholder="Your phone number"
                      />
                    </label>
                    <label className="text-sm font-semibold">
                      Company Name
                      <input
                        maxLength={120}
                        name="company"
                        disabled={disabled}
                        autoComplete="off"
                        className={input}
                        placeholder="Your company"
                      />
                    </label>
                    <label className="text-sm font-semibold sm:col-span-2">
                      Service *
                      <select required name="service" disabled={disabled} className={input}>
                        <option value="">Select a service</option>
                        {serviceOptions.map((x) => (
                          <option key={x} value={x}>
                            {x}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="text-sm font-semibold sm:col-span-2">
                      Tell us about your project *
                      <textarea
                        required
                        minLength={10}
                        maxLength={5000}
                        name="message"
                        disabled={disabled}
                        rows={6}
                        className={`${input} resize-none`}
                        placeholder="Your goals, timeline and what success looks like..."
                      />
                    </label>
                  </div>
                  {state === "error" && (
                    <div
                      role="alert"
                      className="mt-5 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-600 dark:text-red-300"
                    >
                      {error}
                    </div>
                  )}
                  <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <button
                      disabled={disabled}
                      className="brand-gradient-bg inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 font-bold text-white shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                      type="submit"
                    >
                      {state === "submitting" ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Sending securely…
                        </>
                      ) : (
                        <>
                          Send Message <Send className="size-4" />
                        </>
                      )}
                    </button>
                    <span className="flex items-center gap-2 text-xs text-brand-muted">
                      <ShieldCheck className="size-4 text-brand-accent" />
                      Secure, private and never shared
                    </span>
                  </div>
                </>
              )}
            </form>
          </div>
          <div>
            <div className="lg:sticky lg:top-28">
              <SectionLabel>Get in Touch</SectionLabel>
              <h2 className="text-3xl font-extrabold">Start the conversation.</h2>
              <p className="mt-4 text-brand-muted">
                Have a project, a question, or simply want to explore what’s possible? We would love
                to hear from you.
              </p>
              <div className="mt-8 space-y-4">
                {details.map(({ icon: Icon, label, value, href }) => (
                  <div
                    key={label}
                    className="flex gap-4 rounded-2xl border border-brand-line bg-brand-surface p-5"
                  >
                    <Icon className="mt-1 size-5 shrink-0 text-brand-primary" />
                    <div>
                      <div className="text-xs uppercase tracking-wider text-brand-muted">
                        {label}
                      </div>
                      {href ? (
                        <a
                          href={href}
                          target={href.startsWith("http") ? "_blank" : undefined}
                          rel={href.startsWith("http") ? "noreferrer" : undefined}
                          className="mt-1 block font-semibold transition-colors hover:text-brand-primary"
                          data-hover
                        >
                          {value}
                        </a>
                      ) : (
                        <div className="mt-1 font-semibold">{value}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="mt-7 text-sm text-brand-muted">We typically respond within 24 hours.</p>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
