import type { CreateTransactionInput, UpdateTransactionInput, Transaction } from '../../domain/entities/transaction'
import type { TransactionRepository } from '../../domain/repositories/transaction-repository'

interface TransactionRow {
  id: string
  type: string
  amount: number
  category_id: string
  description: string
  date: string
  created_at: string
  user_id: string
}

function toTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    type: row.type as 'income' | 'expense',
    amount: row.amount,
    categoryId: row.category_id,
    description: row.description,
    date: row.date,
    createdAt: row.created_at,
    userId: row.user_id,
  }
}

export class D1TransactionRepository implements TransactionRepository {
  constructor(private readonly db: D1Database) {}

  async findAll(): Promise<Transaction[]> {
    const { results } = await this.db
      .prepare('SELECT id, type, amount, category_id, description, date, created_at, user_id FROM transactions ORDER BY date DESC, created_at DESC')
      .all<TransactionRow>()
    return results.map(toTransaction)
  }

  async findById(id: string): Promise<Transaction | null> {
    const row = await this.db
      .prepare('SELECT id, type, amount, category_id, description, date, created_at, user_id FROM transactions WHERE id = ?')
      .bind(id)
      .first<TransactionRow>()
    return row ? toTransaction(row) : null
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    const { results } = await this.db
      .prepare('SELECT id, type, amount, category_id, description, date, created_at, user_id FROM transactions WHERE user_id = ? ORDER BY date DESC, created_at DESC')
      .bind(userId)
      .all<TransactionRow>()
    return results.map(toTransaction)
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    const { results } = await this.db
      .prepare('SELECT id, type, amount, category_id, description, date, created_at, user_id FROM transactions WHERE date >= ? AND date <= ? ORDER BY date DESC, created_at DESC')
      .bind(startDate, endDate)
      .all<TransactionRow>()
    return results.map(toTransaction)
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const id = crypto.randomUUID()
    const createdAt = new Date().toISOString()
    await this.db
      .prepare('INSERT INTO transactions (id, type, amount, category_id, description, date, created_at, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)')
      .bind(id, input.type, input.amount, input.categoryId, input.description, input.date, createdAt, input.userId)
      .run()
    return { id, ...input, createdAt }
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction | null> {
    const existing = await this.findById(id)
    if (!existing) return null

    const type = input.type ?? existing.type
    const amount = input.amount ?? existing.amount
    const categoryId = input.categoryId ?? existing.categoryId
    const description = input.description ?? existing.description
    const date = input.date ?? existing.date
    await this.db
      .prepare('UPDATE transactions SET type = ?, amount = ?, category_id = ?, description = ?, date = ? WHERE id = ?')
      .bind(type, amount, categoryId, description, date, id)
      .run()
    return { ...existing, type, amount, categoryId, description, date }
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.db.prepare('DELETE FROM transactions WHERE id = ?').bind(id).run()
    return result.meta.changes > 0
  }
}
