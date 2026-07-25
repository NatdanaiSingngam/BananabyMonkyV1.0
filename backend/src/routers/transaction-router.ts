import { Hono } from 'hono'
import { describeRoute, resolver, validator } from 'hono-openapi'
import {
  createTransactionSchema,
  errorResponseSchema,
  idParamSchema,
  updateTransactionSchema,
  transactionListResponseSchema,
  transactionResponseSchema,
} from '../schemas/transaction-schemas'
import type { AppEnv } from '../types'

const jsonContent = (schema: Parameters<typeof resolver>[0]) => ({
  'application/json': { schema: resolver(schema) },
})

export function createTransactionRouter() {
  const router = new Hono<AppEnv>()

  router.get(
    '/',
    describeRoute({
      tags: ['Transactions'],
      summary: 'List all transactions',
      description: 'Optional query ?userId=xxx to filter by user.',
      responses: {
        200: { description: 'All transactions', content: jsonContent(transactionListResponseSchema) },
      },
    }),
    (c) => c.get('container').transactionHandler.listByUser(c)
  )

  router.post(
    '/',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Create a transaction',
      responses: {
        201: { description: 'Transaction created', content: jsonContent(transactionResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('json', createTransactionSchema),
    (c) => c.get('container').transactionHandler.create(c)
  )

  router.get(
    '/:id',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Get a transaction by id',
      responses: {
        200: { description: 'Transaction found', content: jsonContent(transactionResponseSchema) },
        404: { description: 'Transaction not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').transactionHandler.get(c)
  )

  router.patch(
    '/:id',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Update a transaction',
      responses: {
        200: { description: 'Transaction updated', content: jsonContent(transactionResponseSchema) },
        400: { description: 'Invalid input', content: jsonContent(errorResponseSchema) },
        404: { description: 'Transaction not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    validator('json', updateTransactionSchema),
    (c) => c.get('container').transactionHandler.update(c)
  )

  router.delete(
    '/:id',
    describeRoute({
      tags: ['Transactions'],
      summary: 'Delete a transaction',
      responses: {
        204: { description: 'Transaction deleted' },
        404: { description: 'Transaction not found', content: jsonContent(errorResponseSchema) },
      },
    }),
    validator('param', idParamSchema),
    (c) => c.get('container').transactionHandler.delete(c)
  )

  return router
}
