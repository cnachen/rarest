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
            <el-tabs v-model="selectedTabName" class="editor-tabs" @tab-remove="handleFileDelete"
              @tab-click="handleFileSelected">
              <el-tab-pane v-for="item in projectInner.files" :key="item.name" :label="item.name" :name="item.name"
                closable>
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
            <button @click="handleActivityButton" title="统计"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)">
              <el-icon :size="20">
                <HeartRateMonitor />
              </el-icon>
            </button>
            <button @click="handleCompileButton" title="编译"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)">
              <el-icon :size="20">
                <Hammer />
              </el-icon>
            </button>
            <button @click="handleRestartButton" title="重启"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)">
              <el-icon :size="20">
                <Refresh />
              </el-icon>
            </button>
            <button @click="handleRunButton" title="运行"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)">
              <el-icon :size="20">
                <PlayerPlay />
              </el-icon>
            </button>
            <button @click="handleStopButton" title="暂停"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)">
              <el-icon :size="20">
                <PlayerStop />
              </el-icon>
            </button>
            <button @click="handleStepButton" title="单步"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)">
              <el-icon :size="20">
                <StepInto />
              </el-icon>
            </button>
            <button @click="handleSettingsButton" title="设置"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)">
              <el-icon :size="20">
                <Settings />
              </el-icon>
            </button>
          </div>
        </div>

        <!-- 编辑器区域 -->
        <div class="editors-wrapper" style="margin-top: 8px; margin-bottom: 8px;">
          <!-- 左侧编辑器容器 -->
          <div class="editor-container" :style="{ width: leftWidth + '%' }" style="margin-right: 5px;">
            <vue-monaco-editor v-model:value="sourceCode" theme="vs" :options="MONACO_EDITOR_OPTIONS"
              :language="selectedTabName.toLowerCase().endsWith('.s') ? 'riscv123' : 'c'" @mount="handleMountLeft"
              class="left-editor" />
          </div>

          <!-- 拖动条 -->
          <div class="editor-resizer" @mousedown="handleEditorResizerMouseDown"></div>

          <!-- 右侧编辑器容器 -->
          <div class="editor-container" :style="{ width: (100 - leftWidth) + '%' }" style="margin-right: 5px;">
            <vue-monaco-editor v-model:value="decompiledCode" theme="riscvTheme123" :options="MONACO_EDITOR_OPTIONS1"
              language="riscv123" @mount="handleMountRight" class="right-editor" />
          </div>
        </div>

        <!-- 拖动条 -->
        <div class="bottom-drag-handle"></div>

        <!-- 底部表格区域 -->
        <div class="bottom-tabs" ref="bottomTabs" style="border-top: 1px solid var(--el-border-color-light);">
          <el-tabs v-model="bottomActiveTab" class="bottom-content">

            <el-tab-pane label="控制台" name="table1" style="font-family: var(--font-mono);">
              <Console ref="consoleRef" />
            </el-tab-pane>
            <el-tab-pane label="内存" name="table2">
              <el-table :data="memoryData" border stripe highlight-current-row>
                <el-table-column prop="address" label="地址" />
                <el-table-column prop="word" label="字" :formatter="hexFormatter(8)" />
                <el-table-column prop="word" label="字节0" :formatter="byteFormatter(0)" />
                <el-table-column prop="word" label="字节1" :formatter="byteFormatter(1)" />
                <el-table-column prop="word" label="字节2" :formatter="byteFormatter(2)" />
                <el-table-column prop="word" label="字节3" :formatter="byteFormatter(3)" />
              </el-table>
            </el-tab-pane>

            <el-tab-pane label="监视" name="table3">
            </el-tab-pane>
          </el-tabs>
        </div>
      </div>

      <!-- 右侧列 -->
      <div class="right-column" ref="rightColumn" style="width: 250px">
        <el-tabs v-model="activeTab" class="session-tabs">
          <el-tab-pane label="寄存器" name="history">
            <el-table :data="registerData" style="width: 100%" border stripe highlight-current-row>
              <el-table-column prop="key" label="ABI名称" width="80" />
              <el-table-column prop="value" label="值" />
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
      <settings-dialog ref="settingsDialogRef" />
    </template>
  </div>
</template>

