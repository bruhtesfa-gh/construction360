import { IContact } from '@/core/schemas/contact.schema';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export interface GetAllContactsQuery {
  builderId: string;
}

export const contactsApi = createApi({
  reducerPath: 'contactsApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/contacts' }),
  endpoints: (builder) => ({
    getAll: builder.query<IContact[], GetAllContactsQuery>({
      query: ({ builderId }) => `?builderId=${builderId}`,
    }),
    createContact: builder.mutation<IContact, Partial<IContact>>({
      query: (body) => ({
        url: '',
        method: 'POST',
        body,
      }),
    }),
  }),
});
export const { useGetAllQuery, useCreateContactMutation } = contactsApi;
