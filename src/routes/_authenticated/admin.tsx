import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { themes } from "@/data/products";
import { productsQuery } from "@/lib/catalog";

/**
 * ADMIN DASHBOARD — add/edit products, upload PDFs, moderate reviews.
 * Access is enforced by the database: only accounts with the admin role can save.
 */
export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin | ChromaCove" }, { name: "robots", content: "noindex" }] }),
  component: Admin,
});

type Row = {
  id: string; slug: string; name: string; audience: string; theme: string; age: string; difficulty: string;
  pages: number; price: number; bestseller: boolean; short: string; description: string; color: string;
  pdf_path: string | null; active: boolean;
};
type ReviewRow = { id: string; product_slug: string; name: string; rating: number; text: string };

const blank: Omit<Row, "id"> = {
  slug: "", name: "", audience: "adults", theme: "mandala", age: "16+", difficulty: "Easy", pages: 20, price: 5.99,
  bestseller: false, short: "", description: "", color: "f6c9b8", pdf_path: null, active: true,
};

const schema = z.object({
  slug: z.string().regex(/^[a-z0-9-]{2,80}$/, "Web address: lowercase letters, numbers and dashes only"),
  name: z.string().trim().min(1, "Name is required").max(120),
  audience: z.enum(["adults", "kids"]),
  theme: z.enum(["mandala", "animals", "flowers", "fantasy", "dinosaurs", "alphabet"]),
  age: z.string().trim().min(1).max(10),
  difficulty: z.enum(["Easy", "Medium", "Detailed"]),
  pages: z.coerce.number().int().positive(),
  price: z.coerce.number().min(0),
  bestseller: z.boolean(),
  short: z.string().max(200),
  description: z.string().max(4000),
  color: z.string().regex(/^[0-9a-fA-F]{6}$/, "Color must be a 6-digit hex like f6c9b8"),
  active: z.boolean(),
});

