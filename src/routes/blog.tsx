import { createFileRoute } from "@tanstack/react-router";
import { PageShell, seo } from "@/components/site";

/** BLOG POSTS — edit or add posts here. */
const posts = [
  { title: "5 reasons coloring is the best 10-minute stress break", date: "Sep 12, 2026", excerpt: "Science-backed reasons a few minutes with colored pencils can reset a frazzled brain." },
  { title: "Best paper for printable coloring pages", date: "Aug 28, 2026", excerpt: "From everyday printer paper to heavy cardstock — what works with pencils, gel pens and markers." },
  { title: "Rainy-day coloring games for kids", date: "Aug 3, 2026", excerpt: "Color-by-roll, swap-a-page and four other ways to make coloring time extra fun." },
];

export const Route = createFileRoute("/blog")({
  head: () => seo("Coloring Tips & Ideas Blog", "Coloring techniques, printing tips and creative activities for adults and kids.", "/blog"),
  component: () => (
    <PageShell title="The ChromaCove blog" intro="Tips, techniques and a little inspiration.">
      <div className="space-y-4">
        {posts.map((p) => (
          <article key={p.title} className="rounded-3xl bg-card p-6 shadow-soft">
            <p className="text-sm text-muted-foreground">{p.date}</p>
            <h2 className="!mt-1">{p.title}</h2>
            <p className="!mb-0">{p.excerpt}</p>
          </article>
        ))}
      </div>
    </PageShell>
  ),
});
