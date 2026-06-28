"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/store/cart";

const navLinks = [
  { label: "Produits", href: "/produits" },
  { label: "Collections", href: "/produits" },
  { label: "À Propos", href: "/#story" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const count = useCart((s) => s.count());
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user;
  const router = useRouter();

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  function handleSearch(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = searchRef.current?.value.trim();
    if (q) router.push(`/produits?q=${encodeURIComponent(q)}`);
    setSearchOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href="/" className="text-lg font-semibold tracking-widest uppercase shrink-0">
            Artisan.TN
          </Link>

          {/* Expanding search bar (desktop) */}
          {searchOpen ? (
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-lg mx-auto">
              <div className="relative w-full">
                <input
                  ref={searchRef}
                  type="search"
                  placeholder="Rechercher un produit…"
                  className="w-full h-9 pl-9 pr-10 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-500"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <button
                  type="button"
                  onClick={() => setSearchOpen(false)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </form>
          ) : (
            /* Desktop nav */
            <nav className="hidden md:flex items-center gap-8 flex-1 justify-center">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          )}

          {/* Right icons */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Search icon (desktop) */}
            <button
              aria-label="Rechercher"
              onClick={() => setSearchOpen((v) => !v)}
              className="hidden md:flex text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Account */}
            {isLoggedIn ? (
              <Link href="/compte" aria-label="Mon compte" className="hidden md:flex text-neutral-600 hover:text-neutral-900 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            ) : (
              <Link href="/connexion" className="hidden md:flex text-sm text-neutral-600 hover:text-neutral-900 transition-colors">
                Connexion
              </Link>
            )}

            {/* Cart */}
            <Link href="/panier" aria-label="Panier" className="relative text-neutral-600 hover:text-neutral-900 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {count > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-neutral-900 text-white text-[10px] font-medium rounded-full flex items-center justify-center leading-none">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            {/* Mobile menu button */}
            <button
              aria-label="Menu"
              className="md:hidden text-neutral-600 hover:text-neutral-900"
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="4" y1="8" x2="20" y2="8" />
                  <line x1="4" y1="16" x2="20" y2="16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-neutral-200 bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4 space-y-4">
            {/* Mobile search */}
            <form action="/produits" method="get">
              <div className="relative">
                <input
                  name="q"
                  type="search"
                  placeholder="Rechercher…"
                  className="w-full h-10 pl-9 pr-4 rounded-lg border border-neutral-200 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
                />
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </div>
            </form>

            <nav className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <Link key={link.label} href={link.href} className="text-sm text-neutral-700 hover:text-neutral-900" onClick={() => setMenuOpen(false)}>
                  {link.label}
                </Link>
              ))}
              <hr className="border-neutral-100" />
              {isLoggedIn ? (
                <Link href="/compte" className="text-sm text-neutral-700" onClick={() => setMenuOpen(false)}>Mon compte</Link>
              ) : (
                <>
                  <Link href="/connexion" className="text-sm text-neutral-700" onClick={() => setMenuOpen(false)}>Connexion</Link>
                  <Link href="/inscription" className="text-sm text-neutral-700" onClick={() => setMenuOpen(false)}>Créer un compte</Link>
                </>
              )}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
