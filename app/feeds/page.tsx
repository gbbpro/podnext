"use client";
import { useEffect, useState } from "react";
import Header from "@/components/Header";

interface Feed {
  name: string;
  url: string;
}

export default function FeedsPage() {
  const [feeds, setFeeds] = useState<Feed[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [deletingUrl, setDeletingUrl] = useState<string | null>(null);

  async function loadFeeds() {
    const res = await fetch("/api/feeds");
    const data = await res.json();
    setFeeds(data);
    setLoading(false);
  }

  useEffect(() => {
    loadFeeds();
  }, []);

  function showMessage(type: "success" | "error", text: string) {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3500);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), url: url.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        showMessage("error", data.error ?? "Failed to add feed");
      } else {
        setFeeds(data);
        setName("");
        setUrl("");
        showMessage("success", "Feed added successfully");
      }
    } catch {
      showMessage("error", "Network error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(feedUrl: string) {
    setDeletingUrl(feedUrl);
    try {
      const res = await fetch("/api/feeds", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: feedUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        showMessage("error", data.error ?? "Failed to delete feed");
      } else {
        setFeeds(data);
        showMessage("success", "Feed removed");
      }
    } catch {
      showMessage("error", "Network error");
    } finally {
      setDeletingUrl(null);
    }
  }

  return (
    <>
      <Header />
      <main className="container">
        <div className="page-header">
          <h1 className="page-title">Manage feeds</h1>
          <p className="page-subtitle">
            Add or remove RSS podcast feeds. Changes apply to the main feed immediately.
          </p>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`}>{message.text}</div>
        )}

        <form className="add-feed-form" onSubmit={handleAdd}>
          <input
            type="text"
            placeholder="Feed name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="url"
            placeholder="RSS feed URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting || !name.trim() || !url.trim()}
          >
            {submitting ? "Adding…" : "Add feed"}
          </button>
        </form>

        {loading ? (
          <p className="empty-state">Loading…</p>
        ) : feeds.length === 0 ? (
          <p className="empty-state">No feeds yet. Add one above.</p>
        ) : (
          <>
            <p className="feed-count">{feeds.length} feed{feeds.length !== 1 ? "s" : ""}</p>
            <table className="feed-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>URL</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {feeds.map((feed) => (
                  <tr key={feed.url}>
                    <td>
                      <div className="feed-name">{feed.name}</div>
                    </td>
                    <td>
                      <a
                        href={feed.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="feed-url"
                        title={feed.url}
                        style={{ color: "var(--muted)" }}
                      >
                        {feed.url}
                      </a>
                    </td>
                    <td>
                      <button
                        className="btn btn-danger-ghost"
                        onClick={() => handleDelete(feed.url)}
                        disabled={deletingUrl === feed.url}
                      >
                        {deletingUrl === feed.url ? "Removing…" : "Remove"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </main>
    </>
  );
}
