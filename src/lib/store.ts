/** Cart + wishlist stored in the browser (localStorage). */
import { useSyncExternalStore } from "react";
import { discountCodes, type Product } from "@/data/products";

type State = { cart: Record<string, number>; wishlist: string[]; code: string };
const KEY = "chromacove-store";
const empty: State = { cart: {}, wishlist: [], code: "" };
let state: State = empty;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try { state = { ...empty, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; } catch { /* ignore */ }
}
function set(next: State) {
  state = next;
  localStorage.setItem(KEY, JSON.stringify(state));
  listeners.forEach((l) => l());
}
const subscribe = (l: () => void) => { load(); listeners.add(l); l(); return () => listeners.delete(l); };

export function useStore() {
  return useSyncExternalStore(subscribe, () => { load(); return state; }, () => empty);
}

export const actions = {
  add: (slug: string) => set({ ...state, cart: { ...state.cart, [slug]: 1 } }), // digital: qty 1
  remove: (slug: string) => { const c = { ...state.cart }; delete c[slug]; set({ ...state, cart: c }); },
  clear: () => set({ ...state, cart: {}, code: "" }),
  toggleWish: (slug: string) =>
    set({ ...state, wishlist: state.wishlist.includes(slug) ? state.wishlist.filter((s) => s !== slug) : [...state.wishlist, slug] }),
  setCode: (code: string) => set({ ...state, code: code.toUpperCase() }),
};

/** Pricing: "Buy 3, get 1 free" — every 4th item (cheapest first) is free. */
export function totals(s: State, products: Product[]) {
  const items = products.filter((p) => s.cart[p.slug]);
  const subtotal = items.reduce((a, p) => a + p.price, 0);
  const sorted = [...items].sort((a, b) => a.price - b.price);
  const freeCount = Math.floor(items.length / 4);
  const bundle = sorted.slice(0, freeCount).reduce((a, p) => a + p.price, 0);
  const pct = discountCodes[s.code] ?? 0;
  const discount = ((subtotal - bundle) * pct) / 100;
  return { items, subtotal, bundle, pct, discount, total: Math.max(0, subtotal - bundle - discount) };
}
export const money = (n: number) => `$${n.toFixed(2)}`;
