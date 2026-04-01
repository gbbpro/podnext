import { NextRequest, NextResponse } from "next/server";
import { getFeeds, saveFeeds, Feed } from "@/lib/feeds";
import { cacheDelete } from "@/lib/cache";

// GET /api/feeds — list all feeds
export async function GET() {
  const feeds = await getFeeds();
  return NextResponse.json(feeds);
}

// POST /api/feeds — add a new feed { name, url }
export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = (body.name ?? "").trim();
  const url = (body.url ?? "").trim();

  if (!name || !url) {
    return NextResponse.json({ error: "name and url are required" }, { status: 400 });
  }

  // Basic URL validation
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
  // Bust the article cache so the new feed is fetched next time
  await cacheDelete("all_articles");

  return NextResponse.json(updated, { status: 201 });
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
  await cacheDelete("all_articles");

  return NextResponse.json(updated);
}
