<template>
  <div class="space-y-6 text-black">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-black">تفاصيل الفاتورة #{{ sale?.id || '-' }}</h2>
      <div>
        <label class="text-sm ">حالة الفاتورة</label>
        <select v-model="status" class="ml-2 px-2 py-1 border rounded-md">
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>
        <button
          @click="updateStatus"
          :disabled="updating"
          class="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md"
        >
          {{ updating ? 'جارٍ...' : 'تحديث' }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="p-6 bg-white rounded shadow">جاري التحميل...</div>

    <div v-else-if="sale" class="bg-white rounded text-black shadow p-6">
      <div class="mb-4">
        <div><strong>العميل:</strong> {{ sale.customer?.name || sale.customer_id }}</div>
        <div>
          <strong>الهاتف:</strong> {{ sale.customer?.phone || sale.customer?.email || '-' }}
        </div>
        <div><strong>التاريخ:</strong> {{ formatDate(sale.created_at) }}</div>
      </div>

      <table class="min-w-full divide-y divide-gray-200 mb-4">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-right text-sm text-gray-500">المنتج</th>
            <th class="px-4 py-2 text-right text-sm text-gray-500">اللون</th>
            <th class="px-4 py-2 text-right text-sm text-gray-500">الكمية</th>
            <th class="px-4 py-2 text-right text-sm text-gray-500">سعر الوحدة</th>
            <th class="px-4 py-2 text-right text-sm text-gray-500">المجموع</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200 text-black">
          <tr v-for="item in sale.items || []" :key="item.id">
            <td class="px-4 py-2">{{ item.product?.name || item.product_id }}</td>
            <td class="px-4 py-2">{{ item.color?.color_name || item.color?.id || '-' }}</td>
            <td class="px-4 py-2">{{ item.quantity }}</td>
            <td class="px-4 py-2">{{ item.unit_price }} ر.س</td>
            <td class="px-4 py-2">
              {{ (Number(item.unit_price) * Number(item.quantity)).toFixed(2) }} ر.س
            </td>
          </tr>
        </tbody>
      </table>

      <div class="text-right text-lg font-semibold">الإجمالي: {{ sale.total }} ر.س</div>
    </div>

    <div v-else class="p-6 bg-white rounded shadow">لم يتم العثور على الفاتورة</div>

    <div v-if="error" class="text-red-600">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { salesService } from '@/services/sales'

const route = useRoute()
const router = useRouter()

interface SaleItem {
  id?: number
  product_id?: number
  product?: { id?: number; name?: string }
  product_color_id?: number
  color?: { id?: number; color_name?: string }
  quantity?: number
  unit_price?: string | number
}

interface Sale {
  id: number
  customer_id: number
  total: string
  status: string
  created_at?: string
  customer?: { id?: number; name?: string; phone?: string; email?: string }
  items?: SaleItem[]
}

const sale = ref<Sale | null>(null)
const loading = ref(false)
const updating = ref(false)
const error = ref('')

const statuses = ['pending', 'processing', 'delivered', 'paid', 'cancelled']
const status = ref<string>(String(statuses[0]))

const id = Number(route.params.id)

const fetchSale = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await salesService.getById(id)
    sale.value = res.data
    status.value = String(sale.value?.status || statuses[0])
  } catch (e) {
    console.error('Failed to load sale', e)
    error.value = 'فشل في جلب بيانات الفاتورة'
  } finally {
    loading.value = false
  }
}

const updateStatus = async () => {
  if (!sale.value) return
  updating.value = true
  error.value = ''
  try {
    await salesService.update(id, { status: status.value })
    // refresh
    await fetchSale()
  } catch (e) {
    console.error('Failed to update status', e)
    error.value = 'فشل في تحديث حالة الفاتورة'
  } finally {
    updating.value = false
  }
}

const formatDate = (iso?: string) => {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('ar-EG')
}

onMounted(async () => {
  if (!id || Number.isNaN(id)) {
    // go back to list if invalid id
    router.push({ name: 'invoices' })
    return
  }
  await fetchSale()
})
</script>
