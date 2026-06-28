import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

// Uses only the Edge-compatible config — no Prisma, no Node.js built-ins.
export default NextAuth(authConfig).auth;

export const config = {
  matcher: ["/admin/:path*"],
};
