import { authController } from "@/modules/auth/auth.controller";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return authController.me(req);
}
