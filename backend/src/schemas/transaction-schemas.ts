import z from 'zod'

export const transactionSchema = z.object({
  id: z.string().uuid(),
  type: z.enum(['income', 'expense']),
  amount: z.number().nonnegative(),
  categoryId: z.string().uuid(),
  description: z.string(),
  date: z.string(),
  createdAt: z.string().datetime(),
  userId: z.string().uuid(),
})

export const createTransactionSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().nonnegative(),
  categoryId: z.string().min(1),
  description: z.string().default(''),
  date: z.string().min(1),
  userId: z.string().min(1),
})

export const updateTransactionSchema = z.object({
  type: z.enum(['income', 'expense']).optional(),
  amount: z.number().nonnegative().optional(),
  categoryId: z.string().min(1).optional(),
  description: z.string().optional(),
  date: z.string().min(1).optional(),
})

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export const transactionResponseSchema = z.object({ data: transactionSchema })
export const transactionListResponseSchema = z.object({ data: z.array(transactionSchema) })

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})
