<template>
  <span>
    <input
      type="number"
      v-model.number="inputHour"
      @input="validateHourInput"
      @wheel.prevent="adjustHourByWheel"
      @keydown="handleHourKeydown"
      class="w-2rem"
      :style="inputStyle"
      @change="inputUpdateTickData()" />
    :
    <input
      type="number"
      v-model.number="inputMinute"
      @input="validateMinuteInput"
      @wheel.prevent="adjustMinuteByWheel"
      @keydown="handleMinuteKeydown"
      class="w-2rem"
      :style="inputStyle"
      @change="inputUpdateTickData()" />
  </span>
</template>

<script setup>
import { computed, onBeforeMount, ref, watch } from 'vue';

onBeforeMount(() => {
  tickDataUpdateInput();
});

const props = defineProps({
  min: { type: Number, default: 0 },
  max: { type: Number, default: 1440 }
});
const tickData = defineModel();
const inputHour = ref(0);
const inputMinute = ref(0);
const emit = defineEmits(['change']);

const inputUpdateTickData = () => {
  const result = inputHour.value * 60 + inputMinute.value;
  if (result < props.min) {
    tickData.value = props.min;
    tickDataUpdateInput();
  } else if (props.max < result) {
    tickData.value = props.max;
    tickDataUpdateInput();
  } else if (result > 1440) {
    inputHour.value = 24;
    inputMinute.value = 0;
    tickData.value = 1440;
  } else {
    tickData.value = result;
  }

  emit('change');
};

watch(tickData, () => tickDataUpdateInput());

const tickDataUpdateInput = () => {
  inputHour.value = Math.floor(tickData.value / 60) || 0;
  inputMinute.value = tickData.value % 60 || 0;
};

const validateHourInput = (event) => {
  const value = parseInt(event.target.value.replace(/\D/g, ''), 10);
  if (value == 0 && event.target.value.length > 1) {
    event.target.value = 0;
  }
  if (value >= 0 && value <= 24) {
    inputHour.value = value;
  } else {
    inputHour.value = inputHour.value > 24 ? 24 : 0;
  }
};

const validateMinuteInput = (event) => {
  const value = parseInt(event.target.value.replace(/\D/g, ''), 10);
  if (value == 0 && event.target.value.length > 1) {
    event.target.value = 0;
  }
  if (value >= 0 && value <= 59) {
    inputMinute.value = value;
  } else {
    inputMinute.value = inputMinute.value > 59 ? 59 : 0;
  }
};

const adjustHourByWheel = (event) => {
  if (event.deltaY < 0 && inputHour.value < 24) {
    inputHour.value++;
  } else if (event.deltaY > 0 && inputHour.value > 0) {
    inputHour.value--;
  }
  inputUpdateTickData();
};

const adjustMinuteByWheel = (event) => {
  if (event.deltaY < 0) {
    if (inputMinute.value === 59) {
      inputMinute.value = 0;
      if (inputHour.value < 24) inputHour.value++;
    } else {
      inputMinute.value++;
    }
  } else if (event.deltaY > 0) {
    if (inputHour.value === 0 && inputMinute.value === 0) return;

    if (inputMinute.value === 0) {
      inputMinute.value = 59;
      if (inputHour.value > 0) inputHour.value--;
    } else {
      inputMinute.value--;
    }
  }
  inputUpdateTickData();
};

const handleHourKeydown = (event) => {
  if (event.key === 'ArrowUp' && inputHour.value < 24) {
    inputHour.value++;
    inputUpdateTickData();
  } else if (event.key === 'ArrowDown' && inputHour.value > 0) {
    inputHour.value--;
    inputUpdateTickData();
  }
};

const handleMinuteKeydown = (event) => {
  if (event.key === 'ArrowUp') {
    if (inputMinute.value === 59) {
      inputMinute.value = 0;
      if (inputHour.value < 24) inputHour.value++;
    } else {
      inputMinute.value++;
    }
    inputUpdateTickData();
  } else if (event.key === 'ArrowDown') {
    if (inputHour.value === 0 && inputMinute.value === 0) return;

    if (inputMinute.value === 0) {
      inputMinute.value = 59;
      if (inputHour.value > 0) inputHour.value--;
    } else {
      inputMinute.value--;
    }
    inputUpdateTickData();
  }
};

const inputStyle = 'border-radius: unset; border: none; border-bottom: 1px solid black; text-align: center; padding-left: 0; padding-right: 0;';
</script>
<style scoped>
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
/* input[type='number'] {
  -moz-appearance: textfield; 
} */
</style>
