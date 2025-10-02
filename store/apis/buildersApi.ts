import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Builder {
  builder_id: string;
  builder_name?: string;
  logo_url?: string;
}

export interface GetByIdQuery {
  builderId: string;
}

export const buildersApi = createApi({
  reducerPath: 'buildersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/builders' }),
  endpoints: (builder) => ({
    getById: builder.query<Builder, GetByIdQuery>({
      query: ({ builderId }) => `/${builderId}`,
    }),
  }),
});
export const { useGetByIdQuery } = buildersApi;
