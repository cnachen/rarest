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
        [/^[ \t]*[.]\w+\b/, 'riscv.directive'],
        [/\?+[ \t]+0x[0-9a-fA-F]+\b/, 'riscv.instruction.illegal'],
        [/-> 0x[0-9a-fA-F]+\b/, 'riscv.instruction.jump'],
        [/"[^"]*"/, 'riscv.literal.string'],
        [/0x[0-9a-fA-F]+/, 'riscv.literal.hex'],
        [/^[0-9a-fA-F]{12}:/, 'riscv.view.address'],
        [/\[[IURSJB]\]/, 'riscv.instruction.type'],
        [/\b(call|nop|li|la|mv|not|neg|negw|sext.w|seqz|snez|sltz|sgtz|beqz|bnez|blez|bgez|bltz|bgtz|bgt|ble|bgtu|bleu|j|jr|ret|lui|auipc|jal|jalr|beq|bne|blt|bge|bltu|bgeu|lb|lh|lw|ld|lbu|lhu|lwu|sb|sh|sw|sd|addi|slti|sltiu|xori|ori|andi|slli|srli|srai|add|sub|sll|slt|sltu|xor|srl|sra|or|and|addiw|addw|mul|mulhu|div|divu|rem|remu|mulw|divw|divuw|remw|remuw)\b/, 'riscv.literal.mnemonic'],  // 指令
        [/\b(zero|[atvs][0-9]|t[0-6]|s[0-9]|a[0-7]|ra|sp|gp|tp|fp)\b/, 'riscv.literal.register'],
        [/[.](bss|rodata|data|text)([.]\w+)?/, 'riscv.section'],
        [/^[_a-zA-Z][._a-zA-Z0-9]+:/, 'riscv.label.general'],
        [/^[0-9]:/, 'riscv.label.num'],
        [/\b[0-9](f|b)+/, 'riscv.ref.num'],
        [/\b[0-9]+/, 'riscv.literal.num'],
        [/[._a-zA-Z][._a-zA-Z0-9]+/, 'riscv.ref.general'],
        [/[#;].*$/, 'riscv.literal.comment'],
        [/[ \t]+/, 'riscv.literal.whitespace'],
      ],
    },
  })

  const keywords = `call|nop|li|la|mv|not|neg|negw|sext.w|seqz|snez|sltz|sgtz|beqz|bnez|blez|bgez|bltz|bgtz|bgt|ble|bgtu|bleu|j|jr|ret|lui|auipc|jal|jalr|beq|bne|blt|bge|bltu|bgeu|lb|lh|lw|ld|lbu|lhu|lwu|sb|sh|sw|sd|addi|slti|sltiu|xori|ori|andi|slli|srli|srai|add|sub|sll|slt|sltu|xor|srl|sra|or|and|addiw|addw|mul|mulhu|div|divu|rem|remu|mulw|divw|divuw|remw|remuw`.split('|');
  const registers = `zero|a0|a1|a2|a3|a4|a5|a6|a7|t0|t1|t2|t3|t4|t5|t6|s0|s1|s2|s3|s4|s5|s6|s7|s8|s9|ra|sp|gp|tp|fp`.split('|');
  const directives = `local|global|section|bss|rodata|data|text`.split('|');

  // 注册补全
  monaco.languages.registerCompletionItemProvider('riscv123', {
    provideCompletionItems: function (model, position) {
      const lineContent = model.getLineContent(position.lineNumber);
      const suggestions = [];
      console.log(lineContent);

      // 第一部分：如果输入的是指令关键字
      if (lineContent.trim() === '') {  // 只检测以字母开头的行（指令关键字）
        suggestions.push(...keywords.map(keyword => ({
          label: keyword,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: keyword,
          documentation: `RISC-V Instruction: ${keyword}`
        })));
      }
      else if (/^[.]/.test(lineContent)) {
        suggestions.push(...directives.map(directive=> ({
          label: directive,
          kind: monaco.languages.CompletionItemKind.Keyword,
          insertText: directive,
          documentation: `RISC-V directive: ${directive}`
        })));
      }
      // 第二部分：如果输入的是寄存器名（寄存器补全）
      else {
        suggestions.push(...registers.map(register => ({
          label: register,
          kind: monaco.languages.CompletionItemKind.Variable,
          insertText: register,
          documentation: `RISC-V Register: ${register}`
        })));
      } 

      return { suggestions };
    }
  });

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
      { token: 'riscv.directive', foreground: '#888888', fontStyle: 'bold' },     // 地址灰色
      { token: 'riscv.section', foreground: '#444444' },      // 数字橘红
      { token: 'riscv.view.address', foreground: '#888888' },     // 地址灰色
      { token: 'riscv.ref.num', foreground: '#9e56b0' },      // 数字橘红
      { token: 'riscv.ref.general', foreground: '#9e56b0' },      // 数字橘红
      { token: 'riscv.label.general', foreground: '#9e56b0', fontStyle: 'bold' },      // 数字橘红
      { token: 'riscv.label.num', foreground: '#9e56b0', fontStyle: 'bold' },      // 数字橘红
      { token: 'riscv.literal.string', foreground: '#c52727' },      // 数字橘红
      { token: 'riscv.literal.num', foreground: '#c52727' },      // 数字橘红
      { token: 'riscv.literal.hex', foreground: '#3030b9' },   // 立即数橘红
      { token: 'riscv.literal.comment', foreground: '#666666' },   // 立即数橘红
      { token: 'riscv.literal.mnemonic', foreground: '#666666', fontStyle: 'bold' }, // 指令绿色
      { token: 'riscv.literal.register', foreground: '#367b21' },    // 寄存器蓝色
      { token: 'riscv.instruction.type', foreground: '#bf78cc', fontStyle: '' }, // 类型黄色
      { token: 'riscv.instruction.illegal', foreground: '#c52727', fontStyle: 'bold' },      // 数字橘红
      { token: 'riscv.instruction.jump', foreground: '#888888', fontStyle: 'bold' },      // 数字橘红
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