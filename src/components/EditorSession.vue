<template>
  <div class="editor-session">
    <!-- 左侧列 -->
    <div class="left-column">
      <!-- 顶部工具栏 -->
      <div class="toolbar">
        <div class="tool-buttons">
          <button 
              @click="console.log('compile')" 
              title="分享"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)"
            >
              <el-icon :size="20">
                <Share />
              </el-icon>
            </button>
          <button 
              @click="console.log('compile')" 
              title="编译"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)"
            >
              <el-icon :size="20">
                <Refresh />
              </el-icon>
            </button>
            <button 
              @click="console.log('run')" 
              title="运行"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)"
            >
              <el-icon :size="20">
                <PlayerPlay />
              </el-icon>
            </button>
            <button 
              @click="console.log('stop')" 
              title="暂停"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)"
            >
              <el-icon :size="20">
                <PlayerStop />
              </el-icon>
            </button>
            <button 
              @click="console.log('step')" 
              title="单步"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)"
            >
              <el-icon :size="20">
                <StepInto />
              </el-icon>
            </button>
        </div>
      </div>

      <!-- 编辑器区域 -->
      <div class="editors-wrapper">
        <!-- 左侧编辑器容器 -->
        <div class="editor-container" :style="{ width: leftWidth + '%' }">
        <vue-monaco-editor
    v-model:value="code"
    theme="vs-light"
    :options="MONACO_EDITOR_OPTIONS"
    @mount="handleMount"
    class="left-editor"
  />
        </div>

        <!-- 拖动条 -->
        <div class="editor-resizer" @mousedown="handleEditorResizerMouseDown"></div>

        <!-- 右侧编辑器容器 -->
        <div class="editor-container" :style="{ width: (100 - leftWidth) + '%' }">
          <vue-monaco-editor
    v-model:value="code"
    theme="vs-light"
    :options="MONACO_EDITOR_OPTIONS"
    @mount="handleMount"
    class="left-editor"
  />
        </div>
      </div>

      <!-- 拖动条 -->
      <div class="bottom-drag-handle"></div>

      <!-- 底部表格区域 -->
      <div class="bottom-tabs" ref="bottomTabs">
        <el-tabs v-model="bottomActiveTab" class="bottom-content">
          <el-tab-pane label="控制台" name="table1">
            <el-table :data="tableData1" border stripe highlight-current-row>
              <el-table-column prop="name" label="NAME" />
              <el-table-column prop="value" label="值" />
              <el-table-column prop="status" label="状态" />
              <el-table-column prop="action" label="操作" />
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="内存" name="table2">
            <el-table :data="tableData2" border stripe highlight-current-row>
              <el-table-column prop="name" label="名称" />
              <el-table-column prop="value" label="值" />
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>

    <!-- 右侧列 -->
    <div class="right-column" ref="rightColumn" style="width: 300px">
      <el-tabs v-model="activeTab" class="session-tabs">
        <el-tab-pane label="寄存器" name="history">
          <el-table :data="historyData" style="width: 100%" border stripe highlight-current-row>
            <el-table-column prop="timestamp" label="时间" width="180" />
            <el-table-column prop="content" label="内容" />
          </el-table>
        </el-tab-pane>
        <el-tab-pane label="执行记录" name="execution">
          <el-table :data="executionData" style="width: 100%" border stripe highlight-current-row>
            <el-table-column prop="timestamp" label="时间" width="180" />
            <el-table-column prop="command" label="命令" />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, onUnmounted } from 'vue'
import { Refresh, PlayerPlay, Share, PlayerStop, StepInto} from '@vicons/tabler'

const code = ref('// some code...')

const MONACO_EDITOR_OPTIONS = {
  theme: 'vs',
  language: 'javascript',
  automaticLayout: true,
  minimap: {
    enabled: false
  },
  scrollBeyondLastLine: false,
  fontSize: 14,
  lineNumbers: 'on',
  roundedSelection: false,
  scrollbar: {
    vertical: 'auto',
    horizontal: 'auto',
    useShadows: false,
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8
  },
  hover: {
    enabled: false
  },
  parameterHints: {
    enabled: false
  },
  suggestOnTriggerCharacters: false,
  quickSuggestions: false,
  snippetSuggestions: 'none',
  folding: false,
  overviewRulerBorder: false,
  overviewRulerLanes: 0,
  hideCursorInOverviewRuler: true
}

