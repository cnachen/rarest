<template>
  <el-dialog v-model="dialogVisible" title="创建项目" width="500px" align-center @after-leave="focusInput">
    <div class="create-content">
      <el-form :model="form" label-width="80px" @keydown.enter.native.prevent="confirm">
        <el-form-item label="项目名称">
          <el-input
            ref="nameInput"
            v-model="form.name"
            maxlength="20"
            show-word-limit
            placeholder="请输入新的项目名称（最多20个字符）"
          />
        </el-form-item>

        <el-form-item label="项目模板" class="form-item">
          <el-select v-model="form.template" placeholder="请选择模板" style="width: 100%;">
            <el-option label="默认" value="default" />
            <el-option label="斐波那契数列" value="fib" />
            <el-option label="阶乘" value="fact" />
            <el-option label="冒泡排序" value="bubble_sort" />
            <el-option label="最大公约数" value="gcd" />
          </el-select>
        </el-form-item>
      </el-form>

      <div class="create-footer">
        <el-button @click="cancel">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { ElMessage } from 'element-plus'

const dialogVisible = ref(false)
const form = ref({
  name: '',
  template: 'default'
})
const nameInput = ref(null)

let resolveCallback, rejectCallback

defineExpose({
  show: () => {
    form.value = { name: '', template: 'default' }
    dialogVisible.value = true
    return new Promise((resolve, reject) => {
      resolveCallback = resolve
      rejectCallback = reject
    })
  }
})

// 聚焦输入框的函数
const focusInput = () => {
  nextTick(() => {
    nameInput.value?.focus()  // 聚焦名称输入框
  })
}

const confirm = () => {
  if (!form.value.name || form.value.name.length > 20) {
    ElMessage.error('项目名称长度必须在1到20个字符之间')
    return
  }
  resolveCallback({ name: form.value.name, template: form.value.template })
  dialogVisible.value = false  // 确保在确认后关闭 dialog
}

const cancel = () => {
  rejectCallback('用户取消')
  dialogVisible.value = false  // 取消时也关闭 dialog
}
</script>

<style scoped>
.create-content {
  padding: 20px;
}

.form-item {
  margin-top: 16px;
}

.create-footer {
  margin-top: 20px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>