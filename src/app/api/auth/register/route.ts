import { authController } from "@/modules/auth/auth.controller";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  return authController.register(req);
}
