import type { CreateTransactionInput, UpdateTransactionInput, Transaction } from '../domain/entities/transaction'
import { NotFoundError, ValidationError } from '../domain/errors'
import type { TransactionRepository } from '../domain/repositories/transaction-repository'

export class TransactionService {
  constructor(
    private readonly transactionRepository: TransactionRepository
  ) {}

  async listTransactions(): Promise<Transaction[]> {
    return this.transactionRepository.findAll()
  }

  async getTransaction(id: string): Promise<Transaction> {
    const transaction = await this.transactionRepository.findById(id)
    if (!transaction) throw new NotFoundError('Transaction')
    return transaction
  }

  async getTransactionsByUser(userId: string): Promise<Transaction[]> {
    if (!userId?.trim()) throw new ValidationError('userId is required')
    return this.transactionRepository.findByUserId(userId)
  }

  async createTransaction(input: CreateTransactionInput): Promise<Transaction> {
    this.validateTransactionInput(input)
    return this.transactionRepository.create(input)
  }

  async updateTransaction(id: string, input: UpdateTransactionInput): Promise<Transaction> {
    if (input.amount !== undefined && input.amount < 0) throw new ValidationError('amount must be positive')
    const updated = await this.transactionRepository.update(id, input)
    if (!updated) throw new NotFoundError('Transaction')
    return updated
  }

  async deleteTransaction(id: string): Promise<void> {
    const deleted = await this.transactionRepository.delete(id)
    if (!deleted) throw new NotFoundError('Transaction')
  }

  private validateTransactionInput(input: CreateTransactionInput): void {
    if (!['income', 'expense'].includes(input.type)) throw new ValidationError('type must be "income" or "expense"')
    if (input.amount === undefined || input.amount < 0) throw new ValidationError('amount must be a positive number')
    if (!input.categoryId?.trim()) throw new ValidationError('categoryId is required')
    if (!input.userId?.trim()) throw new ValidationError('userId is required')
    if (!input.date?.trim()) throw new ValidationError('date is required')
  }
}
