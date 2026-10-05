import { createFileRoute } from "@tanstack/react-router";
import { PageShell, seo } from "@/components/site";

export const Route = createFileRoute("/shipping-returns")({
  head: () => seo("Delivery & Returns", "How digital delivery works and our refund policy for printable coloring books.", "/shipping-returns"),
  component: () => (
    <PageShell title="Delivery & returns">
      <h2>Instant digital delivery</h2>
      <p>Nothing ships — every book is a PDF. You'll see download links right after checkout and receive them by email. Links stay active for 30 days and can be re-sent on request.</p>
      <h2>Returns & refunds</h2>
      <p>Because digital files can't be returned, all sales are final. If a file is damaged, missing pages or won't open, email us within 14 days and we'll fix it or give a full refund.</p>
    </PageShell>
  ),
});
