import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";
import { headFor, pathFor } from "@/content";
import contactPage from "../../content/pages/contact.json";

export const Route = createFileRoute("/contact")({
  head: () => headFor("contact", contactPage.seo),
  component: ContactRedirect,
});

/**
 * The contact page ships as its own static document, so this route exists only
 * to carry the right metadata during client-side navigation and then hand over
 * to that document.
 */
function ContactRedirect() {
  useEffect(() => {
    window.location.replace(pathFor("contact"));
  }, []);

  return (
    <main className="grid min-h-screen place-items-center bg-brand-bg px-6 text-brand-text">
      <p>Opening the contact form...</p>
    </main>
  );
}
