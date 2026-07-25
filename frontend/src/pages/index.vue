<script setup lang="ts">
import { onMounted } from 'vue'
import { useSEO } from '@/composables/useSEO'
import { useTransactionStore } from '@/stores/use-transaction-store'
import { useUserStore } from '@/stores/use-user-store'

useSEO({
  title: 'Dashboard',
  description: 'ภาพรวมรายรับรายจ่ายของคุณ',
  keywords: ['dashboard', 'banana by monky', 'รายรับรายจ่าย'],
})

const transactionStore = useTransactionStore()
const userStore = useUserStore()
const { totalIncome, totalExpense, balance, transactions } = storeToRefs(transactionStore)

function formatAmount(amount: number) {
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(amount)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

onMounted(async () => {
  await Promise.all([
    transactionStore.fetchTransactions(),
    userStore.fetchUsers(),
  ])
})
</script>

<template>
  <div>
    <h1 class="text-h5 font-weight-bold mb-6">Dashboard — Banana by Monky</h1>

    <VRow class="mb-6">
      <VCol cols="12" sm="6" lg="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="success" variant="tonal" size="48">
              <VIcon icon="ri-arrow-up-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">รายรับทั้งหมด</div>
              <div class="text-h5 font-weight-bold text-success">{{ formatAmount(totalIncome) }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" lg="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="error" variant="tonal" size="48">
              <VIcon icon="ri-arrow-down-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">รายจ่ายทั้งหมด</div>
              <div class="text-h5 font-weight-bold text-error">{{ formatAmount(totalExpense) }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
      <VCol cols="12" sm="6" lg="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="primary" variant="tonal" size="48">
              <VIcon icon="ri-wallet-3-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">คงเหลือ</div>
              <div class="text-h5 font-weight-bold">{{ formatAmount(balance) }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow>
      <VCol cols="12" md="8">
        <VCard title="รายการล่าสุด">
          <VList lines="two">
            <VListItem
              v-for="t in transactions.slice(0, 10)"
              :key="t.id"
            >
              <template #prepend>
                <VAvatar
                  :color="t.type === 'income' ? 'success' : 'error'"
                  variant="tonal"
                  size="36"
                >
                  <VIcon
                    :icon="t.type === 'income' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'"
                    size="18"
                  />
                </VAvatar>
              </template>
              <VListItemTitle class="d-flex justify-space-between">
                <span>{{ t.description || 'No description' }}</span>
                <span
                  :class="t.type === 'income' ? 'text-success' : 'text-error'"
                  class="font-weight-bold"
                >
                  {{ t.type === 'income' ? '+' : '-' }}{{ formatAmount(t.amount) }}
                </span>
              </VListItemTitle>
              <VListItemSubtitle>
                {{ formatDate(t.date) }}
              </VListItemSubtitle>
            </VListItem>
            <VListItem v-if="transactions.length === 0" class="text-center text-medium-emphasis py-4">
              No transactions yet. Start recording your income and expenses!
            </VListItem>
          </VList>
          <VCardActions v-if="transactions.length > 0">
            <RouterLink :to="{ name: 'transaction-page' }">
              <VBtn variant="text" size="small">View all transactions</VBtn>
            </RouterLink>
          </VCardActions>
        </VCard>
      </VCol>
      <VCol cols="12" md="4">
        <VCard title="Quick Stats">
          <VCardText>
            <div class="d-flex flex-column gap-4">
              <div>
                <div class="text-caption text-medium-emphasis">จำนวนรายการ</div>
                <div class="text-h6">{{ transactions.length }} รายการ</div>
              </div>
              <div>
                <div class="text-caption text-medium-emphasis">จำนวนผู้ใช้</div>
                <div class="text-h6">{{ userStore.users.length }} คน</div>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
