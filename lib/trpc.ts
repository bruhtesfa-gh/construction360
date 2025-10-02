'use client';

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../.junk/server/api/root';

export const api = createTRPCReact<AppRouter>();