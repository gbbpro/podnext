import { Article, formatDuration } from "@/lib/feeds";

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ArticleCard({ article }: { article: Article }) {
  // Prefer the enclosure audio URL; fall back to the webpage link
  const href = article.enclosure?.url || article.link;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="article-card"
    >
      <div style={{ minWidth: 0 }}>
        <div className="article-source-tag">{article.source}</div>
        <div className="article-meta">
          <span className="article-date">{formatDate(article.isoDate)}</span>
        </div>
        <h2 className="article-title">{article.title}</h2>
        {article.summary && (
          <p className="article-summary">{article.summary}</p>
        )}
      </div>
      <div className="article-right">
        {article.duration && (
          <div className="article-duration">{formatDuration(article.duration)}</div>
        )}
        {article.enclosure?.url && (
          <div className="article-play-hint">▶ audio</div>
        )}
      </div>
    </a>
  );
}
