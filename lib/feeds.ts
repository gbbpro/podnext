import Parser from "rss-parser";
import { cacheGet, cacheSet, cacheDelete } from "./cache";

export interface Article {
  source: string;
  title: string;
  link: string;
  pubDate: string;
  isoDate: string;
  summary: string;
  duration?: string;
  enclosure?: { url: string; type: string };
}

export interface Feed {
  name: string;
  url: string;
}

export const DEFAULT_FEEDS: Feed[] = [
  { name: "PTFO", url: "https://feeds.megaphone.fm/LBE1877691396" },
  { name: "Nothing Personal", url: "https://feeds.megaphone.fm/npds" },
  { name: "Basketball Illuminati", url: "https://feeds.megaphone.fm/basketballilluminati" },
  { name: "Pivot", url: "https://feeds.megaphone.fm/pivot" },
  { name: "Cinephobe", url: "https://feeds.megaphone.fm/PDR6404381910" },
  {
    name: "Cautionary Tales",
    url: "https://www.omnycontent.com/d/playlist/e73c998e-6e60-432f-8610-ae210140c5b1/c0ae8c6e-22f0-4e9b-ac1c-ae390037ac53/7f5a4714-6b10-4ccf-a424-ae390037ac70/podcast.rss",
  },
  { name: "Today Explained", url: "https://feeds.megaphone.fm/VMP5705694065" },
  { name: "The Daily", url: "https://feeds.simplecast.com/Sl5CSM3S" },
];

const FEEDS_KEY = "user_feeds";

export async function getFeeds(): Promise<Feed[]> {
  const stored = await cacheGet<Feed[]>(FEEDS_KEY);
  return stored ?? DEFAULT_FEEDS;
}

export async function saveFeeds(feeds: Feed[]): Promise<void> {
  // Save feeds and clear all article caches atomically
  await cacheSet(FEEDS_KEY, feeds, 0);
  await clearAllArticleCaches();
}

// Derive a stable cache key from the feed URLs themselves.
// If the feed list changes, the key changes automatically — no separate version key needed.
export function getArticleCacheKey(feeds: Feed[]): string {
  const sig = feeds.map((f) => f.url).sort().join("|");
  let hash = 0;
  for (let i = 0; i < sig.length; i++) {
    hash = (hash * 31 + sig.charCodeAt(i)) & 0xffffffff;
  }
  return `articles_${Math.abs(hash)}`;
}

export async function clearAllArticleCaches(): Promise<void> {
  // Delete the legacy keys too in case they exist
  await cacheDelete("all_articles");
  await cacheDelete("all_articles_vdefault");
}

export async function bustArticleCache(): Promise<void> {
  await clearAllArticleCaches();
}

const parser = new Parser({
  customFields: {
    item: [
      ["itunes:duration", "duration"],
      ["itunes:summary", "itunesSummary"],
    ],
  },
});

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

// Truncate summaries before caching — episode descriptions can be huge
// and Upstash has a 10MB per-key limit. 300 chars is plenty for display.
function truncateSummary(text: string, max = 300): string {
  if (text.length <= max) return text;
  return text.slice(0, max).trimEnd() + "…";
}
export async function fetchAllArticles(feeds?: Feed[]): Promise<Article[]> {
  const feedList = feeds ?? (await getFeeds());

  const results = await Promise.allSettled(
    feedList.map(async ({ name, url }) => {
      const feed = await parser.parseURL(url);
      return feed.items.map((item) => ({
        source: name,
        title: item.title ?? "",
        link: item.link ?? "",
        pubDate: item.pubDate ?? "",
        isoDate: item.isoDate ?? item.pubDate ?? "",
        summary: stripHtml(
          item.contentSnippet ??
            (item as any).itunesSummary ??
            item.content ??
            ""
        ),
        duration: (item as any).duration,
        enclosure: item.enclosure as { url: string; type: string } | undefined,
      }));
    })
  );

  const articles: Article[] = [];
  for (const result of results) {
    if (result.status === "fulfilled") articles.push(...result.value);
  }
  return articles;
}

export function sortByDate(articles: Article[]): Article[] {
  return [...articles].sort(
    (a, b) => new Date(b.isoDate).getTime() - new Date(a.isoDate).getTime()
  );
}

export function formatDuration(duration?: string): string {
  if (!duration) return "";
  if (duration.includes(":")) return duration;
  const secs = parseInt(duration, 10);
  if (isNaN(secs)) return duration;
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}
