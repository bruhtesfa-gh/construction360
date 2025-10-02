import prisma from '../prisma';

export class HomeRepository {
  async getAll(builderId: string, limit: number = 10) {
    return prisma.homes.findMany({
      where: { builder_id: builderId },
      take: limit,
      orderBy: { created_at: 'desc' },
    });
  }
}
