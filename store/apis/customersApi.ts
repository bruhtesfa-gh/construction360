import { CreateCustomerInput } from '@/core/schemas/customer.schema';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';


export interface CustomersQuery {
  builderId: string;
}

export const customersApi = createApi({
  reducerPath: 'customersApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/customers' }),
  endpoints: (builder) => ({
    getAll: builder.query<CreateCustomerInput[], CustomersQuery>({
      query: ({ builderId }) => `?builderId=${builderId}`,
    }),
    createCustomer: builder.mutation<any, Partial<CreateCustomerInput> & { region_id: string; builder_id: string }>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
    }),
  }),
});
export const { useGetAllQuery, useCreateCustomerMutation } = customersApi;
