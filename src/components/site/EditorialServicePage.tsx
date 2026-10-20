import {
  appServicePhotography,
  appServiceSectionMedia,
  appServiceContextualLinks,
} from "@/content/app-service-media";
import designPlanning from "@/assets/photo-custom-website-design-development-planning.webp";
import designLayout from "@/assets/photo-custom-website-design-development-design.webp";
import shopPayments from "@/assets/photo-e-commerce-websites-payments.webp";
import shopCheckout from "@/assets/photo-e-commerce-websites-checkout.webp";
import supportSecurity from "@/assets/photo-website-maintenance-support-security.webp";
import supportHardware from "@/assets/photo-website-maintenance-support-hardware.webp";
import speedCode from "@/assets/photo-speed-seo-optimization-code.webp";
import speedNetwork from "@/assets/photo-speed-seo-optimization-network.webp";
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
  ...appServicePhotography,
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

const sectionMedia: Record<string, { section: number; src: string; alt: string }[]> = {
  ...appServiceSectionMedia,
  "custom-website-design-development": [
    {
      section: 0,
      src: designPlanning,
      alt: "Planning a website layout with wireframes on a whiteboard",
    },
    {
      section: 1,
      src: designLayout,
      alt: "Website layouts and design assets open on a desktop monitor",
    },
  ],
  "e-commerce-websites": [
    {
      section: 2,
      src: shopPayments,
      alt: "A card payment being processed through a payment terminal",
    },
    {
      section: 3,
      src: shopCheckout,
      alt: "A customer shopping online with a bank card and laptop",
    },
  ],
  "website-maintenance-support": [
    {
      section: 3,
      src: supportSecurity,
      alt: "A developer reviewing software on a laptop and phone",
    },
    {
      section: 7,
      src: supportHardware,
      alt: "Close-up of computer circuitry used in technical infrastructure",
    },
  ],
  "speed-seo-optimization": [
    { section: 1, src: speedCode, alt: "Website source code displayed on a screen" },
    { section: 5, src: speedNetwork, alt: "Network cables connected to server infrastructure" },
  ],
};

const contextualLinks: Record<string, Record<number, string>> = {
  ...appServiceContextualLinks,
  "custom-website-design-development": {
    4: "speed-seo-optimization",
    5: "website-maintenance-support",
  },
  "e-commerce-websites": { 6: "speed-seo-optimization", 7: "website-maintenance-support" },
  "website-maintenance-support": {
    4: "speed-seo-optimization",
    6: "custom-website-design-development",
  },
  "speed-seo-optimization": {
    1: "website-maintenance-support",
    4: "custom-website-design-development",
  },
};

/** Long-form service pages share the current design and preserve document paragraphs. */
export function EditorialServicePage({ service }: { service: Service }) {
  const photo = photography[service.slug];
  const parent = services.find((entry) => entry.slug === service.parent)!;
  const isApp = service.parent === "app-development";
  const product = isApp ? "app" : "website";
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
            <Link to="/services/$slug" params={{ slug: parent.slug }}>
              {parent.title}
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
                  Discuss your {product}
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
                  <span>
                    {isApp
                      ? "Usability. Functionality. Reliability."
                      : "Design. Functionality. Reliability."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section id="website-overview" className="dm-section">
        <div className="dm-container dm-split dm-overview">
          <div>
            <p className="dm-eyebrow">Your {product}, your business</p>
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
        {service.sections.map((section, index) => {
          const image = sectionMedia[service.slug]?.find((entry) => entry.section === index);
          const related = services.find(
            (entry) => entry.slug === contextualLinks[service.slug]?.[index],
          );
          return (
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
                  {image && (
                    <figure className="dm-website-section-photo">
                      <img
                        src={image.src}
                        alt={image.alt}
                        width={1000}
                        height={700}
                        loading="lazy"
                        decoding="async"
                      />
                    </figure>
                  )}
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
                  {related && (
                    <Link
                      to="/services/$slug"
                      params={{ slug: related.slug }}
                      className="dm-website-context-link"
                    >
                      Explore {related.title}
                      <ArrowUpRight size={17} />
                    </Link>
                  )}
                </div>
              </div>
            </section>
          );
        })}
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
            <p className="dm-eyebrow">Related {product} services</p>
            <h2>
              Support for every stage
              <br />
              <span>of your {product}.</span>
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
          <span className="dm-cta-label">Tell us what your {product} needs</span>
          <h2>
            Let's plan your
            <br />
            next step.
          </h2>
          <p>
            Share your {isApp ? "app idea or existing application" : "current website"}, the
            challenges you face and what you want to achieve.
          </p>
          <a href={pathFor("contact")} className="dm-button">
            Start a conversation
            <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
    </div>
  );
}
