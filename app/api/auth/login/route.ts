import { NextResponse } from "next/server";
import { createSession, verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json(); const email = String(body.email ?? "").trim().toLowerCase(); const password = String(body.password ?? ""); const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) return NextResponse.json({ error: "E-mail ou senha incorretos." }, { status: 401 });
  const organization = user.role === "NGO" || user.role === "PROTECTOR"; if (body.expectedRole === "ADOPTER" && user.role !== "ADOPTER") return NextResponse.json({ error: "Esta conta pertence a uma ONG/protetor." }, { status: 403 }); if (body.expectedRole === "ORGANIZATION" && !organization) return NextResponse.json({ error: "Esta conta é de adotante." }, { status: 403 });
  await createSession({ id: user.id, name: user.name, email: user.email, role: user.role }); const redirect = typeof body.redirect === "string" && body.redirect.startsWith("/") && !body.redirect.startsWith("//") ? body.redirect : organization ? "/painel" : "/animais"; return NextResponse.json({ redirect });
}
