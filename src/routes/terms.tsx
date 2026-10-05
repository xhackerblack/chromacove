import { createFileRoute } from "@tanstack/react-router";
import { PageShell, seo } from "@/components/site";

export const Route = createFileRoute("/terms")({
  head: () => seo("Terms of Use", "Licence and terms for ChromaCove printable coloring books.", "/terms"),
  component: () => (
    <PageShell title="Terms of use" intro="Plain-language summary — have a lawyer review before launch.">
      <h2>Your licence</h2>
      <p>Each purchase grants a personal, household licence (or one classroom). Print as many copies as you need for that use.</p>
      <h2>What's not allowed</h2>
      <p>Reselling, sharing the files online, or selling printed or colored copies commercially.</p>
      <h2>Contact</h2>
      <p>Questions? Reach us through the contact page.</p>
    </PageShell>
  ),
});
