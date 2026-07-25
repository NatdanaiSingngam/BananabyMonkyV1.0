<script setup lang="ts">
import { useTransactionStore } from '@/stores/use-transaction-store'
import { useCategoryStore } from '@/stores/use-category-store'
import { useUserStore } from '@/stores/use-user-store'
import type { CreateTransactionBody, UpdateTransactionBody, Transaction } from '@/models'

const transactionStore = useTransactionStore()
const categoryStore = useCategoryStore()
const userStore = useUserStore()
const { transactions, isLoading, error } = storeToRefs(transactionStore)
const { categories } = storeToRefs(categoryStore)
const { users } = storeToRefs(userStore)

const headers = [
  { title: 'Date', key: 'date' },
  { title: 'Type', key: 'type' },
  { title: 'Category', key: 'categoryId' },
  { title: 'Amount', key: 'amount' },
  { title: 'Description', key: 'description' },
  { title: 'Action', key: 'action', sortable: false, align: 'end' as const },
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

function openEdit(t: Transaction) {
  editingTransaction.value = t
  form.value = {
    type: t.type,
    amount: t.amount,
    categoryId: t.categoryId,
    description: t.description,
    date: t.date,
    userId: t.userId,
  }
  dialog.value = true
}

function openDelete(t: Transaction) {
  deletingTransaction.value = t
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
        <span class="text-h6">Transactions</span>
        <VBtn
          color="primary"
          prepend-icon="ri-add-line"
          @click="openCreate"
        >
          Add Transaction
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
            {{ item.type === 'income' ? 'รายรับ' : 'รายจ่าย' }}
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
            No transactions yet. Click "Add Transaction" to record one.
          </div>
        </template>
      </VDataTable>
    </VCard>

    <!-- Create / Edit Dialog -->
    <VDialog v-model="dialog" max-width="560" persistent>
      <VCard :title="editingTransaction ? 'Edit Transaction' : 'Add Transaction'">
        <VCardText>
          <VForm @submit.prevent="submit">
            <VSelect
              v-model="form.type"
              :items="[
                { title: 'Income (รายรับ)', value: 'income' },
                { title: 'Expense (รายจ่าย)', value: 'expense' },
              ]"
              label="Type"
              class="mb-4"
              required
            />
            <VTextField
              v-model.number="form.amount"
              label="Amount"
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
              label="Category"
              class="mb-4"
              required
            />
            <VTextField
              v-model="form.date"
              label="Date"
              type="date"
              class="mb-4"
              required
            />
            <VTextarea
              v-model="form.description"
              label="Description"
              prepend-inner-icon="ri-file-text-line"
              rows="2"
            />
            <VSelect
              v-model="form.userId"
              :items="users.map(u => ({ title: u.name, value: u.id }))"
              label="User"
              class="mb-4"
              required
            />
          </VForm>
        </VCardText>
        <VCardActions class="justify-end pa-4">
          <VBtn variant="text" @click="dialog = false">Cancel</VBtn>
          <VBtn
            color="primary"
            :loading="isSubmitting"
            @click="submit"
          >
            {{ editingTransaction ? 'Save' : 'Create' }}
          </VBtn>
        </VCardActions>
      </VCard>
    </VDialog>

    <!-- Delete Dialog -->
    <VDialog v-model="deleteDialog" max-width="400">
      <VCard title="Delete Transaction">
        <VCardText>
          Are you sure you want to delete this transaction? This action cannot be undone.
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
