import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

async function getStats() {
  const [productCount, orderCount, categoryCount, revenueResult] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.category.count(),
    prisma.order.aggregate({
      _sum: { totalUsd: true },
      where: { status: { notIn: ["canceled", "refunded"] } },
    }),
  ]);

  const sum = revenueResult._sum?.totalUsd ?? 0;

  return { productCount, orderCount, categoryCount, revenue: sum };
}

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/admin/login");

  const stats = await getStats();

  const cards = [
    { label: "Produits", value: stats.productCount, href: "/admin/produits" },
    { label: "Catégories", value: stats.categoryCount, href: "/admin/categories" },
    { label: "Commandes", value: stats.orderCount, href: "/admin/commandes" },
    {
      label: "Chiffre d'affaires",
      value: `${Number(stats.revenue).toFixed(2)} TND`,
      href: "/admin/commandes",
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900">Tableau de bord</h1>
        <p className="text-sm text-neutral-500 mt-1">Bienvenue, {session.user?.email}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <a
            key={card.label}
            href={card.href}
            className="bg-white rounded-lg border border-neutral-200 p-6 hover:border-neutral-400 transition-colors"
          >
            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider">{card.label}</p>
            <p className="mt-2 text-3xl font-semibold text-neutral-900">{card.value}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
