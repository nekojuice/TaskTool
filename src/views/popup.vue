<template>
  <div class="sidenav p-0 flex justify-content-center flex-wrap">
    <div class="w-2rem flex justify-content-center align-content-start flex-wrap">
      <Button
        v-tooltip="'開起debug區塊'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-ellipsis-v"
        severity="secondary"
        :outlined="!showBlock.debugBlock"
        @click="showBlock.debugBlock = !showBlock.debugBlock"
      />
      <Button
        v-tooltip="'在新瀏覽器標籤開啟'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-window-maximize"
        severity="secondary"
        outlined
        @click="openInNewTab('/index.html')"
      />
      <div class="h-2rem w-2rem"></div>
      <Button
        v-tooltip="'任務編輯區塊'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-book"
        severity="info"
        :outlined="!showBlock.taskEditor"
        @click="[(showBlock.taskEditor = !showBlock.taskEditor), saveCache()]"
      />
      <Button
        v-tooltip="'時段編輯區塊'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-clock"
        severity="info"
        :outlined="!showBlock.timeEditor"
        @click="[(showBlock.timeEditor = !showBlock.timeEditor), saveCache()]"
      />
      <Button
        v-tooltip="'顯示刪除按鈕'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-unlock"
        severity="danger"
        :outlined="!showBlock.deleteMode"
        @click="[(showBlock.deleteMode = !showBlock.deleteMode), saveCache()]"
      />
      <div class="h-2rem w-2rem"></div>
      <FileUpload
        v-tooltip="'上傳並覆蓋資料'"
        name="demo[]"
        mode="basic"
        auto
        customUpload
        chooseIcon="pi pi-upload"
        :chooseButtonProps="{ label: '', class: 'h-2rem w-2rem flex align-items-center justify-content-center', severity: 'danger', outlined: true }"
        accept=".json"
        :maxFileSize="1000000"
        @select="fileOnChange($event)"
      >
      </FileUpload>
      <Button v-tooltip="'下載資料'" class="h-2rem w-2rem flex align-items-center justify-content-center" icon="pi pi-download" severity="danger" outlined @click="downloadOnClick()" />
      <a id="downloadAnchorElem" style="display: none" :href="datatable" download="launch.json"></a>
    </div>
    <!-- debugblock -->
    <div v-if="showBlock.debugBlock" class="w-2rem flex justify-content-center align-content-end flex-wrap">
      <Button v-tooltip="'DEBUG, all tasks and cache'" class="h-2rem w-2rem flex align-items-center justify-content-center" label="A" outlined @click="showStorageData()" />
      <Button v-tooltip="'DEBUG, current data'" class="h-2rem w-2rem flex align-items-center justify-content-center" label="D" outlined @click="console.log('data', _data)" />
      <Button v-tooltip="'DEBUG, current data all times'" class="h-2rem w-2rem flex align-items-center justify-content-center" label="T" outlined @click="console.log('time', _time)" />
      <Button v-tooltip="'DEBUG, current period'" class="h-2rem w-2rem flex align-items-center justify-content-center" label="P" outlined @click="console.log('period', _period)" />
      <Button v-tooltip="'⚠️刪除所有資料'" class="h-2rem w-2rem flex align-items-center justify-content-center" icon="pi pi-trash" severity="danger" outlined @click="deleteAllData()" />
    </div>
  </div>
  <div class="main">
    <!-- Task Info -->
    <Panel v-if="showBlock.taskEditor">
      <div class="grid">
        <div class="col-1">
          <label for="taskId">編號</label>
          <InputNumber id="taskId" v-model="_data.id" inputClass="w-full" :min="0" size="small" :disabled="true" />
        </div>
        <div class="col-9">
          <label for="taskHeader">標題</label>
          <InputText id="taskHeader" class="w-full" type="text" v-model="_data.taskHeader" @change="saveCache()" />
        </div>
        <div class="col-1">
          <label>新增</label>
          <Button icon="pi pi-plus" outlined raised @click="newTask()" />
        </div>
        <div class="col-1">
          <label>儲存</label>
          <Button icon="pi pi-save" severity="danger" outlined raised @click="saveTaskInfo()" :disabled="!_data.taskHeader.trim()" />
        </div>
        <div class="col-6">
          <label for="taskUrl">連結 <Button class="h-1rem w-1rem" icon="pi pi-link" severity="secondary" @click="openInNewTab(_data.taskUrl)" text size="small"></Button></label>
          <InputText id="taskUrl" class="w-full" type="text" v-model="_data.taskUrl" @change="saveCache()" />
        </div>
        <div class="col-6">
          <label for="taskBranch">分支</label>
          <InputText id="taskBranch" class="w-full" type="text" v-model="_data.taskBranch" @change="saveCache()" />
        </div>
      </div>
    </Panel>
    <!-- Time Editor -->
    <Panel v-if="showBlock.timeEditor" class="pl-3 pr-3">
      <div class="grid">
        <div class="col-3">
          <label>任務日期&nbsp;<Button class="h-1rem" outlined raised @click="_time.date = convertDateToString(new Date(), 'yyyyMMdd', { separator: '/' })" label="今日" size="small" /></label>
          <InputTextDate class="w-full" v-model="_time.date" title="資料日期" format="yyyyMMdd" separator="/" @change="saveCache()"></InputTextDate>&nbsp;
        </div>
        <div class="col-8">
          <label
            >時段&nbsp;<Button
              class="h-1rem"
              outlined
              raised
              @click="_period = [new Date().getHours() * 60 + new Date().getMinutes() - 60, new Date().getHours() * 60 + new Date().getMinutes()]"
              label="現在"
              size="small"
          /></label>
          <div class="w-full">
            <InputNumber v-model="computedStartTimeHour" inputClass="w-3rem" :min="0" :max="24" size="small" />&nbsp;:&nbsp;
            <InputNumber v-model="computedStartTimeMinute" inputClass="w-3rem" :min="0" :max="60" size="small" />
            &nbsp;~&nbsp;
            <InputNumber v-model="computedEndTimeHour" inputClass="w-3rem" :min="0" :max="24" size="small" />&nbsp;:&nbsp;
            <InputNumber v-model="computedEndTimeMinute" inputClass="w-3rem" :min="0" :max="60" size="small" />
          </div>
        </div>
        <div class="col-1">
          <label>加入</label>
          <Button icon="pi pi-save" severity="danger" outlined raised @click="saveTime" />
        </div>
        <Slider class="mt-1 col-12" v-model="_period" range :step="1" :max="1441" pt:startHandler:style="margin-top: 8px; z-index: 10;" pt:endHandler:style="margin-top: 8px; z-index: 10;" />
        <br />
        <Timeline class="col-12 p-0 mt-3" :workTime="selectedDateTimeline?.periods" :restTime="[[710, 800]]" :showScale="true"></Timeline>
      </div>
    </Panel>
    <!-- Tasks List and Data -->
    <!-- TODO: 刪除task -->
    <div class="target">
      <div class="grid">
        <div class="col-8">
          <DataTable :value="_tasks" @rowReorder="onRowReorder($event)" dataKey="id">
            <Column rowReorder class="w-1" />
            <Column field="taskHeader" header="標題" sclass="w-9">
              <template #body="slotProps">
                <Button @click="[(_data = { ...slotProps.data }), saveCache()]" :severity="isSelected(slotProps.data.id)">
                  {{ slotProps.data.taskHeader }}
                </Button>
              </template>
            </Column>
            <Column field="effort" header="effort" class="w-2">
              <template #body="slotProps">
                {{ calEffort(slotProps.data.times) }}
              </template>
            </Column>
            <Column v-if="showBlock.deleteMode" field="delete" header="刪除">
              <template #body="slotProps">
                <Button icon="pi pi-trash" severity="danger" size="small" raised @click="deleteTask(slotProps.data.id)" />
              </template>
            </Column>
          </DataTable>
        </div>
        <div class="col-4">
          <span>任務: {{ _data.taskHeader }}</span>
          <br />
          <span v-if="!sortedTimelines.length">目前沒有時數紀錄</span>
          <Timeline
            v-for="day in sortedTimelines"
            :date="day.date"
            :workTime="day.periods"
            :restTime="[[710, 800]]"
            :showDateAndSum="true"
            :deleteMode="showBlock.deleteMode"
            @click="_time.date = day.date"
            @deleteDate="deleteDate(day.date)"
          ></Timeline>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { computed, onMounted, ref, watch } from 'vue'

