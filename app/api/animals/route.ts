import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const slugify = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function POST(request: Request) {
  const user = await getSession();
  if (!user || user.role === "ADOPTER") return NextResponse.json({ error: "Acesso negado." }, { status: 403 });
  try {
    const body = await request.json();
    const name = String(body.name ?? "").trim();
    const ageValue = Number(body.ageValue);
    const imageUrls = Array.isArray(body.images) ? body.images.filter((url: unknown): url is string => typeof url === "string" && url.startsWith("https://")) : [];
    if (name.length < 2) return NextResponse.json({ error: "Informe o nome." }, { status: 400 });
    if (!Number.isInteger(ageValue) || ageValue < 0) return NextResponse.json({ error: "Informe uma idade válida." }, { status: 400 });
    if (!imageUrls.length) return NextResponse.json({ error: "Adicione pelo menos uma foto." }, { status: 400 });
    const ageMonths = body.ageUnit === "YEARS" ? ageValue * 12 : ageValue;
    const base = slugify(name);
    let slug = base;
    let suffix = 2;
    while (await prisma.animal.findUnique({ where: { slug } })) slug = `${base}-${suffix++}`;
    const animal = await prisma.animal.create({
      data: {
        slug, name, description: String(body.description ?? ""), species: body.species,
        breed: String(body.breed ?? "SRD"), sex: body.sex, ageMonths,
        size: String(body.size ?? "Médio"), city: String(body.city ?? ""),
        state: String(body.state ?? "").toUpperCase(), imageUrls: imageUrls.slice(0, 8), guardianId: user.id,
        vaccinated: body.vaccinated === "on", neutered: body.neutered === "on", dewormed: body.dewormed === "on",
        specialNeeds: String(body.specialNeeds ?? "").trim() || null,
      },
    });
    return NextResponse.json({ redirect: `/animais/${animal.slug}` }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível cadastrar." }, { status: 500 });
  }
}
