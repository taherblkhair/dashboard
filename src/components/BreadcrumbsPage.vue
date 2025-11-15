<template>
  <nav class="text-sm text-gray-600 mb-3" aria-label="Breadcrumb">
    <ol class="flex items-center space-x-2 space-x-reverse">
      <li v-for="(item, idx) in items" :key="idx" class="flex items-center">
        <router-link
          v-if="item.to && idx !== items.length - 1"
          :to="item.to"
          class="text-blue-600 hover:underline"
        >
          {{ item.label }}
        </router-link>
        <span v-else class="text-gray-800 font-medium">{{ item.label }}</span>
        <span v-if="idx !== items.length - 1" class="mx-2 text-gray-400">/</span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { RouteRecordNormalized } from 'vue-router'

const route = useRoute()
const router = useRouter()

const items = computed(() => {
  // Build breadcrumb chain by walking `meta.parent` links (parent contains route.name)
  const out: Array<{ label: string; to?: string }> = []

  // Start from current route record name if available
  let currentName = route.name as string | undefined

  // If current route has no name, fallback to matched behavior
  if (!currentName) {
    const matched = route.matched.filter((r: RouteRecordNormalized) => {
      return Boolean(r.meta && (r.meta as Record<string, unknown>).breadcrumb) || Boolean(r.name)
    })
    for (const m of matched) {
      const meta = m.meta as Record<string, unknown>
      const label =
        meta && typeof meta.breadcrumb === 'string'
          ? String(meta.breadcrumb)
          : m.name
            ? String(m.name)
            : m.path
      const resolved = m.name
        ? router.resolve({ name: m.name as string, params: route.params })
        : undefined
      out.push({ label: String(label), to: resolved?.href || undefined })
    }
    if (out.length === 0) out.push({ label: 'لوحة التحكم', to: '/' })
    return out
  }

  // Walk up parents
  const visited = new Set<string>()
  while (currentName) {
    if (visited.has(currentName)) break
    visited.add(currentName)

    // find route by name
    const routeRecord = router.getRoutes().find((r) => String(r.name) === currentName)
    if (!routeRecord) break

    const meta = routeRecord.meta as Record<string, unknown>
    const label =
      meta && typeof meta.breadcrumb === 'string'
        ? String(meta.breadcrumb)
        : String(routeRecord.name ?? routeRecord.path)
    const resolved = routeRecord.name
      ? router.resolve({ name: routeRecord.name as string, params: route.params })
      : undefined
    out.push({ label: String(label), to: resolved?.href || undefined })

    const parent = meta && typeof meta.parent === 'string' ? String(meta.parent) : undefined
    currentName = parent
  }

  // reverse so root -> current
  return out.reverse()
})
</script>
