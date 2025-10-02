import { z } from 'zod';

export const signupSchema = z.object({
  password: z.string().min(8),
  email_address: z.string().email(),
  first_name: z.string().min(1),
  last_name: z.string().min(1),
  builder_name: z.string().min(1),
});

export type SignupInput = z.infer<typeof signupSchema>;
