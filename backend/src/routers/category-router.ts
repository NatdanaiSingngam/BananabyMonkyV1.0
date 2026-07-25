import { Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'
import {
  createCategorySchema,
  errorResponseSchema,
  idParamSchema,
  updateCategorySchema,
  categoryListResponseSchema,
  categoryResponseSchema,
} from '../schemas/category-schemas'
import type { AppEnv } from '../types'

const jsonContent = (schema: Parameters<typeof resolver>[0]) => ({
  'application/json': { schema: resolver(schema) },
})

export function createCategoryRouter() {
  const router = new Hono<AppEnv>()

  router.get(
    '/',
    describeRoute({
      tags: ['Categories'],
      summary: 'List all categories',
      description: 'Optional query ?type=income or ?type=expense to filter.',
      responses: {
        200: { description: 'All categories', content: jsonContent(categoryListResponseSchema) },
      },
    }),
    (c) => c.get('container').categoryHandler.listByType(c)
  )

  router.post(
    '/',
    describeRoute({
      tags: ['Categories'],
      summary: 'Create a category',
      responses: {
        201: { description: 'Category created', content: jsonContent(categoryResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('json', createCategorySchema),
    (c) => c.get('container').categoryHandler.create(c)
  )

  router.get(
    '/:id',
    describeRoute({
      tags: ['Categories'],
      summary: 'Get a category by id',
      responses: {
        200: { description: 'Category found', content: jsonContent(categoryResponseSchema) },
        404: { description: 'Category not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').categoryHandler.get(c)
  )

  router.patch(
    '/:id',
    describeRoute({
      tags: ['Categories'],
      summary: 'Update a category',
      responses: {
        200: { description: 'Category updated', content: jsonContent(categoryResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Category not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    validator('json', updateCategorySchema),
    (c) => c.get('container').categoryHandler.update(c)
  )

  router.delete(
    '/:id',
    describeRoute({
      tags: ['Categories'],
      summary: 'Delete a category',
      responses: {
        204: { description: 'Category deleted' },
        404: { description: 'Category not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').categoryHandler.delete(c)
  )

  return router
}
