export interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  categoryId: string
  description: string
  date: string
  createdAt: string
  userId: string
}

export interface CreateTransactionBody {
  type: 'income' | 'expense'
  amount: number
  categoryId: string
  description: string
  date: string
  userId: string
}

export interface UpdateTransactionBody {
  type?: 'income' | 'expense'
  amount?: number
  categoryId?: string
  description?: string
  date?: string
}

export interface TransactionListResponse {
  data: Transaction[]
}

export interface TransactionResponse {
  data: Transaction
}
