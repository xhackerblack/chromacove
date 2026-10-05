import { createFileRoute, notFound, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { productsQuery, useProducts, findProduct } from "@/lib/catalog";
import { Heart, Check } from "lucide-react";
import { productImages, avgRating } from "@/data/products";
import { useStore, actions, money } from "@/lib/store";
import { ProductCard, Stars } from "@/components/site";

export const Route = createFileRoute("/product/$slug")({
  loader: async ({ params, context }) => {
    const p = findProduct(await context.queryClient.ensureQueryData(productsQuery), params.slug);
    if (!p) throw notFound();
    return p;
  },
  head: ({ loaderData: p, params }) => {
    if (!p) return { meta: [{ title: "Not found" }, { name: "robots", content: "noindex" }] };
    const title = `${p.name} — Printable Coloring Book | ChromaCove`;
    const image = productImages(p)[0];
    return {
      meta: [
        { title }, { name: "description", content: p.short },
        { property: "og:title", content: title }, { property: "og:description", content: p.short },
        { property: "og:type", content: "product" }, { property: "og:url", content: `/product/${params.slug}` },
        { property: "og:image", content: image }, { name: "twitter:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: `/product/${params.slug}` }],
      scripts: [{ type: "application/ld+json", children: JSON.stringify({
        "@context": "https://schema.org", "@type": "Product", name: p.name, description: p.description, image,
        offers: { "@type": "Offer", price: p.price, priceCurrency: "USD", availability: "https://schema.org/InStock" },
        aggregateRating: { "@type": "AggregateRating", ratingValue: avgRating(p).toFixed(1), reviewCount: p.reviews.length },
      }) }],
    };
  },
  component: ProductPage,
});

const reviewSchema = z.object({
  name: z.string().trim().min(1, "Please add your name").max(60),
  text: z.string().trim().min(1, "Please write a few words").max(600),
  rating: z.number().int().min(1).max(5),
});

function ProductPage() {
  const { slug } = Route.useParams();
  const products = useProducts();
  const loaded = Route.useLoaderData();
  const p = findProduct(products, slug) ?? loaded!;
  const qc = useQueryClient();
  const [status, setStatus] = useState("");
  const s = useStore();
  const imgs = productImages(p);
  const [active, setActive] = useState(0);
  const reviews = p.reviews;
  const [form, setForm] = useState({ name: "", text: "", rating: 5 });
  const inCart = !!s.cart[p.slug];
  const wished = s.wishlist.includes(p.slug);
  const related = products.filter((x) => x.slug !== p.slug && (x.audience === p.audience || x.theme === p.theme)).slice(0, 4);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <img src={imgs[active]} alt={`${p.name} page ${active + 1} preview`} width={800} height={1000} className="aspect-[4/5] w-full rounded-3xl object-cover shadow-soft" />
          <div className="mt-3 grid grid-cols-4 gap-2">
            {imgs.map((src, i) => (
              <button key={src} onClick={() => setActive(i)} aria-label={`Show page ${i + 1}`} className={`overflow-hidden rounded-xl border-2 ${i === active ? "border-primary" : "border-transparent"}`}>
                <img src={src} alt="" loading="lazy" className="aspect-[4/5] w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-sm font-bold uppercase text-secondary">{p.audience} · {p.theme}</p>
          <h1 className="text-4xl font-bold md:text-5xl">{p.name}</h1>
          <div className="mt-2 flex items-center gap-2"><Stars value={avgRating(p)} /><span className="text-sm">({reviews.length} reviews)</span></div>
          <p className="mt-4 text-3xl font-bold">{money(p.price)}</p>
          <dl className="mt-4 grid grid-cols-3 gap-2 text-center">
            {[["Age", p.age], ["Difficulty", p.difficulty], ["Pages", p.pages]].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-muted p-3"><dt className="text-xs uppercase text-muted-foreground">{k}</dt><dd className="font-bold">{v}</dd></div>
            ))}
          </dl>
          <div className="mt-6 flex gap-2">
            {inCart
              ? <Link to="/cart" className="btn-teal flex-1"><Check className="h-5 w-5" /> In cart — view</Link>
              : <button className="btn-primary flex-1" onClick={() => actions.add(p.slug)}>Add to Cart</button>}
            <button onClick={() => actions.toggleWish(p.slug)} aria-label="Toggle wishlist" className="rounded-full border-2 border-foreground/15 px-4">
              <Heart className={`h-5 w-5 ${wished ? "fill-primary text-primary" : ""}`} />
            </button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">Instant PDF download · US Letter & A4 included · Buy 3, get 1 free</p>
          <p className="mt-6 leading-relaxed">{p.description}</p>
        </div>
      </div>

      <section className="mt-14 max-w-3xl">
        <h2 className="text-3xl font-bold">Reviews</h2>
        <ul className="mt-4 space-y-3">
          {reviews.map((r, i) => (
            <li key={i} className="rounded-2xl bg-card p-4 shadow-soft"><Stars value={r.rating} /><p className="mt-1">{r.text}</p><p className="mt-1 text-sm font-bold">— {r.name}</p></li>
          ))}
        </ul>
        {/* Reviews are saved to Lovable Cloud. */}
        <form className="mt-6 space-y-2 rounded-2xl bg-muted p-4" onSubmit={async (e) => {
          e.preventDefault();
          const parsed = reviewSchema.safeParse(form);
          if (!parsed.success) { setStatus(parsed.error.issues[0]?.message ?? "Please check your review."); return; }
          setStatus("Saving…");
          const { error } = await supabase.from("reviews").insert({ product_slug: p.slug, ...parsed.data });
          if (error) { setStatus("Sorry, your review couldn't be saved. Please try again."); return; }
          await qc.invalidateQueries({ queryKey: productsQuery.queryKey });
          setForm({ name: "", text: "", rating: 5 });
          setStatus("Thanks for your review!");
        }}>
          <p className="font-display text-lg font-semibold">Write a review</p>
          <input aria-label="Your name" required maxLength={60} placeholder="Your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="min-h-11 w-full rounded-xl bg-card px-3" />
          <select aria-label="Rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className="min-h-11 w-full rounded-xl bg-card px-3">
            {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} stars</option>)}
          </select>
          <textarea aria-label="Review" required maxLength={600} placeholder="What did you love?" value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} className="w-full rounded-xl bg-card p-3" rows={3} />
          <button className="btn-primary">Submit review</button>
          {status && <p role="status" className="text-sm font-semibold">{status}</p>}
        </form>
      </section>

      <section className="mt-14">
        <h2 className="text-3xl font-bold">You might also love</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">{related.map((r) => <ProductCard key={r.slug} p={r} />)}</div>
      </section>
    </div>
  );
}
