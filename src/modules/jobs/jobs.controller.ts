import { NextResponse } from "next/server";
import { jobsService } from "./jobs.service";

export class JobsController {
  /**
   * GET /api/jobs
   */
  async getAll(req: Request) {
    try {
      const jobs = await jobsService.getAllJobs();
      return NextResponse.json({
        success: true,
        count: jobs.length,
        jobs
      });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }

  /**
   * GET /api/jobs/[id]
   */
  async getById(req: Request, id: string) {
    try {
      const job = await jobsService.getJobById(id);
      if (!job) {
        return NextResponse.json({ success: false, error: "Consignment not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, job });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
  }

  /**
   * POST /api/jobs
   */
  async create(req: Request) {
    try {
      const body = await req.json();
      const job = await jobsService.createJob(body);
      return NextResponse.json({
        success: true,
        message: `Consignment ${job.id} created & auto-assigned to ${job.vehicle}.`,
        job
      }, { status: 201 });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
  }

  /**
   * PATCH /api/jobs/[id]
   */
  async update(req: Request, id: string) {
    try {
      const body = await req.json();
      const result = await jobsService.updateJob(id, body);
      return NextResponse.json({
        success: true,
        job: result.job,
        invoice: result.invoice
      });
    } catch (err: any) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 });
    }
  }
}

export const jobsController = new JobsController();
