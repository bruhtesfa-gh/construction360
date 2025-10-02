import { CommunityService } from '@/core/services/community.service';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const communityQuerySchema = z.object({
  builderId: z.string().uuid(),
});

const communityService = new CommunityService();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const builderId = searchParams.get('builderId');
  const parse = communityQuerySchema.safeParse({ builderId });
  if (!parse.success) {
    return NextResponse.json({ error: 'Invalid query', details: parse.error.issues }, { status: 400 });
  }
  const communities = await communityService.getAll(parse.data.builderId);
  return NextResponse.json(communities);
}
