/**
 * Auth helpers for NextAuth compatibility.
 * - JWT verification using NEXTAUTH_SECRET (backend validates NextAuth JWTs)
 * - No Better Auth; auth runs on the Next.js app via NextAuth.
 */

import { jwtVerify, type JWTPayload } from "jose";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.NEXTAUTH_SECRET;
if (!JWT_SECRET && process.env.NODE_ENV !== "test") {
  console.warn("[Auth] NEXTAUTH_SECRET is not set; JWT verification will fail.");
}

const secret = JWT_SECRET ? new TextEncoder().encode(JWT_SECRET) : new Uint8Array(0);

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  emailVerified: boolean;
}

export interface NextAuthJwtPayload extends JWTPayload {
  sub?: string;
  email?: string;
  name?: string;
  role?: string;
}

/**
 * Get JWT from cookie (next-auth.session-token) or Authorization: Bearer <token>
 */
function getTokenFromRequest(req: { headers: { cookie?: string; authorization?: string } }): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const cookie = req.headers.cookie;
  if (!cookie) return null;
  const match =
    cookie.match(/(?:^|;\s*)next-auth\.session-token=([^;]*)/) ??
    cookie.match(/(?:^|;\s*)__Secure-next-auth\.session-token=([^;]*)/);
  return match ? decodeURIComponent(match[1].trim()) : null;
}

/**
 * Verify NextAuth JWT and return payload. Returns null if invalid/missing.
 */
export async function verifyNextAuthJwt(token: string): Promise<NextAuthJwtPayload | null> {
  if (!secret.length) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload as NextAuthJwtPayload;
  } catch {
    return null;
  }
}

/**
 * Resolve current user from request: verify JWT, then optionally load role from DB if missing in token.
 */
export async function getAuthUserFromRequest(req: {
  headers: { cookie?: string; authorization?: string };
}): Promise<AuthUser | null> {
  const token = getTokenFromRequest(req);
  if (!token) return null;

  const payload = await verifyNextAuthJwt(token);
  if (!payload?.sub) return null;

  let role = payload.role as string | undefined;
  if (role === undefined) {
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { role: true, emailVerified: true },
    });
    role = dbUser?.role ?? "STUDENT";
  }

  return {
    id: payload.sub,
    email: (payload.email as string) ?? "",
    name: (payload.name as string) ?? "",
    role: role ?? "STUDENT",
    emailVerified: !!payload.email_verified,
  };
}
