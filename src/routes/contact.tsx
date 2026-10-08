import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { ArrowUpRight, ChevronDown, ChevronRight } from "lucide-react";
import { contact, footer, headFor, offices } from "@/content";
import { imageFor } from "@/content/images";
import { Shell } from "@/components/site/Shell";
import { Highlight } from "@/components/site/Highlight";
import { contactPayload, submitContact } from "@/lib/contact-submit";
import contactPage from "../../content/pages/contact.json";

export const Route = createFileRoute("/contact")({
  head: () => headFor("contact", contactPage.seo),
  component: ContactPage,
});

function ContactPage() {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (sending || !form.reportValidity()) return;
    setSending(true);
    setStatus(null);
    try {
      await submitContact(contactPayload(new FormData(form)));
      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
    } finally {
      setSending(false);
    }
  }
  const split = (line: string) => line.split("|").map((part) => part.trim());
  return (
    <Shell>
      <div className="dm-site dm-contact-page">
        <section className="dm-service-hero dm-layered-hero">
          <div className="dm-container">
            <nav className="dm-breadcrumb" aria-label="Breadcrumb">
              <Link to="/">Home</Link>
              <ChevronRight size={13} />
              <span aria-current="page">Contact</span>
            </nav>
            <div className="dm-split">
              <div>
                <p className="dm-overline">{contactPage.hero.eyebrow}</p>
                <h1>
                  <Highlight text={contactPage.hero.title} />
                </h1>
                <p>{contactPage.hero.subtitle}</p>
                <div className="dm-actions">
                  <a className="dm-button" href="#contact-form">
                    Start a conversation <ArrowUpRight size={18} />
                  </a>
                </div>
              </div>
              <div className="dm-service-hero-photo">
                <img
                  src={imageFor("svc-marketing")}
                  alt="A team collaborating on a digital project"
                  fetchPriority="high"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="dm-section">
          <div className="dm-container dm-contact-grid">
            <form
              id="contact-form"
              className="dm-contact-form"
              onSubmit={handleSubmit}
              aria-busy={sending}
            >
              <h2>{contactPage.form.title}</h2>
              <p>{contactPage.form.hint}</p>
              <div className="dm-contact-fields">
                <label>
                  Full Name *
                  <input
                    required
                    minLength={2}
                    maxLength={100}
                    name="fullName"
                    autoComplete="name"
                    placeholder="Your full name"
                  />
                </label>
                <label>
                  Email Address *
                  <input
                    required
                    maxLength={254}
                    type="email"
                    name="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                  />
                </label>
                <label>
                  Phone Number
                  <input
                    maxLength={40}
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    placeholder="Your phone number"
                  />
                </label>
                <label>
                  Company Name
                  <input
                    maxLength={120}
                    name="company"
                    autoComplete="organization"
                    placeholder="Your company"
                  />
                </label>
                <label className="dm-field-full">
                  Service *
                  <select required name="service" defaultValue="">
                    <option value="">Select a service</option>
                    {contactPage.form.serviceOptions.map((service) => (
                      <option key={service}>{service}</option>
                    ))}
                  </select>
                </label>
                <label className="dm-field-full">
                  What would you like to improve? *
                  <select required name="goal" defaultValue="">
                    <option value="">Choose your main business goal</option>
                    {contactPage.form.goalOptions.map((goal) => (
                      <option key={goal}>{goal}</option>
                    ))}
                  </select>
                </label>
                <label className="dm-field-full">
                  Target market
                  <select name="market" defaultValue="">
                    <option value="">Select a market (optional)</option>
                    {contactPage.form.marketOptions.map((market) => (
                      <option key={market}>{market}</option>
                    ))}
                  </select>
                </label>
                <label className="dm-field-full">
                  Current website
                  <input
                    type="url"
                    name="website"
                    maxLength={300}
                    placeholder="https://yourwebsite.com"
                    autoComplete="url"
                  />
                </label>
                <label>
                  Preferred timeline
                  <select name="timeline" defaultValue="">
                    <option value="">Select a timeline (optional)</option>
                    {contactPage.form.timelineOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Budget range
                  <select name="budget" defaultValue="">
                    <option value="">Select a range (optional)</option>
                    {contactPage.form.budgetOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="dm-field-full">
                  Tell us about your project *
                  <textarea
                    required
                    minLength={10}
                    maxLength={4000}
                    name="message"
                    placeholder="Your goals, timeline and what success looks like..."
                    rows={6}
                  />
                </label>
              </div>
              <div
                role="status"
                aria-live="polite"
                className={status ? `dm-contact-status ${status}` : undefined}
              >
                {status === "success"
                  ? contactPage.form.successMessage
                  : status === "error"
                    ? contactPage.form.errorMessage
                    : ""}
              </div>
              <div className="dm-actions">
                <button className="dm-button" type="submit" disabled={sending}>
                  {sending ? contactPage.form.sendingLabel : contactPage.form.buttonLabel}
                  <ArrowUpRight size={18} />
                </button>
                <span className="dm-contact-privacy">{contactPage.form.privacyNote}</span>
              </div>
            </form>
            <aside className="dm-contact-aside">
              <p className="dm-overline">{contactPage.aside.eyebrow}</p>
              <h2>{contactPage.aside.title}</h2>
              <p>{contactPage.aside.body}</p>
              <a href={`mailto:${contact.email}`}>
                <span>Email</span>
                <strong>{contact.email}</strong>
              </a>
              <a href={contact.phoneHref}>
                <span>Phone</span>
                <strong>{contact.phone}</strong>
              </a>
              <div className="dm-contact-offices">
                <span>Headquarters</span>
                <address className="not-italic">
                  {footer.address.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </address>
                <address className="not-italic">
                  {footer.address.map((line) => (
                    <div key={line}>{line}</div>
                  ))}
                </address>
                {offices.map((office) => (
                  <p key={office.label}>
                    <strong>{office.label}</strong>
                    <br />
                    {office.place}
                    <br />
                    {office.zone}
                  </p>
                ))}
              </div>
              <p>{contactPage.aside.footnote}</p>
            </aside>
          </div>
        </section>
        <section className="dm-section dm-soft">
          <div className="dm-container">
            <div className="dm-section-heading">
              <p className="dm-overline">{contactPage.process.eyebrow}</p>
              <h2>{contactPage.process.title}</h2>
            </div>
            <div className="dm-contact-steps">
              {contactPage.process.steps.map((line, index) => {
                const [title, body] = split(line);
                return (
                  <article key={title}>
                    <span className="dm-overline">0{index + 1}</span>
                    <h3>{title}</h3>
                    <p>{body}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
        <section className="dm-section">
          <div className="dm-container dm-split">
            <div>
              <p className="dm-overline">{contactPage.faq.eyebrow}</p>
              <h2>{contactPage.faq.title}</h2>
            </div>
            <div className="dm-faq">
              {contactPage.faq.items.map((line) => {
                const [question, answer] = split(line);
                return (
                  <details key={question}>
                    <summary>
                      {question}
                      <ChevronDown size={16} />
                    </summary>
                    <p>{answer}</p>
                  </details>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </Shell>
  );
}
