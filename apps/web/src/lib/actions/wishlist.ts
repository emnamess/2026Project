"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function toggleWishlist(productId: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "login_required" as const };

  const userId = session.user.id;
  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    revalidatePath("/compte/favoris");
    return { saved: false };
  } else {
    await prisma.wishlistItem.create({ data: { userId, productId } });
    revalidatePath("/compte/favoris");
    return { saved: true };
  }
}
