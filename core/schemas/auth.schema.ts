import { z } from 'zod';

export const loginSchema = z.object({
  user_login_id: z.email().min(1),
  password: z.string().min(1),
});

export type LoginInput = z.infer<typeof loginSchema>;
