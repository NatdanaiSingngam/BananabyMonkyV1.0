<script setup lang="ts">
import { useTransactionStore } from '@/stores/use-transaction-store'
import { useCategoryStore } from '@/stores/use-category-store'
import { useUserStore } from '@/stores/use-user-store'
import { useI18n } from 'vue-i18n'
import type { CreateTransactionBody, UpdateTransactionBody, Transaction } from '@/models'

const { t } = useI18n()

const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const userStore = useUserStore()
const { transactions, isLoading, error } = storeToRefs(transactionStore)
const { categories } = storeToRefs(categoryStore)
const { users } = storeToRefs(userStore)

const headers = [
  { title: t('common.date'), key: 'date' },
  { title: t('common.type'), key: 'type' },
  { title: t('transaction.category'), key: 'categoryId' },
  { title: t('common.amount'), key: 'amount' },
  { title: t('common.description'), key: 'description' },
  { title: t('common.action'), key: 'action', sortable: false, align: 'end' as const },
]

const dialog = ref(false)
const deleteDialog = ref(false)
const isSubmitting = ref(false)
const editingTransaction = ref<Transaction | null>(null)
const deletingTransaction = ref<Transaction | null>(null)

const form = ref<CreateTransactionBody>({
  type: 'expense',
  amount: 0,
  categoryId: '',
  description: '',
  date: new Date().toISOString().split('T')[0],
  userId: '',
})

function openCreate() {
  editingTransaction.value = null
  form.value = {
    type: 'expense',
    amount: 0,
    categoryId: categories.value.length > 0 ? categories.value[0].id : '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    userId: users.value.length > 0 ? users.value[0].id : '',
  }
  dialog.value = true
}

function openEdit(tItem: Transaction) {
  editingTransaction.value = tItem
  form.value = {
    type: tItem.type,
    amount: tItem.amount,
    categoryId: tItem.categoryId,
    description: tItem.description,
    date: tItem.date,
    userId: tItem.userId,
  }
  dialog.value = true
}

function openDelete(tItem: Transaction) {
  deletingTransaction.value = tItem
  deleteDialog.value = true
}

async function submit() {
  isSubmitting.value = true
  try {
    if (editingTransaction.value)
      await transactionStore.updateTransaction(editingTransaction.value.id, form.value)
    else
      await transactionStore.createTransaction(form.value)
    dialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

async function confirmDelete() {
  if (!deletingTransaction.value) return
  isSubmitting.value = true
  try {
    await transactionStore.deleteTransaction(deletingTransaction.value.id)
    deleteDialog.value = false
  }
  finally {
    isSubmitting.value = false
  }
}

function getCategoryName(categoryId: string): string {
  return categories.value.find(c => c.id === categoryId)?.name ?? categoryId
}

function getUserName(userId: string): string {
  return users.value.find(u => u.id === userId)?.name ?? userId
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

function formatAmount(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}

onMounted(async () => {
  await Promise.all([
    transactionStore.fetchTransactions(),
    categoryStore.fetchCategories(),
    userStore.fetchUsers(),
  ])
})
</script>

<template>
  <div>
    <VCard>
      <VCardTitle class="d-flex align-center justify-space-between pa-4">
        <span class="text-h6">{{ t('transaction.title') }}</span>
        <VBtn
          color="primary"
          prepend-icon="ri-add-line"
          @click="openCreate"
        >
          {{ t('transaction.add') }}
        </VBtn>
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
        :items="transactions"
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

        <template #item.categoryId="{ item }">
          <div class="d-flex align-center gap-1">
            <VIcon
              :icon="categories.find(c => c.id === item.categoryId)?.icon || 'ri-list-line'"
              :color="categories.find(c => c.id === item.categoryId)?.color"
              size="18"
            />
            {{ getCategoryName(item.categoryId) }}
          </div>
        </template>

        <template #item.amount="{ item }">
          <span :class="item.type === 'income' ? 'text-success' : 'text-error'" class="font-weight-bold">
            {{ item.type === 'income' ? '+' : '-' }}{{ formatAmount(item.amount) }}
          </span>
        </template>

        <template #item.date="{ item }">
          {{ formatDate(item.date) }}
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
            {{ t('transaction.noData') }}
          </div>
        </template>
      </VDataTable>
    </VCard>

    <VDialog v-model="dialog" max-width="560" persistent>
      <VCard :title="editingTransaction ? t('transaction.editTitle') : t('transaction.createTitle')">
        <VCardText>
          <VForm @submit.prevent="submit">
            <VSelect
              v-model="form.type"
              :items="[
                { title: t('transaction.income'), value: 'income' },
                { title: t('transaction.expense'), value: 'expense' },
              ]"
              :label="t('common.type')"
              class="mb-4"
              required
            />
            <VTextField
              v-model.number="form.amount"
              :label="t('common.amount')"
              type="number"
              min="0"
              step="0.01"
              prepend-inner-icon="ri-money-dollar-circle-line"
              class="mb-4"
              required
            />
            <VSelect
              v-model="form.categoryId"
              :items="categories.map(c => ({ title: c.name, value: c.id }))"
              :label="t('transaction.category')"
              class="mb-4"
              required
            />
            <VTextField
              v-model="form.date"
              :label="t('common.date')"
              type="date"
              class="mb-4"
              required
            />
            <VTextarea
              v-model="form.description"
              :label="t('common.description')"
              prepend-inner-icon="ri-file-text-line"
              rows="2"
            />
            <VSelect
              v-model="form.userId"
              :items="users.map(u => ({ title: u.name, value: u.id }))"
              :label="t('transaction.user')"
              class="mb-4"
              required
            />
          </VForm>
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="dialog = false">{{ t('common.cancel') }}</VBtn>
          <VBtn
            color="primary"
            :loading="isSubmitting"
            @click="submit"
          >
            {{ editingTransaction ? t('common.save') : t('common.create') }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <VDialog v-model="deleteDialog" max-width="400">
      <VCard :title="t('transaction.delete')">
        <VCardText>
          {{ t('transaction.confirmDelete') }}
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
