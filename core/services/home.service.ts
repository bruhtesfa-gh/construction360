import { HomeRepository } from '../repositories/home.repository';

export class HomeService {
  private repo = new HomeRepository();
  async getAll(builderId: string, limit: number = 10) {
    return this.repo.getAll(builderId, limit);
  }
}
