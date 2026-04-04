"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import type { Feed } from "@/lib/feeds";

interface HeaderProps {
  activeSource?: string;
}

export default function Header({ activeSource = "" }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const [feeds, setFeeds] = useState<Feed[]>([]);

  // Always fetch fresh feed list from the API on mount and on every navigation
  useEffect(() => {
    fetch("/api/feeds", { cache: "no-store" })
      .then((r) => r.json())
      .then(setFeeds)
      .catch(() => {});
  }, [pathname]); // re-fetch whenever the route changes

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function handleDate(e: React.FormEvent) {
    e.preventDefault();
    if (date) router.push(`/search-date?date=${date}`);
  }

  function handleSourceChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const val = e.target.value;
    router.push(val ? `/?source=${encodeURIComponent(val)}` : "/");
  }

  return (
    <header className="site-header">
      <div className="container">
        <div className="site-header__inner">
          <Link href="/" className="site-logo">
            <span className="site-logo-dot" />
           810 Podcasts 
          </Link>
          <nav className="header-nav">
            <Link href="/" className={`nav-link${pathname === "/" ? " active" : ""}`}>
              Feed
            </Link>
            <Link href="/feeds" className={`nav-link${pathname === "/feeds" ? " active" : ""}`}>
              Manage feeds
            </Link>
          </nav>
        </div>
      </div>

      {pathname !== "/feeds" && (
        <div className="container">
          <div className="search-row">
            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search episodes…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>

            {feeds.length > 0 && (
              <select
                className={`source-select${activeSource ? " is-filtered" : ""}`}
                value={activeSource}
                onChange={handleSourceChange}
              >
                <option value="">All podcasts</option>
                {feeds.map((f) => (
                  <option key={f.url} value={f.name}>
                    {f.name}
                  </option>
                ))}
              </select>
            )}

            <form className="date-form" onSubmit={handleDate}>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
              <button type="submit">By date</button>
            </form>
          </div>
        </div>
      )}
    </header>
  );
}
