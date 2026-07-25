<script setup lang="ts">
import { useCategoryStore } from '@/stores/use-category-store'
import type { CreateCategoryBody, UpdateCategoryBody, Category } from '@/models'

const categoryStore = useCategoryStore()
const { categories, isLoading, error } = storeToRefs(categoryStore)

const headers = [
  { title: 'Name', key: 'name' },
  { title: 'Type', key: 'type' },
  { title: 'Icon', key: 'icon' },
  { title: 'Color', key: 'color' },
  { title: 'Action', key: 'action', sortable: false, align: 'end' as const },
]

const typeFilter = ref<string>('')

const dialog = ref(false)
const deleteDialog = ref(false)
const isSubmitting = ref(false)
const editingCategory = ref<Category | null>(null)
const deletingCategory = ref<Category | null>(null)

const form = ref<CreateCategoryBody>({ name: '', type: 'expense', icon: 'ri-list-line', color: '#3b82f6' })

function openCreate() {
  editingCategory.value = null
  form.value = { name: '', type: 'expense', icon: 'ri-list-line', color: '#3b82f6' }
  dialog.value = true
}

function openEdit(category: Category) {
  editingCategory.value = category
  form.value = { name: category.name, type: category.type, icon: category.icon, color: category.color }
  dialog.value = true
}

function openDelete(category: Category) {
  deletingCategory.value = category
  deleteDialog.value = true
}

async function submit() {
  isSubmitting.value = true
  try {
    if (editingCategory.value)
      await categoryStore.updateCategory(editingCategory.value.id, form.value)
    else
      await categoryStore.createCategory(form.value)
    dialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!deletingCategory.value) return
  isSubmitting.value = true
  try {
    await categoryStore.deleteCategory(deletingCategory.value.id)
    deleteDialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

watch(typeFilter, () => {
  categoryStore.fetchCategories(typeFilter.value || undefined)
})

onMounted(() => categoryStore.fetchCategories())
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">Categories Management</span>
        <div class="d-flex gap-3">
          <VSelect
            v-model="typeFilter"
            :items="[
              { title: 'All', value: '' },
              { title: 'Income', value: 'income' },
              { title: 'Expense', value: 'expense' },
            ]"
            density="compact"
            style="max-width: 140px"
            hide-details
          />
          <VBtn
            color="primary"
            prepend-icon="ri-add-line"
            @click="openCreate"
          >
            Add Category
          </VBtn>
        </div>
      </VCardTitle>

      <VDivider />

      <VAlert
        v-if="error"
        type="error"
        class="ma-4"
        :text="error"
        closable
      />

      <VDataTable
        :headers="headers"
        :items="categories"
        :loading="isLoading"
        hover
      >
        <template #item.type="{ item }">
          <VChip
            :color="item.type === 'income' ? 'success' : 'error'"
            size="small"
          >
            {{ item.type === 'income' ? 'รายรับ' : 'รายจ่าย' }}
          </VChip>
        </template>

        <template #item.icon="{ item }">
          <VIcon :icon="item.icon" />
        </template>

        <template #item.color="{ item }">
          <div class="d-flex align-center gap-2">
            <div
              :style="{ width: '20px', height: '20px', borderRadius: '4px', backgroundColor: item.color }"
            />
            {{ item.color }}
          </div>
        </template>

        <template #item.action="{ item }">
          <IconBtn @click="openEdit(item)">
            <VTooltip activator="parent" location="top">Edit</VTooltip>
            <VIcon icon="ri-pencil-line" />
          </IconBtn>
          <IconBtn color="error" @click="openDelete(item)">
            <VTooltip activator="parent" location="top">Delete</VTooltip>
            <VIcon icon="ri-delete-bin-line" />
          </IconBtn>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-disabled">
            No categories yet. Click "Add Category" to create one.
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create / Edit Dialog -->
    <VDialog v-model="dialog" max-width="520" persistent>
      <VCard :title="editingCategory ? 'Edit Category' : 'Add Category'">
        <VCardText>
          <VForm @submit.prevent="submit">
            <VTextField
              v-model="form.name"
              label="Name"
              prepend-inner-icon="ri-price-tag-3-line"
              class="mb-4"
              required
            />
            <VSelect
              v-model="form.type"
              :items="[
                { title: 'Income', value: 'income' },
                { title: 'Expense', value: 'expense' },
              ]"
              label="Type"
              class="mb-4"
              required
            />
            <VTextField
              v-model="form.icon"
              label="Icon (Remix icon class)"
              prepend-inner-icon="ri-ball-pen-line"
              class="mb-4"
            />
            <VTextField
              v-model="form.color"
              label="Color (hex)"
              prepend-inner-icon="ri-palette-line"
              class="mb-4"
            />
            <div class="d-flex align-center gap-2">
              <span class="text-body-2">Preview:</span>
              <VChip
                :color="form.color"
                :prepend-icon="form.icon"
              >
                {{ form.name || 'Sample' }}
              </VChip>
            </div>
          </VForm>
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="dialog = false">Cancel</VBtn>
          <VBtn
            color="primary"
            :loading="isSubmitting"
            @click="submit"
          >
            {{ editingCategory ? 'Save' : 'Create' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Dialog -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard title="Delete Category">
        <VCardText>
          Are you sure you want to delete <strong>{{ deletingCategory?.name }}</strong>? This action cannot be undone.
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="deleteDialog = false">Cancel</VBtn>
          <VBtn
            color="error"
            :loading="isSubmitting"
            @click="confirmDelete"
          >
            Delete
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
