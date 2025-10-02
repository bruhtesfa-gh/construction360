import { ContactRepository } from '../repositories/contact.repository';
import type { CreateContactFormInput } from '../schemas/contact.schema';

export class ContactService {
  private repo = new ContactRepository();

  async getAll(builderId: string) {
    return this.repo.getAll(builderId);
  }

  async createContact(data: CreateContactFormInput) {
    return this.repo.createContact(data);
  }
}
