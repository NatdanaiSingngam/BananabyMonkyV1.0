import type { CreateCategoryInput, UpdateCategoryInput, Category } from '../../domain/entities/category'
import type { CategoryRepository } from '../../domain/repositories/category-repository'

export class MemoryCategoryRepository implements CategoryRepository {
  private readonly categories = new Map<string, Category>()

  async findAll(): Promise<Category[]> {
    return [...this.categories.values()].sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name))
  }

  async findById(id: string): Promise<Category | null> {
    return this.categories.get(id) ?? null
  }

  async findByType(type: 'income' | 'expense'): Promise<Category[]> {
    return [...this.categories.values()].filter((c) => c.type === type)
  }

  async create(input: CreateCategoryInput): Promise<Category> {
    const category: Category = {
      id: crypto.randomUUID(),
      name: input.name,
      type: input.type,
      icon: input.icon,
      color: input.color,
      createdAt: new Date().toISOString(),
    }
    this.categories.set(category.id, category)
    return category
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category | null> {
    const existing = this.categories.get(id)
    if (!existing) return null
    const updated: Category = {
      ...existing,
      name: input.name ?? existing.name,
      type: input.type ?? existing.type,
      icon: input.icon ?? existing.icon,
      color: input.color ?? existing.color,
    }
    this.categories.set(id, updated)
    return updated
  }

  async delete(id: string): Promise<boolean> {
    return this.categories.delete(id)
  }
}
