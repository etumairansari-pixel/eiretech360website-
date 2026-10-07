import { useEffect, useRef, useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { ArrowUpRight, ChevronDown, ChevronRight, Menu, Phone, X } from "lucide-react";
import { Logo } from "@/components/Logo";
import { contact, nav as navContent, pathFor, route as routeFor } from "@/content";
import { serviceNavigation } from "@/content/service-navigation";
import { headerVisibleAfterScroll } from "@/lib/header-scroll";
const links = ["home", "services", "about", "platforms", "contact"].map((key) => ({
  to: pathFor(key),
  label: routeFor(key).navLabel,
}));
function ServiceMenu({ mobile = false, onNavigate }: { mobile?: boolean; onNavigate: () => void }) {
  const [expanded, setExpanded] = useState("");
  return (
    <div className={mobile ? "dm-mobile-services" : "dm-nav-dropdown"}>
      {serviceNavigation.map((item) => (
        <div
          key={item.slug}
          className="dm-service-menu-group"
          onMouseEnter={() => {
            if (!mobile) setExpanded(item.slug);
          }}
          onMouseLeave={() => {
            if (!mobile) setExpanded("");
          }}
          onFocus={() => {
            if (!mobile) setExpanded(item.slug);
          }}
          onBlur={(event) => {
            if (!mobile && !event.currentTarget.contains(event.relatedTarget as Node))
              setExpanded("");
          }}
        >
          <div className="dm-service-menu-row">
            <Link to="/services/$slug" params={{ slug: item.slug }} onClick={onNavigate}>
              {item.label}
            </Link>
            {item.children.length > 0 && (
              <button
                type="button"
                aria-label={`Show ${item.label} services`}
                aria-expanded={expanded === item.slug}
                aria-controls={`${mobile ? "mobile" : "desktop"}-submenu-${item.slug}`}
                onClick={() => setExpanded(expanded === item.slug ? "" : item.slug)}
              >
                {mobile ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
              </button>
            )}
          </div>
          {item.children.length > 0 && (
            <div
              id={`${mobile ? "mobile" : "desktop"}-submenu-${item.slug}`}
              className="dm-service-submenu"
              hidden={expanded !== item.slug}
            >
              <span className="dm-submenu-label">{item.label}</span>
              {item.children.map((child) => (
                <Link
                  key={`${child.slug}-${child.section}`}
                  to="/services/$slug"
                  params={{ slug: child.slug }}
                  state={child.section ? { section: child.section } : {}}
                  onClick={onNavigate}
                >
                  {child.label}
                  <ArrowUpRight size={14} />
                </Link>
              ))}
            </div>
          )}
        </div>
      ))}
      <Link to="/services" onClick={onNavigate} className="dm-all-services">
        View all services
        <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}
export function Nav() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [visible, setVisible] = useState(true);
  const menuRef = useRef<HTMLDivElement>(null);
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useEffect(() => {
    let previousY = window.scrollY;
    let shown = true;
    let frame = 0;
    const read = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const next = headerVisibleAfterScroll(previousY, y, shown);
      if (Math.abs(y - previousY) >= 6 || y <= 12) previousY = y;
      if (next !== shown) {
        shown = next;
        setVisible(next);
        if (!next) {
          setOpen(false);
          setServicesOpen(false);
        }
      }
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);
  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node))
        setServicesOpen(false);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setServicesOpen(false);
      }
    };
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", escape);
    return () => {
      document.removeEventListener("pointerdown", close);
      document.removeEventListener("keydown", escape);
    };
  }, []);
  return (
    <header className={`dm-nav${visible ? "" : " dm-nav-hidden"}`} inert={!visible}>
      <div className="dm-container dm-nav-inner">
        <Link to="/" aria-label="Eire Tech home">
          <Logo tone="light" className="h-10 md:h-12" />
        </Link>
        <nav aria-label="Main navigation" className="dm-nav-links">
          {links.map((l) => (
            <div
              key={l.to}
              ref={l.to === pathFor("services") ? menuRef : undefined}
              className="dm-nav-item"
              onMouseEnter={() => {
                if (l.to === pathFor("services")) setServicesOpen(true);
              }}
              onMouseLeave={() => {
                if (l.to === pathFor("services")) setServicesOpen(false);
              }}
              onFocus={() => {
                if (l.to === pathFor("services")) setServicesOpen(true);
              }}
              onBlur={(event) => {
                if (
                  l.to === pathFor("services") &&
                  !event.currentTarget.contains(event.relatedTarget as Node)
                )
                  setServicesOpen(false);
              }}
            >
              <Link
                to={l.to}
                aria-current={pathname === l.to ? "page" : undefined}
                aria-expanded={l.to === pathFor("services") ? servicesOpen : undefined}
                onClick={() => setServicesOpen(false)}
              >
                {l.label}
              </Link>
              {l.to === pathFor("services") && (
                <>{servicesOpen && <ServiceMenu onNavigate={() => setServicesOpen(false)} />}</>
              )}
            </div>
          ))}
        </nav>
        <div className="dm-nav-actions">
          <a href={contact.phoneHref} className="dm-nav-phone" aria-label={`Call ${contact.phone}`}>
            <Phone size={15} />
            {contact.phone}
          </a>
          <a href={pathFor("contact")} className="dm-button dm-nav-cta">
            {navContent.ctaLabel}
            <ArrowUpRight size={16} />
          </a>
          <button
            className="dm-menu-button"
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            onClick={() => setOpen(!open)}
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Mobile navigation" className="dm-mobile-nav">
          {links.map((l) => (
            <div key={l.to}>
              <Link to={l.to} onClick={() => setOpen(false)}>
                {l.label}
              </Link>
              {l.to === pathFor("services") && (
                <ServiceMenu mobile onNavigate={() => setOpen(false)} />
              )}
            </div>
          ))}
        </nav>
      )}
    </header>
  );
}