const leftEditorContent = ref('// some code...')
const rightEditorContent = ref('// some code...')
const editor = shallowRef()
const handleMount = editorInstance => (editor.value = editorInstance)

// your action
function formatCode() {
  editor.value?.getAction('editor.action.formatDocument').run()
}

const activeTab = ref('history')
const bottomActiveTab = ref('table1')
const rightColumn = ref(null)
const bottomTabs = ref(null)
let isDragging = false
let startX = 0
let startWidth = 0
let isBottomDragging = false
let startY = 0
let startHeight = 0
let leftWidth = ref(50) // 左侧编辑器宽度百分比
let isEditorResizing = false
let startEditorX = 0
let startLeftWidth = 0

const handleMouseDown = (e) => {
  // 检查是否点击在拖拽区域（before伪元素）上
  const rect = rightColumn.value.getBoundingClientRect()
  const isInDragArea = e.clientX >= rect.left - 5 && e.clientX <= rect.left + 5
  
  if (!isInDragArea) return
  
  isDragging = true
  startX = e.clientX
  startWidth = rightColumn.value.offsetWidth
  
  // 添加鼠标样式
  document.body.style.cursor = 'col-resize'
  // 防止文本选择
  document.body.style.userSelect = 'none'
  
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
}

const handleMouseMove = (e) => {
  if (!isDragging) return
  const delta = e.clientX - startX
  const newWidth = Math.max(300, Math.min(800, startWidth - delta))
  rightColumn.value.style.width = `${newWidth}px`
}

const handleMouseUp = () => {
  isDragging = false
  // 恢复鼠标样式和文本选择
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
}

const handleBottomMouseDown = (e) => {
  if (!e.target.classList.contains('bottom-drag-handle')) return
  
  isBottomDragging = true
  startY = e.clientY
  startHeight = bottomTabs.value.offsetHeight
  
  document.body.style.cursor = 'row-resize'
  document.body.style.userSelect = 'none'
  
  document.addEventListener('mousemove', handleBottomMouseMove)
  document.addEventListener('mouseup', handleBottomMouseUp)
}

const handleBottomMouseMove = (e) => {
  if (!isBottomDragging) return
  const delta = e.clientY - startY
  const newHeight = Math.max(100, Math.min(600, startHeight - delta))
  bottomTabs.value.style.height = `${newHeight}px`
}

const handleBottomMouseUp = () => {
  isBottomDragging = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  
  document.removeEventListener('mousemove', handleBottomMouseMove)
  document.removeEventListener('mouseup', handleBottomMouseUp)
}

const handleEditorResizerMouseDown = (e) => {
  isEditorResizing = true
  startEditorX = e.clientX
  startLeftWidth = leftWidth.value
  
  document.body.style.cursor = 'col-resize'
  document.body.style.userSelect = 'none'
  
  document.addEventListener('mousemove', handleEditorResizerMouseMove)
  document.addEventListener('mouseup', handleEditorResizerMouseUp)
}

const handleEditorResizerMouseMove = (e) => {
  if (!isEditorResizing) return
  
  const container = document.querySelector('.editors-wrapper')
  const deltaX = e.clientX - startEditorX
  const containerWidth = container.offsetWidth
  
  // 计算宽度变化的百分比
  const deltaPercent = (deltaX / containerWidth) * 100
  const newLeftWidth = startLeftWidth + deltaPercent
  
  // 限制最小和最大宽度比例（20% - 80%）
  leftWidth.value = Math.min(Math.max(newLeftWidth, 20), 80)
}

const handleEditorResizerMouseUp = () => {
  isEditorResizing = false
  document.body.style.cursor = ''
  document.body.style.userSelect = ''
  
  document.removeEventListener('mousemove', handleEditorResizerMouseMove)
  document.removeEventListener('mouseup', handleEditorResizerMouseUp)
}

onMounted(() => {
  document.addEventListener('mousedown', handleMouseDown)
  document.addEventListener('mousedown', handleBottomMouseDown)
})

