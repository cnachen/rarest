import './assets/base.css'

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import App from './App.vue'
import { install as VueMonacoEditorPlugin } from '@guolao/vue-monaco-editor'


const app = createApp(App)

app.use(ElementPlus)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
  }

  app.use(VueMonacoEditorPlugin, {
    paths: {
      // 在这里更改 CDN 链接加载不同版本
      vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs'
    },
  })

app.mount('#app')