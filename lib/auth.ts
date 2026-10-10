import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";
import { auth as googleAuth } from "@/auth";

const scrypt = promisify(scryptCallback);
const COOKIE_NAME = "adotapet_session";
const secret = () => process.env.AUTH_SECRET ?? "dev-only-change-me";
const encode = (value: string) => Buffer.from(value).toString("base64url");

export type SessionUser = { id: string; name: string; email: string; role: UserRole };

export async function hashPassword(password: string) { const salt = randomBytes(16).toString("hex"); const hash = await scrypt(password, salt, 64) as Buffer; return `${salt}:${hash.toString("hex")}`; }
export async function verifyPassword(password: string, stored: string | null) { if (!stored) return false; const [salt, key] = stored.split(":"); if (!salt || !key) return false; const hash = await scrypt(password, salt, 64) as Buffer; const saved = Buffer.from(key, "hex"); return saved.length === hash.length && timingSafeEqual(saved, hash); }

export async function createSession(user: SessionUser) {
  const payload = encode(JSON.stringify({ ...user, exp: Date.now() + 7 * 86400000 }));
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  (await cookies()).set(COOKIE_NAME, `${payload}.${signature}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 });
}
export async function getSession(): Promise<SessionUser | null> { const token = (await cookies()).get(COOKIE_NAME)?.value; if (token) { const [payload, signature] = token.split("."); const expected = createHmac("sha256", secret()).update(payload).digest("base64url"); if (signature && signature.length === expected.length && timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) { try { const data = JSON.parse(Buffer.from(payload, "base64url").toString()); if (data.exp > Date.now()) return data; } catch {} } } const session=await googleAuth(); return session?.user?.id&&session.user.email?{id:session.user.id,name:session.user.name??"Usuário",email:session.user.email,role:session.user.role}:null; }
export async function clearSession() { const store=await cookies(); store.delete(COOKIE_NAME); store.delete("authjs.session-token"); store.delete("__Secure-authjs.session-token"); }
