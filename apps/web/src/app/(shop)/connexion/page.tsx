import { LoginForm } from "@/components/shop/login-form";

export const metadata = { title: "Connexion — Artisan.TN" };

interface Props {
  searchParams: Promise<{ redirect?: string }>;
}

export default async function ConnexionPage({ searchParams }: Props) {
  const { redirect: redirectTo } = await searchParams;

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light tracking-tight text-neutral-900">Connexion</h1>
          <p className="mt-2 text-sm text-neutral-500">Accédez à votre espace client</p>
        </div>
        <LoginForm redirectTo={redirectTo ?? "/compte"} />
      </div>
    </div>
  );
}
