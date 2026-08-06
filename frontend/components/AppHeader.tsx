"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigationItems = [
  { href: "/", label: "Dashboard", section: "dashboard" },
  { href: "/calculator", label: "Calculator", section: "calculator" },
  { href: "/goals", label: "Goals", section: "goals" }
];

export default function AppHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="app-header">
      <div className="header-brand-row">
        <Link className="brand-link" href="/">
          <span className="brand-mark" aria-hidden="true">
            IW
          </span>
          <span>InvestWise</span>
        </Link>
        <button
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation menu"
          className="menu-button"
          onClick={() => setIsMenuOpen((currentValue) => !currentValue)}
          type="button"
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>
      <nav
        aria-label="Primary navigation"
        className="primary-nav"
        data-open={isMenuOpen}
      >
        <ul className="nav-list">
          {navigationItems.map((item) => {
            const isActive =
              item.section === "dashboard"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <li key={item.href}>
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className="nav-link"
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <button
        aria-label="Account profile placeholder"
        className="profile-button"
        type="button"
      >
        A
      </button>
    </header>
  );
}
