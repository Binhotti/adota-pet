import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";
import type { UserRole } from "@prisma/client";

const COOKIE_NAME = "adotapet_session";
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET ?? "dev-only-change-me");

export type SessionUser = { id: string; name: string; email: string; role: UserRole };

export async function createSession(user: SessionUser) {
  const token = await new SignJWT(user).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret());
  (await cookies()).set(COOKIE_NAME, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 7 });
}

export async function getSession(): Promise<SessionUser | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  if (!token) return null;
  try { const { payload } = await jwtVerify(token, secret()); return payload as SessionUser; } catch { return null; }
}

export async function clearSession() { (await cookies()).delete(COOKIE_NAME); }
