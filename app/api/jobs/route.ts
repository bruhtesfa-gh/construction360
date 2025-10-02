import { JobService } from '@/core/services/job.service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const jobQuerySchema = z.object({
  builderId: z.string().uuid(),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
});

const jobService = new JobService();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const builderId = searchParams.get('builderId');
  const limit = searchParams.get('limit');
  const parse = jobQuerySchema.safeParse({ builderId, limit });
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid query', details: parse.error.issues }, { status: 400 });
  }
  const jobs = await jobService.getAll(parse.data.builderId, parse.data.limit);
  return NextResponse.json(jobs);
}