function Admin() {
  const nav = useNavigate();
  const qc = useQueryClient();
  const { user } = Route.useRouteContext();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [edit, setEdit] = useState<(Omit<Row, "id"> & { id?: string }) | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [msg, setMsg] = useState("");

  async function load() {
    const [p, r] = await Promise.all([
      supabase.from("products").select("*").order("created_at"),
      supabase.from("reviews").select("id,product_slug,name,rating,text").order("created_at", { ascending: false }).limit(50),
    ]);
    setRows((p.data ?? []).map((x) => ({ ...x, price: Number(x.price) })) as Row[]);
    setReviews((r.data ?? []) as ReviewRow[]);
  }

  useEffect(() => {
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(!!data);
      if (data) load();
    });
  }, [user.id]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!edit) return;
    const parsed = schema.safeParse(edit);
    if (!parsed.success) return setMsg(parsed.error.issues[0]?.message ?? "Check the form");
    setMsg("Saving…");
    let pdf_path = edit.pdf_path;
    if (file) {
      if (file.type !== "application/pdf") return setMsg("Please choose a PDF file.");
      pdf_path = `${parsed.data.slug}/${Date.now()}.pdf`;
      const up = await supabase.storage.from("books").upload(pdf_path, file, { contentType: "application/pdf" });
      if (up.error) return setMsg(`Upload failed: ${up.error.message}`);
    }
    const payload = { ...parsed.data, pdf_path };
    const res = edit.id
      ? await supabase.from("products").update(payload).eq("id", edit.id)
      : await supabase.from("products").insert(payload);
    if (res.error) return setMsg(res.error.message.includes("duplicate") ? "That web address is already used." : res.error.message);
    setMsg("Saved!");
    setEdit(null); setFile(null);
    await Promise.all([load(), qc.invalidateQueries({ queryKey: productsQuery.queryKey })]);
  }

  async function remove(id: string) {
    if (!confirm("Delete this product and its reviews?")) return;
    await supabase.from("products").delete().eq("id", id);
    await Promise.all([load(), qc.invalidateQueries({ queryKey: productsQuery.queryKey })]);
  }

  async function removeReview(id: string) {
    await supabase.from("reviews").delete().eq("id", id);
    await Promise.all([load(), qc.invalidateQueries({ queryKey: productsQuery.queryKey })]);
  }

  async function signOut() {
    await supabase.auth.signOut();
    qc.clear();
    nav({ to: "/" });
  }

  if (isAdmin === null) return <p className="p-10 text-center">Loading…</p>;
  if (!isAdmin) return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-3xl font-bold">No admin access</h1>
      <p className="mt-2 text-muted-foreground">You're signed in as {user.email}, but this account isn't a store admin yet.</p>
      <button onClick={signOut} className="btn-teal mt-6">Sign out</button>
    </div>
  );

  const f = "min-h-11 w-full rounded-xl border-2 border-foreground/15 bg-card px-3";
  const set = (patch: Partial<Row>) => setEdit((e) => (e ? { ...e, ...patch } : e));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-4xl font-bold">Store admin</h1>
        <div className="flex gap-2">
          <button className="btn-primary" onClick={() => { setEdit({ ...blank }); setFile(null); setMsg(""); }}>+ New product</button>
          <button className="btn-teal" onClick={signOut}>Sign out</button>
        </div>
      </div>

      {edit && (
        <form onSubmit={save} className="mt-6 grid gap-3 rounded-3xl bg-card p-5 shadow-soft md:grid-cols-2">
          <h2 className="text-2xl font-bold md:col-span-2">{edit.id ? `Edit ${edit.name}` : "New product"}</h2>
          <L t="Name"><input className={f} value={edit.name} onChange={(e) => set({ name: e.target.value })} /></L>
          <L t="Web address (e.g. ocean-dreams)"><input className={f} value={edit.slug} onChange={(e) => set({ slug: e.target.value.toLowerCase() })} /></L>
          <L t="For"><select className={f} value={edit.audience} onChange={(e) => set({ audience: e.target.value })}><option value="adults">Adults</option><option value="kids">Kids</option></select></L>
          <L t="Theme"><select className={f} value={edit.theme} onChange={(e) => set({ theme: e.target.value })}>{themes.map((t) => <option key={t}>{t}</option>)}</select></L>
          <L t="Age"><input className={f} value={edit.age} onChange={(e) => set({ age: e.target.value })} /></L>
          <L t="Difficulty"><select className={f} value={edit.difficulty} onChange={(e) => set({ difficulty: e.target.value })}>{["Easy", "Medium", "Detailed"].map((d) => <option key={d}>{d}</option>)}</select></L>
          <L t="Pages"><input type="number" className={f} value={edit.pages} onChange={(e) => set({ pages: Number(e.target.value) })} /></L>
          <L t="Price (USD)"><input type="number" step="0.01" className={f} value={edit.price} onChange={(e) => set({ price: Number(e.target.value) })} /></L>
          <L t="Preview color (hex)"><input className={f} value={edit.color} onChange={(e) => set({ color: e.target.value.replace("#", "") })} /></L>
          <L t="PDF book file">
            <input type="file" accept="application/pdf" className={`${f} py-2`} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <span className="text-xs text-muted-foreground">{edit.pdf_path ? "A PDF is uploaded — choose a file to replace it." : "No PDF uploaded yet."}</span>
          </L>
          <L t="Short tagline" wide><input className={f} value={edit.short} onChange={(e) => set({ short: e.target.value })} /></L>
          <L t="Description" wide><textarea rows={4} className={`${f} py-2`} value={edit.description} onChange={(e) => set({ description: e.target.value })} /></L>
          <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={edit.bestseller} onChange={(e) => set({ bestseller: e.target.checked })} /> Bestseller</label>
          <label className="flex items-center gap-2 font-semibold"><input type="checkbox" checked={edit.active} onChange={(e) => set({ active: e.target.checked })} /> Visible in shop</label>
          <div className="flex gap-2 md:col-span-2">
            <button className="btn-primary">Save</button>
            <button type="button" className="rounded-full px-5 font-semibold" onClick={() => setEdit(null)}>Cancel</button>
          </div>
        </form>
      )}
      {msg && <p role="status" className="mt-3 font-semibold">{msg}</p>}

      <h2 className="mt-10 text-2xl font-bold">Products ({rows.length})</h2>
      <ul className="mt-3 divide-y divide-foreground/10 rounded-3xl bg-card shadow-soft">
        {rows.map((r) => (
          <li key={r.id} className="flex flex-wrap items-center gap-3 p-4">
            <span className="h-10 w-8 rounded" style={{ background: `#${r.color}` }} aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold">{r.name} {!r.active && <span className="text-xs text-muted-foreground">(hidden)</span>}</p>
              <p className="text-sm text-muted-foreground">{r.audience} · {r.theme} · ${r.price.toFixed(2)} · {r.pdf_path ? "PDF ✓" : "no PDF"}</p>
            </div>
            <button className="font-semibold text-secondary underline" onClick={() => { setEdit(r); setFile(null); setMsg(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Edit</button>
            <button className="font-semibold text-destructive underline" onClick={() => remove(r.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-2xl font-bold">Latest reviews</h2>
      <ul className="mt-3 space-y-2">
        {reviews.map((r) => (
          <li key={r.id} className="flex items-start gap-3 rounded-2xl bg-card p-4 shadow-soft">
            <div className="flex-1"><p className="text-sm text-muted-foreground">{r.product_slug} · {r.rating}★ · {r.name}</p><p>{r.text}</p></div>
            <button className="text-sm font-semibold text-destructive underline" onClick={() => removeReview(r.id)}>Remove</button>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 text-2xl font-bold">Orders</h2>
      <p className="mt-2 text-muted-foreground">Orders will appear here once payments are connected.</p>
    </div>
  );
}

function L({ t, wide, children }: { t: string; wide?: boolean; children: React.ReactNode }) {
  return <label className={`flex flex-col gap-1 text-sm font-semibold ${wide ? "md:col-span-2" : ""}`}>{t}{children}</label>;
}
