import type { NextAuthConfig } from "next-auth";

// Edge-compatible config — no Prisma, no bcrypt, no Node.js built-ins.
export const authConfig = {
  pages: { signIn: "/admin/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isAdminLogin = nextUrl.pathname === "/admin/login";
      const isAdminRoute = nextUrl.pathname.startsWith("/admin");
      const isAccountRoute = nextUrl.pathname.startsWith("/compte");

      // Admin routes: redirect to admin login if not logged in
      if (isAdminRoute) {
        if (isAdminLogin && isLoggedIn) return Response.redirect(new URL("/admin", nextUrl));
        if (!isAdminLogin && !isLoggedIn) return Response.redirect(new URL("/admin/login", nextUrl));
      }

      // Customer account: redirect to /connexion if not logged in
      if (isAccountRoute && !isLoggedIn) {
        return Response.redirect(new URL("/connexion?redirect=/compte", nextUrl));
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
