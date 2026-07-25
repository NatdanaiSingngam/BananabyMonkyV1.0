import type { CreateTransactionBody, UpdateTransactionBody, TransactionListResponse, TransactionResponse } from '@/models'
import { request } from './request'

const BASE = `${import.meta.env.VITE_BACKEND_URL}/api/v1/transactions`

export const transactionApi = {
  list: (userId?: string) => request<TransactionListResponse>(userId ? `${BASE}?userId=${userId}` : BASE),
  get: (id: string) => request<TransactionResponse>(`${BASE}/${id}`),
  create: (body: CreateTransactionBody) => request<TransactionResponse>(BASE, { method: 'POST', body: JSON.stringify(body) }),
  update: (id: string, body: UpdateTransactionBody) => request<TransactionResponse>(`${BASE}/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  remove: (id: string) => request<void>(`${BASE}/${id}`, { method: 'DELETE' }),
}
