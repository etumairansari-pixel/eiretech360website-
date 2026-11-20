import { createFileRoute } from "@tanstack/react-router";
import { OpportunityPage, type OpportunityContent } from "@/components/site/OpportunityPage";
import { headFor } from "@/content";
import volunteerPage from "../../content/pages/volunteer.json";

export const Route = createFileRoute("/volunteer")({
  head: () => headFor("volunteer", volunteerPage.seo),
  component: VolunteerPage,
});

function VolunteerPage() {
  return <OpportunityPage content={volunteerPage as OpportunityContent} />;
}
