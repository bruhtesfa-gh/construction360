import { configureStore } from '@reduxjs/toolkit';
import { jobsApi } from './apis/jobsApi';
import { homesApi } from './apis/homesApi';
import { customersApi } from './apis/customersApi';
import { communitiesApi } from './apis/communitiesApi';
import { buildersApi } from './apis/buildersApi';
import { contactsApi } from './apis/contactsApi';
import { quoteContractsApi } from './apis/quoteContractsApi';
import userReducer from './slices/userSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    [jobsApi.reducerPath]: jobsApi.reducer,
    [homesApi.reducerPath]: homesApi.reducer,
    [buildersApi.reducerPath]: buildersApi.reducer,
    [customersApi.reducerPath]: customersApi.reducer,
    [contactsApi.reducerPath]: contactsApi.reducer,
    [communitiesApi.reducerPath]: communitiesApi.reducer,
    [quoteContractsApi.reducerPath]: quoteContractsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      jobsApi.middleware,
      homesApi.middleware,
      buildersApi.middleware,
      contactsApi.middleware,
      customersApi.middleware,
      communitiesApi.middleware,
      quoteContractsApi.middleware,
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppState = ReturnType<typeof configureStore>;
export type AppDispatch = typeof store.dispatch;
