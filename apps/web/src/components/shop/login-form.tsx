"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const result = await signIn("credentials", {
      email: fd.get("email"),
      password: fd.get("password"),
      redirect: false,
    });
    if (result?.error) {
      setError("Email ou mot de passe incorrect.");
      setLoading(false);
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full h-10 rounded border border-neutral-200 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">Mot de passe</label>
        <input
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="w-full h-10 rounded border border-neutral-200 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-10 bg-neutral-900 text-white text-sm hover:bg-neutral-700 disabled:opacity-60 transition-colors rounded"
      >
        {loading ? "Connexion…" : "Se connecter"}
      </button>

      <p className="text-center text-xs text-neutral-500">
        Pas encore de compte ?{" "}
        <Link href="/inscription" className="text-neutral-800 underline">
          Créer un compte
        </Link>
      </p>
    </form>
  );
}
