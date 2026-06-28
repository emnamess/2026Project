"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlist } from "@/lib/actions/wishlist";

export function WishlistButton({
  productId,
  initialSaved,
  isLoggedIn,
}: {
  productId: string;
  initialSaved: boolean;
  isLoggedIn: boolean;
}) {
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    if (!isLoggedIn) {
      router.push("/connexion");
      return;
    }
    startTransition(async () => {
      const result = await toggleWishlist(productId);
      if ("saved" in result) setSaved(result.saved ?? false);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      aria-label={saved ? "Retirer des favoris" : "Ajouter aux favoris"}
      className="w-full h-12 border border-neutral-200 text-neutral-700 text-sm hover:bg-neutral-50 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={saved ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.5"
        className={saved ? "text-red-500" : "text-neutral-400"}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {saved ? "Sauvegardé" : "Ajouter aux favoris"}
    </button>
  );
}