import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Slider from 'primevue/slider'
import InputNumber from 'primevue/inputnumber'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import FileUpload from 'primevue/fileupload'
import Panel from 'primevue/panel'

import InputTextDate from '@/components/InputTextDate.vue'
import Timeline from '@/components/Timeline.vue'

import { convertDateToString } from '../service/commonService'

onMounted(() => {
  loadCache()
  loadTasks()
})

const _tasks = ref([])
const _data = ref({
  id: 0,
  taskHeader: '',
  taskUrl: '',
  taskBranch: '',
  times: []
})
const _time = ref({ date: convertDateToString(new Date(), 'yyyyMMdd', { separator: '/' }), periods: [] })
const _period = ref([new Date().getHours() * 60 + new Date().getMinutes() - 60, new Date().getHours() * 60 + new Date().getMinutes()])
const showBlock = ref({
  taskEditor: false,
  timeEditor: false,
  debugBlock: false,
  deleteMode: false
})

const showStorageData = () => {
  chrome.runtime.sendMessage({ action: 'getStorage', key: 'cache' }, (response) => {
    console.log('cache', response.message)
  })
  chrome.runtime.sendMessage({ action: 'getStorage', key: 'tasks' }, (response) => {
    console.log('tasks', response.message)
  })
}
const loadCache = async () => {
  chrome.runtime.sendMessage({ action: 'getStorage', key: 'cache' }, (response) => {
    if (response.message) {
      _data.value = response.message
    } else {
      _data.value = {
        id: 0,
        taskHeader: '',
        taskUrl: '',
        taskBranch: '',
        times: []
      }
    }
  })
  chrome.runtime.sendMessage({ action: 'getStorage', key: 'UIcache' }, (response) => {
    if (response.message) {
      showBlock.value = response.message
      showBlock.value.deleteMode = false
    } else {
      showBlock.value = {
        taskEditor: false,
        timeEditor: false,
        debugBlock: false,
        deleteMode: false
      }
    }
  })
}
const saveCache = () => {
  chrome.runtime.sendMessage({ action: 'setStorage', obj: { cache: _data.value } }, (response) => {
    console.log(response.message)
  })
  chrome.runtime.sendMessage({ action: 'setStorage', obj: { UIcache: showBlock.value } }, (response) => {
    console.log(response.message)
  })
}
const loadTasks = async () => {
  chrome.runtime.sendMessage({ action: 'getStorage', key: 'tasks' }, (response) => {
    if (response.message) {
      _tasks.value = response.message
    } else {
      _tasks.value = []
    }
  })
}
const saveTasks = () => {
  chrome.runtime.sendMessage({ action: 'setStorage', obj: { tasks: _tasks.value } }, (response) => {
    console.log(response.message)
  })
}
const deleteAllData = async () => {
  chrome.runtime.sendMessage({ action: 'deleteStorage' }, async (response) => {
    console.log(response.message)
    await loadTasks()
    await loadCache()
  })
}
const openInNewTab = (url) => {
  window.open(url, '_blank')
}
const newTask = () => {
  if (!_tasks.value.filter((t) => t.id == _data.value.id).length) {
    return
  }

  let maxId = 0

  if (_data.value.length === 0) {
    maxId = 0
  } else {
    maxId = Math.max(..._tasks.value.map((item) => item.id))
  }

  _data.value = {
    id: maxId + 1,
    taskHeader: '',
    taskUrl: '',
    taskBranch: '',
    times: []
  }
}
const saveTaskInfo = () => {
  const index = _tasks.value.findIndex((t) => t.id == _data.value.id)

  if (index !== -1) {
    _tasks.value[index] = { ..._data.value }
  } else {
    _tasks.value.push({ ..._data.value })
  }

  saveTasks()
}

