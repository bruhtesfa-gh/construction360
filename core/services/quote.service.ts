import { QuoteRepository, QuoteSearchParams, QuoteSearchResult } from '@repos/quote.repository';

export class QuoteService {
  private readonly repository = new QuoteRepository();

  search(params: QuoteSearchParams): Promise<QuoteSearchResult> {
    return this.repository.search(params);
  }
}
