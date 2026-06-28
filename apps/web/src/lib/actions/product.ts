"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductStatus } from "@/generated/prisma/client";

function slugify(text: string) {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueSlug(base: string) {
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function createProduct(formData: FormData) {
  const nameFr = formData.get("name_fr") as string;
  const nameAr = formData.get("name_ar") as string;
  const nameEn = formData.get("name_en") as string;
  const descFr = formData.get("description_fr") as string;
  const descAr = formData.get("description_ar") as string;
  const descEn = formData.get("description_en") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);
  const skuInput = (formData.get("sku") as string).trim();
  const categoryId = formData.get("categoryId") as string;
  const status = (formData.get("status") as string) || "draft";
  const imageUrls = (formData.get("imageUrls") as string)
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

  if (!nameFr || isNaN(price) || !categoryId) {
    throw new Error("Nom, prix et catégorie sont obligatoires.");
  }

  const sku = skuInput || `SKU-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;
  const base = slugify(nameFr) || "produit";

  await prisma.product.create({
    data: {
      nameFr,
      nameAr: nameAr || nameFr,
      nameEn: nameEn || nameFr,
      slugFr: uniqueSlug(base),
      slugAr: uniqueSlug(base),
      slugEn: uniqueSlug(base),
      descriptionFr: descFr || null,
      descriptionAr: descAr || null,
      descriptionEn: descEn || null,
      priceUsd: price,
      priceTnd: price,
      stockQuantity: isNaN(stock) ? 0 : stock,
      sku,
      status: status as ProductStatus,
      categoryId,
      images: {
        create: imageUrls.map((url, i) => ({
          imageUrl: url,
          displayOrder: i,
          altTextFr: nameFr,
          isPrimary: i === 0,
        })),
      },
    },
  });

  revalidatePath("/admin/produits");
  redirect("/admin/produits");
}

export async function updateProduct(id: string, formData: FormData) {
  const nameFr = formData.get("name_fr") as string;
  const nameAr = formData.get("name_ar") as string;
  const nameEn = formData.get("name_en") as string;
  const descFr = formData.get("description_fr") as string;
  const descAr = formData.get("description_ar") as string;
  const descEn = formData.get("description_en") as string;
  const price = parseFloat(formData.get("price") as string);
  const stock = parseInt(formData.get("stock") as string, 10);
  const skuInput = (formData.get("sku") as string).trim();
  const categoryId = formData.get("categoryId") as string;
  const status = formData.get("status") as string;
  const imageUrls = (formData.get("imageUrls") as string)
    .split(",")
    .map((u) => u.trim())
    .filter(Boolean);

  await prisma.$transaction(async (tx) => {
    const existing = await tx.product.findUnique({ where: { id }, select: { sku: true } });
    const sku = skuInput || existing?.sku || `SKU-${Math.random().toString(36).slice(2, 9).toUpperCase()}`;

    await tx.product.update({
      where: { id },
      data: {
        nameFr,
        nameAr: nameAr || nameFr,
        nameEn: nameEn || nameFr,
        descriptionFr: descFr || null,
        descriptionAr: descAr || null,
        descriptionEn: descEn || null,
        priceUsd: price,
        priceTnd: price,
        stockQuantity: isNaN(stock) ? 0 : stock,
        sku,
        status: status as ProductStatus,
        categoryId: categoryId || undefined,
      },
    });

    if (imageUrls.length > 0) {
      await tx.productImage.deleteMany({ where: { productId: id } });
      await tx.productImage.createMany({
        data: imageUrls.map((url, i) => ({
          productId: id,
          imageUrl: url,
          displayOrder: i,
          altTextFr: nameFr,
          isPrimary: i === 0,
        })),
      });
    }
  });

  revalidatePath("/admin/produits");
  revalidatePath(`/admin/produits/${id}`);
  redirect("/admin/produits");
}

export async function deleteProduct(id: string) {
  await prisma.product.delete({ where: { id } });
  revalidatePath("/admin/produits");
}
