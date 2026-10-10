import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ name: z.string().trim().min(3), email: z.email().toLowerCase(), password: z.string().min(8), role: z.enum(["ADOPTER", "NGO", "PROTECTOR"]), organizationName: z.string().trim().optional() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Confira os dados. A senha deve ter pelo menos 8 caracteres." }, { status: 400 });
  const { name, email, password, role, organizationName } = parsed.data;
  if ((role === "NGO" || role === "PROTECTOR") && !organizationName) return NextResponse.json({ error: "Informe o nome da ONG ou do projeto de proteção." }, { status: 400 });
  if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 });
  const user = await prisma.user.create({ data: { name, email, passwordHash: await hash(password, 12), role, organization: role !== "ADOPTER" ? { create: { name: organizationName!, description: role === "NGO" ? "ONG de proteção animal" : "Protetor independente" } } : undefined } });
  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  return NextResponse.json({ redirect: role === "ADOPTER" ? "/animais" : "/painel" }, { status: 201 });
}
