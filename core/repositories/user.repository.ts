import prisma from '../prisma';

export class UserRepository {
  async findByLoginId(user_login_id: string) {
    return prisma.users.findUnique({
      where: { user_login_id },
      include: {
        user_permissions: { include: { auth_permissions: true } },
        user_groups: { include: { auth_groups: { include: { auth_group_permissions: { include: { auth_permissions: true } } } } } },
        user_profiles: true,
      },
    });
  }

  async findById(user_id: string) {
    return prisma.users.findUnique({
      where: { user_id },
      include: {
        user_permissions: { include: { auth_permissions: true } },
        user_groups: { include: { auth_groups: { include: { auth_group_permissions: { include: { auth_permissions: true } } } } } },
        user_profiles: true,
      },
    });
  }
}