<script setup>
import { ref, shallowRef, onMounted, onUnmounted, watch, inject } from 'vue'
import { Refresh, PlayerPlay, Share, PlayerStop, StepInto, Plus, Settings, Hammer, HeartRateMonitor } from '@vicons/tabler'
import { ElMessage, ElMessageBox, formatter } from 'element-plus'
import { ProjectInner } from '../models/project'
import { UUIDVar } from '../models/uuidvar'
import { VueMonacoEditor } from '@guolao/vue-monaco-editor'
import Console from './Console.vue'
import SettingsDialog from './SettingsDialog.vue'
import * as monaco from 'monaco-editor'

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
  sourceCode.value = projectInner.value.getFile(selectedTabName.value).content
  decompiledCode.value = projectInner.value.decompiled
})


const projectInner = ref(new ProjectInner(props.selectedIndex));
const localVar = inject('localVar')
const uuidVar = new UUIDVar(projectInner.value.uuid)

const consoleRef = ref(null)

const selectedTabName = ref(uuidVar.getVar(`selectedTabName`) || 'entry.S')

watch(() => selectedTabName.value, (newValue) => {
  sourceCode.value = projectInner.value.getFile(newValue).content
})

const MONACO_EDITOR_OPTIONS = {
  theme: 'vs',
  automaticLayout: true,
  minimap: {
    enabled: false
  },
  scrollBeyondLastLine: false,
  fontSize: 14,
  fontFamily: 'monospace',
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
    enabled: true
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
  hideCursorInOverviewRuler: true,
}

const MONACO_EDITOR_OPTIONS1 = {
  ...MONACO_EDITOR_OPTIONS,
  readOnly: true,
  glyphMargin: true,
  theme: 'riscvTheme123'
}

const sourceCode = ref(projectInner.value.getFile(selectedTabName.value).content)
const decompiledCode = ref(projectInner.value.decompiled)

const editorLeft = shallowRef()
const editorRight = shallowRef()
const handleMountLeft = editorInstance => (editorLeft.value = editorInstance)
const handleMountRight = editorInstance => {
  editorRight.value = editorInstance;
  if (decompiledCode.value != "") {
    decorateLine(editorRight, 1, 'yellow-line')
  }
}

let line = 1;
// your action
function formatCode() {
  // editorLeft.value?.getAction('editor.action.formatDocument').run()
  clearLineDecorations(editorRight, line - 1)
  decorateLine(editorRight, line++, 'yellow-line')
}

function decorateLine(editorRef, line, className) {
  editorRef.value?.deltaDecorations([], [{
    options: {
      isWholeLine: true,
      className: className
    },
    range: new monaco.Range(line, 1, line, 100)
  }])
}

function clearLineDecorations(editorRef, line) {
  const model = editorRef.value?.getModel();
  if (!model) return;

  // 获取所有 decorations
  const decorations = model.getAllDecorations();

  // 过滤出目标行的 decoration IDs
  const toRemove = decorations
    .filter(dec =>
      dec.range.startLineNumber <= line &&
      dec.range.endLineNumber >= line
    )
    .map(dec => dec.id);

  // 移除这些 decorations
  if (toRemove.length > 0) {
    editorRef.value.deltaDecorations(toRemove, []);
  }
}

function hexFormatter(len) {
  return (row, column, cellValue, index) => {
    let num = Number(cellValue);
    if (isNaN(num)) return 'N/A'; // 非数字直接返回

    // 如果是负数，按64位无符号处理（转为 BigInt 再加 2^64）
    if (num < 0) {
      const bigNum = BigInt(num) + (1n << 64n);
      return '0x' + bigNum.toString(16).padStart(len, '0');
    }

    // 正数正常处理，考虑大数字直接转 BigInt 防止丢失精度
    return '0x' + BigInt(num).toString(16).padStart(len, '0');
  }
}

function byteFormatter(byteIndex) {
  return (row, column, cellValue) => {
    // 根据 byteIndex 返回对应的字节
    if (byteIndex === 0) return cellValue & 0xFF;              // byte0
    if (byteIndex === 1) return (cellValue >> 8) & 0xFF;       // byte1
    if (byteIndex === 2) return (cellValue >> 16) & 0xFF;      // byte2
    if (byteIndex === 3) return (cellValue >> 24) & 0xFF;      // byte3
  };
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
let leftWidth = ref(localVar.getVar(`leftWidth`) || 60) // 左侧编辑器宽度百分比
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
  const newWidth = Math.max(250, Math.min(800, startWidth - delta))
  rightColumn.value.style.width = `${newWidth}px`
}

