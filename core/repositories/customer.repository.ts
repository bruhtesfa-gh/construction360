import prisma from '../prisma';
import { CreateCustomerInput } from '../schemas/customer.schema';

export class CustomerRepository {
  async getAll(builderId: string) {
    return prisma.customers.findMany({
      where: { builder_id: builderId },
      orderBy: { created_at: 'desc' },
    });
  }

  async create(data: CreateCustomerInput) {
    return prisma.customers.create({
      data,
    });
  }
}
