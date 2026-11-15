/**
 * Fixed-window rate limiter kept in memory.
 *
 * On Cloudflare Workers each running copy has its own memory, so this is a
 * first line of defence, not a hard guarantee. The hard limits are:
 *  - a Cloudflare rate-limiting rule on /api/* (see docs/DEPLOY.md), and
 *  - the per-conversation daily message cap in the assistant (stored in the database).
 */
export class FixedWindowLimiter {
  private hits = new Map<string, { count: number; resetAt: number }>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  /** Records one hit for `key`. Returns whether it is allowed and, if not, when to retry. */
  hit(key: string): { ok: true } | { ok: false; retryAfterSec: number } {
    const t = this.now();
    const entry = this.hits.get(key);
    if (!entry || entry.resetAt <= t) {
      this.hits.set(key, { count: 1, resetAt: t + this.windowMs });
      this.sweep(t);
      return { ok: true };
    }
    if (entry.count < this.limit) {
      entry.count += 1;
      return { ok: true };
    }
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((entry.resetAt - t) / 1000)) };
  }

  /** Drops expired keys so memory stays small. */
  private sweep(t: number) {
    if (this.hits.size < 5000) return;
    for (const [k, v] of this.hits) if (v.resetAt <= t) this.hits.delete(k);
  }
}
