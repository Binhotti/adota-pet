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
async function compressImage(file:File){if(file.size<900000)return file;const bitmap=await createImageBitmap(file),scale=Math.min(1,1800/Math.max(bitmap.width,bitmap.height)),canvas=document.createElement("canvas");canvas.width=Math.round(bitmap.width*scale);canvas.height=Math.round(bitmap.height*scale);canvas.getContext("2d")?.drawImage(bitmap,0,0,canvas.width,canvas.height);const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error("Falha ao compactar imagem")),"image/webp",.82));return new File([blob],file.name.replace(/\.[^.]+$/,".webp"),{type:"image/webp"})}

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

  function makePrimary(index: number) { setImages((current) => [current[index], ...current.filter((_, i) => i !== index)]); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
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
        const file = await compressImage(images[index].file);
        const blob = await upload(`animais/${Date.now()}-${file.name}`, file, {
          access: "public",
          handleUploadUrl: "/api/uploads",
        });
        uploadedUrls.push(blob.url);
        setProgress(Math.round(((index + 1) / images.length) * 100));
      }
      const formData = new FormData(form);
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
      <fieldset className="healthFields"><legend>Saúde</legend><label><input type="checkbox" name="vaccinated"/> Vacinado</label><label><input type="checkbox" name="neutered"/> Castrado</label><label><input type="checkbox" name="dewormed"/> Vermifugado</label></fieldset>
      <label><span>Necessidades especiais</span><textarea name="specialNeeds" rows={2} placeholder="Deixe em branco caso não tenha" /></label>
      <label><span>Descrição</span><textarea name="description" rows={5} required /></label>
      <section className="imageUploader" aria-labelledby="photos-label">
        <div className="uploadLabel"><span id="photos-label">Fotos do animal</span><small>{images.length}/{MAX_IMAGES}</small></div>
        <div className={`dropZone${dragging ? " dragging" : ""}`} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={handleDrop} onClick={() => inputRef.current?.click()} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") inputRef.current?.click(); }} role="button" tabIndex={0}>
          <UploadCloud /><b>Arraste as fotos aqui</b><span>ou clique para selecionar</span><small>JPG, PNG ou WebP · até 10 MB por foto</small>
          <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={handleFiles} hidden />
        </div>
        {images.length > 0 && <><p className="fieldHint">Clique em uma foto para torná-la a principal.</p><div className="imagePreviews">{images.map(({ file, preview }, index) => <figure key={`${file.name}-${file.lastModified}`} onClick={()=>makePrimary(index)}><Image src={preview} alt={`Prévia ${index + 1}: ${file.name}`} fill unoptimized /><button type="button" onClick={(e) => {e.stopPropagation();removeImage(index)}} aria-label={`Remover ${file.name}`}><Trash2 /></button>{index === 0 && <figcaption>Foto principal</figcaption>}</figure>)}</div></>}
      </section>
      {error && <p className="formError">{error}</p>}
      <button className="button orange" disabled={loading}>{loading ? <><Loader2 className="spin" />{progress < 100 ? `Enviando fotos... ${progress}%` : "Salvando animal..."}</> : <><Save />Cadastrar animal</>}</button>
    </form>
  );
}
