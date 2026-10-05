/** Shared layout pieces: header, footer, product card, doodles, email form. */
import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Heart, ShoppingBag, Menu, X, Star } from "lucide-react";
import { useStore, actions, money } from "@/lib/store";
import { productImages, avgRating, type Product } from "@/data/products";

const nav = [
  { to: "/shop", label: "Shop" },
  { to: "/free-printables", label: "Free Printables" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function Header() {
  const s = useStore();
  const [open, setOpen] = useState(false);
  const count = Object.keys(s.cart).length;
  return (
    <header className="sticky top-0 z-40 border-b-2 border-foreground/10 bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-2xl font-bold">
          Chroma<span className="text-primary">Cove</span>
        </Link>
        <nav className="hidden gap-6 md:flex" aria-label="Main">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="font-semibold hover:text-primary" activeProps={{ className: "text-primary" }}>{n.label}</Link>
          ))}
        </nav>
        <div className="flex items-center gap-1">
          <Link to="/wishlist" aria-label={`Wishlist (${s.wishlist.length})`} className="relative rounded-full p-2 hover:bg-muted">
            <Heart className="h-5 w-5" />
            {s.wishlist.length > 0 && <Badge n={s.wishlist.length} />}
          </Link>
          <Link to="/cart" aria-label={`Cart (${count})`} className="relative rounded-full p-2 hover:bg-muted">
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && <Badge n={count} />}
          </Link>
          <button className="rounded-full p-2 md:hidden" onClick={() => setOpen(!open)} aria-label="Menu" aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav className="border-t border-foreground/10 px-4 pb-4 md:hidden" aria-label="Mobile">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} onClick={() => setOpen(false)} className="block py-3 text-lg font-semibold">{n.label}</Link>
          ))}
        </nav>
      )}
    </header>
  );
}
const Badge = ({ n }: { n: number }) => (
  <span className="absolute -right-0.5 -top-0.5 grid h-5 w-5 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">{n}</span>
);

export function Footer() {
  const links = [
    ["/shipping-returns", "Shipping & Returns"], ["/privacy", "Privacy"], ["/terms", "Terms"], ["/contact", "Contact"],
  ] as const;
  return (
    <footer className="mt-20 bg-foreground text-background">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl font-bold">Chroma<span className="text-sunny">Cove</span></p>
          <p className="mt-2 opacity-80">Printable coloring books for grown-ups and little artists.</p>
        </div>
        <ul className="space-y-2">
          {links.map(([to, l]) => <li key={to}><Link to={to} className="opacity-80 hover:opacity-100">{l}</Link></li>)}
        </ul>
        <div>
          <p className="mb-2 font-semibold">Join the newsletter</p>
          <EmailForm cta="Subscribe" success="You're in! Watch your inbox." dark />
        </div>
      </div>
      <p className="pb-6 text-center text-sm opacity-60">© {new Date().getFullYear()} ChromaCove</p>
    </footer>
  );
}

/** Email capture. TODO: connect to your email provider / backend. */
export function EmailForm({ cta, success, dark }: { cta: string; success: string; dark?: boolean }) {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length < 255;
  if (done) return <p role="status" className="font-semibold">{success}</p>;
  return (
    <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); if (valid) setDone(true); }}>
      <label className="sr-only" htmlFor={`email-${cta}`}>Email address</label>
      <input id={`email-${cta}`} type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@email.com"
        className={`min-h-12 flex-1 rounded-full border-2 px-5 ${dark ? "border-background/30 bg-transparent text-background placeholder:text-background/60" : "border-foreground/15 bg-card"}`} />
      <button className="btn-primary" disabled={!valid}>{cta}</button>
    </form>
  );
}

export function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex text-sunny-strong" aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`h-4 w-4 ${i <= Math.round(value) ? "fill-current" : ""}`} />)}
    </span>
  );
}

export function ProductCard({ p }: { p: Product }) {
  const s = useStore();
  const wished = s.wishlist.includes(p.slug);
  return (
    <article className="group relative overflow-hidden rounded-3xl border-2 border-foreground/10 bg-card shadow-soft transition hover:-translate-y-1">
      <button onClick={() => actions.toggleWish(p.slug)} aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
        className="absolute right-3 top-3 z-10 rounded-full bg-card/90 p-2">
        <Heart className={`h-5 w-5 ${wished ? "fill-primary text-primary" : ""}`} />
      </button>
      <Link to="/product/$slug" params={{ slug: p.slug }}>
        <img src={productImages(p)[0]} alt={`${p.name} coloring book cover`} loading="lazy" width={800} height={1000} className="aspect-[4/5] w-full object-cover" />
        <div className="p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-secondary">{p.audience} · {p.theme}</p>
          <h3 className="font-display text-xl font-semibold">{p.name}</h3>
          <div className="mt-1 flex items-center justify-between">
            <span className="text-lg font-bold">{money(p.price)}</span>
            <Stars value={avgRating(p)} />
          </div>
        </div>
      </Link>
    </article>
  );
}

/** Hand-drawn style doodle accent (swirl). */
export function Doodle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 40" className={className} aria-hidden fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
      <path d="M4 30 C 20 4, 30 4, 40 22 S 62 40, 74 18 S 100 2, 116 20" />
    </svg>
  );
}

export function PageShell({ title, intro, children }: { title: string; intro?: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-display text-4xl font-bold md:text-5xl">{title}</h1>
      <Doodle className="mt-1 h-6 w-28 text-primary" />
      {intro && <p className="mt-4 text-lg text-muted-foreground">{intro}</p>}
      <div className="prose-cc mt-8">{children}</div>
    </div>
  );
}

/** Builds route head meta. */
export const seo = (title: string, description: string, path: string) => ({
  meta: [
    { title: `${title} | ChromaCove` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} | ChromaCove` },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { property: "og:url", content: path },
    { name: "twitter:card", content: "summary_large_image" },
  ],
  links: [{ rel: "canonical", href: path }],
});
