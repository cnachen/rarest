<script setup>
import Main from './components/Main.vue'

import { provide, ref } from 'vue';
import { LocalVar } from './models/localvar';

const localVar = new LocalVar();
provide('localVar', localVar);

</script>

<template>
  <main>
    <Main />
  </main>
</template>