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

export interface CreateTransactionInput {
  type: 'income' | 'expense'
  amount: number
  categoryId: string
  description: string
  date: string
  userId: string
}

export interface UpdateTransactionInput {
  type?: 'income' | 'expense'
  amount?: number
  categoryId?: string
  description?: string
  date?: string
}
