import prisma from '../prisma';

export class JobRepository {
  async getAll(builderId: string, limit: number = 10) {
    return prisma.jobs.findMany({
      where: { builder_id: builderId },
      take: limit,
      orderBy: { created_at: 'desc' },
    });
  }
}
