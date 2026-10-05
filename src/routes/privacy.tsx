import { createFileRoute } from "@tanstack/react-router";
import { PageShell, seo } from "@/components/site";

export const Route = createFileRoute("/privacy")({
  head: () => seo("Privacy Policy", "How ChromaCove collects, uses and protects your information.", "/privacy"),
  component: () => (
    <PageShell title="Privacy policy" intro="Plain-language summary — have a lawyer review before launch.">
      <h2>What we collect</h2>
      <p>Your email and order details when you buy or sign up. Payments are processed by our payment partners; we never see your full card number.</p>
      <h2>How we use it</h2>
      <p>To deliver your files, send receipts and — only if you opt in — our newsletter. We never sell your data.</p>
      <h2>Your choices</h2>
      <p>Unsubscribe anytime, or email us to access or delete your data.</p>
    </PageShell>
  ),
});
