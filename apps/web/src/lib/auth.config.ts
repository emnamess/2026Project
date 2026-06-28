import type { NextAuthConfig } from "next-auth";

// Edge-compatible config — no Prisma, no bcrypt, no Node.js built-ins.
// Used by middleware only.
export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = nextUrl.pathname === "/admin/login";

      if (isLoginPage && isLoggedIn)
        return Response.redirect(new URL("/admin", nextUrl));
      if (!isLoginPage && !isLoggedIn)
        return Response.redirect(new URL("/admin/login", nextUrl));

      return true;
    },
  },
} satisfies NextAuthConfig;
