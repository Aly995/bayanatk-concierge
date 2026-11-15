# Deploy to demo.bayanatk.com (Cloudflare Workers)

The app runs as a Cloudflare Worker, like bayanatk.com, and redeploys automatically
every time you push to GitHub. Build and runtime were tested locally on Cloudflare's
runtime (`wrangler dev`) before this guide was written.

## One-time setup (about 15 minutes)

### 1. Put the project on GitHub
In the `hotel-ai-assistant` folder:

```bash
git init
git add .
git commit -m "Bayanatk Concierge v0.1"
```

Create an empty repository on github.com named `bayanatk-concierge` (private is fine), then:

```bash
git remote add origin https://github.com/<your-user>/bayanatk-concierge.git
git branch -M main
git push -u origin main
```

`.gitignore` already keeps out `node_modules`, build output and secret files (`.env.local`, `.dev.vars`).

### 2. Create the Worker from the repository
Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository** → choose
`bayanatk-concierge`, then set:

| Setting | Value |
|---|---|
| Project / Worker name | `bayanatk-concierge` (must match `name` in `wrangler.jsonc`) |
| Build command | `npx opennextjs-cloudflare build` |
| Deploy command | `npx opennextjs-cloudflare deploy` |

Click **Deploy**.

### 3. Address: demo.bayanatk.com
`wrangler.jsonc` asks Cloudflare to serve the Worker at `demo.bayanatk.com` and create the DNS
record automatically, because bayanatk.com is in the same Cloudflare account.
If it doesn't appear: Worker → **Settings** → **Domains & Routes** → **Add** → Custom domain →
`demo.bayanatk.com`.

### 4. Secrets
Worker → **Settings** → **Variables and Secrets** → add as **Secret** (encrypted):

| Name | Needed | Why |
|---|---|---|
| `STAFF_ACCESS_KEY` | Yes | Locks every real hotel's staff inbox. Use a long random value. |
| `SUPABASE_SERVICE_ROLE_KEY` | Before showing hotels | Saves conversations (see note below). `SUPABASE_URL` is already set in `wrangler.jsonc`. |
| `ANTHROPIC_API_KEY` | When you want real AI | Without it the demo uses offline replies |

The demo hotel (`demo-madinah`) stays open to everyone through `PUBLIC_DEMO_HOTEL_SLUG` in
`wrangler.jsonc`, so website visitors can try both the guest chat and the staff inbox.

> **Important: connect Supabase before you send the link to hotels.** Without a database,
> conversations live in the Worker's memory. Cloudflare can run several copies of the Worker
> and restarts them when idle, so a guest's message may not show up in the staff inbox, or may
> disappear after a few minutes. Supabase (free plan) fixes this:
> in the Supabase SQL editor run, in order, `supabase/migrations/0001_init.sql`,
> `supabase/migrations/0002_website_and_retention.sql`, `supabase/seed.sql` and `supabase/seed_site.sql`,
> then add the Supabase secret above.

### 5. Add the demo to bayanatk.com
Copy the section in `docs/bayanatk-demo-section.html` into your website's code where you
show your work, commit and push. Your existing Cloudflare deployment publishes it.

### 6. Protection and clean-up (before real guests)
**Rate limiting rule.** The app already limits each visitor, but per Worker copy. Add Cloudflare's own
limit: Cloudflare dashboard → bayanatk.com → **Security** → **WAF** → **Rate limiting rules** → Create:
- If incoming requests match: Hostname equals `demo.bayanatk.com`, URI Path starts with `/api/hotels/`,
  Request Method equals `POST`
- Same characteristics: IP. When rate exceeds: 10 requests per 10 seconds. Action: Block.

The Free plan includes one such rule with a 10-second window.

**Delete old data automatically.** Supabase → **Integrations** → **Cron** → enable, then in the SQL editor:

```sql
select cron.schedule('purge-guest-data', '15 3 * * *', $$select public.purge_old_guest_data(90, 365)$$);
```

This deletes chats 90 days after the last message and booking requests after 365 days, every night
at 03:15 UTC. Keep the numbers equal to `DATA_RETENTION_DAYS` and `BOOKING_RETENTION_DAYS`, which the
privacy notice shows to guests.

## After setup
- Every `git push` to `main` redeploys `demo.bayanatk.com` automatically.
- Logs: Worker → **Observability** (turned on in `wrangler.jsonc`).
- Try a build on your laptop first: `npm run cf:preview` runs the Worker locally on Cloudflare's runtime.

## Links to share
| Who | Link |
|---|---|
| Anyone (public demo) | `https://demo.bayanatk.com` |
| Sample hotel website | `https://demo.bayanatk.com/site/demo-madinah` (opens Arabic for Arabic browsers) |
| Guests of a pilot hotel (QR code) | `https://demo.bayanatk.com/h/<hotel-slug>` |
| Staff of a pilot hotel | `https://demo.bayanatk.com/dashboard/<hotel-slug>?key=<STAFF_ACCESS_KEY>` |

Before a real pilot, replace the shared staff key with staff logins (see `docs/ROADMAP.md`).
