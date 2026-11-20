import { createFileRoute } from "@tanstack/react-router";
import { OpportunityPage, type OpportunityContent } from "@/components/site/OpportunityPage";
import { headFor } from "@/content";
import careersPage from "../../content/pages/careers.json";

export const Route = createFileRoute("/careers")({
  head: () => headFor("careers", careersPage.seo),
  component: CareersPage,
});

function CareersPage() {
  return <OpportunityPage content={careersPage as OpportunityContent} />;
}
