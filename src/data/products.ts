/**
 * PRODUCT TYPES & HELPERS.
 * Products and reviews now live in Lovable Cloud — manage them at /admin.
 * Images are placeholders (placehold.co) tinted with each product's `color`.
 */
export type Audience = "adults" | "kids";
export type Theme = "mandala" | "animals" | "flowers" | "fantasy" | "dinosaurs" | "alphabet";

export interface Review {
  id?: string;
  name: string;
  rating: number;
  text: string;
}
export interface Product {
  slug: string;
  name: string;
  audience: Audience;
  theme: Theme;
  age: string; // e.g. "16+", "4-7"
  difficulty: "Easy" | "Medium" | "Detailed";
  pages: number;
  price: number; // USD
  bestseller?: boolean;
  short: string;
  description: string;
  color: string; // placeholder background hex (no #)
  reviews: Review[];
}

const img = (color: string, label: string, i: number) =>
  `https://placehold.co/800x1000/${color}/2b2118/png?text=${encodeURIComponent(label + " · p" + i)}&font=raleway`;
export const productImages = (p: Product) => [1, 2, 3, 4].map((i) => img(p.color, p.name, i));

export const themes: Theme[] = [
  "mandala",
  "animals",
  "flowers",
  "fantasy",
  "dinosaurs",
  "alphabet",
];
export const avgRating = (p: Product) =>
  p.reviews.length ? p.reviews.reduce((s, r) => s + r.rating, 0) / p.reviews.length : 0;

/** DISCOUNT CODES — percent off the subtotal after bundles. */
export const discountCodes: Record<string, number> = { COVE10: 10, WELCOME15: 15 };
