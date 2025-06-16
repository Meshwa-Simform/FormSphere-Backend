import z from 'zod';

export const registerSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .refine((val: string) => /[A-Z]/.test(val), {
      message: 'Password must contain at least one uppercase letter',
    })
    .refine((val: string) => /[a-z]/.test(val), {
      message: 'Password must contain at least one lowercase letter',
    })
    .refine((val: string) => /[0-9]/.test(val), {
      message: 'Password must contain at least one number',
    })
    .refine((val: string) => /[!@#$%^&*]/.test(val), {
      message: 'Password must contain at least one special character',
    }),
});
