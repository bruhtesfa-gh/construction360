import prisma from '../prisma';

export class PermissionRepository {
  async findAll() {
    return prisma.auth_permissions.findMany();
  }
}
