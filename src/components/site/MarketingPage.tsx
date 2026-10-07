import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, ChevronDown, ChevronRight } from "lucide-react";
import { services, type Service } from "@/content/services";
import { imageFor } from "@/content/images";
import { pathFor } from "@/content";
import { SectionLink } from "./SectionLink";
import { Highlight } from "./Highlight";
const channels = ["Google Search", "Meta Ads", "LinkedIn", "Instagram", "YouTube"];
export function MarketingPage({ service }: { service: Service }) {
  const overview = !service.parent;
  const children = services.filter((s) => s.parent === "digital-marketing");
  const questions = [
    {
      question: "Which markets do you support?",
      answer:
        "Our services support businesses across Ireland, Europe and the USA. Strategy and messaging are shaped around the audience and markets you want to reach.",
    },
    {
      question: "How is the strategy developed?",
      answer:
        "We start with your business goals, audience, existing activity and opportunities. That information guides the channels, priorities and content.",
    },
    {
      question: "How do we get started?",
      answer:
        "Share your business goals and current website through our contact form. We can discuss your needs and the next steps.",
    },
  ];
  return (
    <div className="dm-site dm-service-page">
      <section className="dm-service-hero dm-layered-hero">
        <div className="dm-container">
          <nav className="dm-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={13} />
            <Link to="/services">Services</Link>
            <ChevronRight size={13} />
            {!overview && (
              <>
                <Link to="/services/$slug" params={{ slug: "digital-marketing" }}>
                  Digital Marketing
                </Link>
                <ChevronRight size={13} />
              </>
            )}
            <span aria-current="page">{service.title}</span>
          </nav>
          <div className="dm-split">
            <div>
              <p className="dm-overline">{service.tag}</p>
              <h1>{service.title}</h1>
              <p className="dm-hero-subtitle">
                {overview ? "Your brand's online success starts here." : service.headline}
              </p>
              <p>
                Reach the right people. Build meaningful connections. Turn your digital presence
                into business opportunity.
              </p>
              <div className="dm-actions">
                <a href={pathFor("contact")} className="dm-button">
                  Contact now
                  <ArrowUpRight size={18} />
                </a>
                <SectionLink to="marketing-services" className="dm-button dm-button-outline">
                  Discover our approach
                  <ArrowUpRight size={18} />
                </SectionLink>
              </div>
            </div>
            <div className="dm-service-hero-photo">
              <span className="dm-banner-kicker">Ireland &middot; Europe &middot; USA</span>
              <img
                src={service.img}
                alt={`${service.title} strategy and execution`}
                width={1100}
                height={800}
                fetchPriority="high"
              />
              <div className="dm-service-photo-caption">
                <Check size={22} />
                <div>
                  <strong>Built around your business.</strong>
                  <span>Strategy. Creativity. Performance.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div className="dm-channel-strip">
        <div className="dm-container">
          {channels.map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      </div>
      <section id="marketing-services" className="dm-section">
        <div className="dm-container dm-split dm-overview">
          <div>
            <p className="dm-eyebrow">A strategy with purpose</p>
            <h2>
              {overview
                ? "Your digital growth starts with the right direction."
                : `${service.title}, built around your goals.`}
            </h2>
            <a href={pathFor("contact")} className="dm-button">
              Talk to our team
              <ArrowUpRight size={17} />
            </a>
            <div className="dm-overview-photo">
              <img
                src={
                  overview || service.slug === "seo-services"
                    ? imageFor("svc-automation")
                    : service.img
                }
                alt={`${service.title} research and planning`}
                width={1000}
                height={650}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          <div className="dm-prose">
            {service.intro.map((p, i) => (
              <p key={i}>
                <Highlight text={p} />
              </p>
            ))}
          </div>
        </div>
      </section>
      {overview && (
        <section className="dm-section dm-brand">
          <div className="dm-container">
            <div className="dm-section-heading">
              <p className="dm-eyebrow">Our digital marketing services</p>
              <h2>
                The right channels.
                <br />
                <span>Working together.</span>
              </h2>
            </div>
            <div className="dm-service-grid dm-two-columns">
              {children.map((s) => (
                <Link
                  key={s.slug}
                  to="/services/$slug"
                  params={{ slug: s.slug }}
                  className="dm-service-card"
                >
                  <div className="dm-card-photo">
                    <img src={s.img} alt={s.title} width={800} height={500} loading="lazy" />
                  </div>
                  <div className="dm-card-content">
                    <h3>{s.title}</h3>
                    <p>{s.desc}</p>
                    <span>
                      Explore service
                      <ArrowUpRight size={17} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="dm-section dm-soft">
        <div className="dm-container">
          <div className="dm-section-heading">
            <p className="dm-eyebrow">What's included</p>
            <h2>
              A complete approach
              <br />
              <span>to {service.title.toLowerCase()}.</span>
            </h2>
          </div>
          <div className="dm-section-links">
            {service.sections.map((s, i) => (
              <SectionLink key={s.anchor} to={s.anchor} className="dm-section-link">
                <span>{String(i + 1).padStart(2, "0")}</span>
                {s.title}
                <ArrowUpRight size={17} />
              </SectionLink>
            ))}
          </div>
        </div>
      </section>
      <div className="dm-service-sections">
        {service.sections.map((section, i) => (
          <section
            id={section.anchor}
            key={section.anchor}
            className={`dm-section dm-editorial-section ${i % 2 === 1 ? "dm-soft" : ""}`}
          >
            <div className={`dm-container dm-split ${i % 2 === 1 ? "dm-split-reverse" : ""}`}>
              <div className="dm-section-photo">
                <img
                  src={
                    overview
                      ? imageFor(["svc-ai", "svc-social", "svc-automation", "svc-content"][i % 4])
                      : service.slug === "seo-services"
                        ? imageFor(
                            [
                              "svc-web",
                              "svc-ai",
                              "svc-seo",
                              "svc-marketing",
                              "svc-ppc",
                              "svc-automation",
                            ][i % 6],
                          )
                        : service.img
                  }
                  alt={`${section.title} expertise`}
                  width={1000}
                  height={800}
                  loading="lazy"
                />
                <span>
                  {String(i + 1).padStart(2, "0")} / {service.tag}
                </span>
              </div>
              <div className="dm-prose">
                <p className="dm-eyebrow">Our expertise</p>
                <h2>{section.title}</h2>
                {section.body
                  .split(/\n\s*\n/)
                  .filter(Boolean)
                  .map((p, j) => (
                    <p key={j}>
                      <Highlight text={p} />
                    </p>
                  ))}
                {!section.body && (
                  <div className="dm-actions">
                    <SectionLink
                      to={service.sections[i + 1]?.anchor || "marketing-services"}
                      className="dm-button"
                    >
                      Explore our approach
                      <ArrowUpRight size={18} />
                    </SectionLink>
                  </div>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
      <section className="dm-section">
        <div className="dm-container dm-split">
          <div>
            <p className="dm-eyebrow">Clear answers</p>
            <h2>
              Frequently asked
              <br />
              <span>questions.</span>
            </h2>
          </div>
          <div className="dm-faq">
            {(service.faqs.length ? service.faqs : questions).map((f) => (
              <details key={f.question}>
                <summary>
                  {f.question}
                  <ChevronDown size={18} />
                </summary>
                <p>{f.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      {!overview && (
        <section className="dm-section dm-soft">
          <div className="dm-container">
            <div className="dm-section-heading">
              <p className="dm-eyebrow">Connected services</p>
              <h2>
                Build a stronger
                <br />
                <span>digital presence.</span>
              </h2>
            </div>
            <div className="dm-marketing-grid dm-three-columns">
              {children
                .filter((s) => s.slug !== service.slug)
                .map((s) => (
                  <Link
                    to="/services/$slug"
                    params={{ slug: s.slug }}
                    key={s.slug}
                    className="dm-marketing-card"
                  >
                    <h3>{s.title}</h3>
                    <p>{s.tag}</p>
                    <ArrowUpRight size={22} />
                  </Link>
                ))}
            </div>
          </div>
        </section>
      )}
      <section className="dm-cta">
        <div className="dm-container">
          <span className="dm-cta-label">Ready to take the next step?</span>
          <h2>
            Let's build your
            <br />
            digital growth together.
          </h2>
          <p>Tell us about your business, your audience and where you want to go.</p>
          <a href={pathFor("contact")} className="dm-button">
            Start a conversation
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
    </div>
  );
}
