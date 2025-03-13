<script setup>
import MainFrame from './components/MainFrame.vue'

import { provide, ref } from 'vue';
import { LocalVar } from './models/localvar';

const localVar = new LocalVar();
provide('localVar', localVar);

</script>

<template>
  <main>
    <MainFrame />
  </main>
</template>