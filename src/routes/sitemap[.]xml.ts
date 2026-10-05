import { createFileRoute } from "@tanstack/react-router";

/** Auto-generated sitemap at /sitemap.xml (includes every active product). */
export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const origin = new URL(request.url).origin;
        let slugs: string[] = [];
        try {
          const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
          const res = await fetch(`${process.env["SUPABASE_URL"]}/rest/v1/products?select=slug&active=eq.true`, { headers: { apikey: key } });
          if (res.ok) slugs = ((await res.json()) as { slug: string }[]).map((r) => r.slug);
        } catch { /* fall back to static pages only */ }
        const paths = ["/", "/shop", "/free-printables", "/blog", "/about", "/contact", "/shipping-returns", "/privacy", "/terms",
          ...slugs.map((s) => `/product/${s}`)];
        const xml = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map((p) => `<url><loc>${origin}${p}</loc></url>`).join("")}</urlset>`;
        return new Response(xml, { headers: { "content-type": "application/xml" } });
      },
    },
  },
});
