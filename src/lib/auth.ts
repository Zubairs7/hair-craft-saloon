import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

const COOKIE = "hc_admin_session";
const SECRET = process.env.ADMIN_SESSION_SECRET || "hair-craft-dev-secret-change-me";

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

export function createSessionToken(adminId: string): string {
  const exp = Date.now() + 1000 * 60 * 60 * 24 * 7;
  const payload = `${adminId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string): string | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [adminId, expStr, sig] = parts;
  const payload = `${adminId}.${expStr}`;
  const expected = sign(payload);
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  if (Date.now() > Number(expStr)) return null;
  return adminId;
}

export async function loginAdmin(username: string, password: string) {
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return null;
  const ok = await bcrypt.compare(password, admin.passwordHash);
  if (!ok) return null;
  return admin;
}

export async function setAdminCookie(adminId: string) {
  const token = createSessionToken(adminId);
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete(COOKIE);
}

export async function getAdminSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (!token) return null;
  const adminId = verifySessionToken(token);
  if (!adminId) return null;
  return prisma.admin.findUnique({ where: { id: adminId } });
}

export async function requireAdmin() {
  const admin = await getAdminSession();
  if (!admin) throw new Error("UNAUTHORIZED");
  return admin;
}
