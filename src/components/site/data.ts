import {
  Megaphone,
  Workflow,
  Sparkles,
  Radio,
  Globe,
  Smartphone,
  BrainCircuit,
  Palette,
  Film,
  type LucideIcon,
} from "lucide-react";
import imgMarketing from "@/assets/svc-marketing.jpg";
import imgAutomation from "@/assets/svc-automation.jpg";
import imgBrand from "@/assets/svc-brand.jpg";
import imgAtl from "@/assets/svc-atl.jpg";
import imgWeb from "@/assets/svc-web.jpg";
import imgApp from "@/assets/svc-app.jpg";
import imgAi from "@/assets/svc-ai.jpg";
import imgDesign from "@/assets/svc-design.jpg";
import imgVideo from "@/assets/svc-video.jpg";

export type Service = {
  icon: LucideIcon;
  title: string;
  tag: string;
  img: string;
  desc: string;
  points: string[];
};

export const services: Service[] = [
  {
    icon: Megaphone,
    title: "Digital Marketing",
    tag: "Reach",
    img: imgMarketing,
    desc: "Boost your visibility and engagement with data-driven strategies across every channel.",
    points: [
      "Search Engine Optimization (SEO)",
      "Social Media Marketing",
      "Paid Advertising (Google, Meta, and more)",
      "Content Strategy and Creation",
    ],
  },
  {
    icon: Workflow,
    title: "Marketing & Business Automation",
    tag: "Flow",
    img: imgAutomation,
    desc: "Save time and increase efficiency by automating the workflows that slow your team down.",
    points: [
      "CRM Integration and Setup",
      "Automated Email and SMS Campaigns",
      "Workflow and Process Automation",
      "Lead Nurturing Systems",
    ],
  },
  {
    icon: Sparkles,
    title: "Brand Management",
    tag: "Identity",
    img: imgBrand,
    desc: "Build a consistent, powerful identity across every platform your audience sees you on.",
    points: [
      "Brand Strategy and Positioning",
      "Brand Guidelines and Voice",
      "Cross-Platform Brand Consistency",
      "Reputation Management",
    ],
  },
  {
    icon: Radio,
    title: "ATL & TTL Campaigns",
    tag: "Broadcast",
    img: imgAtl,
    desc: "Strategic above-the-line and through-the-line advertising for maximum market reach.",
    points: [
      "Traditional Media Campaigns",
      "Outdoor and Print Advertising",
      "Integrated Multi-Channel Campaigns",
      "Campaign Planning and Execution",
    ],
  },
  {
    icon: Globe,
    title: "Website Development",
    tag: "Web",
    img: imgWeb,
    desc: "Responsive, high-performance websites tailored to your business goals, not templates.",
    points: [
      "Custom Website Design and Development",
      "E-commerce Websites",
      "Website Maintenance and Support",
      "Speed and SEO Optimization",
    ],
  },
  {
    icon: Smartphone,
    title: "App Development",
    tag: "Mobile",
    img: imgApp,
    desc: "Custom mobile and web applications engineered to scale with your business.",
    points: [
      "iOS and Android App Development",
      "Web Application Development",
      "UI/UX Design for Apps",
      "App Maintenance and Updates",
    ],
  },
  {
    icon: BrainCircuit,
    title: "Custom AI Development",
    tag: "Intelligence",
    img: imgAi,
    desc: "Intelligent, tailor-made AI solutions to automate and optimize business operations.",
    points: [
      "AI Chatbots and Virtual Assistants",
      "Workflow Automation Powered by AI",
      "Custom AI Tools and Integrations",
      "Data Analysis and Insights",
    ],
  },
  {
    icon: Palette,
    title: "Graphic Designing",
    tag: "Visual",
    img: imgDesign,
    desc: "Creative visual identities, branding materials, and marketing collateral that get noticed.",
    points: [
      "Logo and Identity Design",
      "Marketing Collateral and Print Design",
      "Social Media Creatives",
      "Packaging and Product Design",
    ],
  },
  {
    icon: Film,
    title: "Video Editing & Animation",
    tag: "Motion",
    img: imgVideo,
    desc: "Engaging visual content that tells your brand's story and brings it to life.",
    points: [
      "Promotional Videos",
      "Social Media Reels and Shorts",
      "Motion Graphics and Animation",
      "Explainer Videos",
    ],
  },
];

/** Single source of truth for the contact details shown in the footer and on /contact. */
export const office = {
  email: "info@eiretech360.com",
  phone: "+353 89 942 7009",
  phoneHref: "tel:+353899427009",
} as const;

/**
 * Social profiles. Canonical URLs only — the share/authwall links these were
 * taken from carry session tokens that are tied to one browser and expire.
 */
export const social = [
  { label: "LinkedIn", href: "https://www.linkedin.com/company/eire-tech/" },
  { label: "Facebook", href: "https://www.facebook.com/people/EireTech/61591366410652/" },
] as const;

/* ------------------------------------------------------------------
   Public office location used in the footer map and directions links.
------------------------------------------------------------------ */
export const officeAddressLines = ["1717 N Street NW", "Ste 1", "Washington, DC 20036"];

export const officeAddress = officeAddressLines.join(", ");

/** Keyless Google Maps embed + a "get directions" deep link for the same place. */
export const officeMapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(officeAddress)}&output=embed`;
export const officeMapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(officeAddress)}`;

export const serviceOptions = [
  "Digital Marketing",
  "Automation",
  "Brand Management",
  "ATL/TTL Campaigns",
  "Website Development",
  "App Development",
  "AI Development",
  "Graphic Design",
  "Video Editing",
  "Other",
];
