"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface Props {
  initialUrls?: string[];
  onChange: (urls: string[]) => void;
}

export function ImageUploader({ initialUrls = [], onChange }: Props) {
  const [urls, setUrls] = useState<string[]>(initialUrls);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError("");

    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Erreur"); break; }
      newUrls.push(data.url as string);
    }

    const next = [...urls, ...newUrls];
    setUrls(next);
    onChange(next);
    setUploading(false);
  }

  function remove(url: string) {
    const next = urls.filter((u) => u !== url);
    setUrls(next);
    onChange(next);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {urls.map((url) => (
          <div key={url} className="relative w-24 h-24 rounded border border-neutral-200 overflow-hidden group">
            <Image src={url} alt="" fill className="object-cover" />
            <button
              type="button"
              onClick={() => remove(url)}
              className="absolute inset-0 bg-black/50 text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            >
              Supprimer
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-24 h-24 rounded border-2 border-dashed border-neutral-300 text-neutral-400 hover:border-neutral-500 hover:text-neutral-600 flex flex-col items-center justify-center gap-1 transition-colors disabled:opacity-50"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="text-xs">{uploading ? "..." : "Ajouter"}</span>
        </button>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
