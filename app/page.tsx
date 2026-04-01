import { fetchAllArticles, sortByDate, getFeeds } from "@/lib/feeds";
import { cacheGet, cacheSet } from "@/lib/cache";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import Link from "next/link";

const PER_PAGE = 15;
const CACHE_KEY = "all_articles";

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: { page?: string };
}) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1", 10));

  let articles = await cacheGet<ReturnType<typeof sortByDate>>(CACHE_KEY);
  if (!articles) {
    const raw = await fetchAllArticles();
    articles = sortByDate(raw);
    await cacheSet(CACHE_KEY, articles, 3600);
  }

  const total = articles.length;
  const totalPages = Math.ceil(total / PER_PAGE);
  const start = (page - 1) * PER_PAGE;
  const paginated = articles.slice(start, start + PER_PAGE);

  const pageNums: number[] = [];
  for (let i = Math.max(1, page - 3); i <= Math.min(totalPages, page + 3); i++) {
    pageNums.push(i);
  }

  return (
    <>
      <Header />
      <main className="container">
        <div className="article-list">
          {paginated.length === 0 ? (
            <p className="empty-state">No episodes found. <Link href="/feeds" style={{ color: "var(--accent)" }}>Add some feeds →</Link></p>
          ) : (
            paginated.map((article, i) => (
              <ArticleCard key={`${article.source}-${article.link}-${i}`} article={article} />
            ))
          )}
        </div>

        {totalPages > 1 && (
          <nav className="pagination" aria-label="Pagination">
            {page > 1 && <Link href={`/?page=${page - 1}`}>← Prev</Link>}
            {pageNums.map((n) =>
              n === page ? (
                <span key={n} className="current">{n}</span>
              ) : (
                <Link key={n} href={`/?page=${n}`}>{n}</Link>
              )
            )}
            {page < totalPages && <Link href={`/?page=${page + 1}`}>Next →</Link>}
          </nav>
        )}
      </main>
    </>
  );
}
