import prisma from '../prisma';

export class CommunityRepository {
  async getAll(builderId: string) {
    // Assuming communities are referenced in homes
    return prisma.homes.findMany({
      where: { builder_id: builderId },
      select: { community_id: true },
      distinct: ['community_id'],
    });
  }
}
