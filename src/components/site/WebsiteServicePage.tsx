import { Link } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, ChevronRight, Check } from "lucide-react";
import { pathFor } from "@/content";
import { services, type Service } from "@/content/services";
import designOverview from "@/assets/photo-custom-website-design-development-overview.webp";
import shopOverview from "@/assets/photo-e-commerce-websites-overview.webp";
import supportOverview from "@/assets/photo-website-maintenance-support-overview.webp";
import speedOverview from "@/assets/photo-speed-seo-optimization-overview.webp";
import { Highlight } from "./Highlight";
import { SectionLink } from "./SectionLink";

const photography: Record<string, { src: string; alt: string; heroAlt: string }> = {
  "custom-website-design-development": {
    src: designOverview,
    alt: "A bright workspace for planning a website project",
    heroAlt: "Responsive website designs displayed across desktop, tablet and mobile screens",
  },
  "e-commerce-websites": {
    src: shopOverview,
    alt: "An open shop sign representing a retail business ready to serve customers",
    heroAlt: "A customer making a payment at a retail checkout",
  },
  "website-maintenance-support": {
    src: supportOverview,
    alt: "Code editor used for website troubleshooting and maintenance",
    heroAlt: "Website source code displayed on a monitor",
  },
  "speed-seo-optimization": {
    src: speedOverview,
    alt: "Server infrastructure supporting reliable website delivery",
    heroAlt: "Website development and a live page displayed on desktop monitors",
  },
};

/** Website services share the current service design and preserve document paragraphs. */
export function WebsiteServicePage({ service }: { service: Service }) {
  const photo = photography[service.slug];
  const siblings = services.filter(
    (entry) => entry.parent === service.parent && entry.slug !== service.slug,
  );

  return (
    <div className="dm-site dm-service-page dm-website-service">
      <section className="dm-service-hero dm-layered-hero">
        <div className="dm-container">
          <nav className="dm-breadcrumb" aria-label="Breadcrumb">
            <Link to="/">Home</Link>
            <ChevronRight size={13} aria-hidden />
            <Link to="/services">Services</Link>
            <ChevronRight size={13} aria-hidden />
            <Link to="/services/$slug" params={{ slug: "website-development" }}>
              Website Development
            </Link>
            <ChevronRight size={13} aria-hidden />
            <span aria-current="page">{service.title}</span>
          </nav>
          <div className="dm-split">
            <div>
              <p className="dm-overline">{service.tag}</p>
              <h1>{service.title}</h1>
              {service.headline !== service.title && (
                <p className="dm-hero-subtitle">{service.headline}</p>
              )}
              <p>{service.desc}</p>
              <div className="dm-actions">
                <a href={pathFor("contact")} className="dm-button">
                  Discuss your website
                  <ArrowUpRight size={18} />
                </a>
                <SectionLink to="website-overview" className="dm-button dm-button-outline">
                  Explore our approach
                  <ArrowUpRight size={18} />
                </SectionLink>
              </div>
            </div>
            <div className="dm-service-hero-photo">
              <span className="dm-banner-kicker">Ireland &middot; Europe &middot; USA</span>
              <img
                src={service.img}
                alt={photo.heroAlt}
                width={1200}
                height={900}
                fetchPriority="high"
                decoding="async"
              />
              <div className="dm-service-photo-caption">
                <Check size={22} />
                <div>
                  <strong>Built around your business.</strong>
                  <span>Design. Functionality. Reliability.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="website-overview" className="dm-section">
        <div className="dm-container dm-split dm-overview">
          <div>
            <p className="dm-eyebrow">Your website, your business</p>
            <h2>
              A practical approach.
              <br />
              <span>A clear purpose.</span>
            </h2>
            <div className="dm-overview-photo">
              <img
                src={photo.src}
                alt={photo.alt}
                width={1100}
                height={800}
                loading="lazy"
                decoding="async"
              />
            </div>
          </div>
          <div className="dm-prose">
            {service.intro.map((paragraph, index) => (
              <p key={index}>
                <Highlight text={paragraph} />
              </p>
            ))}
          </div>
        </div>
      </section>
      <section className="dm-section dm-soft">
        <div className="dm-container">
          <div className="dm-section-heading">
            <p className="dm-eyebrow">Explore this service</p>
            <h2>
              What you need
              <br />
              <span>to know.</span>
            </h2>
          </div>
          <div className="dm-section-links">
            {service.sections.map((section, index) => (
              <SectionLink key={section.anchor} to={section.anchor} className="dm-section-link">
                <span>{String(index + 1).padStart(2, "0")}</span>
                {section.title}
                <ArrowUpRight size={17} />
              </SectionLink>
            ))}
          </div>
        </div>
      </section>
      <div className="dm-service-sections">
        {service.sections.map((section, index) => (
          <section
            id={section.anchor}
            key={section.anchor}
            className={`dm-section dm-website-editorial ${index % 2 ? "dm-soft" : ""}`}
          >
            <div className="dm-container dm-split">
              <div className="dm-website-section-heading">
                <p className="dm-eyebrow">
                  {String(index + 1).padStart(2, "0")} / {service.tag}
                </p>
                <h2>{section.title}</h2>
              </div>
              <div className="dm-prose">
                {section.body
                  .split(/\n\s*\n/)
                  .filter(Boolean)
                  .map((paragraph, paragraphIndex) => (
                    <p key={paragraphIndex}>
                      <Highlight text={paragraph} />
                    </p>
                  ))}
              </div>
            </div>
          </section>
        ))}
      </div>
      {service.faqs.length > 0 && (
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
              {service.faqs.map((faq) => (
                <details key={faq.question}>
                  <summary>
                    {faq.question}
                    <ChevronDown size={18} />
                  </summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}
      <section className="dm-section dm-soft">
        <div className="dm-container">
          <div className="dm-section-heading">
            <p className="dm-eyebrow">Related website services</p>
            <h2>
              Support for every stage
              <br />
              <span>of your website.</span>
            </h2>
          </div>
          <div className="dm-marketing-grid dm-three-columns">
            {siblings.map((entry) => (
              <Link
                to="/services/$slug"
                params={{ slug: entry.slug }}
                key={entry.slug}
                className="dm-marketing-card"
              >
                <h3>{entry.title}</h3>
                <p>{entry.tag}</p>
                <ArrowUpRight size={22} />
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section className="dm-cta">
        <div className="dm-container">
          <span className="dm-cta-label">Tell us what your website needs</span>
          <h2>
            Let's plan your
            <br />
            next step.
          </h2>
          <p>Share your current website, the challenges you face and what you want to achieve.</p>
          <a href={pathFor("contact")} className="dm-button">
            Start a conversation
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
    </div>
  );
}
