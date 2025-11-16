<template>
  <div class="space-y-6 text-black">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-black">تفاصيل الطلبية رقم #{{ sale?.id || '-' }}</h2>
      <div class="flex items-center space-x-2 space-x-reverse no-print">
        <label class="text-sm">حالة الفاتورة</label>
        <select v-model="status" class="ml-2 px-2 py-1 border rounded-md">
          <option v-for="s in statuses" :key="s" :value="s">{{ statusLabel(s) }}</option>
        </select>
        <button
          @click="openConfirm"
          :disabled="updating"
          class="ml-2 px-3 py-1 bg-blue-600 text-white rounded-md"
        >
          {{ updating ? 'جارٍ...' : 'تحديث' }}
        </button>

        <!-- Actions dropdown -->
        <div class="relative ml-2" ref="actionsRoot">
          <button
            @click="toggleActions"
            type="button"
            class="px-3 py-1 bg-gray-700 text-white rounded-md flex items-center"
            aria-haspopup="true"
            :aria-expanded="showActions ? 'true' : 'false'"
          >
            إجراءات
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <div
            v-if="showActions"
            class="origin-top-right absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
          >
            <div class="py-1" role="menu" aria-orientation="vertical">
              <button
                @click="downloadPdf"
                class="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                تحميل PDF
              </button>
              <button
                @click="printInvoice"
                class="w-full text-right px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
              >
                طباعة
              </button>
            </div>
          </div>
        </div>
        <!-- end actions -->
      </div>
    </div>

    <div v-if="loading" class="p-6 bg-white rounded shadow">جاري التحميل...</div>

    <div v-else-if="sale" class="bg-white rounded text-black shadow p-6 printable" id="print-area">
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
            <td class="px-4 py-2">{{ item.unit_price }}د.ل</td>
            <td class="px-4 py-2">
              {{ (Number(item.unit_price) * Number(item.quantity)).toFixed(2) }}د.ل
            </td>
          </tr>
        </tbody>
      </table>

      <div class="text-right text-lg font-semibold">الإجمالي: {{ sale.total }}د.ل</div>
    </div>

    <div v-else class="p-6 bg-white rounded shadow">لم يتم العثور على الفاتورة</div>

    <div v-if="error" class="text-red-600">{{ error }}</div>

    <!-- Confirmation modal for status update -->
    <div v-if="showConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black opacity-40" @click="showConfirm = false"></div>
      <div class="relative bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <h3 class="text-lg font-semibold mb-3">تأكيد تغيير الحالة</h3>
        <p class="mb-4">
          هل أنت متأكد أنك تريد تغيير حالة هذه الفاتورة إلى «{{ statusLabel(status) }}»؟
        </p>
        <div class="flex justify-end space-x-2 space-x-reverse">
          <button @click="showConfirm = false" class="px-3 py-1 border rounded-md">إلغاء</button>
          <button
            @click="performUpdate"
            :disabled="updating"
            class="px-3 py-1 bg-blue-600 text-white rounded-md"
          >
            {{ updating ? 'جارٍ...' : 'تأكيد' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
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
const showActions = ref(false)
const actionsRoot = ref<HTMLElement | null>(null)

// confirmation modal for status change
const showConfirm = ref(false)
const openConfirm = () => {
  showConfirm.value = true
}

const statuses = ['pending', 'processing', 'delivered', 'paid', 'cancelled']
const status = ref<string>(String(statuses[0]))

// Human-friendly Arabic labels for status codes. Keep the value as the
// English key (used by the API) but display the Arabic label in the UI.
const statusLabels: Record<string, string> = {
  pending: 'قيد الانتظار',
  processing: 'قيد المعالجة',
  delivered: 'تم التوصيل',
  paid: 'مدفوع',
  cancelled: 'ملغي',
}

const statusLabel = (s: string) => {
  return statusLabels[s] || String(s)
}

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
    // after successful update navigate to /orders
    router.push({ name: 'orders' })
  } catch (e) {
    console.error('Failed to update status', e)
    error.value = 'فشل في تحديث حالة الفاتورة'
  } finally {
    updating.value = false
  }
}

const performUpdate = async () => {
  // call the existing update flow; keep modal open while updating
  await updateStatus()
  // close modal if still open (navigation may have occurred)
  showConfirm.value = false
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

const onDocumentClick = (e: MouseEvent) => {
  const root = actionsRoot.value
  if (!root) return
  if (e.target instanceof Node && !root.contains(e.target)) {
    showActions.value = false
  }
}

const toggleActions = () => {
  showActions.value = !showActions.value
}

onMounted(() => {
  document.addEventListener('click', onDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocumentClick)
})

const printInvoice = () => {
  try {
    window.print()
  } catch (e) {
    // fall back silently and log
    // window.print may be blocked in some environments
    // keep console error for debugging

    console.error('print failed', e)
  }
}

const downloadPdf = async () => {
  try {
    const el = document.getElementById('print-area')
    if (!el) {
      console.error('print area not found')
      return
    }

    const html2pdfModule = await import('html2pdf.js')
    // html2pdf types aren't present here; allow a narrow any for the module default
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const html2pdf = (html2pdfModule && (html2pdfModule as any).default) || html2pdfModule

    const filename = `invoice-${sale.value?.id || 'print'}.pdf`

    const opt = {
      margin: 10,
      filename,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
    }

    await html2pdf().set(opt).from(el).save()
  } catch (err) {
    console.error('PDF generation failed, falling back to print dialog', err)
    printInvoice()
  }
}
</script>
