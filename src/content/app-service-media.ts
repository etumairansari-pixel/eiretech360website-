import appPhoto0_1 from "@/assets/photo-ios-android-app-development-overview.webp";
import appPhoto0_2 from "@/assets/photo-ios-android-app-development-detail-1.webp";
import appPhoto0_3 from "@/assets/photo-ios-android-app-development-detail-2.webp";
import appPhoto1_1 from "@/assets/photo-web-application-development-overview.webp";
import appPhoto1_2 from "@/assets/photo-web-application-development-detail-1.webp";
import appPhoto1_3 from "@/assets/photo-web-application-development-detail-2.webp";
import appPhoto2_1 from "@/assets/photo-ui-ux-design-apps-overview.webp";
import appPhoto2_2 from "@/assets/photo-ui-ux-design-apps-detail-1.webp";
import appPhoto2_3 from "@/assets/photo-ui-ux-design-apps-detail-2.webp";
import appPhoto3_1 from "@/assets/photo-app-maintenance-updates-overview.webp";
import appPhoto3_2 from "@/assets/photo-app-maintenance-updates-detail-1.webp";
import appPhoto3_3 from "@/assets/photo-app-maintenance-updates-detail-2.webp";

export const appServicePhotography = {
  "ios-android-app-development": {
    src: appPhoto0_1,
    alt: "An Android phone displaying installed applications",
    heroAlt: "Mobile app dashboard displayed on a phone beside desktop screens",
  },
  "web-application-development": {
    src: appPhoto1_1,
    alt: "Web development code open on a laptop at a desk",
    heroAlt: "Application code displayed across a laptop screen",
  },
  "ui-ux-design-apps": {
    src: appPhoto2_1,
    alt: "Planning an interface with wireframes on a tablet",
    heroAlt: "Sketching interface wireframes on paper",
  },
  "app-maintenance-updates": {
    src: appPhoto3_1,
    alt: "A laptop displaying software diagnostics",
    heroAlt: "Computer circuitry representing application infrastructure",
  },
};

export const appServiceSectionMedia = {
  "ios-android-app-development": [
    { section: 2, src: appPhoto0_2, alt: "Application source code open in a code editor" },
    { section: 4, src: appPhoto0_3, alt: "A person interacting with a mobile application" },
  ],
  "web-application-development": [
    { section: 0, src: appPhoto1_2, alt: "A laptop on a clean desk ready for browser-based work" },
    { section: 4, src: appPhoto1_3, alt: "A person using a desktop computer for daily tasks" },
  ],
  "ui-ux-design-apps": [
    {
      section: 1,
      src: appPhoto2_2,
      alt: "A designer working on visual assets at a desktop computer",
    },
    {
      section: 6,
      src: appPhoto2_3,
      alt: "Interface layouts and reusable components on a design screen",
    },
  ],
  "app-maintenance-updates": [
    { section: 3, src: appPhoto3_2, alt: "Code on a screen representing software security checks" },
    { section: 6, src: appPhoto3_3, alt: "Colleagues reviewing work together on a laptop" },
  ],
};

export const appServiceContextualLinks = {
  "ios-android-app-development": { 1: "ui-ux-design-apps", 5: "app-maintenance-updates" },
  "web-application-development": { 1: "ui-ux-design-apps", 5: "app-maintenance-updates" },
  "ui-ux-design-apps": { 4: "ios-android-app-development", 6: "web-application-development" },
  "app-maintenance-updates": { 2: "ios-android-app-development", 5: "ui-ux-design-apps" },
};
