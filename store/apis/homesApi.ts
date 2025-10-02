import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Home {
  home_id: string;
  floor_plan_code?: string;
  elevation_code?: string;
  description?: string;
  sequence?: number;
}

export interface HomesQuery {
  builderId: string;
  limit?: number;
}

export const homesApi = createApi({
  reducerPath: 'homesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/homes' }),
  endpoints: (builder) => ({
    getAll: builder.query<Home[], HomesQuery>({
      query: ({ builderId, limit = 10 }) => `?builderId=${builderId}&limit=${limit}`,
    }),
  }),
});
export const { useGetAllQuery } = homesApi;
