<script setup lang="ts">
import { useSEO } from '@/composables/useSEO'
import { useTransactionStore } from '@/stores/use-transaction-store'
import { useUserStore } from '@/stores/use-user-store'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

useSEO({
  title: t('dashboard.title'),
  description: t('dashboard.description'),
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
    <h1 class="text-h5 font-weight-bold mb-6">{{ t('app.title') }} — {{ t('dashboard.title') }}</h1>

    <VRow class="mb-6">
      <VCol cols="12" sm="6" lg="4">
        <VCard>
          <VCardText class="d-flex align-center gap-3">
            <VAvatar color="success" variant="tonal" size="48">
              <VIcon icon="ri-arrow-up-line" size="24" />
            </VAvatar>
            <div>
              <div class="text-caption text-medium-emphasis">{{ t('dashboard.totalIncome') }}</div>
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
              <div class="text-caption text-medium-emphasis">{{ t('dashboard.totalExpense') }}</div>
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
              <div class="text-caption text-medium-emphasis">{{ t('dashboard.balance') }}</div>
              <div class="text-h5 font-weight-bold">{{ formatAmount(balance) }}</div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>

    <VRow>
      <VCol cols="12" md="8">
        <VCard :title="t('dashboard.recentTransactions')">
          <VList lines="two">
            <VListItem
              v-for="tItem in transactions.slice(0, 10)"
              :key="tItem.id"
            >
              <template #prepend>
                <VAvatar
                  :color="tItem.type === 'income' ? 'success' : 'error'"
                  variant="tonal"
                  size="36"
                >
                  <VIcon
                    :icon="tItem.type === 'income' ? 'ri-arrow-up-line' : 'ri-arrow-down-line'"
                    size="18"
                  />
                </VAvatar>
              </template>
              <VListItemTitle class="d-flex justify-space-between">
                <span>{{ tItem.description || t('common.noData') }}</span>
                <span
                  :class="tItem.type === 'income' ? 'text-success' : 'text-error'"
                  class="font-weight-bold"
                >
                  {{ tItem.type === 'income' ? '+' : '-' }}{{ formatAmount(tItem.amount) }}
                </span>
              </VListItemTitle>
              <VListItemSubtitle>
                {{ formatDate(tItem.date) }}
              </VListItemSubtitle>
            </VListItem>
            <VListItem v-if="transactions.length === 0" class="text-center text-medium-emphasis py-4">
              {{ t('dashboard.noTransactions') }}
            </VListItem>
          </VList>
          <VCardActions v-if="transactions.length > 0">
            <RouterLink to="/transaction-page">
              <VBtn variant="text" size="small">{{ t('dashboard.viewAll') }}</VBtn>
            </RouterLink>
          </VCardActions>
        </VCard>
      </VCol>
      <VCol cols="12" md="4">
        <VCard :title="t('dashboard.quickStats')">
          <VCardText>
            <div class="d-flex flex-column gap-4">
              <div>
                <div class="text-caption text-medium-emphasis">{{ t('dashboard.transactionCount') }}</div>
                <div class="text-h6">{{ transactions.length }} {{ t('common.status') }}</div>
              </div>
              <div>
                <div class="text-caption text-medium-emphasis">{{ t('dashboard.userCount') }}</div>
                <div class="text-h6">{{ userStore.users.length }} {{ t('common.status') }}</div>
              </div>
            </div>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </div>
</template>
