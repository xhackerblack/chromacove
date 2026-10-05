import { createFileRoute, Link } from "@tanstack/react-router";
import { useProducts } from "@/lib/catalog";
import { ProductCard, EmailForm, Doodle, seo } from "@/components/site";

/** HOME PAGE COPY — edit text below. */
const faqs = [
  ["How do I get my coloring book?", "Right after checkout you get an instant download link on screen and by email. Download the PDF and print at home or at a print shop."],
  ["Can I print pages more than once?", "Yes! Print as many copies as you like for personal and household use — perfect for redoing a favorite page."],
  ["What paper should I use?", "Regular printer paper works great for crayons and pencils. For markers, we recommend 65–110 lb cardstock."],
  ["Can teachers use these in class?", "Absolutely. A single purchase covers one classroom. Contact us for school-wide licences."],
  ["Do you offer refunds?", "Because files are digital, sales are final — but if anything's wrong with your file, we'll fix it or refund you. Just email us."],
];
const testimonials = [
  ["Coloring Mindful Mandalas has replaced my evening scroll. I sleep better!", "Priya, Toronto"],
  ["My kids fight over who gets the next Dino Dash page. Worth every cent.", "Sam, Austin"],
  ["Instant download, beautiful lines, prints perfectly. I've bought five books.", "Elena, Lisbon"],
];

export const Route = createFileRoute("/")({
  head: () => {
    const h = seo("Printable Coloring Books for Adults & Kids", "Instant-download coloring book PDFs: calming mandalas, florals and fantasy for adults, plus dinosaurs, ABCs and animals for kids.", "/");
    return {
      ...h,
      scripts: [{ type: "application/ld+json", children: JSON.stringify({
        "@context": "https://schema.org", "@type": "FAQPage",
        mainEntity: faqs.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      }) }],
    };
  },
  component: Home,
});

function Home() {
  const best = useProducts().filter((p) => p.bestseller);
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden px-4 pb-16 pt-12 text-center md:pt-20">
        <Doodle className="absolute -left-6 top-10 h-12 w-40 rotate-12 text-sunny" />
        <Doodle className="absolute -right-8 bottom-6 h-12 w-40 -rotate-12 text-secondary/50" />
        <p className="inline-block rounded-full bg-sunny px-4 py-1 text-sm font-bold">Instant PDF download · Print at home</p>
        <h1 className="mx-auto mt-5 max-w-3xl text-5xl font-bold leading-tight md:text-7xl">
          Color your calm. <span className="text-primary">Spark their imagination.</span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">
          Printable coloring books for grown-ups who need a breather and kids who never run out of ideas.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/shop" search={{ audience: "adults" }} className="btn-primary text-lg">Shop Adults</Link>
          <Link to="/shop" search={{ audience: "kids" }} className="btn-teal text-lg">Shop Kids</Link>
        </div>
        <p className="mt-6 font-semibold">🎁 Buy 3, get 1 free — automatically applied</p>
      </section>

      {/* BESTSELLERS */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-3xl font-bold md:text-4xl">Bestsellers</h2>
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {best.map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 md:grid-cols-2">
        <Link to="/shop" search={{ audience: "adults" }} className="rounded-3xl bg-primary p-8 text-primary-foreground shadow-soft">
          <h2 className="text-3xl font-bold">For Adults</h2>
          <p className="mt-2 opacity-90">Mandalas, botanicals, wild animals & fantasy worlds.</p>
          <span className="mt-4 inline-block font-bold underline">Browse →</span>
        </Link>
        <Link to="/shop" search={{ audience: "kids" }} className="rounded-3xl bg-secondary p-8 text-secondary-foreground shadow-soft">
          <h2 className="text-3xl font-bold">For Kids</h2>
          <p className="mt-2 opacity-90">Dinosaurs, ABCs, zoo buddies & fairy gardens.</p>
          <span className="mt-4 inline-block font-bold underline">Browse →</span>
        </Link>
      </section>

      {/* FREE SAMPLE */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-3xl border-2 border-dashed border-foreground/20 bg-sunny/40 p-8 md:p-12">
          <h2 className="text-3xl font-bold">Get a free sample page</h2>
          <p className="mb-5 mt-2 max-w-lg">Try before you buy — we'll email you one adult and one kids page to print today.</p>
          <EmailForm cta="Send my free pages" success="Check your inbox — your free pages are on the way! 🎨" />
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-6xl px-4 py-10">
        <h2 className="text-3xl font-bold">Loved by colorers everywhere</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {testimonials.map(([q, who]) => (
            <figure key={who} className="rounded-3xl bg-card p-6 shadow-soft">
              <blockquote className="text-lg">“{q}”</blockquote>
              <figcaption className="mt-3 font-bold text-secondary">— {who}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 py-10">
        <h2 className="text-3xl font-bold">Questions, answered</h2>
        <div className="mt-6 space-y-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="rounded-2xl bg-card p-5 shadow-soft">
              <summary className="cursor-pointer font-display text-lg font-semibold">{q}</summary>
              <p className="mt-2 text-muted-foreground">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="mx-auto max-w-3xl px-4 py-10 text-center">
        <h2 className="text-3xl font-bold">New pages every month</h2>
        <p className="mb-5 mt-2 text-muted-foreground">Join the Cove for new releases, freebies and 10% off your first order.</p>
        <EmailForm cta="Join the Cove" success="Welcome! Use code COVE10 for 10% off." />
      </section>
    </>
  );
}
