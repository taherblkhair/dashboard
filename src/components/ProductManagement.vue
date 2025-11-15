<template>
  <div class="space-y-6">
    <!-- رأس الصفحة -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">إدارة المنتجات</h2>
      <button
        @click="showAddProductModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center"
      >
        <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          ></path>
        </svg>
        إضافة منتج جديد
      </button>
    </div>

    <!-- جدول المنتجات -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                الصورة
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                المنتج
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                الصنف
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                السعر
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                الألوان
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="product in products" :key="product.id">
              <td class="px-6 py-4 whitespace-nowrap">
                <img
                  :src="
                    product.colors && product.colors.length && product.colors[0]?.image_url
                      ? product.colors[0].image_url
                      : product.category?.image_url || 'https://via.placeholder.com/40'
                  "
                  :alt="product.name"
                  class="h-10 w-10 rounded-lg object-cover"
                />
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ product.name }}</div>
                <div class="text-sm text-gray-500">{{ product.description }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ product.category?.name || product.category_id || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ product.base_price }}د.ل
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex space-x-1 space-x-reverse">
                  <span
                    v-for="(color, idx) in product.colors || []"
                    :key="idx"
                    class="w-6 h-6 rounded-full border border-gray-300"
                    :style="{ backgroundColor: color.color_code || color.code }"
                    :title="`${color.color_name || color.name} (${color.quantity})`"
                  >
                  </span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                <button @click="editProduct(product)" class="text-blue-600 hover:text-blue-900">
                  تعديل
                </button>
                <button @click="deleteProduct(product.id)" class="text-red-600 hover:text-red-900">
                  حذف
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- نافذة إضافة/تعديل منتج -->
    <div
      v-if="showAddProductModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div
        class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white"
      >
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد' }}
          </h3>

          <form @submit.prevent="saveProduct" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">اسم المنتج</label>
                <input
                  v-model="productForm.name"
                  type="text"
                  class="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الصنف</label>
                <select
                  v-model="productForm.category_id"
                  class="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">اختر الصنف</option>
                  <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
                </select>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">السعر</label>
                <input
                  v-model="productForm.price"
                  type="number"
                  class="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                <textarea
                  v-model="productForm.description"
                  class="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>

            <!-- إدارة الألوان -->
            <div>
              <div class="flex justify-between items-center mb-2">
                <label class="block text-sm font-medium text-gray-700">الألوان والكميات</label>
                <button
                  type="button"
                  @click="addColor"
                  class="text-sm text-blue-600 hover:text-blue-800"
                >
                  + إضافة لون
                </button>
              </div>

              <div
                v-for="(color, index) in productForm.colors"
                :key="index"
                class="flex items-center space-x-2 space-x-reverse mb-2"
              >
                <input
                  v-model="color.name"
                  placeholder="اسم اللون"
                  class="px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1"
                />
                <input
                  v-model="color.quantity"
                  type="number"
                  placeholder="الكمية"
                  class="px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 w-24"
                />
                <input
                  v-model="color.code"
                  type="color"
                  class="w-10 h-10 border border-gray-300 rounded-md"
                />
                <button
                  type="button"
                  @click="removeColor(index)"
                  class="text-red-600 hover:text-red-800"
                >
                  ×
                </button>
              </div>
            </div>

            <div class="flex justify-end space-x-2 space-x-reverse pt-4">
              <button
                type="button"
                @click="showAddProductModal = false"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                إلغاء
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
              >
                {{ editingProduct ? 'تحديث' : 'حفظ' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { productService } from '@/services/products'
import { categoryService } from '@/services/categories'

interface ProductColor {
  color_name?: string
  color_code?: string
  quantity: number
  image_url?: string | null
  name?: string // local form uses `name`
  code?: string
}

interface Category {
  id: number
  name: string
  image_url?: string
}

interface Product {
  id: number
  name: string
  description: string | null
  base_price: string | number
  category?: Category | null
  category_id?: number
  colors?: ProductColor[]
}

const showAddProductModal = ref(false)
const editingProduct = ref<Product | null>(null)
const loading = ref(false)
const formLoading = ref(false)
const error = ref('')

const categories = ref<Category[]>([])
const products = ref<Product[]>([])

const productForm = reactive({
  name: '',
  category_id: '' as string | number,
  price: '' as string | number,
  description: '',
  colors: [] as ProductColor[],
})

const fetchCategories = async () => {
  try {
    const res = await categoryService.getAll()
    const data = res.data
    if (Array.isArray(data)) categories.value = data
    else if (data && Array.isArray(data.data)) categories.value = data.data
  } catch (e) {
    console.warn('Failed to load categories', e)
  }
}

const fetchProducts = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await productService.getAll()
    const d = res.data

    console.log('✅ API Returned:', d)

    if (Array.isArray(d)) {
      // ✅ الحالة الحالية (الرد من Laravel مباشرة)
      products.value = d
    } else if (d && Array.isArray(d.data)) {
      products.value = d.data
    } else {
      console.warn('⚠️ Unexpected API format', d)
      products.value = []
    }
  } catch (e) {
    console.error('❌ Error fetching products', e)
    error.value = 'فشل في جلب المنتجات'
  } finally {
    loading.value = false
  }
}

const addColor = () => {
  productForm.colors.push({ name: '', quantity: 0, code: '#000000' })
}

const removeColor = (index: number) => {
  productForm.colors.splice(index, 1)
}

const editProduct = (product: Product) => {
  editingProduct.value = product
  productForm.name = product.name || ''
  productForm.category_id = product.category?.id ?? product.category_id ?? ''
  productForm.price = product.base_price ?? ''
  productForm.description = product.description ?? ''
  productForm.colors = (product.colors || []).map((c) => ({
    name: c.color_name || c.name || '',
    quantity: c.quantity || 0,
    code: c.color_code || c.code || '#000000',
  }))
  showAddProductModal.value = true
}

const saveProduct = async () => {
  formLoading.value = true
  error.value = ''
  try {
    const payload: Record<string, unknown> = {
      name: productForm.name,
      description: productForm.description,
      base_price: Number(productForm.price),
      category_id: Number(productForm.category_id),
      colors: productForm.colors.map((c) => ({
        color_name: c.name,
        color_code: c.code,
        quantity: Number(c.quantity),
      })),
    }

    if (editingProduct.value) {
      await productService.update(editingProduct.value.id, payload)
    } else {
      await productService.create(payload)
    }

    await fetchProducts()
    resetForm()
    showAddProductModal.value = false
  } catch (e) {
    console.error('Error saving product', e)
    error.value = 'فشل في حفظ المنتج'
  } finally {
    formLoading.value = false
  }
}

const deleteProduct = async (id: number) => {
  if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return
  try {
    await productService.delete(id)
    await fetchProducts()
  } catch (e) {
    console.error('Error deleting product', e)
    error.value = 'فشل في حذف المنتج'
  }
}

const resetForm = () => {
  productForm.name = ''
  productForm.category_id = ''
  productForm.price = ''
  productForm.description = ''
  productForm.colors = []
  editingProduct.value = null
}

onMounted(async () => {
  await Promise.all([fetchCategories(), fetchProducts()])
})
</script>
