<template>
  <span>
    <TimeInput v-model="timeData[0]" @change="switchTime" />
    ~
    <TimeInput v-model="timeData[1]" @change="switchTime" />
  </span>
</template>
<script setup>
import { computed, onMounted, watch } from 'vue';

import TimeInput from '@/components/TimeInput.vue';

const model = defineModel();
const timeData = computed({
  get() {
    if (!model.value || !Array.isArray(model.value) || model.value.length !== 2) {
      model.value = [0, 0];
      return [0, 0];
    }

    return model.value;
  },
  set(value) {
    model.value = value;
  }
});

const switchTime = () => {
  if (timeData.value[1] < timeData.value[0]) {
    [timeData.value[0], timeData.value[1]] = [timeData.value[1], timeData.value[0]];
  }
};
</script>

<style scoped></style>
