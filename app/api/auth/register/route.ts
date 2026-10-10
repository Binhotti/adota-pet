import { NextResponse } from "next/server";
import { createSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
  const body = await request.json(); const name = String(body.name ?? "").trim(); const email = String(body.email ?? "").trim().toLowerCase(); const phone = String(body.phone ?? "").trim(); const password = String(body.password ?? ""); const role = body.role;
  if (name.length < 3 || !/^\S+@\S+\.\S+$/.test(email) || phone.replace(/\D/g, "").length < 10 || password.length < 8 || !["ADOPTER", "NGO", "PROTECTOR"].includes(role)) return NextResponse.json({ error: "Confira os dados, o telefone e a senha de pelo menos 8 caracteres." }, { status: 400 });
  const organizationName = String(body.organizationName ?? "").trim(); if (role !== "ADOPTER" && !organizationName) return NextResponse.json({ error: "Informe o nome da ONG ou projeto." }, { status: 400 });
  if (await prisma.user.findUnique({ where: { email } })) return NextResponse.json({ error: "Este e-mail já está cadastrado." }, { status: 409 });
  const user = await prisma.user.create({ data: { name, email, phone, passwordHash: await hashPassword(password), role, organization: role !== "ADOPTER" ? { create: { name: organizationName } } : undefined } });
  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role }); return NextResponse.json({ redirect: role === "ADOPTER" ? "/animais" : "/painel" }, { status: 201 });
  } catch (error) { console.error("Erro ao cadastrar usuário:", error); return NextResponse.json({ error: "Não foi possível acessar o banco. Confira DATABASE_URL e execute npm run db:push." }, { status: 500 }); }
}
