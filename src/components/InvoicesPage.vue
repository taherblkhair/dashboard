<template>
  <div>
    <h1 class="text-2xl font-bold text-gray-900 mb-6">إدارة</h1>
    <div class="bg-white rounded-lg shadow p-6">
      <!-- قائمة الفواتير -->
      <div v-if="loading" class="text-gray-500">جارٍ التحميل...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>

      <div v-else class="flex flex-col">
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  رقم
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  الزبون
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  المجموع
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  الحالة
                </th>
                <th
                  class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  التاريخ
                </th>
                <th
                  class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="invoice in invoices" :key="invoice.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ invoice.id }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ invoice.customer?.name ?? '—' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatCurrency(invoice.total) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span
                    :class="statusClass(invoice.status)"
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                  >
                    {{ invoice.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ formatDate(invoice.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-center">
                  <router-link
                    :to="{ name: 'invoice-detail', params: { id: invoice.id } }"
                    class="text-blue-600 hover:text-blue-800"
                  >
                    عرض
                  </router-link>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="invoices.length === 0" class="mt-4 text-gray-500">لا توجد فواتير.</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import salesService from '@/services/sales'

type Customer = {
  id: number
  name: string
  email?: string
}

type SaleItem = Record<string, unknown>

type Sale = {
  id: number
  customer_id: number
  total: string
  status: string
  created_at: string
  customer?: Customer
  items?: SaleItem[]
}

const invoices = ref<Sale[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const loadInvoices = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await salesService.getAll()
    invoices.value = res.data ?? []
  } catch (e: unknown) {
    const err = e as { message?: string }
    error.value = 'فشل تحميل الفواتير. ' + (err.message ?? '')
    console.error('loadInvoices error', e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadInvoices()
})

const formatCurrency = (value: string | number) => {
  try {
    const num = typeof value === 'string' ? parseFloat(value) : Number(value)
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'LYD',
      maximumFractionDigits: 2,
    }).format(num)
  } catch {
    return String(value)
  }
}

const formatDate = (iso?: string) => {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleString('ar-SA')
  } catch {
    return iso
  }
}

const statusClass = (status: string) => {
  switch (status) {
    case 'paid':
      return 'bg-green-100 text-green-800'
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'cancelled':
    case 'void':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}
</script>
