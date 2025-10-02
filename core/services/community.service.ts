import { CommunityRepository } from '../repositories/community.repository';

export class CommunityService {
  private repo = new CommunityRepository();
  async getAll(builderId: string) {
    return this.repo.getAll(builderId);
  }
}
