import Link from "next/link";

interface ProductCardProps {
  product: {
    id: string;
    nameFr: string;
    slugFr: string;
    priceUsd: number | { toNumber: () => number };
    priceTnd: number | { toNumber: () => number } | null;
    images: { imageUrl: string; altTextFr?: string | null }[];
    category: { nameFr: string } | null;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const price = product.priceTnd
    ? typeof product.priceTnd === "object"
      ? product.priceTnd.toNumber()
      : product.priceTnd
    : typeof product.priceUsd === "object"
    ? product.priceUsd.toNumber()
    : product.priceUsd;

  const image = product.images[0];

  return (
    <Link href={`/produits/${product.slugFr}`} className="group block">
      <div className="aspect-square bg-neutral-100 overflow-hidden rounded-sm">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image.imageUrl}
            alt={image.altTextFr ?? product.nameFr}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-300">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </div>
        )}
      </div>
      <div className="mt-3 space-y-0.5">
        {product.category && (
          <p className="text-xs text-neutral-400 uppercase tracking-wider">{product.category.nameFr}</p>
        )}
        <p className="text-sm font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors line-clamp-2">
          {product.nameFr}
        </p>
        <p className="text-sm text-neutral-700">{price.toFixed(2)} TND</p>
      </div>
    </Link>
  );
}
