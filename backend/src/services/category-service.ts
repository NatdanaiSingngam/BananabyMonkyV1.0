import type { CreateCategoryInput, UpdateCategoryInput, Category } from '../domain/entities/category'
import { NotFoundError, ValidationError } from '../domain/errors'
import type { CategoryRepository } from '../domain/repositories/category-repository'

export class CategoryService {
  constructor(
    private readonly categoryRepository: CategoryRepository
  ) {}

  async listCategories(): Promise<Category[]> {
    return this.categoryRepository.findAll()
  }

  async getCategory(id: string): Promise<Category> {
    const category = await this.categoryRepository.findById(id)
    if (!category) throw new NotFoundError('Category')
    return category
  }

  async getCategoriesByType(type: 'income' | 'expense'): Promise<Category[]> {
    if (!['income', 'expense'].includes(type)) throw new ValidationError('type must be "income" or "expense"')
    return this.categoryRepository.findByType(type)
  }

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    if (!input.name?.trim()) throw new ValidationError('name is required')
    if (!['income', 'expense'].includes(input.type)) throw new ValidationError('type must be "income" or "expense"')
    return this.categoryRepository.create({
      name: input.name.trim(),
      type: input.type,
      icon: input.icon || 'ri-list-line',
      color: input.color || '#3b82f6',
    })
  }

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    const updated = await this.categoryRepository.update(id, input)
    if (!updated) throw new NotFoundError('Category')
    return updated
  }

  async deleteCategory(id: string): Promise<void> {
    const deleted = await this.categoryRepository.delete(id)
    if (!deleted) throw new NotFoundError('Category')
  }
}