const copyLink = async () => {
  await navigator.clipboard.writeText(`${location.origin}/readonly/${projectInner.value.uuid}`)
  ElMessage.success('可分享链接已复制到剪贴板')
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
  localVar.setVar(`leftWidth`, leftWidth.value)
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

import { compile, registers, memoryRange, postRun, postStep, postRestart, postStop } from '../api/compiler'

const registerData = ref([])
const memoryData = ref([])

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

const stepData = ref()
let currentLine = 1

const handleActivityButton = () => {
  consoleRef.value?.addLog('Activity button clicked', 'info')
  function addArrowDecoration() {
    const decoration = {
      range: new monaco.Range(5, 1, 10, 1), // 从第五行到第十行
      options: {
        isWholeLine: true,
        className: 'arrow-decoration', // 自定义类名，用于显示箭头
      },
    };

    editorRight.value?.deltaDecorations([], [decoration]); // 使用 deltaDecorations 方法应用装饰
  }
  addArrowDecoration();
}

const handleCompileButton = async () => {
  console.log('compile')
  projectInner.value.updateFile(selectedTabName.value, sourceCode.value)
  const retstring = await compile(projectInner.value?.files)

  if (retstring.includes('Compilation failed')) {
    ElMessage.error('编译失败')
    consoleRef.value?.addLog('Target failed with error(s).', 'error')
  } else {
    projectInner.value.updateDecompiled(retstring)
    decompiledCode.value = projectInner.value.decompiled
    ElMessage.success('编译成功')
    consoleRef.value?.addLog('Target compiled with no error.', 'info')
  }
}

const handleStepButton = async () => {
  console.log('step');
  const x = await postStep();
  console.log(x)
  stepData.value = x;
  clearLineDecorations(editorRight, currentLine)
  currentLine = x.pc / 4 + 1
  decorateLine(editorRight, currentLine, 'yellow-line')
  consoleRef.value?.addLog(x.message, 'info');
  registerData.value = await registers();
  memoryData.value = await memoryRange({
    begin: 0,
    end: 0x1c,
  });
}

const handleRestartButton = async () => {
  console.log('restart');
  clearInterval(timer);
  const x = await postRestart();
  console.log(x)
  clearLineDecorations(editorRight, currentLine);
  currentLine = 1;
  decorateLine(editorRight, currentLine, 'yellow-line');
  ElMessage.success('重启成功')
  consoleRef.value?.addLog(x[0], 'info');
}

let timer = null;

const handleRunButton = async () => {
  console.log('run')
  // Generate random logs
  const messages = [
    'Loading program into memory...',
    'Initializing registers...',
    'Program counter set to 0x00000000',
    'Stack pointer initialized',
    'Starting execution at entry point',
    'Warning: Unaligned memory access detected',
    'Error: Invalid instruction at 0x00004532',
    'Successfully executed 1000 instructions',
    'Memory allocation failed at address 0x10004000',
    'Branch prediction accuracy: 95%'
  ]

  const types = ['info', 'warning', 'error', 'success']

  // Add 3-5 random logs
  // const numLogs = Math.floor(Math.random() * 3) + 3
  // for (let i = 0; i < numLogs; i++) {
  //   const msg = messages[Math.floor(Math.random() * messages.length)]
  //   const type = types[Math.floor(Math.random() * types.length)]
  //   consoleRef.value?.addLog(msg, type)
  // }

  const x = await postRun();
  console.log(x)
  if (x[0].includes('already')) {
    ElMessage.warning('已在运行')
    consoleRef.value?.addLog(x[0], 'warning');
  } else {
    timer = setInterval(handleStepButton, 1000 / +localVar.getVar('selectedFrequency') || 1000)
    ElMessage.success('开始运行')
    consoleRef.value?.addLog(x[0], 'info');
  }
}

const handleStopButton = async () => {
  console.log('stop')
  const consoleClear = () => {
    consoleRef.value?.clear()
  }

  clearInterval(timer)

  const x = await postStop();
  console.log(x)
  ElMessage.success('已暂停')
  consoleRef.value?.addLog(x[0], 'info');
}

const handleSettingsButton = () => {
  showSettingsDialog()
}

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
        if (!value.endsWith('.c') && !value.endsWith('.h') && !value.toLowerCase().endsWith('.s')) {
          return '文件名必须以 .c 或 .h 或 .s/.S 结尾'
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

const settingsDialogRef = ref(null)
const showSettingsDialog = () => {
  settingsDialogRef.value?.show()
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
  flex-direction: column-reverse;
}

:deep(.el-tabs__content) {
  flex: 1;
  overflow: auto;
}

.right-column {
  width: 400px;
  min-width: 250px;
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
  flex-direction: column-reverse;
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
