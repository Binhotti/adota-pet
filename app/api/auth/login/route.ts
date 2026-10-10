import { compare } from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ email: z.email().toLowerCase(), password: z.string().min(1), expectedRole: z.enum(["ADOPTER", "ORGANIZATION"]).optional(), redirect: z.string().startsWith("/").optional() });

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "E-mail ou senha inválidos." }, { status: 400 });
  const { email, password, expectedRole, redirect } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await compare(password, user.passwordHash))) return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  const isOrganization = user.role === "NGO" || user.role === "PROTECTOR";
  if (expectedRole === "ADOPTER" && user.role !== "ADOPTER") return NextResponse.json({ error: "Esta conta pertence a uma ONG/protetor. Troque o tipo de acesso." }, { status: 403 });
  if (expectedRole === "ORGANIZATION" && !isOrganization) return NextResponse.json({ error: "Esta conta é de adotante. Troque o tipo de acesso." }, { status: 403 });
  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role });
  return NextResponse.json({ redirect: redirect ?? (isOrganization ? "/painel" : "/animais") });
}
