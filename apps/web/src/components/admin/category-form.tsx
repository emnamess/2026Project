"use client";

import { useState, useRef } from "react";
import { createCategory } from "@/lib/actions/category";

export function CategoryForm() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleFile(file: File | null) {
    if (!file) return;
    setUploading(true);
    setUploadError("");
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) {
      setUploadError(data.error ?? "Erreur lors du téléversement");
    } else {
      setImageUrl(data.url as string);
    }
    setUploading(false);
  }

  async function handleSubmit(formData: FormData) {
    await createCategory(formData);
    setImageUrl(null);
    formRef.current?.reset();
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <input type="hidden" name="imageUrl" value={imageUrl ?? ""} />

      {/* Image */}
      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-2">Image de la catégorie</label>
        <div className="flex items-start gap-4">
          {/* Preview */}
          <div
            className="w-24 h-24 rounded border-2 border-dashed border-neutral-200 overflow-hidden bg-neutral-50 flex items-center justify-center shrink-0 cursor-pointer hover:border-neutral-400 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-neutral-300">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="button"
              disabled={uploading}
              onClick={() => inputRef.current?.click()}
              className="h-8 px-3 text-xs border border-neutral-200 rounded hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              {uploading ? "Téléversement…" : imageUrl ? "Changer l'image" : "Choisir une image"}
            </button>
            {imageUrl && (
              <button
                type="button"
                onClick={() => setImageUrl(null)}
                className="block text-xs text-red-500 hover:text-red-700 underline"
              >
                Supprimer
              </button>
            )}
            {uploadError && <p className="text-xs text-red-600">{uploadError}</p>}
            <p className="text-xs text-neutral-400">JPG, PNG, WebP — max 5 Mo</p>
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
        />
      </div>

      {/* Names */}
      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">Nom (Français) *</label>
        <input
          name="name_fr"
          required
          className="w-full h-9 rounded border border-neutral-200 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">Nom (العربية)</label>
        <input
          name="name_ar"
          dir="rtl"
          className="w-full h-9 rounded border border-neutral-200 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">Nom (English)</label>
        <input
          name="name_en"
          className="w-full h-9 rounded border border-neutral-200 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-700 mb-1">
          Slug <span className="text-neutral-400 font-normal">(optionnel)</span>
        </label>
        <input
          name="slug"
          placeholder="poterie-traditionnelle"
          className="w-full h-9 rounded border border-neutral-200 text-sm px-3 focus:outline-none focus:ring-1 focus:ring-neutral-400"
        />
      </div>

      <button
        type="submit"
        className="h-9 px-5 bg-neutral-900 text-white text-sm rounded hover:bg-neutral-700 transition-colors"
      >
        Créer la catégorie
      </button>
    </form>
  );
}
