import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import ProductsView from '../views/ProductsView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import CustomersView from '../views/CustomersView.vue'
import InvoicesView from '../views/InvoicesView.vue'
import InvoicesPage from '../views/invoices/InvoicesPage.vue'
import RegisterPage from '@/views/auth/RegisterPage.vue'
import LoginPage from '@/views/auth/LoginPage.vue'
import { getAuthToken } from '@/services/api'

// التسجيل والتسجيل الخاص
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true, breadcrumb: 'لوحة التحكم' },
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView,
      meta: { requiresAuth: true, breadcrumb: 'المنتجات' },
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView,
      meta: { requiresAuth: true, breadcrumb: 'الأصناف' },
    },
    {
      path: '/customers',
      name: 'customers',
      component: CustomersView,
      meta: { requiresAuth: true, breadcrumb: 'الزبائن' },
    },
    {
      path: '/invoices',
      name: 'invoices',
      component: InvoicesView,
      meta: { requiresAuth: true, breadcrumb: 'الفواتير'},
    },
    {
      path: '/orders',
      name: 'orders',
      component: InvoicesPage,
      meta: { requiresAuth: true, breadcrumb: 'الطلبات',parent: 'dashboard' }, // مؤقتًا استخدم نفس مكون الفواتير
      // meta: { requiresAuth: true },
    },
    {
      path: '/invoices/:id',
      name: 'invoice-detail',
      component: () => import('../views/InvoiceDetailView.vue'),
      meta: { requiresAuth: true, breadcrumb: 'تفاصيل الفاتورة', parent: 'orders' },
    },

    // التسجيل والتسجيل الخاص
    {
      path: '/login',
      name: 'login',
      component: LoginPage,
      meta: { requiresAuth: false, hideLayout: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterPage,
      meta: { requiresAuth: false, hideLayout: true },
    },
  ],
})

// Global navigation guard: protect routes by default.
// A route is considered public only if one of the matched records explicitly
// sets `meta.requiresAuth === false`. Everything else requires auth.
router.beforeEach((to, from, next) => {
  const isPublic = to.matched.some((record) => record.meta && record.meta.requiresAuth === false)
  const token = getAuthToken()

  if (!isPublic && !token) {
    // route requires auth (default) and no token -> redirect to login
    next({ name: 'login', query: { redirect: to.fullPath } })
    return
  }

  // If user is authenticated and tries to access login/register, redirect home
  if (token && (to.name === 'login' || to.name === 'register')) {
    next({ name: 'dashboard' })
    return
  }

  next()
})

export default router
