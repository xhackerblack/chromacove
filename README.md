# ChromaCove Coloring

Mobile-first storefront for digital coloring books and printables. Built with
[TanStack Start](https://tanstack.com/start), React 19, Tailwind CSS v4 and
Supabase. Deploys to [Cloudflare Workers](https://workers.cloudflare.com/).

## Development

You need [Bun](https://bun.sh) (or Node.js + npm).

```sh
git clone https://github.com/xhackerblack/chromacove.git
cd chromacove
cp .env.example .env   # then fill in your Supabase values
bun install
bun run dev
```

Other commands:

| Command             | What it does                                                |
| ------------------- | ----------------------------------------------------------- |
| `bun run dev`       | Start the dev server                                        |
| `bun run build`     | Production build (`.output/`, Cloudflare Worker bundle)    |
| `bun run typecheck` | TypeScript check                                            |
| `bun run lint`      | ESLint                                                      |
| `bun run test`      | Vitest                                                      |

## Deploy to Cloudflare Workers

1. Install Wrangler and log in:
   ```sh
   npm i -g wrangler
   wrangler login
   ```
2. Put your real Supabase values in `wrangler.jsonc` (`vars`), or set them in
   the Cloudflare dashboard. For the service-role key (server admin client):
   ```sh
   wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   ```
3. Build and deploy:
   ```sh
   bun run deploy
   ```
   This runs `vite build` (Nitro `cloudflare-module` preset, output in
   `.output/`) and then `wrangler deploy --config .output/server/wrangler.json`.

Notes:

- Server code reads `process.env.*` — on Workers this is auto-populated from
  worker vars/secrets because `nodejs_compat` is enabled with a
  `compatibility_date` after 2025-04-01.
- Client code uses `import.meta.env.VITE_*`, inlined at build time from your
  local `.env`.

## Built with

- TanStack Start / TanStack Router
- TypeScript (strict)
- React 19
- Tailwind CSS v4
- Supabase
