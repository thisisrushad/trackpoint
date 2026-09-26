import { NextResponse } from "next/server";
import { authService } from "./auth.service";
import { extractTokenFromHeader, verifyJWT } from "@/lib/jwt";

export class AuthController {
  /**
   * POST /api/auth/login
   */
  async login(req: Request) {
    try {
      const body = await req.json();
      const { email, role } = body;

      const result = await authService.login(email, role);

      const response = NextResponse.json({
        success: true,
        message: "Authentication successful.",
        token: result.token,
        user: result.user
      });

      // Also set HTTP-Only Cookie for session security
      response.cookies.set("trackpoint_jwt", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
  }

  /**
   * GET /api/auth/me — Verify currently logged-in user via JWT
   */
  async me(req: Request) {
    try {
      const token = extractTokenFromHeader(req);
      if (!token) {
        return NextResponse.json({ success: false, error: "No authorization token provided" }, { status: 401 });
      }

      const payload = verifyJWT(token);
      if (!payload) {
        return NextResponse.json({ success: false, error: "Invalid or expired JWT token" }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        user: payload
      });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
  }
  /**
   * POST /api/auth/register — Self-service B2B customer onboarding
   */
  async register(req: Request) {
    try {
      const body = await req.json();
      const { name, email, companyName, password, abn, industry, creditTerms, phone, location } = body;

      if (!name || !email || !companyName) {
        return NextResponse.json(
          { success: false, error: "Contact name, work email, and company name are required." },
          { status: 400 }
        );
      }

      const result = await authService.register({
        name,
        email,
        companyName,
        password,
        abn,
        industry,
        creditTerms,
        phone,
        location
      });

      const response = NextResponse.json({
        success: true,
        message: "Commercial customer account registered successfully.",
        token: result.token,
        user: result.user
      });

      response.cookies.set("trackpoint_jwt", result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7 // 7 days
      });

      return response;
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
  }
}

export const authController = new AuthController();
