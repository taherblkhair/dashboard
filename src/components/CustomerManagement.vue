<template>
  <div>
    <div class="flex justify-between items-center mb-4">
      <h2 class="text-xl font-bold">إدارة الزبائن</h2>
      <button @click="startCreate" class="px-3 py-1 bg-blue-600 text-white rounded">
        زبون جديد
      </button>
    </div>

    <div class="bg-white rounded-lg shadow p-4 mb-6">
      <div v-if="loading" class="text-gray-500">جارٍ التحميل...</div>
      <div v-else-if="error" class="text-red-600">{{ error }}</div>

      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">#</th>
            <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">الاسم</th>
            <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">البريد</th>
            <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">الهاتف</th>
            <th class="px-4 py-2 text-right text-xs font-medium text-gray-500">العنوان</th>
            <th class="px-4 py-2 text-center text-xs font-medium text-gray-500">إجراءات</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="c in customers" :key="c.id">
            <td class="px-4 py-2 text-sm text-gray-900">{{ c.id }}</td>
            <td class="px-4 py-2 text-sm text-gray-900">{{ c.name }}</td>
            <td class="px-4 py-2 text-sm text-gray-900">{{ c.email }}</td>
            <td class="px-4 py-2 text-sm text-gray-900">{{ c.phone }}</td>
            <td class="px-4 py-2 text-sm text-gray-900">{{ c.address }}</td>
            <td class="px-4 py-2 text-sm text-center">
              <button @click="editCustomer(c)" class="text-blue-600 hover:text-blue-800 mr-2">
                تعديل
              </button>
              <button @click="confirmDelete(c)" class="text-red-600 hover:text-red-800">حذف</button>
            </td>
          </tr>
          <tr v-if="customers.length === 0">
            <td class="px-4 py-4 text-sm text-gray-500" colspan="6">لا توجد سجلات.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Form -->
    <div v-if="showForm" class="bg-white rounded-lg shadow p-4">
      <h3 class="text-lg font-medium mb-3">{{ form.id ? 'تعديل زبون' : 'زبون جديد' }}</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label class="block text-sm text-gray-700">الاسم</label>
          <input v-model="form.name" class="mt-1 w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label class="block text-sm text-gray-700">البريد الإلكتروني</label>
          <input v-model="form.email" class="mt-1 w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label class="block text-sm text-gray-700">الهاتف</label>
          <input v-model="form.phone" class="mt-1 w-full border rounded px-2 py-1" />
        </div>
        <div>
          <label class="block text-sm text-gray-700">العنوان</label>
          <input v-model="form.address" class="mt-1 w-full border rounded px-2 py-1" />
        </div>
      </div>

      <div class="mt-4 flex items-center space-x-2 space-x-reverse">
        <button
          @click="saveCustomer"
          :disabled="formLoading"
          class="px-3 py-1 bg-green-600 text-white rounded"
        >
          {{ formLoading ? 'جارٍ الحفظ...' : form.id ? 'حفظ التعديلات' : 'إنشاء' }}
        </button>
        <button @click="cancelForm" class="px-3 py-1 border rounded">إلغاء</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { customerService } from '@/services/customers'

type Customer = {
  id?: number
  name?: string
  email?: string
  phone?: string
  address?: string
}

const customers = ref<Customer[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const showForm = ref(false)
const formLoading = ref(false)
const form = reactive<Customer>({ name: '', email: '', phone: '', address: '' })

const loadCustomers = async () => {
  loading.value = true
  error.value = null
  try {
    const res = await customerService.getAll()
    customers.value = res.data ?? []
  } catch (e: unknown) {
    console.error('loadCustomers error', e)
    error.value = 'فشل في جلب الزبائن'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCustomers()
})

const startCreate = () => {
  form.id = undefined
  form.name = ''
  form.email = ''
  form.phone = ''
  form.address = ''
  showForm.value = true
}

const editCustomer = (c: Customer) => {
  form.id = c.id
  form.name = c.name || ''
  form.email = c.email || ''
  form.phone = c.phone || ''
  form.address = c.address || ''
  showForm.value = true
}

const cancelForm = () => {
  showForm.value = false
}

const saveCustomer = async () => {
  // basic validation
  if (!form.name || !form.email) {
    alert('الرجاء إدخال الاسم والبريد الإلكتروني')
    return
  }
  formLoading.value = true
  try {
    if (form.id) {
      await customerService.update(Number(form.id), {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      })
    } else {
      await customerService.create({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      })
    }
    await loadCustomers()
    showForm.value = false
  } catch (e) {
    console.error('saveCustomer error', e)
    alert('فشل في حفظ البيانات')
  } finally {
    formLoading.value = false
  }
}

const confirmDelete = (c: Customer) => {
  if (!c.id) return
  if (!confirm(`حذف الزبون ${c.name}?`)) return
  ;(async () => {
    try {
      await customerService.delete(Number(c.id))
      await loadCustomers()
    } catch (e) {
      console.error('deleteCustomer error', e)
      alert('فشل في الحذف')
    }
  })()
}
</script>
