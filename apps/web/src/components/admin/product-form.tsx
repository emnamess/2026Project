"use client";

import { useState } from "react";
import { ImageUploader } from "./image-uploader";

interface Category {
  id: string;
  nameFr: string;
}

interface ProductFormProps {
  action: (formData: FormData) => Promise<void>;
  categories: Category[];
  defaultValues?: {
    name_fr?: string;
    name_ar?: string;
    name_en?: string;
    description_fr?: string;
    description_ar?: string;
    description_en?: string;
    price?: number | string;
    stock?: number;
    sku?: string | null;
    categoryId?: string | null;
    status?: string;
    imageUrls?: string[];
  };
}

export function ProductForm({ action, categories, defaultValues = {} }: ProductFormProps) {
  const [imageUrls, setImageUrls] = useState<string[]>(defaultValues.imageUrls ?? []);

  return (
    <form action={action} className="space-y-8">
      <input type="hidden" name="imageUrls" value={imageUrls.join(",")} />

      <section className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Images</h2>
        <ImageUploader initialUrls={imageUrls} onChange={setImageUrls} />
      </section>

      <section className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Noms</h2>
        <Field label="Nom (Français) *" name="name_fr" defaultValue={defaultValues.name_fr} required />
        <Field label="Nom (العربية)" name="name_ar" defaultValue={defaultValues.name_ar} dir="rtl" />
        <Field label="Nom (English)" name="name_en" defaultValue={defaultValues.name_en} />
      </section>

      <section className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Descriptions</h2>
        <Textarea label="Description (Français)" name="description_fr" defaultValue={defaultValues.description_fr} />
        <Textarea label="Description (العربية)" name="description_ar" defaultValue={defaultValues.description_ar} dir="rtl" />
        <Textarea label="Description (English)" name="description_en" defaultValue={defaultValues.description_en} />
      </section>

      <section className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Prix & Stock</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Prix (TND) *" name="price" type="number" step="0.01" min="0" defaultValue={defaultValues.price} required />
          <Field label="Stock" name="stock" type="number" min="0" defaultValue={defaultValues.stock ?? 0} />
          <Field label="SKU" name="sku" defaultValue={defaultValues.sku ?? ""} />
        </div>
      </section>

      <section className="bg-white rounded-lg border border-neutral-200 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Organisation</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Catégorie *</label>
            <select
              name="categoryId"
              defaultValue={defaultValues.categoryId ?? ""}
              required
              className="w-full h-9 rounded border border-neutral-200 text-sm px-3 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
            >
              <option value="">— Sélectionner —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.nameFr}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700 mb-1">Statut</label>
            <select
              name="status"
              defaultValue={defaultValues.status ?? "draft"}
              className="w-full h-9 rounded border border-neutral-200 text-sm px-3 bg-white focus:outline-none focus:ring-1 focus:ring-neutral-400"
            >
              <option value="draft">Brouillon</option>
              <option value="published">Publié</option>
              <option value="archived">Archivé</option>
            </select>
          </div>
        </div>
      </section>

      <div className="flex justify-end gap-3">
        <a
          href="/admin/produits"
          className="h-9 px-5 border border-neutral-200 text-sm text-neutral-700 flex items-center hover:bg-neutral-50 rounded transition-colors"
        >
          Annuler
        </a>
        <button
          type="submit"
          className="h-9 px-5 bg-neutral-900 text-white text-sm rounded hover:bg-neutral-700 transition-colors"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );
}

function Field({
  label, name, defaultValue, required, type = "text", step, min, dir,
}: {
  label: string; name: string; defaultValue?: string | number | null;
  required?: boolean; type?: string; step?: string; min?: string; dir?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-700 mb-1">{label}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue ?? ""}
        required={required}
        step={step}
        min={min}
        dir={dir}
        className="w-full h-9 rounded border border-neutral-200 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-neutral-400"
      />
    </div>
  );
}

function Textarea({ label, name, defaultValue, dir }: {
  label: string; name: string; defaultValue?: string; dir?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-neutral-700 mb-1">{label}</label>
      <textarea
        name={name}
        defaultValue={defaultValue ?? ""}
        rows={3}
        dir={dir}
        className="w-full rounded border border-neutral-200 text-sm px-3 py-2 focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
      />
    </div>
  );
}
