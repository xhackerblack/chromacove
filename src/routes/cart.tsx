import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useStore, actions, totals, money } from "@/lib/store";
import { discountCodes, productImages } from "@/data/products";
import { seo } from "@/components/site";
import { useProducts } from "@/lib/catalog";

export const Route = createFileRoute("/cart")({
  head: () => ({ ...seo("Your Cart", "Review your printable coloring books, apply discount codes and check out.", "/cart"), meta: [...seo("Your Cart", "Review your cart.", "/cart").meta, { name: "robots", content: "noindex" }] }),
  component: Cart,
});

function Cart() {
  const s = useStore();
  const t = totals(s, useProducts());
  const [code, setCode] = useState("");
  const [err, setErr] = useState("");
  if (!t.items.length) return (
    <div className="px-4 py-20 text-center"><h1 className="text-4xl font-bold">Your cart is empty</h1><Link to="/shop" className="btn-primary mt-6">Find a book</Link></div>
  );
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-4xl font-bold">Your cart</h1>
      {t.items.length % 4 === 3 && <p className="mt-3 rounded-2xl bg-sunny p-3 font-semibold">Add one more book and it's free! 🎉</p>}
      <ul className="mt-6 space-y-3">
        {t.items.map((p) => (
          <li key={p.slug} className="flex items-center gap-4 rounded-2xl bg-card p-3 shadow-soft">
            <img src={productImages(p)[0]} alt="" loading="lazy" className="h-20 w-16 rounded-lg object-cover" />
            <div className="flex-1"><p className="font-display font-semibold">{p.name}</p><p className="text-sm text-muted-foreground">PDF · {p.pages} pages</p></div>
            <span className="font-bold">{money(p.price)}</span>
            <button onClick={() => actions.remove(p.slug)} aria-label={`Remove ${p.name}`} className="p-2"><Trash2 className="h-5 w-5" /></button>
          </li>
        ))}
      </ul>
      <form className="mt-6 flex gap-2" onSubmit={(e) => {
        e.preventDefault();
        const c = code.trim().toUpperCase();
        if (discountCodes[c]) { actions.setCode(c); setErr(""); } else setErr("That code isn't valid.");
      }}>
        <input aria-label="Discount code" placeholder="Discount code" value={code} onChange={(e) => setCode(e.target.value)} className="min-h-12 flex-1 rounded-full border-2 border-foreground/15 bg-card px-5" />
        <button className="btn-teal">Apply</button>
      </form>
      {err && <p className="mt-2 text-destructive" role="alert">{err}</p>}
      <dl className="mt-6 space-y-1 rounded-2xl bg-muted p-5">
        <Row k="Subtotal" v={money(t.subtotal)} />
        {t.bundle > 0 && <Row k="Buy 3, get 1 free" v={`−${money(t.bundle)}`} />}
        {t.pct > 0 && <Row k={`Code ${s.code} (${t.pct}%)`} v={`−${money(t.discount)}`} />}
        <Row k="Total" v={money(t.total)} bold />
      </dl>
      <Link to="/checkout" className="btn-primary mt-6 w-full text-lg">Checkout</Link>
    </div>
  );
}
const Row = ({ k, v, bold }: { k: string; v: string; bold?: boolean }) => (
  <div className={`flex justify-between ${bold ? "border-t border-foreground/10 pt-2 text-xl font-bold" : ""}`}><dt>{k}</dt><dd>{v}</dd></div>
);
