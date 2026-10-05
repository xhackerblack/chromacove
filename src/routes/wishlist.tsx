import { createFileRoute, Link } from "@tanstack/react-router";
import { useStore } from "@/lib/store";
import { useProducts } from "@/lib/catalog";
import { ProductCard, seo } from "@/components/site";

export const Route = createFileRoute("/wishlist")({
  head: () => seo("Your Wishlist", "Coloring books you've saved for later.", "/wishlist"),
  component: Wishlist,
});

function Wishlist() {
  const s = useStore();
  const items = useProducts().filter((p) => s.wishlist.includes(p.slug));
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold">Your wishlist</h1>
      {items.length === 0
        ? <p className="mt-6">Nothing saved yet. Tap the heart on any book. <Link to="/shop" className="font-bold text-primary underline">Browse the shop</Link></p>
        : <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">{items.map((p) => <ProductCard key={p.slug} p={p} />)}</div>}
    </div>
  );
}
