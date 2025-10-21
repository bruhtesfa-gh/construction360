import { NextRequest, NextResponse } from 'next/server';
import { QuoteService } from '@/core/services/quote.service';
import { quoteSearchSchema } from '@/core/schemas/quote.schema';

const quoteService = new QuoteService();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const parsed = quoteSearchSchema.safeParse({
    builderId: searchParams.get('builderId'),
    search: searchParams.get('search') ?? undefined,
    page: searchParams.get('page') ?? searchParams.get('page_number') ?? undefined,
    pageSize: searchParams.get('pageSize') ?? searchParams.get('page_size') ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { builderId, search, page, pageSize } = parsed.data;
  const result = await quoteService.search({ builderId, search, page, pageSize });

  return NextResponse.json({
    count: result.total,
    page,
    pageSize,
    results: result.items,
  });
}
