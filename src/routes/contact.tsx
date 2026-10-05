import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageShell, seo } from "@/components/site";

export const Route = createFileRoute("/contact")({
  head: () => seo("Contact Us", "Questions about an order or a download? Get in touch with the ChromaCove team.", "/contact"),
  component: Contact,
});

function Contact() {
  const [sent, setSent] = useState(false);
  const f = "min-h-12 w-full rounded-2xl border-2 border-foreground/15 bg-card px-4";
  return (
    <PageShell title="Say hello" intro="We usually reply within one business day.">
      {sent ? <p role="status" className="font-semibold">Thanks! We'll be in touch soon.</p> : (
        <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
          <input aria-label="Name" required maxLength={100} placeholder="Name" className={f} />
          <input aria-label="Email" type="email" required maxLength={255} placeholder="Email" className={f} />
          <textarea aria-label="Message" required maxLength={1000} rows={5} placeholder="How can we help?" className={`${f} py-3`} />
          <button className="btn-primary">Send message</button>
        </form>
      )}
    </PageShell>
  );
}
