import { createFileRoute } from "@tanstack/react-router";
import { PageShell, seo } from "@/components/site";

export const Route = createFileRoute("/about")({
  head: () => seo("About Us", "ChromaCove makes printable coloring books that help grown-ups unwind and kids imagine.", "/about"),
  component: () => (
    <PageShell title="About ChromaCove" intro="A tiny studio with a big box of crayons.">
      <p>ChromaCove started at a kitchen table: one parent sketching dinosaurs for a restless four-year-old, and the other doodling mandalas to unwind after work. Friends kept asking for copies, so we turned those sketches into books.</p>
      <p>Today every page is still drawn by hand, then cleaned up so it prints crisp at home. We make books for two kinds of people — grown-ups who need a quiet moment, and kids who need somewhere to put all those ideas.</p>
      <h2>What we believe</h2>
      <ul>
        <li>Screens off, colors on — even for ten minutes.</li>
        <li>Digital means instant, affordable and endlessly re-printable.</li>
        <li>No page is ever colored "wrong."</li>
      </ul>
    </PageShell>
  ),
});
