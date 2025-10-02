import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface Job {
  job_id: string;
  job_number: string;
  description?: string;
  construction_stage?: number;
}

export interface JobsQuery {
  builderId: string;
  limit?: number;
}

export const jobsApi = createApi({
  reducerPath: 'jobsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/jobs' }),
  endpoints: (builder) => ({
    getAll: builder.query<Job[], JobsQuery>({
      query: ({ builderId, limit = 10 }) => `?builderId=${builderId}&limit=${limit}`,
    }),
  }),
});
export const { useGetAllQuery } = jobsApi;