const saveTime = () => {
  const taskIndex = _tasks.value.findIndex((t) => t.id == _data.value.id)
  const timeIndex = _tasks.value[taskIndex]?.times.findIndex((t) => t.date == _time.value.date) ?? -1
  console.log('taskIndex', taskIndex)
  console.log('timeIndex', timeIndex)

  if (timeIndex == -1) {
    _time.value.periods = removeLaunchPeriod([..._period.value])

    _data.value.times.push({ ..._time.value })

    if (taskIndex == -1) {
      _tasks.value.push({ ..._data.value })
    } else {
      _tasks.value[taskIndex].times = _data.value.times
    }
  } else {
    const mergedPeriod = processWorkPeriods([..._tasks.value[taskIndex].times[timeIndex].periods, [..._period.value]])
    console.log('mergedPeriod', mergedPeriod)

    _tasks.value[taskIndex].times[timeIndex].periods = mergedPeriod
  }

  saveTasks()
  saveCache()
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

const removeLaunchPeriod = ([start, end]) => {
  const lunchBreakStart = 710
  const lunchBreakEnd = 800
  const result = []

  if (start < lunchBreakStart && end > lunchBreakEnd) {
    result.push([start, lunchBreakStart], [lunchBreakEnd, end])
  } else if (end > lunchBreakStart && start < lunchBreakEnd) {
    if (start < lunchBreakStart) result.push([start, lunchBreakStart])
    if (end > lunchBreakEnd) result.push([lunchBreakEnd, end])
  } else {
    result.push([start, end])
  }

  return result
}

const onRowReorder = (event) => {
  const reorderedTasks = event.value
  _tasks.value = reorderedTasks

  saveTaskInfo()
}

const calEffort = (workData) => {
  let totalMinutes = workData.reduce((totalMinutes, day) => {
    const dayMinutes = day.periods.reduce((dayTotal, period) => {
      const [start, end] = period
      return dayTotal + (end - start)
    }, 0)
    return totalMinutes + dayMinutes
  }, 0)

  const personDays = Math.ceil(totalMinutes / 60) * 0.125

  return personDays
}

const computedStartTimeHour = computed({
  get() {
    const tick = _period.value[0]

    return Math.floor(tick / 60)
  },
  set(value) {
    const tick = _period.value[0]
    const minuteValue = tick % 60

    _period.value[0] = +value * 60 + minuteValue
  }
})

const computedStartTimeMinute = computed({
  get() {
    const tick = _period.value[0]

    return tick % 60
  },
  set(value) {
    const tick = _period.value[0]
    const hourValue = Math.floor(tick / 60)

    _period.value[0] = hourValue * 60 + +value
  }
})

const computedEndTimeHour = computed({
  get() {
    const tick = _period.value[1]

    return Math.floor(tick / 60)
  },
  set(value) {
    const tick = _period.value[1]
    const minuteValue = tick % 60

    _period.value[1] = +value * 60 + minuteValue
  }
})

const computedEndTimeMinute = computed({
  get() {
    const tick = _period.value[1]

    return tick % 60
  },
  set(value) {
    const tick = _period.value[1]
    const hourValue = Math.floor(tick / 60)

    _period.value[1] = hourValue * 60 + +value
  }
})

watch(
  () => _period.value,
  (period) => {
    period[0] = period[0] < 0 ? 0 : period[0]
    period[1] = period[1] > 1440 ? 1440 : period[1]

    if (period[0] > 1425) {
      period[0] = 1425
      period[1] = 1440
    }
    if (period[0] >= period[1] && period[0] <= 1425) {
      period[1] = period[0] + 15
    }
  }
)

const selectedDateTimeline = computed(() => {
  return _data.value.times.filter((t) => t.date == _time.value.date)[0]
})

const sortedTimelines = computed(() => _data.value.times.sort((a, b) => (a.date > b.date ? 1 : b.date > a.date ? -1 : 0)))

const downloadOnClick = () => {
  let dlAnchorElem = document.getElementById('downloadAnchorElem')

  var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(_tasks.value))
  dlAnchorElem.setAttribute('href', dataStr)
  dlAnchorElem.setAttribute('download', `taskdata-${new Date().toLocaleDateString().replaceAll('/', '-')}.json`)
  dlAnchorElem.click()
}

