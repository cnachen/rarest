<template>
  <div class="editor-session">
    <!-- 当selectedIndex为空时显示空白页 -->
    <template v-if="!props.selectedIndex">
      <div class="empty-state">
        <el-empty description="添加新的项目以开始">
          <template #image>
            <el-icon :size="64" style="color: var(--el-text-color-secondary)">
              <Plus />
            </el-icon>
          </template>
        </el-empty>
      </div>
    </template>

    <!-- 当selectedIndex存在时显示编辑器界面 -->
    <template v-else>
      <!-- 左侧列 -->
      <div class="left-column">
        <!-- 顶部工具栏 -->
        <div class="toolbar">
          <!-- 添加标签页 -->
          <div class="tabs-container">
            <el-tabs v-model="selectedTabName" type="card" class="editor-tabs" @tab-remove="handleFileDelete" @tab-click="handleFileSelected">
              <el-tab-pane v-for="item in projectInner.files" :key="item.name"
                :label="item.name" :name="item.name" closable>
              </el-tab-pane>
            </el-tabs>
          </div>

          <!-- 工具按钮 -->
          <div class="tool-buttons">
            <button @click="handleFileCreate" title="新建文件"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)">
              <el-icon :size="20">
                <Plus />
              </el-icon>
            </button>
            <button @click="copyLink" title="分享"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)">
              <el-icon :size="20">
                <Share />
              </el-icon>
            </button>
            <button @click="console.log('compile')" title="编译"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)">
              <el-icon :size="20">
                <Refresh />
              </el-icon>
            </button>
            <button @click="console.log('run')" title="运行"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)">
              <el-icon :size="20">
                <PlayerPlay />
              </el-icon>
            </button>
            <button @click="console.log('stop')" title="暂停"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)">
              <el-icon :size="20">
                <PlayerStop />
              </el-icon>
            </button>
            <button @click="console.log('step')" title="单步"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)">
              <el-icon :size="20">
                <StepInto />
              </el-icon>
            </button>
            <button @click="console.log('settings')" title="设置"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)">
              <el-icon :size="20">
                <Settings />
              </el-icon>
            </button>
          </div>
        </div>

        <!-- 编辑器区域 -->
        <div class="editors-wrapper">
          <!-- 左侧编辑器容器 -->
          <div class="editor-container" :style="{ width: leftWidth + '%' }">
            <vue-monaco-editor v-model:value="leftEditorContent" theme="vs-light" :options="MONACO_EDITOR_OPTIONS"
              @mount="handleMount" class="left-editor" />
          </div>

          <!-- 拖动条 -->
          <div class="editor-resizer" @mousedown="handleEditorResizerMouseDown"></div>

          <!-- 右侧编辑器容器 -->
          <div class="editor-container" :style="{ width: (100 - leftWidth) + '%' }">
            <vue-monaco-editor v-model:value="rightEditorContent" theme="vs-light" :options="MONACO_EDITOR_OPTIONS"
              @mount="handleMount" class="left-editor" />
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
    </template>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, onUnmounted, watch } from 'vue'
import { Refresh, PlayerPlay, Share, PlayerStop, StepInto, Plus, Settings } from '@vicons/tabler'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ProjectInner } from '../models/project'
import { UUIDVar } from '../models/uuidvar'

const props = defineProps({
  selectedIndex: {
    type: String,
    required: true
  }
})

// 监听selectedIndex的变化
watch(() => props.selectedIndex, (newIndex) => {
  console.log('选中的项目索引:', newIndex)
  projectInner.value = new ProjectInner(newIndex);
  uuidVar.update(projectInner.value.uuid);
  selectedTabName.value = uuidVar.getVar(`selectedTabName`) || 'entry.S'
})

const projectInner = ref(new ProjectInner(props.selectedIndex));
const uuidVar = new UUIDVar(projectInner.value.uuid)

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

const copyLink = async () => {
  await navigator.clipboard.writeText(location.href)
  ElMessage.success('Sharable URL has been copied to clipboard.')
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

const selectedTabName = ref(uuidVar.getVar(`selectedTabName`) || 'entry.S')

const handleFileSelected = (tab) => {
  selectedTabName.value = tab.props.name
  uuidVar.setVar(`selectedTabName`, tab.props.name)
}

// 添加新标签页
const handleFileCreate = async () => {
  try {
    const { value: title } = await ElMessageBox.prompt('请输入文件名', '新建文件', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValidator: (value) => {
        if (!value) {
          return '文件名不能为空'
        }
        // 验证文件后缀名
        if (!value.endsWith('.c') && !value.toLowerCase().endsWith('.s')) {
          return '文件名必须以 .c 或 .s/.S 结尾'
        }
        // 检查文件名是否重复
        const isDuplicate = projectInner.value.files.some(tab => tab.name.toLowerCase() === value.toLowerCase())
        if (isDuplicate) {
          return '文件名已存在'
        }
        return true
      },
      inputErrorMessage: '文件名格式不正确'
    })

    if (title) {
      projectInner.value.createFile(title, '')
      selectedTabName.value = title
      uuidVar.setVar(`selectedTabName`, title)
    }
  } catch {
    // 用户取消输入
  }
}

// 删除标签页
const handleFileDelete = (targetName) => {
  if (projectInner.value.files.length === 1) {
    ElMessage.warning('至少保留一个标签页')
    return
  } 

  const targetIndex = projectInner.value.files.findIndex(tab => tab.name === targetName)

  // 如果删除的是当前激活的标签页，需要激活其他标签页
  if (selectedTabName.value === targetName) {
    // 优先激活右侧标签页，如果没有则激活左侧标签页
    const newActiveTab = projectInner.value.files[targetIndex + 1] || projectInner.value.files[targetIndex - 1]
    selectedTabName.value = newActiveTab.name
    uuidVar.setVar(`selectedTabName`, newActiveTab.name)
  }

  projectInner.value.deleteFile(targetName)
}
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
  height: 40px;
  gap: 16px;
}

.tabs-container {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.editor-tabs {
  flex: 1;
  min-width: 0;
}

:deep(.el-tabs__header) {
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
}

:deep(.el-tabs__nav-wrap) {
  padding: 0;
  overflow: hidden;
}

:deep(.el-tabs__nav-scroll) {
  overflow: hidden;
}

:deep(.el-tabs__nav) {
  border: none;
  white-space: nowrap;
  display: flex;
  align-items: center;
}

:deep(.el-tabs__item) {
  white-space: nowrap;
  flex-shrink: 0;
}

.add-tab-button {
  width: 20px;
  height: 20px;
  margin-left: 8px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  transition: color 0.3s;
  padding: 2px;
  border-radius: 4px;
  flex-shrink: 0;
}

.add-tab-button:hover {
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
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

:deep(.el-table) th.el-table__cell>.cell {
  font-weight: 600 !important;
  /* color: var(--el-text-color-primary) !important; */
}

.empty-state {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: var(--el-bg-color);
}

:deep(.el-empty__description) {
  margin-top: 20px;
  font-size: 16px;
  color: var(--el-text-color-secondary);
}
</style>
