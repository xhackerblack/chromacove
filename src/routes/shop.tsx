import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import { themes } from "@/data/products";
import { useProducts } from "@/lib/catalog";
import { ProductCard, seo } from "@/components/site";

const search = z.object({
  audience: z.enum(["adults", "kids"]).optional(),
  theme: z.string().optional(),
  age: z.enum(["3-5", "6-9", "16+"]).optional(),
  max: z.number().optional(),
  sort: z.enum(["popular", "price-asc", "price-desc", "name"]).optional(),
  q: z.string().optional(),
});

export const Route = createFileRoute("/shop")({
  validateSearch: search,
  head: () => seo("Shop Coloring Books", "Browse printable coloring books by audience, theme, age and price. Mandalas, animals, flowers, fantasy, dinosaurs and alphabet.", "/shop"),
  component: Shop,
});

const ageMatch = (pAge: string, f: string) => {
  if (f === "16+") return pAge === "16+";
  const [lo = 0, hi = 0] = f.split("-").map(Number);
  const [a = 0, b = NaN] = pAge.split("-").map(Number);
  return !isNaN(b) && a <= hi && b >= lo;
};

function Shop() {
  const s = Route.useSearch();
  const products = useProducts();
  const nav = useNavigate({ from: "/shop" });
  const set = (patch: Partial<z.infer<typeof search>>) => nav({ search: (old) => ({ ...old, ...patch }), replace: true });

  let list = products.filter((p) =>
    (!s.audience || p.audience === s.audience) &&
    (!s.theme || p.theme === s.theme) &&
    (!s.age || ageMatch(p.age, s.age)) &&
    (!s.max || p.price <= s.max) &&
    (!s.q || (p.name + p.description + p.theme).toLowerCase().includes(s.q.toLowerCase())));
  if (s.sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
  if (s.sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
  if (s.sort === "name") list = [...list].sort((a, b) => a.name.localeCompare(b.name));
  if (!s.sort || s.sort === "popular") list = [...list].sort((a, b) => Number(!!b.bestseller) - Number(!!a.bestseller));

  const sel = "min-h-11 rounded-full border-2 border-foreground/15 bg-card px-4";
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold">Shop coloring books</h1>
      <input type="search" aria-label="Search" placeholder="Search dragons, flowers, ABC…" defaultValue={s.q}
        onChange={(e) => set({ q: e.target.value || undefined })} className={`${sel} mt-5 w-full`} />
      <div className="mt-3 flex gap-2 overflow-x-auto pb-2">
        {([undefined, "adults", "kids"] as const).map((a) => (
          <button key={a ?? "all"} onClick={() => set({ audience: a })}
            className={`shrink-0 rounded-full px-4 py-2 font-bold ${s.audience === a ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
            {a ? a.charAt(0).toUpperCase() + a.slice(1) : "All"}
          </button>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-4">
        <select aria-label="Theme" className={sel} value={s.theme ?? ""} onChange={(e) => set({ theme: e.target.value || undefined })}>
          <option value="">All themes</option>
          {themes.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
        </select>
        <select aria-label="Age" className={sel} value={s.age ?? ""} onChange={(e) => set({ age: (e.target.value || undefined) as never })}>
          <option value="">All ages</option><option value="3-5">Ages 3–5</option><option value="6-9">Ages 6–9</option><option value="16+">Teens & adults</option>
        </select>
        <select aria-label="Max price" className={sel} value={s.max ?? ""} onChange={(e) => set({ max: e.target.value ? Number(e.target.value) : undefined })}>
          <option value="">Any price</option><option value="5">Under $5</option><option value="8">Under $8</option><option value="10">Under $10</option>
        </select>
        <select aria-label="Sort" className={sel} value={s.sort ?? "popular"} onChange={(e) => set({ sort: e.target.value as never })}>
          <option value="popular">Most popular</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option><option value="name">Name A–Z</option>
        </select>
      </div>
      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">{list.length} books</p>
      <div className="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
        {list.map((p) => <ProductCard key={p.slug} p={p} />)}
      </div>
      {list.length === 0 && <p className="py-10 text-center">No matches — try clearing a filter.</p>}
    </div>
  );
}
