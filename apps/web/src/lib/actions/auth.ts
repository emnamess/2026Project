"use server";

import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";

export async function registerCustomer(formData: FormData) {
  const firstName = (formData.get("firstName") as string).trim();
  const lastName = (formData.get("lastName") as string).trim();
  const email = (formData.get("email") as string).trim().toLowerCase();
  const password = formData.get("password") as string;
  const confirm = formData.get("confirm") as string;

  if (!firstName || !email || !password) {
    return { error: "Tous les champs obligatoires doivent être remplis." };
  }
  if (password.length < 8) {
    return { error: "Le mot de passe doit contenir au moins 8 caractères." };
  }
  if (password !== confirm) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Un compte existe déjà avec cet email." };
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.user.create({
    data: { firstName, lastName: lastName || null, email, passwordHash, role: "customer" },
  });

  await signIn("credentials", { email, password, redirectTo: "/compte" });
}
