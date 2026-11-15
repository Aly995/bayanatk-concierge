import { NextResponse } from "next/server";

/** /site/<hotel> sends Arabic-speaking browsers to the Arabic site, everyone else to English. */
export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const prefersArabic = /^\s*ar\b/i.test(req.headers.get("accept-language") ?? "");
  const res = NextResponse.redirect(new URL(`/site/${encodeURIComponent(slug)}/${prefersArabic ? "ar" : "en"}`, req.url), 307);
  res.headers.set("Vary", "Accept-Language");
  return res;
}
