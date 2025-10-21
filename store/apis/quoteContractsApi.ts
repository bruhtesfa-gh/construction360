import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface QuoteContractListItem {
  id: string;
  contractNumber: string | null;
  quoteContractType: string | null;
  status: string | null;
  createdAt: string | null;
  communityCode: string | null;
  communityPhaseCode: string | null;
  lot: string | null;
  block: string | null;
  state: string | null;
}

export interface QuoteContractsResponse {
  count: number;
  page: number;
  pageSize: number;
  results: QuoteContractListItem[];
}

export interface QuoteContractsQuery {
  builderId: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export const quoteContractsApi = createApi({
  reducerPath: 'quoteContractsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/quote-contracts' }),
  endpoints: (builder) => ({
    getContracts: builder.query<QuoteContractsResponse, QuoteContractsQuery>({
      query: ({ builderId, search = '', page = 1, pageSize = 10 }) => {
        const params = new URLSearchParams({
          builderId,
          page: String(page),
          pageSize: String(pageSize),
        });

        if (search) {
          params.set('search', search);
        }

        return `?${params.toString()}`;
      },
      serializeQueryArgs: ({ queryArgs }) => {
        const { builderId, search = '', page = 1, pageSize = 10 } = queryArgs;
        return JSON.stringify({ builderId, search, page, pageSize });
      },
      transformResponse: (response: QuoteContractsResponse) => ({
        ...response,
        results: response.results.map((item) => ({
          ...item,
          createdAt: item.createdAt,
        })),
      }),
    }),
  }),
});

export const { useGetContractsQuery } = quoteContractsApi;
