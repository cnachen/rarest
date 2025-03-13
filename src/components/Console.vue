<template>
  <div class="console-container">
    <div class="console-output" ref="consoleOutput">
      <div v-for="(log, index) in logs" :key="index" :class="['console-line', log.type]">
        <span class="timestamp" style="margin-top: 2px;">{{ log.timestamp }}</span>
        <span class="content" v-html="formatContent(log.content)"></span>
      </div>
    </div>
    <!-- <div class="console-input">
      <span class="prompt">></span>
      <input 
        ref="inputRef"
        v-model="currentInput"
        @keydown.enter="handleCommand"
        @keydown.up="navigateHistory('up')"
        @keydown.down="navigateHistory('down')"
        placeholder="输入命令..."
        spellcheck="false"
      />
    </div> -->
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue'

const logs = ref([
  {
    timestamp: getCurrentTime(),
    content: 'Console initialized.',
    type: 'info'
  }
])
const currentInput = ref('')
const commandHistory = ref([])
const historyIndex = ref(-1)
const consoleOutput = ref(null)
const inputRef = ref(null)

// 暴露方法给父组件
const addLog = (content, type = 'info') => {
  logs.value.unshift({
    timestamp: getCurrentTime(),
    content,
    type
  })
  scrollToBottom()
}

const clear = () => {
  logs.value = [{
    timestamp: getCurrentTime(),
    content: 'Console cleared.',
    type: 'info'
  }]
}

defineExpose({
  addLog,
  clear
})

function getCurrentTime() {
  return new Date().toLocaleTimeString()
}

function formatContent(content) {
  // 这里可以添加语法高亮或其他格式化逻辑
  return content.replace(/\n/g, '<br>')
}

function scrollToBottom() {
  nextTick(() => {
    if (consoleOutput.value) {
      consoleOutput.value.scrollTop = consoleOutput.value.scrollHeight
    }
  })
}

function handleCommand() {
  if (!currentInput.value.trim()) return

  commandHistory.value.push(currentInput.value)
  historyIndex.value = commandHistory.value.length

  addLog(`$ ${currentInput.value}`, 'command')
  executeCommand(currentInput.value)
  currentInput.value = ''
}

function executeCommand(command) {
  // 示例命令处理
  switch (command.toLowerCase()) {
    case 'clear':
      clear()
      break
    case 'help':
      addLog('可用命令：\n- clear: 清空控制台\n- help: 显示帮助信息', 'info')
      break
    default:
      addLog(`未知命令: ${command}`, 'error')
  }
}

function navigateHistory(direction) {
  if (commandHistory.value.length === 0) return

  if (direction === 'up') {
    historyIndex.value = Math.max(0, historyIndex.value - 1)
  } else {
    historyIndex.value = Math.min(commandHistory.value.length, historyIndex.value + 1)
  }

  if (historyIndex.value === commandHistory.value.length) {
    currentInput.value = ''
  } else {
    currentInput.value = commandHistory.value[historyIndex.value]
  }
}

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<style scoped>
.console-container {
  height: 100%;
  background-color: #ffffff;  /* 改为白色背景 */
  color: #000000;  /* 改为黑色文字 */
  font-family: 'Consolas', 'Monaco', monospace;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.console-output {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.console-line {
  margin: 2px 0;
  display: flex;
  gap: 8px;
  font-size: 14px;
  line-height: 1.4;
}

.timestamp {
  color: #999;  /* 稍微暗一点的灰色 */
  font-size: 12px;
  white-space: nowrap;
}

.content {
  flex: 1;
  white-space: pre-wrap;
  word-break: break-all;
}

.console-input {
  display: flex;
  align-items: center;
  padding: 8px;
  background-color: #f5f5f5;  /* 浅灰色背景 */
  border-top: 1px solid #e0e0e0;  /* 浅色边框 */
}

.prompt {
  color: #008000;  /* 深绿色提示符 */
  margin-right: 8px;
  font-weight: bold;
}

input {
  flex: 1;
  background: transparent;
  border: none;
  color: #000000;  /* 黑色输入文字 */
  font-family: inherit;
  font-size: 14px;
  outline: none;
}

input::placeholder {
  color: #999;  /* 浅灰色占位符 */
}

/* 日志类型样式 */
.info {
  color: #000000;  /* 黑色信息 */
}

.error {
  color: #cc0000;  /* 深红色错误 */
}

.warning {
  color: #cc6600;  /* 深橙色警告 */
}

.success {
  color: #006600;  /* 深绿色成功 */
}

.command {
  color: #0066cc;  /* 深蓝色命令 */
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f5f5f5;  /* 浅灰色轨道 */
}

::-webkit-scrollbar-thumb {
  background: #cccccc;  /* 灰色滑块 */
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #999999;  /* 深灰色悬停 */
}
</style>
