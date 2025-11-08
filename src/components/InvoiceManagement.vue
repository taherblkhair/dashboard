<template>
  <div class="space-y-6">
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">إنشاء فاتورة / بيع جديد</h2>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <form @submit.prevent="createSale" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">العميل</label>
          <select v-model="form.customer_id" class="w-full px-3 text-black py-2 border rounded-md" required>
            <option value="">اختر العميل</option>
            <option v-for="c in customers" :key="c.id" :value="c.id">
              {{ c.name }} - {{ c.phone || c.email }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">العناصر</label>

          <div v-for="(item, idx) in form.items" :key="idx" class="mb-3 p-3 border rounded-md">
            <div class="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <div>
                <label class="text-xs text-gray-600">المنتج</label>
                <select
                  v-model="item.product_id"
                  @change="onProductChange(idx)"
                  class="w-full px-2 py-1 text-black border rounded-md"
                >
                  <option value="">اختر المنتج</option>
                  <option v-for="p in products" :key="p.id" :value="p.id">{{ p.name }}</option>
                </select>
              </div>

              <div>
                <label class="text-xs text-gray-600">اللون</label>
                <select v-model="item.product_color_id" class="w-full text-black px-2 py-1 border rounded-md">
                  <option value="">اختر اللون</option>
                  <option v-for="c in item.availableColors" :key="c.id" :value="c.id">
                    {{ c.color_name || c.color_code || c.id }} ({{ c.quantity }})
                  </option>
                </select>
              </div>

              <div>
                <label class="text-xs text-gray-600">الكمية</label>
                <input
                  v-model.number="item.quantity"
                  type="number"
                  min="1"
                  class="w-full text-black px-2 py-1 border rounded-md"
                />
              </div>

              <div>
                <label class="text-xs text-gray-600">سعر الوحدة</label>
                <input
                  v-model.number="item.unit_price"
                  type="number"
                  min="0"
                  class="w-full text-black px-2 py-1 border rounded-md"
                />
              </div>
            </div>

            <div class="flex justify-end mt-2">
              <button type="button" @click="removeItem(idx)" class="text-red-600">حذف</button>
            </div>
          </div>

          <button type="button" @click="addItem" class="text-sm text-blue-600">+ إضافة عنصر</button>
        </div>

        <div class="text-right">
          <div class="text-lg text-black font-medium">الإجمالي: {{ formattedTotal }}</div>
        </div>

        <div class="flex justify-end">
          <button
            type="submit"
            :disabled="formLoading"
            class="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            {{ formLoading ? 'جاري الإنشاء...' : 'إنشاء فاتورة' }}
          </button>
        </div>

        <div v-if="error" class="mt-2 text-red-600">{{ error }}</div>
        <div v-if="success" class="mt-2 text-green-600">تم إنشاء الفاتورة بنجاح.</div>
      </form>
    </div>

    <div class="bg-white rounded-lg shadow p-6">
      <h3 class="text-lg font-medium text-black mb-4">سجل الفواتير</h3>
      <div v-if="loading">جاري التحميل...</div>
      <div v-else>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-right text-black text-sm">#</th>
              <th class="px-4 py-2 text-right text-black text-sm">العميل</th>
              <th class="px-4 py-2 text-right text-black text-sm">الإجمالي</th>
              <th class="px-4 py-2 text-right text-black text-sm">الحالة</th>
              <th class="px-4 py-2 text-right text-black text-sm">التاريخ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="s in sales" :key="s.id">
              <td class="px-4 text-black py-2">{{ s.id }}</td>
              <td class="px-4 text-black py-2">{{ s.customer?.name || s.customer_id }}</td>
              <td class="px-4 text-black py-2">{{ s.total }} ر.س</td>
              <td class="px-4 text-black py-2">{{ s.status }}</td>
              <td class="px-4 text-black py-2">{{ formatDate(s.created_at) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { salesService } from '@/services/sales'
import { customerService } from '@/services/customers'
import { productService } from '@/services/products'

interface Customer {
  id: number
  name: string
  email?: string
  phone?: string
}

interface ProductColor {
  id?: number
  product_id?: number
  color_name?: string
  color_code?: string
  quantity?: number
}

interface Product {
  id: number
  name: string
  base_price: string | number
  colors?: ProductColor[]
}

interface SaleItem {
  product_id?: number | ''
  product_color_id?: number | ''
  quantity: number
  unit_price: number
  availableColors: ProductColor[]
}

interface Sale {
  id: number
  customer_id: number
  total: string
  status: string
  created_at: string
  customer?: Customer
}

const sales = ref<Sale[]>([])
const customers = ref<Customer[]>([])
const products = ref<Product[]>([])
const loading = ref(false)
const formLoading = ref(false)
const error = ref('')
const success = ref(false)

const form = reactive({
  customer_id: '' as number | '',
  items: [] as SaleItem[],
})

const fetchCustomers = async () => {
  try {
    const res = await customerService.getAll()
    const d = res.data
    if (Array.isArray(d)) customers.value = d
    else if (d && Array.isArray(d.data)) customers.value = d.data
  } catch (e) {
    console.error('Failed to load customers', e)
  }
}

const fetchProducts = async () => {
  try {
    const res = await productService.getAll()
    const d = res.data
    if (Array.isArray(d)) products.value = d
    else if (d && Array.isArray(d.data)) products.value = d.data
  } catch (e) {
    console.error('Failed to load products', e)
  }
}

const fetchSales = async () => {
  loading.value = true
  try {
    const res = await salesService.getAll()
    const d = res.data
    if (Array.isArray(d)) sales.value = d
    else if (d && Array.isArray(d.data)) sales.value = d.data
  } catch (e) {
    console.error('Failed to load sales', e)
  } finally {
    loading.value = false
  }
}

const addItem = () => {
  form.items.push({
    product_id: '',
    product_color_id: '',
    quantity: 1,
    unit_price: 0,
    availableColors: [],
  })
}

const removeItem = (index: number) => {
  form.items.splice(index, 1)
}

const onProductChange = (index: number) => {
  const item = form.items[index]
  if (!item) return
  const prod = products.value.find((p) => p.id === Number(item.product_id))
  if (prod) {
    item.availableColors = prod.colors ? prod.colors : []
    item.unit_price = Number(prod.base_price || 0)
    // reset selected color
    const first = item.availableColors[0]
    item.product_color_id = first?.id ?? ''
  } else {
    item.availableColors = []
    item.unit_price = 0
    item.product_color_id = ''
  }
}

const total = computed(() => {
  return form.items.reduce(
    (acc, it) => acc + Number(it.unit_price || 0) * Number(it.quantity || 0),
    0,
  )
})

const formattedTotal = computed(() => `${total.value.toFixed(2)} ر.س`)

const createSale = async () => {
  if (!form.customer_id) {
    error.value = 'اختر العميل أولاً'
    return
  }
  if (!form.items.length) {
    error.value = 'أضف عنصر واحد على الأقل'
    return
  }

  formLoading.value = true
  error.value = ''
  success.value = false

  try {
    const payload: Record<string, unknown> = {
      customer_id: Number(form.customer_id),
      items: form.items.map((it) => ({
        product_id: Number(it.product_id),
        product_color_id: Number(it.product_color_id),
        quantity: Number(it.quantity),
        unit_price: Number(it.unit_price),
      })),
    }

    await salesService.create(payload)
    success.value = true
    // refresh sales list
    await fetchSales()
    // reset form
    form.customer_id = ''
    form.items = []
  } catch (e: unknown) {
    console.error('Error creating sale', e)
    error.value = 'فشل في إنشاء الفاتورة'
  } finally {
    formLoading.value = false
  }
}

const formatDate = (iso?: string) => {
  if (!iso) return '-'
  return new Date(iso).toLocaleString('ar-EG')
}

onMounted(async () => {
  await Promise.all([fetchCustomers(), fetchProducts(), fetchSales()])
})
</script>
