<template>
  <div :class="`flex ${_class}`">
    <InputText v-model="dateInput" class="flex w-full" :disabled="props.disabled" :placeholder="props.placeholder" @change="dateInputOnChange($event)" />
    <DatePicker v-model="dateCalendar" class="flex w-2rem" :disabled="props.disabled" showIcon :view="props.view" />
  </div>
</template>
<script setup>
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import { isValidDateString, convertDateToString, convertStringToDate } from '../service/commonService'
import { ref, computed } from 'vue'

const props = defineProps(['modelValue', 'title', 'format', 'view', 'yearOffset', 'separator', 'class', 'disabled', 'nullable', 'placeholder'])
const emit = defineEmits(['update:modelValue'])
const inputData = ref({})
const data = computed({
  get: () => props.modelValue,
  set: (value) => {
    if (!value) {
      emit('update:modelValue', ' '.repeat(props.format.length))
    } else {
      emit('update:modelValue', value)
    }
  }
})

const _class = props.class || 'w-full'
const yearOffset = Number(props.yearOffset) || 0
const separator = props.separator || ''

const yearText = computed(() => {
  switch (yearOffset) {
    case 1911:
      return '民國'
    case 0:
      return '西元'
    default:
      const sign = numVar >= 0 ? '+' : '-'
      return `西元${sign}${yearOffset}年`
  }
})

const dateInput = computed({
  get: () => data.value,
  set: (val) => {
    inputData.value = val
  }
})

const dateCalendar = computed({
  get: () => {
    if (!data.value) {
      return new Date()
    }

    return convertStringToDate(data.value, props.format, { yearOffset: yearOffset, separator: separator })
  },
  set: (val) => {
    data.value = convertDateToString(val, props.format, { yearOffset: yearOffset, separator: separator })
  }
})

const dateInputOnChange = (event) => {
  if ((props.nullable && !inputData.value) || isValidDateString(inputData.value, props.format)) {
    data.value = inputData.value
  } else {
    event.target.value = data.value
    inputData.value = data.value
  }
}
</script>

<style scoped>
:deep(.p-datepicker .p-inputtext) {
  display: none;
  width: 0;
}
</style>
