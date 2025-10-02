import prisma from '../prisma';
import type { CreateContactFormInput } from '../schemas/contact.schema';

export class ContactRepository {
  async getAll(builderId: string) {
    return prisma.contacts.findMany({
      where: { builder_id: builderId },
      orderBy: { created_at: 'desc' },
    });
  }

  async createContact(data: CreateContactFormInput) {
    return prisma.contacts.create({
      data,
    });
  }
}
