// Import Tailwind + project globals. `styles.css` contains the Tailwind directives
// (@tailwind base; @tailwind components; @tailwind utilities;) and font imports.
// `assets/main.css` contains project-specific rules that depend on Tailwind utilities,
// so import both (styles first) so utility classes like `w-6`/`h-6` take effect.
import './styles.css'
import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
