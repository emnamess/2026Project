"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createCategory(formData: FormData) {
  const nameFr = formData.get("name_fr") as string;
  const nameAr = formData.get("name_ar") as string;
  const nameEn = formData.get("name_en") as string;
  const slugInput = ((formData.get("slug") as string) ?? "").trim();
  const imageUrl = ((formData.get("imageUrl") as string) ?? "").trim() || null;

  if (!nameFr) throw new Error("Le nom français est obligatoire.");

  const base = slugInput || slugify(nameFr) || "categorie";
  const suffix = Math.random().toString(36).slice(2, 6);

  await prisma.category.create({
    data: {
      nameFr,
      nameAr: nameAr || nameFr,
      nameEn: nameEn || nameFr,
      slugFr: slugInput || `${base}-${suffix}`,
      slugEn: `${base}-${suffix}-en`,
      imageUrl,
    },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}
