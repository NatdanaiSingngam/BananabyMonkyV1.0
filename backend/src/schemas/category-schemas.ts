import z from 'zod'

export const categorySchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  type: z.enum(['income', 'expense']),
  icon: z.string(),
  color: z.string(),
  createdAt: z.string().datetime(),
})

export const createCategorySchema = z.object({
  name: z.string().min(1),
  type: z.enum(['income', 'expense']),
  icon: z.string().default('ri-list-line'),
  color: z.string().default('#3b82f6'),
})

export const updateCategorySchema = createCategorySchema.partial()

export const idParamSchema = z.object({
  id: z.string().min(1),
})

export const categoryResponseSchema = z.object({ data: categorySchema })
export const categoryListResponseSchema = z.object({ data: z.array(categorySchema) })

export const errorResponseSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
  }),
})
