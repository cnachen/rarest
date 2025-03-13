<script setup>
import MainFrame from './components/MainFrame.vue'

import { provide, ref } from 'vue';
import Session from './models/session';

const session = ref(new Session());
provide('session', session);
</script>

<template>
  <main>
    <MainFrame />
  </main>
</template>