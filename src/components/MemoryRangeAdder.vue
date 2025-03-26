<template>
    <div class="input-confirm">
        <el-text>输入内存范围：</el-text>
        <div class="inputs-container">
            <el-input v-model="input1" placeholder="请输入第一个值" style="width: 200px; margin-right: 10px;" />
            <el-input v-model="input2" placeholder="请输入第二个值" style="width: 200px;" />
        </div>
        <button @click="handleConfirm" title="确认"
            style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)">
            <el-icon :size="20">
                <Check />
            </el-icon>
        </button>
    </div>
</template>

<script setup>
import { ref, defineEmits } from 'vue';
import { ElInput, ElIcon, ElText, ElMessage } from 'element-plus';
import { Check } from '@vicons/tabler';  // 确保 Check 图标被正确导入

const emit = defineEmits();

// 定义两个输入框的值
const input1 = ref('');
const input2 = ref('');

// 校验输入是否为有效的十进制或十六进制数
const validateInput = (input) => {
    const hexRegex = /^0x[0-9a-fA-F]+$/; // 匹配十六进制数

    return hexRegex.test(input); // 十进制或十六进制数都合法
};

// 确认按钮的点击事件处理函数
const handleConfirm = () => {
    // 校验输入的值是否符合十进制或十六进制的格式
    if (!validateInput(input1.value) || !validateInput(input2.value)) {
        ElMessage.error('请输入有效的十六进制整数');
        return;
    }

    // 转换输入的值为数字（考虑十六进制前缀）
    const value1 = parseInt(input1.value, 16);  // 支持十六进制输入
    const value2 = parseInt(input2.value, 16);  // 支持十六进制输入

    // 校验第一个输入框的值是否小于第二个输入框的值
    if (value1 >= value2) {
        ElMessage.error('第一个值必须小于第二个值');
        return;
    }

    // 如果通过验证，继续执行操作
    console.log('输入1:', input1.value);
    console.log('输入2:', input2.value);
    emit('updateMemoryRange', { value1, value2 });
};
</script>

<style scoped>
.input-confirm {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin: 20px;
}

.inputs-container {
    display: flex;
    align-items: center;
}

.confirm-button {
    margin-left: 20px;
}
</style>