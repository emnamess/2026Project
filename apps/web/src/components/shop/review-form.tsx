"use client";

import { useState, useTransition } from "react";
import { submitReview } from "@/lib/actions/review";

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
          aria-label={`${star} étoile${star > 1 ? "s" : ""}`}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill={(hovered || value) >= star ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            className={(hovered || value) >= star ? "text-amber-400" : "text-neutral-300"}
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
    </div>
  );
}

const RATING_LABELS = ["", "Mauvais", "Médiocre", "Moyen", "Bien", "Excellent"];

export function ReviewForm({ productId }: { productId: string }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) { setErrorMsg("Veuillez sélectionner une note."); return; }
    setErrorMsg("");

    startTransition(async () => {
      try {
        await submitReview(productId, rating, comment);
        setStatus("success");
      } catch (err) {
        setErrorMsg(err instanceof Error ? err.message : "Une erreur est survenue.");
        setStatus("error");
      }
    });
  }

  if (status === "success") {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
        Votre avis a été envoyé et sera publié après modération. Merci !
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <p className="text-sm font-medium text-neutral-700 mb-2">Note</p>
        <div className="flex items-center gap-3">
          <StarPicker value={rating} onChange={setRating} />
          {rating > 0 && (
            <span className="text-sm text-neutral-500">{RATING_LABELS[rating]}</span>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-neutral-700 mb-1.5">
          Commentaire <span className="text-neutral-400 font-normal">(optionnel)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          placeholder="Partagez votre expérience avec ce produit…"
          maxLength={1000}
          className="w-full rounded border border-neutral-200 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
        />
        <p className="text-right text-xs text-neutral-400 mt-0.5">{comment.length}/1000</p>
      </div>

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="h-9 px-5 bg-neutral-900 text-white text-sm rounded hover:bg-neutral-700 disabled:opacity-50 transition-colors"
      >
        {isPending ? "Envoi…" : "Publier mon avis"}
      </button>
    </form>
  );
}
