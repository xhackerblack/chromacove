/** Loads the product catalog (with reviews) from Lovable Cloud. */
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Product } from "@/data/products";

export const productsQuery = queryOptions({
  queryKey: ["products"],
  queryFn: async (): Promise<Product[]> => {
    const { data, error } = await supabase
      .from("products")
      .select(
        "slug,name,audience,theme,age,difficulty,pages,price,bestseller,short,description,color,reviews(id,name,rating,text,created_at)",
      )
      .eq("active", true)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (data ?? []).map((p) => ({
      ...p,
      price: Number(p.price),
      audience: p.audience as Product["audience"],
      theme: p.theme as Product["theme"],
      difficulty: p.difficulty as Product["difficulty"],
      reviews: [...(p.reviews ?? [])].sort((a, b) => a.created_at.localeCompare(b.created_at)),
    }));
  },
  staleTime: 60_000,
});

export const useProducts = () => useSuspenseQuery(productsQuery).data;
export const findProduct = (list: Product[], slug: string) => list.find((p) => p.slug === slug);
