"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function submitReview(productId: string, rating: number, comment: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Vous devez être connecté pour laisser un avis.");

  const userId = session.user.id;

  const existing = await prisma.review.findUnique({
    where: { productId_userId: { productId, userId } },
  });
  if (existing) throw new Error("Vous avez déjà laissé un avis pour ce produit.");

  const purchase = await prisma.orderItem.findFirst({
    where: { productId, order: { userId } },
  });

  await prisma.review.create({
    data: {
      productId,
      userId,
      rating,
      comment: comment.trim() || null,
      verifiedPurchase: !!purchase,
      status: "pending",
    },
  });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (product) revalidatePath(`/produits/${product.slugFr}`);
}

export async function moderateReview(id: string, action: "approved" | "rejected") {
  const review = await prisma.review.update({
    where: { id },
    data: { status: action },
    include: { product: true },
  });
  revalidatePath("/admin/avis");
  revalidatePath(`/produits/${review.product.slugFr}`);
}
