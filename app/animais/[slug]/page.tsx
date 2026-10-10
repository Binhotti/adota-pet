import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, Check, Heart, MapPin, PawPrint, Ruler, Share2, ShieldCheck, Syringe, Users } from "lucide-react";
import { AnimalGallery } from "@/components/animal-gallery";
import { SiteHeader } from "@/components/site-header";
import { animals, getAnimalBySlug } from "@/data/animals";

export function generateStaticParams() { return animals.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const animal = getAnimalBySlug((await params).slug); return animal ? { title: `${animal.name} para adoção | AdotaPet`, description: animal.description } : {}; }

export default async function AnimalDetailsPage({ params }: { params: Promise<{ slug: string }> }) {
  const animal = getAnimalBySlug((await params).slug); if (!animal) notFound();
  return <main><SiteHeader/><section className="detailPage container"><Link className="backLink" href="/animais"><ArrowLeft/>Voltar para animais</Link><div className="detailGrid"><AnimalGallery name={animal.name} images={animal.gallery}/><aside className="adoptionCard"><div className="detailHeading"><div><span>{animal.species} • {animal.breed}</span><h1>{animal.name}</h1></div><button aria-label="Favoritar"><Heart/></button></div><p className="detailLocation"><MapPin/>{animal.city} - {animal.state}<small>Localização aproximada</small></p><div className="detailFacts"><span><CalendarDays/><small>Idade</small><b>{animal.age}</b></span><span><Ruler/><small>Porte</small><b>{animal.size}</b></span><span><PawPrint/><small>Sexo</small><b>{animal.sex}</b></span></div><Link className="button orange interestButton" href={`/login?role=ADOPTER&redirect=/animais/${animal.slug}`}>Tenho interesse <Heart/></Link><p className="safeNote"><ShieldCheck/>Seus dados serão enviados somente ao responsável.</p><button className="shareButton"><Share2/>Compartilhar perfil</button></aside></div><div className="detailContent"><article><h2>Conheça {animal.name}</h2><p>{animal.description}</p><h3>Personalidade</h3><div className="tags">{animal.personality.map(item=><span key={item}>{item}</span>)}</div><h3>Cuidados e saúde</h3><div className="healthGrid"><span className={animal.vaccinated?"ok":"pending"}><Syringe/>Vacinas {animal.vaccinated?"em dia":"pendentes"}</span><span className={animal.neutered?"ok":"pending"}><Check/>{animal.neutered?"Castrado(a)":"Castração pendente"}</span><span className="ok"><ShieldCheck/>Vermifugado(a)</span></div></article><aside className="guardianCard"><div className="guardianIcon"><Users/></div><span>{animal.guardianType} responsável</span><h3>{animal.guardian}</h3><p><Check/>Perfil verificado</p><Link href="#">Conhecer responsável</Link></aside></div></section></main>;
}
