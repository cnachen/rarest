<template>
    <el-dialog v-model="dialogVisible" title="关于软件" width="400px" align-center>
        <div class="about-content">
            <h3>{{ param.softwareInfo.name }}</h3>
            <p>{{ param.softwareInfo.description }}</p>
            <div class="about-info">
                <p><strong>版本：</strong> v{{ param.softwareInfo.version }}</p>
                <p><strong>作者：</strong> {{ param.softwareInfo.author }}</p>
                <p><strong>许可证：</strong> {{ param.softwareInfo.license }}</p>
            </div>
            <div class="about-links">
                <a :href="param.softwareInfo.repository" target="_blank" rel="noopener noreferrer">
                    <el-icon>
                        <BrandGithub />
                    </el-icon> GitHub
                </a>
                <a :href="param.softwareInfo.homepage" target="_blank" rel="noopener noreferrer">
                    <el-icon>
                        <Book />
                    </el-icon> 文档
                </a>
            </div>
            <div class="about-footer">
                <el-button type="primary" @click="dialogVisible = false">关闭</el-button>
            </div>
        </div>
    </el-dialog>
</template>

<script setup>
import { ref } from 'vue'
import { BrandGithub, Book } from '@vicons/tabler'
import param from '../models/param'

const dialogVisible = ref(false)

defineExpose({
    show: () => dialogVisible.value = true
})
</script>

<style scoped>
.about-content {
    padding: 20px;
}

.about-info {
    margin-bottom: 16px;
}

.about-links {
    margin-bottom: 16px;
}

.about-links a {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    color: var(--el-color-primary);
    text-decoration: none;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.3s;
}

.about-links a:hover {
    background-color: var(--el-color-primary-light-9);
}

.about-footer {
    margin-top: 20px;
    padding-top: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
}
</style>
