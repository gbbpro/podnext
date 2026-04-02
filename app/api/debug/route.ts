import { NextResponse } from "next/server";
import { cacheGet } from "@/lib/cache";

export const dynamic = "force-dynamic";

export default async function GET() {
  const feeds = await cacheGet("user_feeds");
  const version = await cacheGet("user_feeds_version");

  return NextResponse.json({
    feeds,
    version,
    feedCount: Array.isArray(feeds) ? feeds.length : null,
  });
}
