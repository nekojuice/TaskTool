<template>
  <div class="grid h-full w-full">
    <div class="col-1 p-0 flex justify-content-center flex-wrap">
      <div class="w-2rem flex justify-content-center align-content-start flex-wrap">
        <Button class="h-2rem w-2rem flex align-items-center justify-content-center" icon="pi pi-ellipsis-v" severity="secondary" outlined @click="loadTasks" />
        <Button class="h-2rem w-2rem flex align-items-center justify-content-center" icon="pi pi-save" severity="success" outlined @click="saveTasks" />
      </div>
      <div class="w-2rem flex justify-content-center align-content-end flex-wrap">
        <Button class="h-2rem w-2rem flex align-items-center justify-content-center" icon="pi pi-trash" severity="danger" outlined @click="deleteAllData" />
        <Button class="h-2rem w-2rem flex align-items-center justify-content-center" icon="pi pi-window-maximize" severity="secondary" outlined @click="openInNewTab" />
      </div>
    </div>
    <div class="col-11">
      <div class="grid">
        <div class="col-1">
          <label for="taskId">編號</label>
          <InputNumber id="taskId" v-model="id" inputClass="w-full" :min="0" size="small" />
        </div>
        <div class="col-10">
          <label for="taskHeader">標題</label>
          <InputText id="taskHeader" class="w-full" type="text" v-model="data.taskHeader" @change="saveCache()" />
        </div>
        <div class="col-1">
          <label>任務</label>
          <Button icon="pi pi-plus" severity="success" outlined raised @click="saveTasks" />
        </div>
        <div class="col-6">
          <label for="taskUrl">連結</label>
          <InputText id="taskUrl" class="w-full" type="text" v-model="data.taskUrl" @change="saveCache()" />
        </div>
        <div class="col-6">
          <label for="taskBranch">分支</label>
          <InputText id="taskBranch" class="w-full" type="text" v-model="data.taskBranch" @change="saveCache()" />
        </div>

        <Divider />

        <div class="col-12">
          <div class="grid">
            <div class="col-3">
              <label>任務日期</label>
              <InputTextDate class="w-full" v-model="data.date" title="資料日期" format="yyyyMMdd" separator="/" @change="saveCache()"></InputTextDate>&nbsp;
            </div>
            <div class="col-8">
              <label>時段</label>
              <div class="w-full">
                <InputNumber v-model="computedStartTimeHour" inputClass="w-3rem" :min="0" :max="24" size="small" />&nbsp;:&nbsp;
                <InputNumber v-model="computedStartTimeMinute" inputClass="w-3rem" :min="0" :max="60" size="small" />
                &nbsp;~&nbsp;
                <InputNumber v-model="computedEndTimeHour" inputClass="w-3rem" :min="0" :max="24" size="small" />&nbsp;:&nbsp;
                <InputNumber v-model="computedEndTimeMinute" inputClass="w-3rem" :min="0" :max="60" size="small" />
              </div>
            </div>
            <div class="col-1 ">
              <label>時間</label>
              <Button icon="pi pi-plus" severity="success" outlined raised @click="saveTime" />
            </div>
            <Slider :class="'mt-1 col-12'" v-model="timeTick" range :step="1" :max="1441" class="w-full" />
          </div>
        </div>

        <div class="col-12">
          <div v-for="task in tasks">
            <label class="mr-2">#{{ task.id }}</label>
            <Button class="mr-2 w-5rem">{{ task.data.taskHeader }}</Button>
            <!-- <label class="mr-2">({{ calEffort(task.data.time) }})</label> -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import Slider from 'primevue/slider'
import InputNumber from 'primevue/inputnumber'
import Divider from 'primevue/divider'
import { convertDateToString, convertStringToDate, deepMerge } from '../service/commonService'
import InputTextDate from '@/components/InputTextDate.vue'

onMounted(() => {
  loadCache()
  loadTasks()
})

const tasks = ref([])

const id = ref(0)
const data = ref({
  taskHeader: '',
  taskUrl: '',
  taskBranch: '',
  date: convertDateToString(new Date(), 'yyyyMMdd', { separator: '/' }),
  timeTick: []
})
const timeTick = ref([new Date().getHours() * 60 + new Date().getMinutes() - 60, new Date().getHours() * 60 + new Date().getMinutes()])

