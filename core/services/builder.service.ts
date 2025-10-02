import { BuilderRepository } from '../repositories/builder.repository';

export class BuilderService {
  private repo = new BuilderRepository();
  async getById(builderId: string) {
    return this.repo.getById(builderId);
  }
}
