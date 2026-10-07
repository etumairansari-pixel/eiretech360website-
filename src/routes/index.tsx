import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, Check, ChevronDown, Quote } from "lucide-react";
import { Shell } from "@/components/site/Shell";
import { Highlight } from "@/components/site/Highlight";
import { HeroVideo } from "@/components/site/HeroVideo";
import { services } from "@/content/services";
import { projects } from "@/content/projects";
import { headFor, pathFor } from "@/content";
import homePage from "../../content/pages/home.json";
import testimonials from "../../content/testimonials.json";

export const Route = createFileRoute("/")({
  head: () => headFor("home", homePage.seo),
  component: Home,
});
const mainServices = services.filter((s) => !s.parent);
const marketingServices = services.filter((s) => s.parent === "digital-marketing");

function Hero() {
  return (
    <section className="dm-home-hero dm-cinematic-hero">
      <HeroVideo />
      <div className="dm-container dm-hero-grid">
        <div className="dm-hero-copy">
          <p className="dm-overline">{homePage.hero.badge}</p>
          <h1>
            {homePage.hero.headline.map((text, i) => (
              <span key={i}>
                <Highlight text={text} />
                {i < homePage.hero.headline.length - 1 && <br />}
              </span>
            ))}
          </h1>
          <p className="dm-hero-subtitle">Your brand's online success starts here.</p>
          <p>
            Digital marketing, development and automation. The right strategy to connect with your
            audience and move your business forward.
          </p>
          <div className="dm-actions">
            <a href={pathFor("contact")} className="dm-button">
              {homePage.hero.primaryLabel}
              <ArrowUpRight size={18} />
            </a>
            <a href="#our-services" className="dm-button dm-button-outline">
              Discover our services
              <ArrowUpRight size={18} />
            </a>
          </div>
          <div className="dm-hero-note">
            <Check size={18} /> Ireland, Europe &amp; USA{" "}
            <span>Strategy &middot; Creativity &middot; Growth</span>
          </div>
        </div>
        <aside className="dm-hero-aside">
          <span className="dm-aside-label">One partner. Every possibility.</span>
          <h2>
            Built for your
            <br />
            <span>next chapter.</span>
          </h2>
          <p>Connect your marketing, technology and creativity in one place.</p>
          {marketingServices.slice(0, 3).map((service) => (
            <Link key={service.slug} to="/services/$slug" params={{ slug: service.slug }}>
              {service.title}
              <ArrowUpRight size={17} />
            </Link>
          ))}
        </aside>
      </div>
      <div className="dm-container dm-hero-capabilities">
        {[
          ["09", "Connected capabilities"],
          ["04", "Marketing disciplines"],
          ["03", "Markets: Ireland, Europe & USA"],
        ].map(([number, label]) => (
          <div key={label}>
            <strong>{number}</strong>
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
function Home() {
  const mission = homePage.mission;
  const why = homePage.why;
  return (
    <Shell>
      <div className="dm-site">
        <Hero />
        <div className="dm-channel-strip">
          <div className="dm-container">
            {[
              "Search Engine Optimization",
              "Google & Meta Ads",
              "Social Media Marketing",
              "Content Strategy",
              "Web & App Development",
            ].map((t) => (
              <span key={t}>{t}</span>
            ))}
          </div>
        </div>
        <section className="dm-section">
          <div className="dm-container dm-split">
            <div>
              <p className="dm-eyebrow">Your digital growth partner</p>
              <h2>
                Digital expertise.
                <br />
                <span>Business-focused thinking.</span>
              </h2>
              <p className="dm-lead">{homePage.seo.description}</p>
              <a href={pathFor("contact")} className="dm-button">
                Let's build your growth plan
                <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="dm-feature-photo">
              <img
                src={mainServices[0].img}
                alt="Digital marketing collaboration"
                width={1000}
                height={700}
                loading="lazy"
              />
              <div className="dm-photo-label">A connected approach to digital growth.</div>
            </div>
          </div>
        </section>
        <section className="dm-section dm-soft">
          <div className="dm-container dm-split">
            <div className="dm-feature-photo">
              <img
                src={mainServices[4].img}
                alt="Website strategy and development workspace"
                width={1000}
                height={700}
                loading="lazy"
              />
            </div>
            <div>
              <p className="dm-eyebrow">{mission.label}</p>
              <h2>
                <Highlight text={mission.title} />
              </h2>
              <p>
                <Highlight text={mission.body} />
              </p>
              <a href="/services/digital-marketing" className="dm-text-link">
                Explore digital marketing
                <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </section>
        <section id="our-services" className="dm-section dm-showcase">
          <div className="dm-container">
            <div className="dm-section-heading">
              <p className="dm-eyebrow">Our services</p>
              <h2>
                Everything your business needs
                <br />
                <span>to grow online.</span>
              </h2>
              <p>One team. Connected capabilities. A strategy built around your goals.</p>
            </div>
            <div className="dm-service-grid">
              {mainServices.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    to="/services/$slug"
                    params={{ slug: s.slug }}
                    key={s.slug}
                    className="dm-service-card"
                  >
                    <div className="dm-card-photo">
                      <img
                        src={s.img}
                        alt={`${s.title} services`}
                        width={600}
                        height={400}
                        loading="lazy"
                      />
                    </div>
                    <div className="dm-card-content">
                      <Icon size={28} />
                      <h3>{s.title}</h3>
                      <p>
                        <Highlight text={s.desc} />
                      </p>
                      <span>
                        Explore service
                        <ArrowUpRight size={17} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
        <section className="dm-section">
          <div className="dm-container">
            <div className="dm-section-heading">
              <p className="dm-eyebrow">Digital marketing services</p>
              <h2>
                The right audience.
                <br />
                <span>The right channels.</span>
              </h2>
            </div>
            <div className="dm-marketing-grid">
              {marketingServices.map((s) => {
                const Icon = s.icon;
                return (
                  <Link
                    to="/services/$slug"
                    params={{ slug: s.slug }}
                    key={s.slug}
                    className="dm-marketing-card"
                  >
                    <Icon size={32} />
                    <h3>{s.title}</h3>
                    <p>{s.tag}</p>
                    <ArrowUpRight size={22} />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
        <section className="dm-section dm-soft">
          <div className="dm-container dm-split">
            <div>
              <p className="dm-eyebrow">{why.label}</p>
              <h2>
                <Highlight text={why.title} />
              </h2>
              <p>{why.body}</p>
              <div className="dm-reasons">
                {why.reasons.map((r) => (
                  <div key={r.number}>
                    <span>{r.number}</span>
                    <div>
                      <h3>{r.title}</h3>
                      <p>{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="dm-feature-photo dm-tall-photo">
              <img
                src={marketingServices[1].img}
                alt="Business strategy meeting"
                width={1000}
                height={1200}
                loading="lazy"
              />
              <div className="dm-photo-label">Your goals. Our shared focus.</div>
            </div>
          </div>
        </section>
        <section className="dm-section dm-brand">
          <div className="dm-container">
            <div className="dm-section-heading">
              <p className="dm-eyebrow">Our approach</p>
              <h2>
                A clear direction.
                <br />
                <span>At every step.</span>
              </h2>
            </div>
            <div className="dm-process">
              {homePage.process.steps.map((s, i) => (
                <div key={s.title}>
                  <strong>0{i + 1}</strong>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="dm-section">
          <div className="dm-container">
            <div className="dm-section-heading">
              <p className="dm-eyebrow">Our portfolio</p>
              <h2>
                Real projects.
                <br />
                <span>Thoughtful solutions.</span>
              </h2>
            </div>
            <div className="dm-portfolio-grid">
              {projects.slice(0, 4).map((p) => (
                <Link
                  key={p.title}
                  to="/services/$slug"
                  params={{ slug: p.service }}
                  className="dm-project"
                >
                  <img src={p.img} alt={p.title} width={900} height={550} loading="lazy" />
                  <div>
                    <h3>{p.title}</h3>
                    <span>
                      View project
                      <ArrowUpRight size={18} />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
        <section className="dm-section dm-soft">
          <div className="dm-container">
            <div className="dm-section-heading">
              <p className="dm-eyebrow">Client perspectives</p>
              <h2>
                Good work starts with
                <br />
                <span>a good partnership.</span>
              </h2>
            </div>
            <div className="dm-testimonials">
              {testimonials.map((t) => (
                <blockquote key={t.name}>
                  <Quote size={28} />
                  <p>{t.quote}</p>
                  <footer>
                    <strong>{t.name}</strong>
                    <span>{t.role}</span>
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
        <section className="dm-section">
          <div className="dm-container dm-split">
            <div>
              <p className="dm-eyebrow">Clear answers</p>
              <h2>
                Questions about
                <br />
                <span>your next step?</span>
              </h2>
              <p>Start with your business goals. We'll help you find a practical direction.</p>
            </div>
            <div className="dm-faq">
              {[
                [
                  "Which digital marketing services can I choose?",
                  "We offer SEO, PPC management, social media marketing and content strategy, supported by website development, design and automation.",
                ],
                [
                  "Do you work with businesses outside Ireland?",
                  "Yes. Our service strategies support businesses across Ireland, Europe and the USA, with an approach suited to each target market.",
                ],
                [
                  "How do we get started?",
                  "Contact us with your website, business goals and current challenges. We can discuss the most relevant services and a practical next step.",
                ],
              ].map(([q, a]) => (
                <details key={q}>
                  <summary>
                    {q}
                    <ChevronDown size={18} />
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section className="dm-cta">
          <div className="dm-container">
            <span className="dm-cta-label">Ready for your next chapter?</span>
            <h2>
              Let's turn your ideas into
              <br />
              digital business growth.
            </h2>
            <p>{homePage.cta.subtitle}</p>
            <a href={pathFor("contact")} className="dm-button">
              {homePage.cta.buttonLabel}
              <ArrowUpRight size={18} />
            </a>
          </div>
        </section>
      </div>
    </Shell>
  );
}
