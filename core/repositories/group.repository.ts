import prisma from '../prisma';

export class GroupRepository {
  async findAllWithPermissions() {
    return prisma.auth_groups.findMany({
      include: {
        auth_group_permissions: { include: { auth_permissions: true } },
      },
    });
  }
}
