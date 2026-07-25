import type { CreateTransactionInput, UpdateTransactionInput, Transaction } from '../../domain/entities/transaction'
import type { TransactionRepository } from '../../domain/repositories/transaction-repository'

export class MemoryTransactionRepository implements TransactionRepository {
  private readonly transactions = new Map<string, Transaction>()

  async findAll(): Promise<Transaction[]> {
    return [...this.transactions.values()].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt))
  }

  async findById(id: string): Promise<Transaction | null> {
    return this.transactions.get(id) ?? null
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    return [...this.transactions.values()].filter((t) => t.userId === userId)
  }

  async findByDateRange(startDate: string, endDate: string): Promise<Transaction[]> {
    return [...this.transactions.values()].filter((t) => t.date >= startDate && t.date <= endDate)
  }

  async create(input: CreateTransactionInput): Promise<Transaction> {
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      type: input.type,
      amount: input.amount,
      categoryId: input.categoryId,
      description: input.description,
      date: input.date,
      createdAt: new Date().toISOString(),
      userId: input.userId,
    }
    this.transactions.set(transaction.id, transaction)
    return transaction
  }

  async update(id: string, input: UpdateTransactionInput): Promise<Transaction | null> {
    const existing = this.transactions.get(id)
    if (!existing) return null
    const updated: Transaction = {
      ...existing,
      type: input.type ?? existing.type,
      amount: input.amount ?? existing.amount,
      categoryId: input.categoryId ?? existing.categoryId,
      description: input.description ?? existing.description,
      date: input.date ?? existing.date,
    }
    this.transactions.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.transactions.delete(id)
  }
}
