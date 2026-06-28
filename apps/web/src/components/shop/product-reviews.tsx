import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ReviewForm } from "./review-form";

function Stars({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={s <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
          className={s <= rating ? "text-amber-400" : "text-neutral-200"}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

export async function ProductReviews({ productId }: { productId: string }) {
  const session = await auth();
  const userId = session?.user?.id;

  const [reviews, userReview] = await Promise.all([
    prisma.review.findMany({
      where: { productId, status: "approved" },
      include: { user: { select: { firstName: true, lastName: true } } },
      orderBy: { createdAt: "desc" },
    }),
    userId
      ? prisma.review.findUnique({ where: { productId_userId: { productId, userId } } })
      : null,
  ]);

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
      : 0;

  return (
    <section className="mt-16 pt-12 border-t border-neutral-200">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-xl font-light tracking-tight text-neutral-900">Avis clients</h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-1.5">
              <Stars rating={Math.round(avgRating)} />
              <span className="text-sm text-neutral-500">
                {avgRating.toFixed(1)} · {reviews.length} avis
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        {/* Review list */}
        <div className="lg:col-span-2 space-y-6">
          {reviews.length === 0 ? (
            <p className="text-sm text-neutral-400">Aucun avis pour le moment. Soyez le premier !</p>
          ) : (
            reviews.map((r) => {
              const name = r.user.firstName
                  ? `${r.user.firstName} ${r.user.lastName ?? ""}`.trim()
                  : "Client";
              const initial = name.charAt(0).toUpperCase();
              return (
                <div key={r.id} className="pb-6 border-b border-neutral-100 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-sm font-medium text-neutral-600 shrink-0">
                      {initial}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-neutral-800">{name}</span>
                        {r.verifiedPurchase && (
                          <span className="text-[10px] bg-green-50 text-green-700 border border-green-200 rounded px-1.5 py-0.5 font-medium">
                            Achat vérifié
                          </span>
                        )}
                        <span className="text-xs text-neutral-400 ml-auto">
                          {new Date(r.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                        </span>
                      </div>
                      <Stars rating={r.rating} size={14} />
                      {r.comment && (
                        <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{r.comment}</p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Write a review */}
        <div>
          {!userId ? (
            <div className="bg-neutral-50 rounded-lg p-5 text-sm">
              <p className="font-medium text-neutral-700 mb-1">Laisser un avis</p>
              <p className="text-neutral-500 mb-3">Connectez-vous pour partager votre expérience.</p>
              <Link
                href="/connexion"
                className="inline-block px-4 py-2 bg-neutral-900 text-white text-sm rounded hover:bg-neutral-700 transition-colors"
              >
                Se connecter
              </Link>
            </div>
          ) : userReview ? (
            <div className="bg-neutral-50 rounded-lg p-5">
              <p className="text-sm font-medium text-neutral-700 mb-2">Votre avis</p>
              <Stars rating={userReview.rating} />
              {userReview.comment && (
                <p className="mt-2 text-sm text-neutral-600">{userReview.comment}</p>
              )}
              {userReview.status === "pending" && (
                <p className="mt-2 text-xs text-amber-600">En attente de modération</p>
              )}
            </div>
          ) : (
            <div className="bg-neutral-50 rounded-lg p-5">
              <p className="text-sm font-medium text-neutral-700 mb-4">Laisser un avis</p>
              <ReviewForm productId={productId} />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
