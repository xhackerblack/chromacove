import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";

/** Store-owner sign in / sign up. */
export const Route = createFileRoute("/auth")({
  head: () => ({ meta: [{ title: "Sign in | ChromaCove" }, { name: "robots", content: "noindex" }] }),
  component: AuthPage,
});

const schema = z.object({ email: z.string().trim().email().max(255), password: z.string().min(8, "Password must be at least 8 characters").max(72) });

function AuthPage() {
  const nav = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [form, setForm] = useState({ email: "", password: "" });
  const [msg, setMsg] = useState("");
  const f = "min-h-12 w-full rounded-2xl border-2 border-foreground/15 bg-card px-4";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) return setMsg(parsed.error.issues[0]?.message ?? "Check your details");
    setMsg("…");
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) return setMsg(error.message);
      nav({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signUp({ ...parsed.data, options: { emailRedirectTo: `${window.location.origin}/admin` } });
      setMsg(error ? error.message : "Check your email to confirm your account, then sign in.");
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16">
      <h1 className="text-4xl font-bold">{mode === "in" ? "Sign in" : "Create account"}</h1>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input aria-label="Email" type="email" placeholder="Email" className={f} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <input aria-label="Password" type="password" placeholder="Password" className={f} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <button className="btn-primary w-full">{mode === "in" ? "Sign in" : "Sign up"}</button>
        {msg && <p role="status" className="text-sm">{msg}</p>}
      </form>
      <button className="mt-4 text-sm font-semibold underline" onClick={() => { setMode(mode === "in" ? "up" : "in"); setMsg(""); }}>
        {mode === "in" ? "No account? Sign up" : "Have an account? Sign in"}
      </button>
    </div>
  );
}
