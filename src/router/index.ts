import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'
import ProductsView from '../views/ProductsView.vue'
import CategoriesView from '../views/CategoriesView.vue'
import CustomersView from '../views/CustomersView.vue'
import InvoicesView from '../views/InvoicesView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/products',
      name: 'products',
      component: ProductsView
    },
    {
      path: '/categories',
      name: 'categories',
      component: CategoriesView
    },
    {
      path: '/customers',
      name: 'customers',
      component: CustomersView
    },
    {
      path: '/invoices',
      name: 'invoices',
      component: InvoicesView
    }
  ]
})

export default router