async function fileOnChange(event) {
  const file = event.files[0]

  if (file && file.type === 'application/json') {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result)

        if (!validateTaskData(jsonData)) {
          return
        }

        _tasks.value = jsonData
        saveTasks()
      } catch (error) {
        console.error('無法解析 JSON 文件:', error)
      }
    }

    reader.onerror = (e) => {
      console.error('文件讀取錯誤:', e)
    }

    reader.readAsText(file)
  } else {
    console.error('請上傳 JSON 文件')
  }
}

function isSelected(rowid) {
  return _data.value.id == rowid ? 'warn' : 'primary'
}

function deleteTask(rowid) {
  // TODO
  console.log(rowid)
}

function deleteDate(rowdate) {
  
  const taskIndex = _tasks.value.findIndex((t) => t.id === _data.value.id)

  if (taskIndex === -1) return

  if (rowdate) {
    const timesIndex = _tasks.value[taskIndex].times.findIndex((t) => t.date === rowdate)
    if (timesIndex !== -1) {
      _tasks.value[taskIndex].times.splice(timesIndex, 1)
      console.log(timesIndex, rowdate);
    }

    const dataTimeIndex = _data.value.times.findIndex((t) => t.date === rowdate)
    if (dataTimeIndex !== -1) {
      _data.value.times.splice(dataTimeIndex, 1)
      console.log(dataTimeIndex, rowdate);
    }

    saveTasks()
    saveCache()
  }
}

