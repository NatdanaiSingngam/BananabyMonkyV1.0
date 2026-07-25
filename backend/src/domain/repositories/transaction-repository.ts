import type { CreateTransactionInput, UpdateTransactionInput, Transaction } from '../entities/transaction'

export interface TransactionRepository {
  findAll(): Promise<Transaction[]>
  findById(id: string): Promise<Transaction | null>
  findByUserId(userId: string): Promise<Transaction[]>
  findByDateRange(startDate: string, endDate: string): Promise<Transaction[]>
  create(input: CreateTransactionInput): Promise<Transaction>
  update(id: string, input: UpdateTransactionInput): Promise<Transaction | null>
  delete(id: string): Promise<boolean>
}
