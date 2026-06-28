import { prisma } from "@/lib/prisma";
import { moderateReview } from "@/lib/actions/review";

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} width="13" height="13" viewBox="0 0 24 24"
          fill={s <= rating ? "currentColor" : "none"}
          stroke="currentColor" strokeWidth="1.5"
          className={s <= rating ? "text-amber-400" : "text-neutral-200"}
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      ))}
    </div>
  );
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
  approved: "bg-green-50 text-green-700 border-green-200",
  rejected: "bg-neutral-100 text-neutral-500 border-neutral-200",
};

const STATUS_LABELS: Record<string, string> = {
  pending: "En attente",
  approved: "Approuvé",
  rejected: "Rejeté",
};

export default async function AvisPage() {
  const reviews = await prisma.review.findMany({
    include: {
      user: { select: { firstName: true, lastName: true, email: true } },
      product: { select: { nameFr: true, slugFr: true } },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const pending = reviews.filter((r) => r.status === "pending").length;

  return (
    <div className="p-8">
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="text-2xl font-semibold text-neutral-900">Avis clients</h1>
        {pending > 0 && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
            {pending} en attente
          </span>
        )}
      </div>

      {reviews.length === 0 ? (
        <p className="text-neutral-400 text-sm">Aucun avis pour le moment.</p>
      ) : (
        <div className="space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white border border-neutral-200 rounded-lg p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Stars rating={r.rating} />
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${STATUS_STYLES[r.status]}`}>
                      {STATUS_LABELS[r.status]}
                    </span>
                    {r.verifiedPurchase && (
                      <span className="text-xs text-green-600 font-medium">Achat vérifié</span>
                    )}
                  </div>

                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-neutral-400">
                    <span className="font-medium text-neutral-600">
                      {r.user.firstName ? `${r.user.firstName} ${r.user.lastName ?? ""}`.trim() : r.user.email}
                    </span>
                    <span>sur <span className="text-neutral-700">{r.product.nameFr}</span></span>
                    <span>{new Date(r.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>

                  {r.comment && (
                    <p className="mt-2 text-sm text-neutral-600">{r.comment}</p>
                  )}
                </div>

                {r.status === "pending" && (
                  <div className="flex gap-2 shrink-0">
                    <form action={async () => { "use server"; await moderateReview(r.id, "approved"); }}>
                      <button
                        type="submit"
                        className="h-8 px-3 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                      >
                        Approuver
                      </button>
                    </form>
                    <form action={async () => { "use server"; await moderateReview(r.id, "rejected"); }}>
                      <button
                        type="submit"
                        className="h-8 px-3 border border-neutral-200 text-neutral-600 text-xs rounded hover:bg-neutral-50 transition-colors"
                      >
                        Rejeter
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
