"use client";

import { useState } from "react";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  }

  return (
    <section className="bg-neutral-900 text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 flex flex-col items-center text-center">
        <h2 className="text-2xl md:text-3xl font-semibold tracking-tight">
          Restez Informé
        </h2>
        <p className="mt-3 text-sm text-neutral-400 max-w-sm">
          Nouvelles collections, histoires d&apos;artisans, offres exclusives — directement dans votre boîte mail.
        </p>

        {submitted ? (
          <p className="mt-8 text-sm text-neutral-300">
            Merci ! Vous êtes maintenant abonné.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-8 flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <input
              type="email"
              required
              placeholder="votre@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12 px-4 bg-neutral-800 text-white placeholder:text-neutral-500 text-sm border border-neutral-700 focus:outline-none focus:border-white transition-colors"
            />
            <button
              type="submit"
              className="h-12 px-6 bg-white text-neutral-900 text-sm font-medium hover:bg-neutral-200 transition-colors whitespace-nowrap"
            >
              S&apos;abonner
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
