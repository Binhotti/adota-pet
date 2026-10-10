import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { cookies } from "next/headers";
import type { UserRole } from "@prisma/client";

const scrypt = promisify(scryptCallback);
const COOKIE_NAME = "adotapet_session";
const secret = () => process.env.AUTH_SECRET ?? "dev-only-change-me";
const encode = (value: string) => Buffer.from(value).toString("base64url");

export type SessionUser = { id: string; name: string; email: string; role: UserRole };

export async function hashPassword(password: string) { const salt = randomBytes(16).toString("hex"); const hash = await scrypt(password, salt, 64) as Buffer; return `${salt}:${hash.toString("hex")}`; }
export async function verifyPassword(password: string, stored: string) { const [salt, key] = stored.split(":"); if (!salt || !key) return false; const hash = await scrypt(password, salt, 64) as Buffer; const saved = Buffer.from(key, "hex"); return saved.length === hash.length && timingSafeEqual(saved, hash); }

export async function createSession(user: SessionUser) {
  const payload = encode(JSON.stringify({ ...user, exp: Date.now() + 7 * 86400000 }));
  const signature = createHmac("sha256", secret()).update(payload).digest("base64url");
  (await cookies()).set(COOKIE_NAME, `${payload}.${signature}`, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 604800 });
}
export async function getSession(): Promise<SessionUser | null> { const token = (await cookies()).get(COOKIE_NAME)?.value; if (!token) return null; const [payload, signature] = token.split("."); const expected = createHmac("sha256", secret()).update(payload).digest("base64url"); if (!signature || signature.length !== expected.length || !timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null; try { const data = JSON.parse(Buffer.from(payload, "base64url").toString()); return data.exp > Date.now() ? data : null; } catch { return null; } }
export async function clearSession() { (await cookies()).delete(COOKIE_NAME); }
