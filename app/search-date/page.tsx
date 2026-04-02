import { fetchAllArticles, getFeeds, getArticleCacheKey } from "@/lib/feeds";
import { cacheGet, cacheSet } from "@/lib/cache";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import Link from "next/link";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export default async function SearchDatePage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const dateStr = (searchParams.date ?? "").trim();

  if (!dateStr) {
    return (
      <>
        <Header />
        <main className="container">
          <p className="empty-state">No date provided.</p>
        </main>
      </>
    );
  }

  const targetDate = new Date(dateStr);
  if (isNaN(targetDate.getTime())) {
    return (
      <>
        <Header />
        <main className="container">
          <p className="empty-state">Invalid date format.</p>
        </main>
      </>
    );
  }
const feeds = await getFeeds();
const feedSig = getArticleCacheKey(feeds);
const cacheKey = `search-date_${feedSig}_${crypto.createHash("md5").update(query).digest("hex")}`;
let results = await cacheGet<Awaited<ReturnType<typeof fetchAllArticles>>>(cacheKey);
if (!results) {
  const all = await fetchAllArticles(feeds);
    results = all.filter((a) => {
      const pub = new Date(a.isoDate);
      return (
        pub.getUTCFullYear() === targetDate.getUTCFullYear() &&
        pub.getUTCMonth() === targetDate.getUTCMonth() &&
        pub.getUTCDate() === targetDate.getUTCDate()
      );
    });
    await cacheSet(cacheKey, results, 3600);
  }

  const label = targetDate.toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC",
  });

  return (
    <>
      <Header />
      <main className="container">
        <div className="results-header">
          <p className="results-label">Episodes from</p>
          <p className="results-query">{label}</p>
          <p className="results-count">{results.length} episode{results.length !== 1 ? "s" : ""} published this day</p>
        </div>

        {results.length === 0 ? (
          <p className="empty-state">No episodes found for this date.</p>
        ) : (
          <div className="article-list">
            {results.map((article, i) => (
              <ArticleCard key={`${article.source}-${article.link}-${i}`} article={article} />
            ))}
          </div>
        )}

        <Link href="/" className="back-link">← Back to feed</Link>
      </main>
    </>
  );
}
