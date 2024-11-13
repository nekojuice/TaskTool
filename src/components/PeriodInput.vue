<template>
  <span>
    <TimeInput v-model="timeData[0]" @change="switchTime(), emit('change')" :min="props.min" :max="props.max" />
    ~
    <TimeInput v-model="timeData[1]" @change="switchTime(), emit('change')" :min="props.min" :max="props.max" />
  </span>
</template>
<script setup>
import { computed, onMounted, watch } from 'vue';

import TimeInput from '@/components/TimeInput.vue';

const props = defineProps({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 1440 }
});

const model = defineModel();
const emit = defineEmits(['change']);

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