function validateTaskData(tasks) {
  if (!Array.isArray(tasks)) {
    console.error('tasks 必須是 array')
    return false
  }

  for (const task of tasks) {
    if (typeof task.id !== 'number') {
      console.error('id 必須是 number')
      return false
    }

    if (typeof task.taskHeader !== 'string') {
      console.error('taskHeader 必須是 string')
      return false
    }

    if (typeof task.taskUrl !== 'string') {
      console.error('taskUrl 必須是 string')
      return false
    }

    if (typeof task.taskBranch !== 'string') {
      console.error('taskBranch 必須是 string')
      return false
    }

    if (!Array.isArray(task.times)) {
      console.error('times 必須是 array')
      return false
    }

    for (const time of task.times) {
      if (typeof time.date !== 'string') {
        console.error('date 必須是 string')
        return false
      }

      if (!Array.isArray(time.periods)) {
        console.error('periods 必須是 array')
        return false
      }

      for (const period of time.periods) {
        if (!Array.isArray(period) || period.length !== 2 || typeof period[0] !== 'number' || typeof period[1] !== 'number') {
          console.error('每個 period 必須是 [number, number]')
          return false
        }
      }
    }
  }

  return true
}
</script>

<style scoped>
.sidenav {
  height: 90%;
  width: 32px;
  position: fixed;
  z-index: 1;
  overflow: hidden;
}

.main {
  margin-left: 64px;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.target {
  padding: 10px;
  flex-grow: 1;
  overflow-y: auto;
  overflow-x: hidden;
  background-color: #f0f0f0;
}

.p-slider-handle {
  handle-width: 1px;
}
</style>
