import type { Prisma } from "@/prisma/generated/prisma";
import prisma from "../prisma";

export interface QuoteSearchParams {
  builderId: string;
  search?: string;
  page: number;
  pageSize: number;
}

export interface QuoteListItem {
  id: string;
  contractNumber: string | null;
  quoteContractType: string | null;
  status: string | null;
  createdAt: Date | null;
  communityCode: string | null;
  communityPhaseCode: string | null;
  lot: string | null;
  block: string | null;
  state: string | null;
}

export interface QuoteSearchResult {
  total: number;
  items: QuoteListItem[];
}

export class QuoteRepository {
  async search({
    builderId,
    search,
    page,
    pageSize,
  }: QuoteSearchParams): Promise<QuoteSearchResult> {
    const where: Prisma.quote_contractsWhereInput = { builder_id: builderId };

    if (search) {
      const term = search.trim();
      if (term.length > 0) {
        where.OR = [
          { contract_number: { contains: term, mode: "insensitive" } },
          { status: { contains: term, mode: "insensitive" } },
          { contract_type: { contains: term, mode: "insensitive" } },
          {
            communities: {
              community_code: { contains: term, mode: "insensitive" },
            },
          },
          { lots: { lot: { contains: term, mode: "insensitive" } } },
          { lots: { block: { contains: term, mode: "insensitive" } } },
        ];
      }
    }

    const skip = Math.max(page - 1, 0) * pageSize;

    const [contracts, total] = await prisma.$transaction([
      prisma.quote_contracts.findMany({
        where,
        include: {
          communities: true,
          lots: {
            include: {
              community_phase: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
        skip,
        take: pageSize,
      }),
      prisma.quote_contracts.count({ where }),
    ]);

    const items: QuoteListItem[] = contracts.map((contract) => ({
      id: contract.quote_contract_id,
      contractNumber: contract.contract_number,
      quoteContractType: contract.contract_type,
      status: contract.status,
      createdAt: contract.created_at,
      communityCode: contract.communities?.community_code ?? null,
      communityPhaseCode:
        contract.lots?.community_phase?.community_phase_code ?? null,
      lot: contract.lots?.lot ?? null,
      block: contract.lots?.block ?? null,
      state: contract.communities?.state ?? contract.lots?.state ?? null,
    }));

    return { total, items };
  }
}
