import { createFileRoute } from "@tanstack/react-router";
import { useEffect } from "react";

export const Route = createFileRoute("/contact")({ component: ContactRedirect });

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
