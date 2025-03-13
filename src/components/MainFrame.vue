<template>
    <el-container class="layout">
      <el-header class="header"
      >
        <div class="logo">{{ softwareInfo.name }}
          <el-tag size="small"
          >v{{ softwareInfo.version }}, riscv64i</el-tag
        ></div>

          <div class="header-right">
            <span style="font-size: 13px; font-weight: 600; color: var(--el-text-color-regular)">Version:</span>
            <el-select
              v-model="selectedProject"
              placeholder="选择项目"
              size="small"
              style="width: 200px; margin-right: 16px;"
            >
           
              <el-option
                v-for="item in projectOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
            <a
              href="https://github.com/cnachen/risque"
              target="_blank"
              style="display: flex; text-decoration: none; color: var(--el-text-color-regular)"
              title="GitHub"
            >
              <el-icon :size="20">
                <BrandGithub />
              </el-icon>
            </a>
            <button 
              @click="showAboutDialog"
              title="关于"
              style="border: none; background: none; padding: 0; margin: 0; cursor: pointer; display: flex; align-items: center; color: var(--el-text-color-regular)"
            >
              <el-icon :size="20">
                <QuestionMark />
              </el-icon>
            </button>
          </div>
      </el-header>
      <el-container class="main-container">

      <el-aside class="sidebar">
        <div class="sidebar-search">
          <el-input
            v-model="searchQuery"
            placeholder="搜索..."
            :suffix-icon="Search"
            clearable
            @input="handleSearch"
          />
        </div>
        <el-menu default-active="1" class="el-menu-vertical">
          <el-menu-item 
            v-for="item in filteredMenuItems" 
            :key="item.index" 
            :index="item.index"
            style="font-weight: 500; color: var(--el-text-color-regular)"
          >
            {{ item.label }}
          </el-menu-item>
        </el-menu>
        <div class="add-item-button">
          <el-button 
            type="primary" 
            text 
            @click="handleAddItem"
            class="add-button"
          >
            <el-icon class="add-icon"><Plus /></el-icon>
            <span class="add-text" style="font-weight: 500">添加新项目</span>
          </el-button>
        </div>
      </el-aside>

      <!-- 主要内容区域 -->
      <el-main class="main-content">
        <editor-session />
      </el-main>
    </el-container>

    <!-- 添加新项目的对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :show-close="false"
      width="400px"
      :close-on-click-modal="false"
      title="添加新项目"
      :align-center="false"
      class="add-item-dialog"
    >
      <el-form 
        :model="newItem" 
        :rules="rules" 
        ref="formRef" 
        label-width="0"
        class="add-item-form"
      >
        <el-form-item prop="label">
          <div class="form-item-header">
            <span class="form-item-label">项目名称</span>
            <span class="form-item-required">*</span>
          </div>
          <el-input 
            v-model="newItem.label" 
            placeholder="请输入项目名称（最多20个字符）"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 关于软件的对话框 -->
    <el-dialog
      v-model="aboutDialogVisible"
      title="关于软件"
      width="400px"
      align-center
    >
      <div class="about-content">
        <h3>{{ softwareInfo.name }}</h3>
        <p>{{ softwareInfo.description }}</p>
        <div class="about-info">
          <p><strong>版本：</strong> v{{ softwareInfo.version }}</p>
          <p><strong>作者：</strong> {{ softwareInfo.author }}</p>
          <p><strong>许可证：</strong> {{ softwareInfo.license }}</p>
        </div>
        <div class="about-links">
          <a :href="softwareInfo.repository" target="_blank" rel="noopener noreferrer">
            <el-icon><BrandGithub /></el-icon> GitHub
          </a>
          <a :href="softwareInfo.homepage" target="_blank" rel="noopener noreferrer">
            <el-icon><Book /></el-icon> 文档
          </a>
        </div>
        <div class="about-footer">
          <el-button type="primary" @click="aboutDialogVisible = false">关闭</el-button>
        </div>
      </div>
    </el-dialog>
    </el-container>
  </template>
  
  <script setup>
  import { ref, computed } from "vue";
  import { ElMessage } from 'element-plus'
  import EditorSession from './EditorSession.vue'
  import { Plus, Search, BrandGithub, QuestionMark, Book } from "@vicons/tabler";
  import pkg from '../../package.json'  // 导入 package.json 获取版本信息

  const searchQuery = ref('');
  const dialogVisible = ref(false);
  const formRef = ref(null);
  const aboutDialogVisible = ref(false)
  
  const menuItems = ref([
    { index: '1', label: '选项 1' },
    { index: '2', label: '选项 2' },
    { index: '3', label: '选项 3' },
    { index: '4', label: '选项 4' },
    { index: '5', label: '选项 5' },
    { index: '6', label: '选项 6' },
    { index: '7', label: '选项 7' },
    { index: '8', label: '选项 8' },
    { index: '9', label: '选项 9' },
    { index: '10', label: '选项 10' },
  ]);

  const newItem = ref({
    label: ''
  });

  const rules = {
    label: [
      { required: true, message: '请输入项目名称', trigger: 'blur' },
      { min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur' }
    ]
  };

  const filteredMenuItems = computed(() => {
    if (!searchQuery.value) return menuItems.value;
    return menuItems.value.filter(item => 
      item.label.toLowerCase().includes(searchQuery.value.toLowerCase())
    );
  });

  const handleSelect = (key, keyPath) => {
    console.log(key, keyPath)
  }

  const handleSearch = () => {
    console.log('Searching for:', searchQuery.value);
  }

  const handleAddItem = () => {
    dialogVisible.value = true;
    newItem.value.label = '';
    if (formRef.value) {
      formRef.value.resetFields();
    }
  }

  const submitForm = async () => {
    if (!formRef.value) return;
    
    await formRef.value.validate((valid, fields) => {
      if (valid) {
        // 生成新的索引
        const newIndex = (menuItems.value.length + 1).toString();
        
        // 添加新项目
        menuItems.value.push({
          index: newIndex,
          label: newItem.value.label
        });

        // 关闭对话框并显示成功消息
        dialogVisible.value = false;
        ElMessage({
          message: '添加成功',
          type: 'success'
        });
      }
    });
  }

  // 添加选择项目的数据
  const selectedProject = ref('')
  const projectOptions = [
    {
      value: 'project1',
      label: '示例项目 1'
    },
    {
      value: 'project2',
      label: '示例项目 2'
    },
    {
      value: 'project3',
      label: '示例项目 3'
    },
    {
      value: 'project4',
      label: '示例项目 4'
    },
    {
      value: 'project5',
      label: '示例项目 5'
    }
  ]

  const softwareInfo = {
    name: 'Risqué',
    version: pkg.version || '1.0.0',
    description: '一个强大的调试工具',
    author: pkg.author || 'Cnachen',
    license: pkg.license || 'MIT',
    repository: pkg.repository?.url || 'https://github.com/cnachen/risque',
    homepage: pkg.homepage || 'https://github.com/cnachen/risque',
    dependencies: pkg.dependencies || {}
  }

  const showAboutDialog = () => {
    aboutDialogVisible.value = true
  }

  </script>
  
  <style scoped>
  .layout {
    height: 100vh;
    width: 100vw;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }

  .main-container {
    flex: 1;
    display: flex;
    overflow: hidden;
  }

  .header {
    height: 50px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    border-bottom: 1px solid #e4e7ed;
    background-color: #fff;
  }
  
  .logo {
    font-size: 20px;
    font-weight: bold;
    color: #409EFF;
  }

  .sidebar {
    width: 200px;
    background-color: #fff;
    border-right: 1px solid #e4e7ed;
    height: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
  }

  .sidebar-search {
    padding: 16px;
    border-bottom: 1px solid #e4e7ed;
  }

  .el-menu-vertical {
    border-right: none;
    flex: 1;
  }

  .main-content {
    flex: 1;
    background-color: #f5f7fa;
    overflow: hidden;
    padding: 0;
  }

  .add-item-button {
    padding: 16px;
    border-top: 1px solid #e4e7ed;
    text-align: center;
  }

  :deep(.el-button) {
    width: 100%;
    justify-content: center;
  }

  :deep(.el-button .el-icon) {
    margin-right: 4px;
  }

  /* 确保 Element Plus 组件样式正确 */
  :deep(.el-menu--horizontal) {
    border-bottom: none;
  }

  :deep(.el-menu-item) {
    display: flex;
    align-items: center;
  }

  :deep(.el-menu-item.is-active) {
    background-color: #ecf5ff !important;
    border-right: 2px solid #409EFF;
  }

  :deep(.el-menu-item:hover) {
    background-color: #f5f7fa !important;
  }

  :deep(.el-icon) {
    margin-right: 5px;
  }

  .add-item-dialog {
    border-radius: 8px;
  }

  .add-item-form {
    padding: 20px 20px 0;
  }

  .form-item-header {
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .form-item-label {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
  }

  .form-item-required {
    color: #f56c6c;
    font-size: 14px;
    margin-left: 2px;
  }

  .dialog-footer {
    display: inline-flex;
    gap: 12px;
  }

  :deep(.el-dialog__footer) {
    padding: 12px 20px;
    margin-top: 20px;
    border-top: 1px solid #e4e7ed;
    text-align: right;
  }

  :deep(.el-input__wrapper) {
    box-shadow: none;
    border: 1px solid #dcdfe6;
    transition: all 0.3s;
  }

  :deep(.el-input__wrapper:hover) {
    border-color: #409eff;
  }

  :deep(.el-input__wrapper.is-focus) {
    border-color: #409eff;
    box-shadow: 0 0 0 1px #409eff;
  }

  :deep(.el-button) {
    min-width: 80px;
    padding: 8px 16px;
  }

  :deep(.el-dialog__header) {
    padding: 14px 20px;
    margin: 0;
    border-bottom: 1px solid #e4e7ed;
    height: 52px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }

  :deep(.el-dialog__title) {
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
  }

  :deep(.el-dialog__body) {
    padding: 0;
    margin: 0;
  }

  :deep(.el-form-item) {
    margin-bottom: 0;
  }

  :deep(.el-form-item__error) {
    padding-top: 4px;
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: 8px;
  }

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