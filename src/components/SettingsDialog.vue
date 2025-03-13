<template>
  <el-dialog v-model="dialogVisible" title="设置" width="500px" align-center>
    <div class="settings-content">
      <!-- 编辑器设置 -->
      <div class="settings-section">
        <h3>编辑器设置</h3>
        <el-form label-position="left" label-width="100px">
          <el-form-item label="字体大小">
            <el-input-number 
              v-model="settings.editor.fontSize" 
              :min="12" 
              :max="24" 
              size="small"
            />
          </el-form-item>
          <el-form-item label="主题">
            <el-select v-model="settings.editor.theme" size="small">
              <el-option label="浅色" value="light" />
              <el-option label="深色" value="dark" />
            </el-select>
          </el-form-item>
          <el-form-item label="显示行号">
            <el-switch v-model="settings.editor.lineNumbers" />
          </el-form-item>
          <el-form-item label="自动换行">
            <el-switch v-model="settings.editor.wordWrap" />
          </el-form-item>
        </el-form>
      </div>

      <!-- 调试器设置 -->
      <div class="settings-section">
        <h3>调试器设置</h3>
        <el-form label-position="left" label-width="100px">
          <el-form-item label="自动保存">
            <el-switch v-model="settings.debugger.autoSave" />
          </el-form-item>
          <el-form-item label="断点提示">
            <el-switch v-model="settings.debugger.breakpointHint" />
          </el-form-item>
          <el-form-item label="调试端口">
            <el-input-number 
              v-model="settings.debugger.port" 
              :min="1024" 
              :max="65535" 
              size="small"
            />
          </el-form-item>
        </el-form>
      </div>

      <!-- 界面设置 -->
      <div class="settings-section">
        <h3>界面设置</h3>
        <el-form label-position="left" label-width="100px">
          <el-form-item label="语言">
            <el-select v-model="settings.ui.language" size="small">
              <el-option label="简体中文" value="zh-CN" />
              <el-option label="English" value="en-US" />
            </el-select>
          </el-form-item>
          <el-form-item label="控制台字体">
            <el-select v-model="settings.ui.consoleFont" size="small">
              <el-option label="Consolas" value="Consolas" />
              <el-option label="Monaco" value="Monaco" />
              <el-option label="Menlo" value="Menlo" />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="saveSettings">保存</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref } from 'vue'

const dialogVisible = ref(false)

// 设置项
const settings = ref({
  editor: {
    fontSize: 14,
    theme: 'light',
    lineNumbers: true,
    wordWrap: true,
  },
  debugger: {
    autoSave: true,
    breakpointHint: true,
    port: 8000,
  },
  ui: {
    language: 'zh-CN',
    consoleFont: 'Consolas',
  }
})

// 保存设置
const saveSettings = () => {
  // 这里可以添加保存设置的逻辑
  // 例如：保存到localStorage或发送到服务器
  localStorage.setItem('settings', JSON.stringify(settings.value))
  dialogVisible.value = false
}

// 初始化设置
const initSettings = () => {
  const savedSettings = localStorage.getItem('settings')
  if (savedSettings) {
    settings.value = JSON.parse(savedSettings)
  }
}

// 暴露方法给父组件
defineExpose({
  show: () => {
    initSettings()
    dialogVisible.value = true
  }
})
</script>

<style scoped>
.settings-content {
  padding: 20px;
  max-height: 60vh;
  overflow-y: auto;
}

.settings-section {
  margin-bottom: 24px;
}

.settings-section:last-child {
  margin-bottom: 0;
}

.settings-section h3 {
  margin: 0 0 16px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-primary);
  font-size: 16px;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

.dialog-footer {
  padding-top: 16px;
  text-align: right;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: var(--el-fill-color-blank);
}

::-webkit-scrollbar-thumb {
  background: var(--el-border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--el-border-color-darker);
}
</style>