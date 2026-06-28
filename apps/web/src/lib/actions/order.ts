"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { PaymentMethod, OrderStatus } from "@/generated/prisma/client";

interface CartItemInput {
  id: string;
  nameFr: string;
  price: number;
  quantity: number;
}

function generateOrderNumber() {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ART-${date}-${rand}`;
}

export async function createOrder(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const phone = formData.get("phone") as string;
  const street = formData.get("street") as string;
  const city = formData.get("city") as string;
  const governorate = formData.get("governorate") as string;
  const postalCode = formData.get("postalCode") as string;
  const paymentMethod = formData.get("paymentMethod") as string;
  const cartJson = formData.get("cartItems") as string;

  if (!firstName || !lastName || !email || !street || !city || !governorate) {
    throw new Error("Veuillez remplir tous les champs obligatoires.");
  }

  const cartItems: CartItemInput[] = JSON.parse(cartJson ?? "[]");
  if (cartItems.length === 0) throw new Error("Votre panier est vide.");

  // Verify stock availability before doing anything
  const products = await prisma.product.findMany({
    where: { id: { in: cartItems.map((i) => i.id) } },
    select: { id: true, nameFr: true, stockQuantity: true },
  });

  for (const item of cartItems) {
    const product = products.find((p) => p.id === item.id);
    if (!product || product.stockQuantity < item.quantity) {
      throw new Error(
        `"${product?.nameFr ?? item.nameFr}" n'est plus disponible en quantité suffisante.`
      );
    }
  }

  const subtotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const shipping = subtotal >= 200 ? 0 : 8;
  const total = subtotal + shipping;
  const orderNumber = generateOrderNumber();

  const shippingNote = JSON.stringify({
    firstName, lastName, email, phone,
    street, city, governorate, postalCode, country: "TN",
  });

  // Create order and decrement stock in one transaction
  await prisma.$transaction([
    prisma.order.create({
      data: {
        orderNumber,
        paymentMethod: paymentMethod as PaymentMethod,
        subtotalUsd: subtotal,
        shippingCostUsd: shipping,
        totalUsd: total,
        notes: shippingNote,
        items: {
          create: cartItems.map((item) => ({
            productId: item.id,
            productName: item.nameFr,
            quantity: item.quantity,
            unitPriceUsd: item.price,
            subtotalUsd: item.price * item.quantity,
          })),
        },
      },
    }),
    ...cartItems.map((item) =>
      prisma.product.update({
        where: { id: item.id },
        data: { stockQuantity: { decrement: item.quantity } },
      })
    ),
  ]);

  redirect(`/commande/confirmation/${orderNumber}`);
}

export async function updateOrderStatus(id: string, status: string, trackingNumber?: string) {
  await prisma.order.update({
    where: { id },
    data: {
      status: status as OrderStatus,
      ...(trackingNumber ? { trackingNumber } : {}),
      ...(status === "shipped" ? { shippedAt: new Date() } : {}),
      ...(status === "delivered" ? { deliveredAt: new Date() } : {}),
    },
  });
  revalidatePath(`/admin/commandes/${id}`);
  revalidatePath("/admin/commandes");
}
