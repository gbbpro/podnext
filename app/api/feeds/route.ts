import { NextRequest, NextResponse } from "next/server";
import { getFeeds, saveFeeds, bustArticleCache, Feed } from "@/lib/feeds";

// GET /api/feeds — always fresh, no caching
export async function GET() {
  const feeds = await getFeeds();
  return NextResponse.json(feeds, {
    headers: { "Cache-Control": "no-store" },
  });
}

// POST /api/feeds — add a new feed { name, url }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = (body.name ?? "").trim();
  const url = (body.url ?? "").trim();

  if (!name || !url) {
    return NextResponse.json({ error: "name and url are required" }, { status: 400 });
  }

  try {
    new URL(url);
  } catch {
    return NextResponse.json({ error: "Invalid URL" }, { status: 400 });
  }

  const feeds = await getFeeds();

  if (feeds.some((f) => f.url === url)) {
    return NextResponse.json({ error: "Feed already exists" }, { status: 409 });
  }

  const updated: Feed[] = [...feeds, { name, url }];
  await saveFeeds(updated);
  await bustArticleCache();

  return NextResponse.json(updated, {
    status: 201,
    headers: { "Cache-Control": "no-store" },
  });
}

// DELETE /api/feeds — remove a feed by url
export async function DELETE(req: NextRequest) {
  const body = await req.json();
  const url = (body.url ?? "").trim();

  if (!url) {
    return NextResponse.json({ error: "url is required" }, { status: 400 });
  }

  const feeds = await getFeeds();
  const updated = feeds.filter((f) => f.url !== url);

  if (updated.length === feeds.length) {
    return NextResponse.json({ error: "Feed not found" }, { status: 404 });
  }

  await saveFeeds(updated);
  await bustArticleCache();

  return NextResponse.json(updated, {
    headers: { "Cache-Control": "no-store" },
  });
}