onUnmounted(() => {
  document.removeEventListener('mousedown', handleMouseDown)
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  document.removeEventListener('mousedown', handleBottomMouseDown)
  document.removeEventListener('mousemove', handleBottomMouseMove)
  document.removeEventListener('mouseup', handleBottomMouseUp)
})

// 模拟数据
const tableData1 = ref([
  {
    name: '项目1',
    value: '值1',
    status: '完成'
  },
  {
    name: '项目2',
    value: '值2',
    status: '进行中'
  },
  {
    name: '项目2',
    value: '值2',
    status: '失败'
  },
  {
    name: '项目2',
    value: '值2',
    status: '成功'
  }
])

const tableData2 = ref([
  {
    name: '项目A',
    value: '值A'
  },
  {
    name: '项目B',
    value: '值B'
  }
])

const historyData = ref([
  {
    timestamp: '2024-03-13 14:30:00',
    content: '创建新项目',
    status: '完成'
  },
  {
    timestamp: '2024-03-13 14:35:00',
    content: '修改配置文件',
    status: '进行中'
  }
])

const executionData = ref([
  {
    timestamp: '2024-03-13 14:30:00',
    command: 'npm install',
    status: '成功'
  },
  {
    timestamp: '2024-03-13 14:35:00',
    command: 'npm run build',
    status: '失败'
  }
])
</script>

<style scoped>
.editor-session {
  display: flex;
  height: 100%;
  gap: 0;
  background-color: #fff;
}

.left-column {
  flex: 1;
  background-color: #fff;
  display: flex;
  flex-direction: column;
  min-width: 300px;
  height: 100%;
}

.toolbar {
  padding: 8px;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  height: 40px;
}

.tool-buttons {
  display: flex;
  gap: 8px;
}

.editors-wrapper {
  flex: 1;
  display: flex;
  min-height: 0;
  background-color: var(--el-fill-color-blank);
}

.editor-container {
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  height: 100%;
}

.editor-header {
  height: 32px;
  line-height: 32px;
  padding: 0 12px;
  background-color: var(--el-fill-color-light);
  border-bottom: 1px solid var(--el-border-color-lighter);
  font-size: 13px;
  color: var(--el-text-color-regular);
}

.monaco-editor {
  flex: 1;
  overflow: hidden;
}

.editor-resizer {
  width: 1px;
  background-color: var(--el-border-color-lighter);
  position: relative;
  cursor: col-resize;
}

.editor-resizer::before {
  content: '';
  position: absolute;
  left: -4px;
  right: -4px;
  top: 0;
  bottom: 0;
  z-index: 1;
}

.bottom-drag-handle {
  height: 4px;
  background-color: transparent;
  cursor: row-resize;
  position: relative;
}

.bottom-drag-handle::before {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: -4px;
  bottom: -4px;
}

.bottom-tabs {
  height: 200px;
  display: flex;
  flex-direction: column;
}

.bottom-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
}

.right-column {
  width: 400px;
  min-width: 300px;
  display: flex;
  flex-direction: column;
  background-color: #fff;
  position: relative;
}

.right-column::before {
  content: '';
  position: absolute;
  left: -5px;
  top: 0;
  bottom: 0;
  width: 10px;
  cursor: col-resize;
}

.session-tabs {
  display: flex;
  flex-direction: column;
  height: 100%;
  border-left: 1px solid #e4e7ed;
}

:deep(.el-tabs__header) {
  margin: 0;
  padding: 0 16px;
  border-bottom: 1px solid var(--el-table-border-color);
}

:deep(.el-tabs__nav-wrap) {
  padding: 0;
}

:deep(.el-table) {
  height: 100%;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-family: var(--font-mono);
  border-top: none !important;
}

:deep(.el-table__header),
:deep(.el-table__body) {
  font-family: var(--font-mono);
}

:deep(.el-table__cell) {
  font-family: var(--font-mono) !important;
  font-size: 13px;
}

:deep(.el-table__header) {
  border-top: none;
}

:deep(.el-table__header) {
  font-family: var(--font-mono);
}

:deep(.el-table) th.el-table__cell > .cell {
  font-weight: 600 !important;
  /* color: var(--el-text-color-primary) !important; */
}
</style>
