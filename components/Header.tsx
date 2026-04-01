"use client";
import { useRouter, usePathname } from "next/navigation";
import { useState } from "react";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  function handleDate(e: React.FormEvent) {
    e.preventDefault();
    if (date) router.push(`/search-date?date=${date}`);
  }

  return (
    <header className="site-header">
      <div className="container">
        <div className="site-header__inner">
          <Link href="/" className="site-logo">
            <span className="site-logo-dot" />
            PodFeed
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
