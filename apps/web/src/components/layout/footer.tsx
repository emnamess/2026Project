import Link from "next/link";

const links = {
  Boutique: [
    { label: "Catalogue", href: "/catalogue" },
    { label: "Nouveautés", href: "/nouveautes" },
    { label: "Meilleures Ventes", href: "/meilleures-ventes" },
    { label: "Collections", href: "/collections" },
  ],
  Aide: [
    { label: "Livraison", href: "/livraison" },
    { label: "Retours", href: "/retours" },
    { label: "FAQ", href: "/faq" },
    { label: "Contact", href: "/contact" },
  ],
  Entreprise: [
    { label: "À Propos", href: "/a-propos" },
    { label: "Artisans", href: "/artisans" },
    { label: "Presse", href: "/presse" },
  ],
};

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <span className="text-white text-lg font-semibold tracking-widest uppercase">
              Artisan.TN
            </span>
            <p className="mt-4 text-sm leading-6 max-w-xs">
              Artisanat tunisien authentique, fait à la main par des artisans locaux.
            </p>
          </div>

          {/* Links */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h3 className="text-white text-xs font-semibold uppercase tracking-wider mb-4">
                {section}
              </h3>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 border-t border-neutral-800 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            © {new Date().getFullYear()} Artisan.TN. Tous droits réservés.
          </p>
          <div className="flex items-center gap-6 text-xs">
            <Link href="/confidentialite" className="hover:text-white transition-colors">
              Confidentialité
            </Link>
            <Link href="/conditions" className="hover:text-white transition-colors">
              Conditions
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
