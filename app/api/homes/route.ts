import { HomeService } from '@/core/services/home.service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const homeQuerySchema = z.object({
  builderId: z.string().uuid(),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 10)),
});

const homeService = new HomeService();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const builderId = searchParams.get('builderId');
  const limit = searchParams.get('limit');
  const parse = homeQuerySchema.safeParse({ builderId, limit });
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid query', details: parse.error.issues }, { status: 400 });
  }
  const homes = await homeService.getAll(parse.data.builderId, parse.data.limit);
  return NextResponse.json(homes);
}
