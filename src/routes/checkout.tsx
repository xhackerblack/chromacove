import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore, totals, money } from "@/lib/store";
import { seo } from "@/components/site";
import { useProducts } from "@/lib/catalog";

/**
 * CHECKOUT — payment buttons are placeholders until payments are connected.
 * Once connected, successful orders will show download links and send an email.
 */
export const Route = createFileRoute("/checkout")({
  head: () => seo("Checkout", "Secure checkout for your printable coloring books.", "/checkout"),
  component: Checkout,
});

function Checkout() {
  const s = useStore();
  const t = totals(s, useProducts());
  if (!t.items.length) return <div className="py-20 text-center"><Link to="/shop" className="btn-primary">Your cart is empty — shop now</Link></div>;
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-4xl font-bold">Checkout</h1>
      <p className="mt-2 text-muted-foreground">{t.items.length} book(s) · Total <strong>{money(t.total)}</strong></p>
      <div className="mt-6 space-y-3">
        <button disabled className="btn-primary w-full">Pay with card (Stripe)</button>
        <button disabled className="btn-teal w-full opacity-50">Pay with PayPal</button>
      </div>
      <p className="mt-4 rounded-2xl bg-sunny/50 p-4 text-sm">Payments are coming soon. After payment you'll get an instant download link here and by email.</p>
    </div>
  );
}
