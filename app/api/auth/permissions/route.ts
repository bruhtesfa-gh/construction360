import { NextRequest, NextResponse } from 'next/server';
import { PermissionRepository } from '../../../../core/repositories/permission.repository';

const permissionRepo = new PermissionRepository();

export async function GET() {
  const permissions = await permissionRepo.findAll();
  return NextResponse.json({ permissions });
}
