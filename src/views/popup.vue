<script setup>
import { computed, ref, watch } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Divider from 'primevue/divider'
import Slider from 'primevue/slider'
import InputNumber from 'primevue/inputnumber'

let currentTime = new Date()
const data = ref({
  date: currentTime,
  timeTick: [
    currentTime.getHours() * 60 + currentTime.getMinutes() - 60,
    currentTime.getHours() * 60 + currentTime.getMinutes()
  ]
})

const openInNewTab = () => {
  window.open('/index.html', '_blank') // 打開新分頁並加載新路由
}

const computedStartTimeHour = computed({
  get() {
    const tick = data.value.timeTick[0]

    return Math.floor(tick / 60)
  },
  set(value) {
    const tick = data.value.timeTick[0]
    const minuteValue = tick % 60

    data.value.timeTick[0] = +value * 60 + minuteValue
  }
})

const computedStartTimeMinute = computed({
  get() {
    const tick = data.value.timeTick[0]

    return tick % 60
  },
  set(value) {
    const tick = data.value.timeTick[0]
    const hourValue = Math.floor(tick / 60)

    data.value.timeTick[0] = hourValue * 60 + +value
  }
})

const computedEndTimeHour = computed({
  get() {
    const tick = data.value.timeTick[1]

    return Math.floor(tick / 60)
  },
  set(value) {
    const tick = data.value.timeTick[1]
    const minuteValue = tick % 60

    data.value.timeTick[1] = +value * 60 + minuteValue
  }
})

const computedEndTimeMinute = computed({
  get() {
    const tick = data.value.timeTick[1]

    return tick % 60
  },
  set(value) {
    const tick = data.value.timeTick[1]
    const hourValue = Math.floor(tick / 60)

    data.value.timeTick[1] = hourValue * 60 + +value
  }
})

watch(
  () => data.value.timeTick,
  (timeTick) => {
    if (timeTick[0] > 1425) {
      timeTick[0] = 1425
      timeTick[1] = 1440
    }
    if (timeTick[0] >= timeTick[1] && timeTick[0] <= 1425) {
      timeTick[1] = timeTick[0] + 15
    }
  }
)
</script>
<template>
  <div class="grid">
    <div class="col-1">
      <Button icon="pi pi-window-maximize" severity="secondary" @click="openInNewTab" />
    </div>
    <div class="col-1">
      <Divider layout="vertical" />
    </div>
    <div class="col-10">
      <div class="grid">
        <div class="col-12 mb-2">
          <label for="taskHeader">標題</label>
          <InputText id="taskHeader" class="w-full" type="text" v-model="data.taskHeader" />
        </div>
        <div class="col-12 mb-2">
          <label for="taskUrl">連結</label>
          <InputText id="taskUrl" class="w-full" type="text" v-model="data.taskUrl" />
        </div>
        <div class="col-12">
          <div>
            <label class="mr-1">日期</label>
            <DatePicker class="w-full" v-model="data.date" :manualInput="false" />
          </div>

          <div>
            <label class="mr-1">開始</label>
            <!-- <Button class="h-1rem" label="now" @click="data.time[0] = new Date()" /> -->
            <InputNumber
              inputClass="w-5rem"
              :min="0"
              :max="24"
              v-model="computedStartTimeHour"
            />&nbsp;:&nbsp;
            <InputNumber inputClass="w-5rem" :min="0" :max="60" v-model="computedStartTimeMinute" />
            &nbsp;~&nbsp;
            <InputNumber
              inputClass="w-5rem"
              :min="0"
              :max="24"
              v-model="computedEndTimeHour"
            />&nbsp;:&nbsp;
            <InputNumber inputClass="w-5rem" :min="0" :max="60" v-model="computedEndTimeMinute" />
          </div>
          <Slider v-model="data.timeTick" range step="15" max="1440" class="w-full" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
