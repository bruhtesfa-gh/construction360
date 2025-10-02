import { CustomerRepository } from '../repositories/customer.repository';
import { CreateCustomerInput } from '../schemas/customer.schema';

export class CustomerService {
  private repo = new CustomerRepository();
  async getAll(builderId: string) {
    return this.repo.getAll(builderId);
  }

  async create(data: CreateCustomerInput) {
    return this.repo.create(data);
  }
}
