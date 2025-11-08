<!-- src/components/CategoryManagement.vue -->
<template>
  <div class="space-y-6">
    <!-- قسم التصحيح - يمكن إزالته لاحقاً -->

    <!-- رأس الصفحة -->
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold text-gray-900">إدارة الأصناف</h2>
      <button
        @click="showAddCategoryModal = true"
        class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
        :disabled="loading"
      >
        <svg class="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 4v16m8-8H4"
          ></path>
        </svg>
        {{ loading ? 'جاري التحميل...' : 'إضافة صنف جديد' }}
      </button>
    </div>

    <!-- حالة التحميل -->
    <div v-if="loading" class="bg-white rounded-lg shadow p-8 text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-4 text-gray-600">جاري تحميل البيانات...</p>
    </div>

    <!-- رسالة الخطأ -->
    <div v-if="error && !loading" class="bg-red-50 border border-red-200 rounded-lg p-4">
      <div class="flex items-center">
        <svg
          class="w-5 h-5 text-red-400 ml-2"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          ></path>
        </svg>
        <span class="text-red-800">{{ error }}</span>
      </div>
    </div>

    <!-- جدول الأصناف -->
    <div
      v-if="!loading && categories.length > 0"
      class="bg-white rounded-lg shadow overflow-hidden"
    >
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
                اسم الصنف
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                الوصف
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                تاريخ الإنشاء
              </th>
              <th
                class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                الإجراءات
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="category in categories" :key="category.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <img
                  v-if="category.image_url"
                  :src="category.image_url"
                  :alt="category.name"
                  class="h-10 w-10 rounded-lg object-cover"
                  @error="handleImageError"
                />
                <div
                  v-else
                  class="h-10 w-10 bg-gray-200 rounded-lg flex items-center justify-center"
                >
                  <span class="text-gray-500 text-xs">لا يوجد</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ category.name }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="text-sm text-gray-500 max-w-xs truncate">
                  {{ category.description || 'لا يوجد وصف' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(category.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2 space-x-reverse">
                <button
                  @click="editCategory(category)"
                  class="text-blue-600 hover:text-blue-900 transition-colors"
                  :disabled="loading"
                >
                  تعديل
                </button>
                <button
                  @click="deleteCategory(category.id)"
                  class="text-red-600 hover:text-red-900 transition-colors"
                  :disabled="loading"
                >
                  حذف
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- حالة عدم وجود بيانات -->
    <div
      v-if="!loading && categories.length === 0 && !error"
      class="bg-white rounded-lg shadow p-8 text-center"
    >
      <svg
        class="w-16 h-16 text-gray-400 mx-auto"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        ></path>
      </svg>
      <h3 class="mt-4 text-lg font-medium text-gray-900">لا توجد أصناف</h3>
      <p class="mt-2 text-gray-500">ابدأ بإضافة أول صنف للمتجر</p>
      <button
        @click="showAddCategoryModal = true"
        class="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
      >
        إضافة صنف جديد
      </button>
    </div>

    <!-- نافذة إضافة/تعديل صنف -->
    <div
      v-if="showAddCategoryModal"
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
    >
      <div class="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div class="mt-3">
          <h3 class="text-lg font-medium text-gray-900 mb-4">
            {{ editingCategory ? 'تعديل الصنف' : 'إضافة صنف جديد' }}
          </h3>

          <form @submit.prevent="saveCategory" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">اسم الصنف</label>
              <input
                v-model="categoryForm.name"
                type="text"
                class="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل اسم الصنف"
                required
                :disabled="formLoading"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
              <textarea
                v-model="categoryForm.description"
                rows="3"
                class="w-full px-3 text-black py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="أدخل وصف الصنف"
                :disabled="formLoading"
              ></textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">صورة الصنف</label>
              <input
                type="file"
                accept="image/*"
                @change="handleImageUpload"
                class="w-full px-3 py-2 text-black border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                :disabled="formLoading"
              />
              <p class="text-xs text-gray-500 mt-1">يمكنك رفع صورة للصنف (اختياري)</p>
            </div>

            <div class="flex justify-end space-x-2 space-x-reverse pt-4">
              <button
                type="button"
                @click="closeModal"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                :disabled="formLoading"
              >
                إلغاء
              </button>
              <button
                type="submit"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center"
                :disabled="formLoading"
              >
                <span
                  v-if="formLoading"
                  class="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"
                ></span>
                {{ formLoading ? 'جاري الحفظ...' : editingCategory ? 'تحديث' : 'حفظ' }}
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
import { categoryService } from '@/services/categories'

// تعريف واجهة Category
interface Category {
  id: number
  name: string
  description: string
  created_at: string
  updated_at: string
  image: string | null
  image_url: string | null
}

// البيانات التفاعلية
const categories = ref<Category[]>([])
const loading = ref(false)
const formLoading = ref(false)
const error = ref('')
const showAddCategoryModal = ref(false)
const editingCategory = ref<Category | null>(null)
const selectedImage = ref<File | null>(null)

const categoryForm = reactive({
  name: '',
  description: '',
})

// دالة جلب البيانات من API - محسنة
const fetchCategories = async () => {
  loading.value = true
  error.value = ''
  try {
    console.log('🚀 بدء جلب البيانات من API...')
    const response = await categoryService.getAll()
    console.log('✅ استجابة API كاملة:', response)
    console.log('📊 بيانات الاستجابة:', response.data)

    // معالجة البيانات بطرق مختلفة
    if (Array.isArray(response.data)) {
      categories.value = response.data
      console.log('🎉 تم تحميل الأصناف:', categories.value.length)
    } else if (response.data && Array.isArray(response.data.data)) {
      categories.value = response.data.data
      console.log('🎉 تم تحميل الأصناف من data.data:', categories.value.length)
    } else if (response.data && response.data.categories) {
      categories.value = response.data.categories
      console.log('🎉 تم تحميل الأصناف من categories:', categories.value.length)
    } else {
      console.warn('⚠️ هيكل بيانات غير متوقع:', response.data)
      categories.value = []
    }
  } catch (err: unknown) {
    error.value = 'حدث خطأ في جلب البيانات من الخادم'
    console.error('❌ خطأ في جلب البيانات:', err)

    const e = err as {
      response?: { status?: number; data?: unknown; headers?: Record<string, unknown> }
      request?: unknown
      message?: string
    }

    if (e.response) {
      console.error('📋 تفاصيل الخطأ:', {
        status: e.response.status,
        data: e.response.data,
        headers: e.response.headers,
      })
      const extractMessage = (d: unknown): string | undefined => {
        if (d && typeof d === 'object' && 'message' in d) {
          const m = (d as Record<string, unknown>)['message']
          return typeof m === 'string' ? m : undefined
        }
        return undefined
      }
      const remoteMessage = extractMessage(e.response.data)
      error.value = `خطأ ${e.response.status}: ${remoteMessage || 'فشل في الاتصال بالخادم'}`
    } else if (e.request) {
      console.error('🌐 لم يتم استلام استجابة:', e.request)
      error.value = 'تعذر الاتصال بالخادم. تأكد من تشغيل الخادم على localhost:8000'
    } else {
      console.error('⚙️ خطأ في الإعداد:', e.message)
      error.value = 'حدث خطأ غير متوقع'
    }
  } finally {
    loading.value = false
  }
}

// دالة حفظ الصنف (إنشاء أو تحديث)
const saveCategory = async () => {
  formLoading.value = true
  error.value = ''

  try {
    const formData = new FormData()
    formData.append('name', categoryForm.name)
    formData.append('description', categoryForm.description)

    if (selectedImage.value) {
      formData.append('image', selectedImage.value)
    }

    if (editingCategory.value) {
      // تحديث الصنف
      await categoryService.update(editingCategory.value.id, formData)
    } else {
      // إنشاء صنف جديد
      await categoryService.create(formData)
    }

    await fetchCategories() // إعادة تحميل البيانات
    closeModal()
  } catch (err: unknown) {
    error.value = 'حدث خطأ في حفظ البيانات'
    console.error('Error saving category:', err)
    const e = err as { response?: { data?: unknown }; message?: string }
    const extractMessage = (d: unknown): string | undefined => {
      if (d && typeof d === 'object' && 'message' in d) {
        const m = (d as Record<string, unknown>)['message']
        return typeof m === 'string' ? m : undefined
      }
      return undefined
    }
    const remoteMessage = e.response ? extractMessage(e.response.data) : undefined
    if (remoteMessage) {
      error.value = remoteMessage
    }
  } finally {
    formLoading.value = false
  }
}

// دالة حذف الصنف
const deleteCategory = async (id: number) => {
  if (!confirm('هل أنت متأكد من حذف هذا الصنف؟')) return

  try {
    await categoryService.delete(id)
    await fetchCategories() // إعادة تحميل البيانات
  } catch (err: unknown) {
    error.value = 'حدث خطأ في حذف البيانات'
    console.error('Error deleting category:', err)
    const e = err as { response?: { data?: unknown }; message?: string }
    const extractMessage = (d: unknown): string | undefined => {
      if (d && typeof d === 'object' && 'message' in d) {
        const m = (d as Record<string, unknown>)['message']
        return typeof m === 'string' ? m : undefined
      }
      return undefined
    }
    const remoteMessage = e.response ? extractMessage(e.response.data) : undefined
    if (remoteMessage) {
      error.value = remoteMessage
    }
  }
}

// دالة تعديل الصنف
const editCategory = (category: Category) => {
  editingCategory.value = category
  categoryForm.name = category.name
  categoryForm.description = category.description || ''
  selectedImage.value = null
  showAddCategoryModal.value = true
}

// دالة رفع الصورة
const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  if (target.files && target.files[0]) {
    selectedImage.value = target.files[0]
  }
}

// دالة معالجة خطأ تحميل الصورة
const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement
  target.src = 'https://via.placeholder.com/40?text=No+Image'
}

// دالة تنسيق التاريخ
const formatDate = (dateString: string) => {
  if (!dateString) return 'غير محدد'
  return new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// دالة إغلاق النافذة المنبثقة
const closeModal = () => {
  showAddCategoryModal.value = false
  editingCategory.value = null
  selectedImage.value = null
  resetForm()
}

// دالة إعادة تعيين النموذج
const resetForm = () => {
  categoryForm.name = ''
  categoryForm.description = ''
}

// جلب البيانات عند تحميل المكون
onMounted(() => {
  console.log('🔄 تحميل مكون إدارة الأصناف...')
  fetchCategories()
})
</script>
