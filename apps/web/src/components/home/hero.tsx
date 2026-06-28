import Link from "next/link";

export function Hero() {
  return (
    <section className="relative bg-neutral-100 overflow-hidden">
      {/* Image placeholder — replace with Next.js <Image> once assets are ready */}
      <div className="absolute inset-0 bg-neutral-200" aria-hidden="true" />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-40 md:py-56 flex flex-col items-start">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-6">
          Fait à la main en Tunisie
        </p>
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-neutral-900 max-w-2xl leading-tight">
          L&apos;Artisanat Tunisien, Livré Chez Vous
        </h1>
        <p className="mt-6 text-base md:text-lg text-neutral-600 max-w-md leading-relaxed">
          Des créations authentiques faites à la main par des artisans tunisiens. Poterie, textile, bijoux et bien plus.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row gap-4">
          <Link
            href="/produits"
            className="inline-flex items-center justify-center h-12 px-8 bg-neutral-900 text-white text-sm font-medium hover:bg-neutral-700 transition-colors"
          >
            Découvrir la Collection
          </Link>
          <Link
            href="/#story"
            className="inline-flex items-center justify-center h-12 px-8 border border-neutral-900 text-neutral-900 text-sm font-medium hover:bg-neutral-900 hover:text-white transition-colors"
          >
            Notre Histoire
          </Link>
        </div>
      </div>
    </section>
  );
}
