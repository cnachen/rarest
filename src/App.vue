<script setup>
import Main from './components/Main.vue'

import { watch, provide, ref, onMounted } from 'vue';
import { LocalVar } from './models/localvar';
import { useMonaco } from '@guolao/vue-monaco-editor'

const { monacoRef, unload } = useMonaco();

const registerRiscvSH = async () => {
  // 注册自定义语言
  monacoRef.value?.languages.register({ id: 'riscv123' })
  monacoRef.value?.languages.setMonarchTokensProvider('riscv123', {
    tokenizer: {
      root: [
        [/\?+[ \t]+0x[0-9a-fA-F]+\b/, 'rv.illegalinsn'],
        [/-> 0x[0-9a-fA-F]+\b/, 'rv.jumptarget'],
        [/0x[0-9a-fA-F]+/, 'rv.immediate'],
        [/[0-9a-fA-F]+:/, 'rv.address'],
        [/\[[IURSJB]\]/, 'rv.type'],
        [/\b(lui|auipc|jal|jalr|beq|bne|blt|bge|bltu|bgeu|lb|lh|lw|ld|lbu|lhu|lwu|sb|sh|sw|sd|addi|slti|sltiu|xori|ori|andi|slli|srli|srai|add|sub|sll|slt|sltu|xor|srl|sra|or|and|addiw|addw)\b/, 'rv.mnemonic'],  // 指令
        [/\b(zero|[atvs][0-9]|t[0-6]|s[0-9]|a[0-7]|ra|sp|gp|tp|fp)\b/, 'rv.register'],
        [/[ \t]+/, 'rv.white'],
      ],
    },
  })

  // 悬浮提示
  monacoRef.value?.languages.registerHoverProvider('riscv123', {
    provideHover(model, position, token) {
      const lineNumber = position.lineNumber;
      const lineText = model.getLineContent(lineNumber);
      const regex = /-> 0x[0-9a-fA-F]+$/;
      const buttonHtml = `<button onclick="jumpToLine(${lineNumber})">Jump to line ${lineNumber}</button>`;

      if (regex.test(lineText)) {
        return {
          contents: [
            {
              value: `Jump target ${lineText.match(regex)}`,
            }
          ]
        }
      }
    }
  });

  // 自定义主题
  monacoRef.value?.editor.defineTheme('riscvTheme123', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'rv.address', foreground: '#888888' },     // 地址灰色
      { token: 'rv.type', foreground: '#bf78cc', fontStyle: '' }, // 类型黄色
      { token: 'rv.mnemonic', foreground: '#666666', fontStyle: 'bold' }, // 指令绿色
      { token: 'rv.register', foreground: '#367b21' },    // 寄存器蓝色
      { token: 'rv.immediate', foreground: '#3030b9' },   // 立即数橘红
      { token: 'rv.illegalinsn', foreground: '#c52727', fontStyle: 'bold' },      // 数字橘红
      { token: 'rv.jumptarget', foreground: '#888888', fontStyle: 'bold' },      // 数字橘红
    ],
    colors: {
      // 'editor.background': '#ffffff',
    },
  })
};

watch(monacoRef, (newVal) => {
  if (newVal) {
    registerRiscvSH();
  }
});

const localVar = new LocalVar();
provide('localVar', localVar);


</script>

<template>
  <main>
    <Main />
  </main>
</template>