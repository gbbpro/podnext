import { fetchAllArticles, sortByDate, getFeeds, getFeedsVersion } from "@/lib/feeds";
import { cacheGet, cacheSet } from "@/lib/cache";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import Link from "next/link";

const PER_PAGE = 15;

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string; source?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));
  const activeSource = searchParams.source ?? "";

  // Always read feeds fresh from KV — drives both the dropdown and article fetch
  const feeds = await getFeeds();

  // Cache key includes the feeds version so any add/delete automatically
  // invalidates the article cache without needing an explicit delete
  const version = await getFeedsVersion();
  const cacheKey = `all_articles_v${version}`;

  let articles = await cacheGet<ReturnType<typeof sortByDate>>(cacheKey);
  if (!articles) {
    const raw = await fetchAllArticles(feeds);
    articles = sortByDate(raw);
    await cacheSet(cacheKey, articles, 3600);
  }

  const filtered = activeSource
    ? articles.filter((a) => a.source === activeSource)
    : articles;

  const total = filtered.length;
  const totalPages = Math.ceil(total / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const paginated = filtered.slice(start, start + PER_PAGE);

  const pageNums: number[] = [];
  for (let i = Math.max(1, page - 3); i <= Math.min(totalPages, page + 3); i++) {
    pageNums.push(i);
  }

  function pageUrl(n: number) {
    const params = new URLSearchParams();
    if (activeSource) params.set("source", activeSource);
    if (n > 1) params.set("page", String(n));
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  }

  return (
    <>
      <Header activeSource={activeSource} />
      <main className="container">
        <div className="article-list">
          {paginated.length === 0 ? (
            <p className="empty-state">
              No episodes found.{" "}
              <Link href="/feeds" style={{ color: "var(--accent)" }}>
                Add some feeds →
              </Link>
            </p>
          ) : (
            paginated.map((article, i) => (
              <ArticleCard
                key={`${article.source}-${article.link}-${i}`}
                article={article}
              />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <nav className="pagination" aria-label="Pagination">
            {page > 1 && <Link href={pageUrl(page - 1)}>← Prev</Link>}
            {pageNums.map((n) =>
              n === page ? (
                <span key={n} className="current">{n}</span>
              ) : (
                <Link key={n} href={pageUrl(n)}>{n}</Link>
              )
            )}
            {page < totalPages && <Link href={pageUrl(page + 1)}>Next →</Link>}
          </nav>
        )}
      </main>
    </>
  );
}
