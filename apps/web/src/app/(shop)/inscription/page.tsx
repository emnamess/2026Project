import { RegisterForm } from "@/components/shop/register-form";

export const metadata = { title: "Créer un compte — Artisan.TN" };

export default function InscriptionPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light tracking-tight text-neutral-900">Créer un compte</h1>
          <p className="mt-2 text-sm text-neutral-500">Rejoignez la communauté Artisan.TN</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}
