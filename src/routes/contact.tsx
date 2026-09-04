import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Eire Tech | Get a Free Consultation" },
      {
        name: "description",
        content:
          "Ready to grow your business? Contact Eire Tech today to discuss your web, marketing, app or AI project and get started with a free consultation.",
      },
      { property: "og:title", content: "Contact Eire Tech | Get a Free Consultation" },
      {
        property: "og:description",
        content:
          "Ready to grow your business? Contact Eire Tech today to discuss your web, marketing, app or AI project and get started with a free consultation.",
      },
    ],
    links: [{ rel: "canonical", href: "https://eiretech360.com/contact/" }],
  }),
  component: ContactRedirect,
});

function ContactRedirect() {
  useEffect(() => {
    window.location.replace("/contact/");
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-brand-bg px-6 text-brand-text">
      <p>Opening the contact form...</p>
    </main>
  );
}
