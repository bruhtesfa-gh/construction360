import { JobRepository } from '../repositories/job.repository';

export class JobService {
  private repo = new JobRepository();
  async getAll(builderId: string, limit: number = 10) {
    return this.repo.getAll(builderId, limit);
  }
}
