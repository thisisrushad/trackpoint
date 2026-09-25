import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "trackpoint_super_secret_jwt_key_2026_northline_nt";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: "customer" | "admin" | "driver";
  org: string;
}

/**
 * Sign a new JSON Web Token
 */
export function signJWT(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
}

/**
 * Verify and decode an incoming JSON Web Token
 */
export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (err) {
    return null;
  }
}

/**
 * Extract Bearer token from Request Authorization Header
 */
export function extractTokenFromHeader(req: Request): string | null {
  const authHeader = req.headers.get("Authorization") || req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}