const loadCache = () => {
  chrome.runtime.sendMessage({ action: 'getStorage', key: 'cache' }, (response) => {
    if (response.message) {
      data.value = response.message
    }
  })
}
const saveCache = () => {
  chrome.runtime.sendMessage({ action: 'setStorage', obj: { cache: data.value } }, (response) => {
    console.log(response.message)
  })
}

const loadTasks = async () => {
  chrome.runtime.sendMessage({ action: 'getStorage', key: 'tasks' }, (response) => {
    console.log(response.message)
    tasks.value = response.message
  })
}
const saveTasks = () => {
  const index = tasks.value.findIndex((t) => t.id === id.value)

  if (index !== -1) {
    tasks.value[index].data = data.value
  } else {
    const task = {
      id: id.value,
      data: data.value
    }
    tasks.value.push(task)
  }

  chrome.runtime.sendMessage({ action: 'setStorage', obj: { tasks: tasks.value } }, (response) => {
    console.log(response.message)
  })
}
const deleteAllData = () => {
  chrome.runtime.sendMessage({ action: 'deleteStorage' }, (response) => {
    console.log(response.message)
  })
}
const openInNewTab = () => {
  window.open('/index.html', '_blank')
}

// TODO
const saveTime = () => {
  tasks.value.filter((t) => t.id === id.value).time.filter((t) => t.date === 'TODO')
}

function processWorkPeriods(workPeriods) {
  const lunchBreakStart = 710
  const lunchBreakEnd = 800

  // Step 1: Sort periods by starting time
  workPeriods.sort((a, b) => a[0] - b[0])

  const mergedPeriods = []
  let currentPeriod = workPeriods[0]

  for (let i = 1; i < workPeriods.length; i++) {
    const [currentStart, currentEnd] = currentPeriod
    const [nextStart, nextEnd] = workPeriods[i]

    // Step 2: Merge overlapping periods
    if (currentEnd >= nextStart) {
      currentPeriod = [currentStart, Math.max(currentEnd, nextEnd)]
    } else {
      mergedPeriods.push(currentPeriod)
      currentPeriod = workPeriods[i]
    }
  }
  mergedPeriods.push(currentPeriod)

  // Step 3: Remove lunch break time (710 to 800)
  const result = []
  mergedPeriods.forEach(([start, end]) => {
    if (start < lunchBreakStart && end > lunchBreakEnd) {
      result.push([start, lunchBreakStart], [lunchBreakEnd, end])
    } else if (end > lunchBreakStart && start < lunchBreakEnd) {
      if (start < lunchBreakStart) result.push([start, lunchBreakStart])
      if (end > lunchBreakEnd) result.push([lunchBreakEnd, end])
    } else {
      result.push([start, end])
    }
  })

  return result
}

const calEffort = (timearr) => {
  let totalMinutes = 0

  timearr.forEach((dayObj) => {
    Object.values(dayObj).forEach((timeRanges) => {
      timeRanges.forEach((range) => {
        const [start, end] = range
        totalMinutes += end - start
      })
    })
  })

  // 計算人日，1 人日 = 60 分鐘 * 0.125
  const personDays = (totalMinutes / 60) * 0.125

  return personDays
}

const computedStartTimeHour = computed({
  get() {
    const tick = timeTick.value[0]

    return Math.floor(tick / 60)
  },
  set(value) {
    const tick = timeTick.value[0]
    const minuteValue = tick % 60

    timeTick.value[0] = +value * 60 + minuteValue
  }
})

const computedStartTimeMinute = computed({
  get() {
    const tick = timeTick.value[0]

    return tick % 60
  },
  set(value) {
    const tick = timeTick.value[0]
    const hourValue = Math.floor(tick / 60)

    timeTick.value[0] = hourValue * 60 + +value
  }
})

const computedEndTimeHour = computed({
  get() {
    const tick = timeTick.value[1]

    return Math.floor(tick / 60)
  },
  set(value) {
    const tick = timeTick.value[1]
    const minuteValue = tick % 60

    timeTick.value[1] = +value * 60 + minuteValue
  }
})

const computedEndTimeMinute = computed({
  get() {
    const tick = timeTick.value[1]

    return tick % 60
  },
  set(value) {
    const tick = timeTick.value[1]
    const hourValue = Math.floor(tick / 60)

    timeTick.value[1] = hourValue * 60 + +value
  }
})

watch(
  () => timeTick.value,
  (timeTick) => {
    timeTick[0] = timeTick[0] < 0 ? 0 : timeTick[0]
    timeTick[1] = timeTick[1] > 1440 ? 1440 : timeTick[1]

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

<style scoped></style>
