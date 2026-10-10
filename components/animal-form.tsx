"use client";

import { ChangeEvent, DragEvent, FormEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { upload } from "@vercel/blob/client";
import { Loader2, Save, Trash2, UploadCloud } from "lucide-react";

const MAX_IMAGES = 8;
const MAX_IMAGE_SIZE = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
type SelectedImage = { file: File; preview: string };

export function AnimalForm() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [images, setImages] = useState<SelectedImage[]>([]);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  function addFiles(files: File[]) {
    setError("");
    const valid = files.filter((file) => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError("Use apenas imagens JPG, PNG ou WebP.");
        return false;
      }
      if (file.size > MAX_IMAGE_SIZE) {
        setError(`A imagem ${file.name} ultrapassa 10 MB.`);
        return false;
      }
      return true;
    });
    setImages((current) => {
      const available = MAX_IMAGES - current.length;
      if (valid.length > available) setError(`Você pode enviar no máximo ${MAX_IMAGES} imagens.`);
      return [...current, ...valid.slice(0, available).map((file) => ({ file, preview: URL.createObjectURL(file) }))];
    });
  }

  function handleFiles(event: ChangeEvent<HTMLInputElement>) {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    addFiles(Array.from(event.dataTransfer.files));
  }

  function removeImage(index: number) {
    setImages((current) => {
      URL.revokeObjectURL(current[index].preview);
      return current.filter((_, imageIndex) => imageIndex !== index);
    });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!images.length) {
      setError("Adicione pelo menos uma foto do animal.");
      return;
    }
    setLoading(true);
    setError("");
    setProgress(0);
    try {
      const uploadedUrls: string[] = [];
      for (let index = 0; index < images.length; index++) {
        const { file } = images[index];
        const blob = await upload(`animais/${Date.now()}-${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/uploads",
        });
        uploadedUrls.push(blob.url);
        setProgress(Math.round(((index + 1) / images.length) * 100));
      }
      const formData = new FormData(event.currentTarget);
      const response = await fetch("/api/animals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...Object.fromEntries(formData), images: uploadedUrls }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Não foi possível cadastrar o animal.");
      router.push(result.redirect);
      router.refresh();
    } catch (submissionError) {
      setError(submissionError instanceof Error ? submissionError.message : "Não foi possível cadastrar o animal.");
      setLoading(false);
    }
  }

  return (
    <form className="animalForm" onSubmit={submit}>
      <div className="formGrid">
        <label><span>Nome</span><input name="name" required /></label>
        <label><span>Espécie</span><select name="species"><option value="DOG">Cachorro</option><option value="CAT">Gato</option><option value="OTHER">Outro</option></select></label>
        <label><span>Raça</span><input name="breed" placeholder="SRD" /></label>
        <label><span>Sexo</span><select name="sex"><option value="MALE">Macho</option><option value="FEMALE">Fêmea</option><option value="UNKNOWN">Não informado</option></select></label>
        <fieldset className="ageField"><legend>Idade</legend><input aria-label="Idade" name="ageValue" type="number" min="0" max="100" required placeholder="2" /><select aria-label="Unidade da idade" name="ageUnit" defaultValue="YEARS"><option value="MONTHS">meses</option><option value="YEARS">anos</option></select></fieldset>
        <label><span>Porte</span><select name="size"><option>Pequeno</option><option>Médio</option><option>Grande</option></select></label>
        <label><span>Cidade</span><input name="city" required /></label>
        <label><span>Estado</span><input name="state" maxLength={2} required placeholder="SC" /></label>
      </div>
      <label><span>Descrição</span><textarea name="description" rows={5} required /></label>
      <section className="imageUploader" aria-labelledby="photos-label">
        <div className="uploadLabel"><span id="photos-label">Fotos do animal</span><small>{images.length}/{MAX_IMAGES}</small></div>
        <div className={`dropZone${dragging ? " dragging" : ""}`} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={handleDrop} onClick={() => inputRef.current?.click()} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") inputRef.current?.click(); }} role="button" tabIndex={0}>
          <UploadCloud /><b>Arraste as fotos aqui</b><span>ou clique para selecionar</span><small>JPG, PNG ou WebP · até 10 MB por foto</small>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} hidden />
        </div>
        {images.length > 0 && <div className="imagePreviews">{images.map(({ file, preview }, index) => <figure key={`${file.name}-${file.lastModified}`}><Image src={preview} alt={`Prévia ${index + 1}: ${file.name}`} fill unoptimized /><button type="button" onClick={() => removeImage(index)} aria-label={`Remover ${file.name}`}><Trash2 /></button>{index === 0 && <figcaption>Foto principal</figcaption>}</figure>)}</div>}
      </section>
      {error && <p className="formError">{error}</p>}
      <button className="button orange" disabled={loading}>{loading ? <><Loader2 className="spin" />{progress < 100 ? `Enviando fotos... ${progress}%` : "Salvando animal..."}</> : <><Save />Cadastrar animal</>}</button>
    </form>
  );
}
