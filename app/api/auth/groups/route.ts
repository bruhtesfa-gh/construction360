import { NextRequest, NextResponse } from 'next/server';
import { GroupRepository } from '../../../../core/repositories/group.repository';

const groupRepo = new GroupRepository();

export async function GET() {
  const groups = await groupRepo.findAllWithPermissions();
  return NextResponse.json({ groups });
}
