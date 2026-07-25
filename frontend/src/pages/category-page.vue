<script setup lang="ts">
import { useCategoryStore } from '@/stores/use-category-store'
import { useI18n } from 'vue-i18n'
import type { CreateCategoryBody, UpdateCategoryBody, Category } from '@/models'

const { t } = useI18n()

const categoryStore = useCategoryStore()
const { categories, isLoading, error } = storeToRefs(categoryStore)

const headers = [
  { title: t('common.name'), key: 'name' },
  { title: t('common.type'), key: 'type' },
  { title: t('common.icon'), key: 'icon' },
  { title: t('common.color'), key: 'color' },
  { title: t('common.action'), key: 'action', sortable: false, align: 'end' as const },
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
        <span class="text-h6">{{ t('category.title') }}</span>
        <div class="d-flex gap-3">
          <VSelect
            v-model="typeFilter"
            :items="[
              { title: t('common.all'), value: '' },
              { title: t('common.income'), value: 'income' },
              { title: t('common.expense'), value: 'expense' },
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
            {{ t('category.add') }}
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
            {{ item.type === 'income' ? t('common.income') : t('common.expense') }}
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
            <VTooltip activator="parent" location="top">{{ t('common.edit') }}</VTooltip>
            <VIcon icon="ri-pencil-line" />
          </IconBtn>
          <IconBtn color="error" @click="openDelete(item)">
            <VTooltip activator="parent" location="top">{{ t('common.delete') }}</VTooltip>
            <VIcon icon="ri-delete-bin-line" />
          </IconBtn>
        </template>

        <template #no-data>
          <div class="text-center py-8 text-disabled">
            {{ t('category.noData') }}
          </div>
        </template>
      </VDataTable>
    </VCard>

    <VDialog v-model="dialog" max-width="520" persistent>
      <VCard :title="editingCategory ? t('category.editTitle') : t('category.createTitle')">
        <VCardText>
          <VForm @submit.prevent="submit">
            <VTextField
              v-model="form.name"
              :label="t('common.name')"
              prepend-inner-icon="ri-price-tag-3-line"
              class="mb-4"
              required
            />
            <VSelect
              v-model="form.type"
              :items="[
                { title: t('common.income'), value: 'income' },
                { title: t('common.expense'), value: 'expense' },
              ]"
              :label="t('common.type')"
              class="mb-4"
              required
            />
            <VTextField
              v-model="form.icon"
              :label="t('common.icon')"
              prepend-inner-icon="ri-ball-pen-line"
              class="mb-4"
            />
            <VTextField
              v-model="form.color"
              :label="t('common.color')"
              prepend-inner-icon="ri-palette-line"
              class="mb-4"
            />
            <div class="d-flex align-center gap-2">
              <span class="text-body-2">{{ t('common.preview') }}:</span>
              <VChip
                :color="form.color"
                :prepend-icon="form.icon"
              >
                {{ form.name || t('common.noData') }}
              </VChip>
            </div>
          </VForm>
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="dialog = false">{{ t('common.cancel') }}</VBtn>
          <VBtn
            color="primary"
            :loading="isSubmitting"
            @click="submit"
          >
            {{ editingCategory ? t('common.save') : t('common.create') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VDialog v-model="deleteDialog" max-width="400">
      <VCard :title="t('category.delete')">
        <VCardText>
          {{ t('category.confirmDelete', { name: deletingCategory?.name }) }}
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="deleteDialog = false">{{ t('common.cancel') }}</VBtn>
          <VBtn
            color="error"
            :loading="isSubmitting"
            @click="confirmDelete"
          >
            {{ t('common.delete') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>
