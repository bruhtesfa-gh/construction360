import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../core/prisma';
import { getBuilderId } from '../../_utils';

export async function GET(req: NextRequest, { params }: { params: { builderId: string } }) {
  const builderId = getBuilderId(req);
  
  if (!builderId) {
    return NextResponse.json({ error: 'Missing builderId' }, { status: 400 });
  }
  const builder = await prisma.builders.findUnique({
    where: { builder_id: builderId },
    select: { builder_id: true, builder_name: true, logo_url: true },
  });
  if (!builder) {
    return NextResponse.json({ error: 'Builder not found' }, { status: 404 });
  }
  return NextResponse.json(builder);
}
