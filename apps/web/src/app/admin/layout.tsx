import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin — Artisan.TN",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
