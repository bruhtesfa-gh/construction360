import prisma from '../prisma';

export class BuilderRepository {
  async createBuilder(builder_name: string) {
    return prisma.builders.create({
      data: {
        builder_name,
      },
    });
  }

  async getById(builderId: string) {
    return prisma.builders.findUnique({
      where: { builder_id: builderId },
      select: { builder_id: true, builder_name: true, logo_url: true },
    });
  }
}
