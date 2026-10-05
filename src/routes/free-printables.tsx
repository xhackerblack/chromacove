import { createFileRoute } from "@tanstack/react-router";
import { EmailForm, PageShell, seo } from "@/components/site";

export const Route = createFileRoute("/free-printables")({
  head: () => seo("Free Printable Coloring Pages", "Download free coloring pages for adults and kids — a mandala, a dinosaur and more, sent straight to your inbox.", "/free-printables"),
  component: () => (
    <PageShell title="Free printables" intro="Five free pages to print today: a starter mandala, a peony, a friendly T-rex, the letter A and a fairy house.">
      <ul>
        <li>Print-ready PDF in US Letter and A4</li>
        <li>Works with crayons, pencils and markers</li>
        <li>New freebie every month for subscribers</li>
      </ul>
      <div className="rounded-3xl bg-sunny/40 p-6"><EmailForm cta="Email me the free pages" success="Your free pages are on their way! 🎨" /></div>
    </PageShell>
  ),
});
