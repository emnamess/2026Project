"use client";

import { useRouter, useSearchParams } from "next/navigation";

const SORT_OPTIONS = [
  { value: "nouveautes", label: "Plus récents" },
  { value: "prix-asc",   label: "Prix croissant" },
  { value: "prix-desc",  label: "Prix décroissant" },
  { value: "nom-az",     label: "Nom A → Z" },
];

export function SortSelect({ current }: { current: string }) {
  const router = useRouter();
  const params = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = new URLSearchParams(params.toString());
    if (e.target.value === "nouveautes") {
      next.delete("tri");
    } else {
      next.set("tri", e.target.value);
    }
    router.push(`/produits?${next.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="h-9 pl-3 pr-8 rounded border border-neutral-200 text-sm text-neutral-700 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-400 appearance-none cursor-pointer"
      style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239ca3af' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  );
}
