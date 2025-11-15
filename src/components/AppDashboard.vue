<template>
  <div class="space-y-6">
    <!-- إحصائيات سريعة -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-blue-100 text-blue-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              ></path>
            </svg>
          </div>
          <div class="mr-4">
            <p class="text-sm font-medium text-black">إجمالي المنتجات</p>
            <p class="text-2xl font-bold text-black">{{ overview.products_count ?? '—' }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-green-100 text-green-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
          </div>
          <div class="mr-4">
            <p class="text-sm font-medium text-black">إجمالي الزبائن</p>
            <p class="text-2xl font-bold text-black">{{ overview.customers_count ?? '—' }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-yellow-100 text-yellow-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              ></path>
            </svg>
          </div>
          <div class="mr-4">
            <p class="text-sm font-medium text-black">الفواتير هذا الشهر</p>
            <p class="text-2xl font-bold text-black">{{ overview.invoices_this_month ?? '—' }}</p>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <div class="flex items-center">
          <div class="p-3 rounded-full bg-red-100 text-red-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              ></path>
            </svg>
          </div>
          <div class="mr-4">
            <p class="text-sm font-medium text-black">الإيرادات</p>
            <p class="text-2xl font-bold text-black">
              {{ formatCurrency(overview.revenue_this_month) }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- الفواتير الأخيرة -->
    <div class="bg-white rounded-lg shadow">
      <div class="p-6 border-b border-gray-200">
        <h3 class="text-lg font-medium text-gray-900">آخر الفواتير</h3>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                رقم الفاتورة
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                الزبون
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                المبلغ
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
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="salesLoading">
              <td class="px-6 py-4 text-sm text-gray-500" colspan="5">
                جارٍ تحميل آخر الفواتير...
              </td>
            </tr>
            <tr v-else-if="salesError">
              <td class="px-6 py-4 text-sm text-red-600" colspan="5">{{ salesError }}</td>
            </tr>
            <tr v-else v-for="sale in sales.slice(0, 5)" :key="sale.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ sale.id }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ sale.customer?.name ?? sale.customer_id ?? '—' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatCurrency(sale.total) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full',
                    statusClass(sale.status),
                  ]"
                >
                  {{ sale.status ?? '-' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(sale.created_at as string) }}
              </td>
            </tr>
            <tr v-if="!salesLoading && sales.length === 0">
              <td class="px-6 py-4 text-sm text-gray-500" colspan="5">لا توجد فواتير لعرضها.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import dashboardService from '@/services/dashboard'
import salesService from '@/services/sales'

const overview = ref<Record<string, unknown>>({})
const loading = ref(false)
const error = ref<string | null>(null)

const loadOverview = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await dashboardService.getOverview()
    overview.value = res.data ?? {}
  } catch (e: unknown) {
    console.error('Failed to load dashboard overview', e)
    error.value = 'فشل في تحميل بيانات لوحة التحكم'
  } finally {
    loading.value = false
  }
}

type Sale = {
  id?: number
  customer_id?: number
  total?: string | number
  status?: string
  created_at?: string
  customer?: { name?: string }
}

const sales = ref<Sale[]>([])
const salesLoading = ref(false)
const salesError = ref<string | null>(null)

const loadSales = async () => {
  salesLoading.value = true
  salesError.value = null
  try {
    const res = await salesService.getAll()
    const dataFromApi = (res.data ?? []) as Sale[]
    let data: Sale[] = dataFromApi
    // if overview provides a status_filter, apply it
    const statusFilter = String(overview.value?.status_filter ?? '').trim()
    if (statusFilter) {
      data = data.filter((s) => String(s.status || '').toLowerCase() === statusFilter.toLowerCase())
    }
    sales.value = data
  } catch (e: unknown) {
    console.error('Failed to load sales', e)
    salesError.value = 'فشل في تحميل الفواتير'
  } finally {
    salesLoading.value = false
  }
}

onMounted(async () => {
  await loadOverview()
  await loadSales()
})

const formatDate = (iso?: string) => {
  if (!iso) return '-'
  try {
    return new Date(iso).toLocaleDateString('ar-EG')
  } catch {
    return String(iso)
  }
}

const statusClass = (status?: string) => {
  switch ((status || '').toLowerCase()) {
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

const formatCurrency = (val: unknown) => {
  try {
    const n = Number(val ?? 0)
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'SAR',
      maximumFractionDigits: 2,
    }).format(n)
  } catch {
    return String(val ?? '-')
  }
}
</script>
