import { jobsController } from "@/modules/jobs/jobs.controller";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  return jobsController.getAll(req);
}

export async function POST(req: Request) {
  return jobsController.create(req);
}
