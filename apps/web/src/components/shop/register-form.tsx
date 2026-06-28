"use client";

import { useState } from "react";
import Link from "next/link";
import { registerCustomer } from "@/lib/actions/auth";

export function RegisterForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await registerCustomer(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
    // on success, registerCustomer calls signIn which redirects to /compte
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">Prénom *</label>
          <input
            name="firstName"
            required
            autoComplete="given-name"
            className="w-full h-10 rounded border border-neutral-200 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-700 mb-1">Nom</label>
          <input
            name="lastName"
            autoComplete="family-name"
            className="w-full h-10 rounded border border-neutral-200 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-neutral-400"
          />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">Email *</label>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full h-10 rounded border border-neutral-200 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">Mot de passe * <span className="text-neutral-400 font-normal">(8 caractères min.)</span></label>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full h-10 rounded border border-neutral-200 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">Confirmer le mot de passe *</label>
        <input
          name="confirm"
          type="password"
          required
          autoComplete="new-password"
          className="w-full h-10 rounded border border-neutral-200 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
      </div>

      {error && <p className="text-xs text-red-600 bg-red-50 rounded px-3 py-2">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-10 bg-neutral-900 text-white text-sm hover:bg-neutral-700 disabled:opacity-60 transition-colors rounded"
      >
        {loading ? "Création…" : "Créer mon compte"}
      </button>

      <p className="text-center text-xs text-neutral-500">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="text-neutral-800 underline">
          Se connecter
        </Link>
      </p>
    </form>
  );
}
