import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export type AppApiError = FetchBaseQueryError & {
  status: number;
  message: string;
};