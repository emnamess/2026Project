import Link from "next/link";

export function CraftStory() {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-8 py-20">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Image placeholder */}
        <div className="bg-neutral-200 aspect-square md:aspect-[4/5] w-full" aria-hidden="true" />

        {/* Text */}
        <div className="max-w-lg">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 mb-4">
            Notre Savoir-Faire
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-neutral-900 leading-tight">
            Des Mains Expertes, Des Siècles de Tradition
          </h2>
          <p className="mt-6 text-base text-neutral-600 leading-relaxed">
            Chaque pièce que vous trouvez sur notre boutique est créée par des artisans tunisiens qui perpétuent des techniques ancestrales transmises de génération en génération. Poterie de Nabeul, textiles de Sfax, bijoux de Djerba — chaque région apporte son identité unique.
          </p>
          <p className="mt-4 text-base text-neutral-600 leading-relaxed">
            En achetant artisanal, vous soutenez directement les familles d&apos;artisans et contribuez à la préservation d&apos;un patrimoine vivant.
          </p>
          <Link
            href="/artisans"
            className="mt-8 inline-flex items-center text-sm font-medium text-neutral-900 border-b border-neutral-900 hover:border-neutral-400 hover:text-neutral-500 transition-colors pb-0.5"
          >
            Découvrir nos artisans →
          </Link>
        </div>
      </div>
    </section>
  );
}
