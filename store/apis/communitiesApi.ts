import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Community {
  community_id: string;
  name: string;
}

export interface CommunitiesQuery {
  builderId: string;
}

export const communitiesApi = createApi({
  reducerPath: 'communitiesApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/communities' }),
  endpoints: (builder) => ({
    getAll: builder.query<Community[], CommunitiesQuery>({
      query: ({ builderId }) => `?builderId=${builderId}`,
    }),
  }),
});
export const { useGetAllQuery } = communitiesApi;
