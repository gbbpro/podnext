import { fetchAllArticles } from "@/lib/feeds";
import { cacheGet, cacheSet } from "@/lib/cache";
import Header from "@/components/Header";
import ArticleCard from "@/components/ArticleCard";
import Link from "next/link";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = (searchParams.q ?? "").trim();

  if (!query) {
    return (
      <>
        <Header />
        <main className="container">
          <p className="empty-state">No search query provided.</p>
        </main>
      </>
    );
  }

  const cacheKey = "search:" + crypto.createHash("md5").update(query).digest("hex");

  let results = await cacheGet<Awaited<ReturnType<typeof fetchAllArticles>>>(cacheKey);
  if (!results) {
    const all = await fetchAllArticles();
    results = all.filter((a) =>
      a.title.toLowerCase().includes(query.toLowerCase())
    );
    await cacheSet(cacheKey, results, 3600);
  }

  return (
    <>
      <Header />
      <main className="container">
        <div className="results-header">
          <p className="results-label">Search results</p>
          <p className="results-query">"{query}"</p>
          <p className="results-count">{results.length} episode{results.length !== 1 ? "s" : ""} found</p>
        </div>

        {results.length === 0 ? (
          <p className="empty-state">No episodes match your search.</p>
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
