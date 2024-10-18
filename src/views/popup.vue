<template>
  <div class="sidenav p-0 flex justify-content-center flex-wrap">
    <div class="w-2rem flex justify-content-center align-content-start flex-wrap">
      <Button
        v-tooltip="'開啟debug模式'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-ellipsis-v"
        severity="secondary"
        :outlined="!showBlock.debugBlock"
        @click="showBlock.debugBlock = !showBlock.debugBlock" />
      <Button
        v-tooltip="'在新瀏覽器標籤開啟小工具'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-window-maximize"
        severity="secondary"
        outlined
        @click="openInNewTab('/index.html')" />
      <div class="h-2rem w-2rem"></div>
      <Button
        v-tooltip="'任務內容編輯器'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-book"
        severity="info"
        :outlined="!showBlock.taskEditor"
        @click="[toggleTaskBlock(), saveCache()]" />
      <Button
        v-tooltip="'新增任務'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-plus"
        severity="success"
        :outlined="showBlock.taskEditor != 2"
        @click="[toggleNewTask(), saveCache()]" />
      <Button
        v-tooltip="'時間軸編輯器'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-clock"
        severity="info"
        :outlined="!showBlock.timeEditor"
        @click="[(showBlock.timeEditor = !showBlock.timeEditor), saveCache()]" />
      <Button
        v-tooltip="'顯示刪除按鈕'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-unlock"
        severity="danger"
        :outlined="!showBlock.deleteMode"
        @click="[(showBlock.deleteMode = !showBlock.deleteMode), saveCache()]" />
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
        @select="fileOnChange($event)">
      </FileUpload>
      <Button v-tooltip="'下載資料(ctrl + s)'" class="h-2rem w-2rem flex align-items-center justify-content-center" icon="pi pi-download" severity="danger" outlined @click="downloadOnClick()" />
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
    <Panel v-if="showBlock.taskEditor" :pt:root:style="taskBlockColor()" pt:header:style="padding: 0;" pt:content:style="padding: 18px;">
      <div class="grid">
        <h2 v-if="showBlock.taskEditor == 2" class="col-12">新增任務</h2>
        <div v-if="showBlock.debugBlock" class="col-1">
          <label for="taskId">編號</label>
          <InputNumber id="taskId" v-model="_data.id" inputClass="w-full" :min="0" size="small" :disabled="true" />
        </div>
        <div class="col">
          <label for="taskHeader">標題</label>
          <InputText id="taskHeader" class="w-full" type="text" v-model="_data.taskHeader" @change="saveCache()" />
        </div>
        <div class="col-1">
          <label v-if="showBlock.taskEditor == 2">新增</label>
          <label v-if="showBlock.taskEditor == 1">儲存</label>
          <br />
          <Button icon="pi pi-save" :severity="!_data.taskHeader?.trim() ? 'secondary' : 'warn'" outlined raised @click="saveTaskInfo()" :disabled="!_data.taskHeader?.trim()" />
        </div>
      </div>
      <div class="grid">
        <div class="col-6">
          <label for="taskUrl"> 連結 <Button class="h-1rem w-1rem" icon="pi pi-link" severity="secondary" @click="if (_data.taskUrl?.trim()) openInNewTab(_data.taskUrl);" text size="small" /> </label>
          <InputText id="taskUrl" class="w-full" type="text" v-model="_data.taskUrl" @change="saveCache()" />
        </div>
        <div class="col-6">
          <label for="taskBranch">分支</label>
          <InputText id="taskBranch" class="w-full" type="text" v-model="_data.taskBranch" @change="saveCache()" />
        </div>
      </div>
    </Panel>
    <!-- Time Editor -->
    <Panel v-if="showBlock.timeEditor" class="pl-3 pr-3" :pt:root:style="timeBlockColor() + 'margin-top: -2px;'">
      <div class="grid">
        <div class="col-3 pb-0">
          <label>
            日期&nbsp;
            <Button
              class="h-1rem"
              outlined
              raised
              @click="_time.date = convertDateToString(new Date(), 'yyyyMMdd', { separator: '/' })"
              label="選擇今日"
              size="small"
              :severity="_time.date == convertDateToString(new Date(), 'yyyyMMdd', { separator: '/' }) ? 'secondary' : 'primary'"
              :disabled="_time.date == convertDateToString(new Date(), 'yyyyMMdd', { separator: '/' })" />
          </label>
          <InputTextDate class="w-full" v-model="_time.date" title="資料日期" format="yyyyMMdd" separator="/" @change="saveCache()"></InputTextDate>&nbsp;
        </div>
        <div class="col-6 pb-0">
          <label>
            時段&nbsp;
            <Button
              class="h-1rem"
              outlined
              raised
              @click="_period = [new Date().getHours() * 60 + new Date().getMinutes(), new Date().getHours() * 60 + new Date().getMinutes() + 60]"
              label="現在為開始"
              size="small" />
            &nbsp;
            <Button
              class="h-1rem"
              outlined
              raised
              @click="_period = [new Date().getHours() * 60 + new Date().getMinutes() - 60, new Date().getHours() * 60 + new Date().getMinutes()]"
              label="現在為結束"
              size="small" />
          </label>
          <div class="w-full">
            <InputNumber v-model="computedStartTimeHour" inputClass="w-3rem" :min="0" :max="24" size="small" />&nbsp;:&nbsp;
            <InputNumber v-model="computedStartTimeMinute" inputClass="w-3rem" :min="0" :max="60" size="small" />
            &nbsp;~&nbsp;
            <InputNumber v-model="computedEndTimeHour" inputClass="w-3rem" :min="0" :max="24" size="small" />&nbsp;:&nbsp;
            <InputNumber v-model="computedEndTimeMinute" inputClass="w-3rem" :min="0" :max="60" size="small" />
          </div>
        </div>
        <div class="col-2 pb-0">
          <!-- <label v-if="showBlock.timeEditor == 1">新增模式</label>
          <label v-if="showBlock.timeEditor == 2">扣除模式</label>
          <br />
          <ToggleSwitch v-model="showBlock.timeEditor" :falseValue="1" :trueValue="2" :pt:slider:style="showBlock.timeEditor == 2 ? 'background: #EF4444' : 'background: #27C662'"></ToggleSwitch> -->
        </div>
        <div class="col-1 pb-0">
          <label v-if="showBlock.timeEditor == 1">加入</label>
          <!-- <label v-if="showBlock.timeEditor == 2">扣除</label> -->
          <br />
          <Button icon="pi pi-save" :severity="!_data.taskHeader?.trim() ? 'secondary' : 'warn'" outlined raised @click="saveTime" :disabled="!_data.taskHeader?.trim()" />
        </div>
        <div class="col-12 p-0">
          <Slider
            class="col-12"
            v-model="_period"
            range
            :step="1"
            :max="1440"
            pt:startHandler:style="margin-left: -10px; margin-top: -20px; z-index: 10; border-radius: 0; background: transparent; width: 0; height: 0; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-left: 10px solid gray;"
            pt:endHandler:style="margin-left: 0px; margin-top: -20px; z-index: 10; z-index: 10; border-radius: 0; background: transparent; width: 0; height: 0; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-right: 10px solid gray;"
            pt:range:style="height: 10px; margin-top: 10px; background: repeating-linear-gradient(45deg, rgba(249, 115, 22, 1),  rgba(249, 115, 22, 0.5) 4px, transparent 4px, transparent 7px);"
            style="background: rgba(0, 0, 0, 0)" />
          <br />
          <Timeline
            class="col-12 p-0"
            :date="_time.date"
            :workTime="selectedDateTimeline?.periods"
            :restTime="[[710, 800]]"
            :showScale="true"
            style="margin-top: -30px"
            @periodEditorData="(data) => periodEditorLoadPeriod(data)" />
        </div>
      </div>
    </Panel>
    <!-- Tasks List and Data -->
    <ConfirmDialog group="deleteTask"></ConfirmDialog>
    <div class="target">
      <div class="grid">
        <div class="col">
          <DataTable :value="_tasks" @rowReorder="onRowReorder($event)" dataKey="id">
            <Column rowReorder class="pr-0" style="width: 36px" />
            <Column v-if="showBlock.debugBlock" header="編號" class="w-1 white-space-nowrap">
              <template #body="slotProps">
                {{ slotProps.data.id }}
              </template>
            </Column>
            <Column field="taskHeader" header="標題" class="w-10">
              <template #body="slotProps">
                <Button @click="[taskListSelect(slotProps.data), saveCache()]" :severity="taskListSelectedColor(slotProps.data.id)">
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
        <div v-if="_tasks.filter((t) => t.id == _data.id).length" class="col-4">
          任務:
          <Tag severity="warn">
            <h3 class="font-bold">{{ _data.taskHeader }}</h3>
          </Tag>
          <br />
          <span v-if="!sortedTimelines.length">目前沒有時數紀錄</span>
          <div class="grouped-timeline">
            <div v-for="week in groupedTimelines" :key="week.weekKey" class="mt-2">
              <Tag :value="week.formattedWeek"></Tag>
              <div>
                <Timeline
                  v-for="day in week.days"
                  :date="day.date"
                  :workTime="day.periods"
                  :restTime="[[710, 800]]"
                  :showDateAndSum="true"
                  :deleteMode="showBlock.deleteMode"
                  @click="[(_time.date = day.date), (showBlock.timeEditor = 1)]"
                  @deleteDate="deleteDate(day.date)"
                  @periodEditorData="(data) => periodEditorLoadPeriod(data)"
                  :class="(day.date == _time.date ? 'orangeBackground' : '') + ' floatEffect cursorPointer'" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Dialog v-model:visible="periodEditorData.showPeriodEditor" modal header="更改時間軸片段" :style="{ width: '25rem' }">
      <div>日期: {{ periodEditorData.date }} <Tag class="h-1rem" severity="info" :value="new Intl.DateTimeFormat('zh-TW', { weekday: 'short' }).format(new Date(periodEditorData.date))"></Tag></div>
      <div class="w-full">
        <InputNumber v-model="periodEditorComputedStartTimeHour" inputClass="w-3rem" :min="0" :max="24" size="small" />&nbsp;:&nbsp;
        <InputNumber v-model="periodEditorComputedStartTimeMinute" inputClass="w-3rem" :min="0" :max="60" size="small" />
        &nbsp;~&nbsp;
        <InputNumber v-model="periodEditorComputedEndTimeHour" inputClass="w-3rem" :min="0" :max="24" size="small" />&nbsp;:&nbsp;
        <InputNumber v-model="periodEditorComputedEndTimeMinute" inputClass="w-3rem" :min="0" :max="60" size="small" />
      </div>
      <div class="grid mt-4">
        <Button class="col-2" type="button" label="刪除" severity="danger" @click="[(periodEditorData.showPeriodEditor = false), periodEditorDeletePeriod()]"></Button>
        <span class="col-6"></span>
        <Button class="col-2" type="button" label="取消" severity="secondary" @click="periodEditorData.showPeriodEditor = false"></Button>
        <Button class="col-2" type="button" label="修改" @click="[(periodEditorData.showPeriodEditor = false), periodEditorSavePeriod()]"></Button>
      </div>
    </Dialog>
  </div>
</template>
<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Slider from 'primevue/slider';
import InputNumber from 'primevue/inputnumber';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import FileUpload from 'primevue/fileupload';
import Panel from 'primevue/panel';
import ConfirmDialog from 'primevue/confirmdialog';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import { useConfirm } from 'primevue/useconfirm';

import InputTextDate from '@/components/InputTextDate.vue';
import Timeline from '@/components/Timeline.vue';

import { convertDateToString } from '../service/commonService';

onMounted(() => {
  loadCache();
  loadTasks();
  window.addEventListener('keydown', handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown);
});

const confirm = useConfirm();

const _tasks = ref([]);
const _data = ref({
  id: 0,
  taskHeader: '',
  taskUrl: '',
  taskBranch: '',
  times: []
});
const _time = ref({ date: convertDateToString(new Date(), 'yyyyMMdd', { separator: '/' }), periods: [] });
const _period = ref([new Date().getHours() * 60 + new Date().getMinutes() - 60, new Date().getHours() * 60 + new Date().getMinutes()]);
const showBlock = ref({
  taskEditor: 0,
  timeEditor: false,
  debugBlock: false,
  deleteMode: false
});
const periodEditorData = ref({
  showPeriodEditor: false,
  date: '',
  periodIndex: '',
  period: [0, 0]
});

const showStorageData = () => {
  chrome.runtime.sendMessage({ action: 'getStorage', key: 'cache' }, (response) => {
    console.log('cache', response.message);
  });
  chrome.runtime.sendMessage({ action: 'getStorage', key: 'tasks' }, (response) => {
    console.log('tasks', response.message);
  });
};
const loadCache = async () => {
  chrome.runtime.sendMessage({ action: 'getStorage', key: 'cache' }, (response) => {
    if (response.message) {
      _data.value = response.message;
    } else {
      _data.value = {
        id: 0,
        taskHeader: '',
        taskUrl: '',
        taskBranch: '',
        times: []
      };
    }
  });
  chrome.runtime.sendMessage({ action: 'getStorage', key: 'UIcache' }, (response) => {
    if (response.message) {
      showBlock.value = response.message;
      showBlock.value.deleteMode = false;
    } else {
      showBlock.value = {
        taskEditor: false,
        timeEditor: false,
        debugBlock: false,
        deleteMode: false
      };
    }
  });
};
const saveCache = () => {
  chrome.runtime.sendMessage({ action: 'setStorage', obj: { cache: _data.value } }, (response) => {
    console.log(response.message);
  });
  chrome.runtime.sendMessage({ action: 'setStorage', obj: { UIcache: showBlock.value } }, (response) => {
    console.log(response.message);
  });
};
const loadTasks = async () => {
  chrome.runtime.sendMessage({ action: 'getStorage', key: 'tasks' }, (response) => {
    if (response.message) {
      _tasks.value = response.message;
    } else {
      _tasks.value = [];
    }
  });
};
const saveTasks = () => {
  chrome.runtime.sendMessage({ action: 'setStorage', obj: { tasks: _tasks.value } }, (response) => {
    console.log(response.message);
  });
};
const deleteAllData = async () => {
  chrome.runtime.sendMessage({ action: 'deleteStorage' }, async (response) => {
    console.log(response.message);
    await loadTasks();
    await loadCache();
  });
};
const openInNewTab = (url) => {
  window.open(url, '_blank');
};

const newTaskRestoreTempID = ref(-1);
const toggleTaskBlock = () => {
  // off
  if (showBlock.value.taskEditor) {
    showBlock.value.taskEditor = 0;
  }
  // on
  else if (!showBlock.value.taskEditor) {
    showBlock.value.taskEditor = _tasks.value.filter((t) => t.id == _data.value.id).length ? 1 : 2;
  }
};
const toggleNewTask = () => {
  // off
  if (showBlock.value.taskEditor == 2) {
    if (_tasks.value.filter((t) => t.id == newTaskRestoreTempID.value).length) {
      _data.value = { ..._tasks.value.filter((t) => t.id == newTaskRestoreTempID.value)[0] };
      showBlock.value.taskEditor = 1;
    } else {
      showBlock.value.taskEditor = 0;
    }

    return;
  }
  // on
  else if (!showBlock.value.taskEditor || showBlock.value.taskEditor == 1) {
    showBlock.value.taskEditor = 2;
    newTaskRestoreTempID.value = _data.value.id;
  }

  if (!_tasks.value.filter((t) => t.id == _data.value.id).length) {
    return;
  }

  let maxId = 0;

  if (_tasks.value.length === 0) {
    maxId = 0;
  } else {
    maxId = Math.max(..._tasks.value.map((item) => item.id));
  }

  _data.value = {
    id: maxId + 1,
    taskHeader: '',
    taskUrl: '',
    taskBranch: '',
    times: []
  };
};
const taskBlockColor = () => {
  if (showBlock.value.taskEditor == 1) {
    return 'border-color: #F97316; border-width: 2px;';
  } else if (showBlock.value.taskEditor == 2) {
    return 'border-color: #22C55E; border-width: 2px;';
  }
};
const timeBlockColor = () => {
  if (_tasks.value.filter((t) => t.id == _data.value.id).length) {
    return 'border-color: #F97316; border-width: 2px;';
  } else {
    return 'border-color: #22C55E; border-width: 2px;';
  }
};

const taskListSelect = (data) => {
  _data.value = data;
  newTaskRestoreTempID.value = data.id;
  if (showBlock.value.taskEditor == 2) {
    showBlock.value.taskEditor = 1;
  }
};
function taskListSelectedColor(rowid) {
  return _data.value.id == rowid ? 'warn' : 'primary';
}

const saveTaskInfo = () => {
  const index = _tasks.value.findIndex((t) => t.id == _data.value.id);

  if (index !== -1) {
    _tasks.value[index] = { ..._data.value };
  } else {
    _tasks.value.push({ ..._data.value });
  }

  if (showBlock.value.taskEditor == 2) {
    showBlock.value.taskEditor = 1;
    newTaskRestoreTempID.value = -1;
  }

  saveTasks();
};

const saveTime = () => {
  const taskIndex = _tasks.value.findIndex((t) => t.id == _data.value.id);
  const timeIndex = _tasks.value[taskIndex]?.times.findIndex((t) => t.date == _time.value.date) ?? -1;

  if (timeIndex == -1) {
    _time.value.periods = removeLaunchPeriod([..._period.value]);

    _data.value.times.push({ ..._time.value });

    if (taskIndex == -1) {
      _tasks.value.push({ ..._data.value });
    } else {
      _tasks.value[taskIndex].times = _data.value.times;
    }
  } else {
    const mergedPeriod = processWorkPeriods([..._tasks.value[taskIndex].times[timeIndex].periods, [..._period.value]]);
    _tasks.value[taskIndex].times[timeIndex].periods = mergedPeriod;
  }

  saveTasks();
  saveCache();
};

function processWorkPeriods(workPeriods) {
  const lunchBreakStart = 710;
  const lunchBreakEnd = 800;

  // Step 1: Sort periods by starting time
  workPeriods.sort((a, b) => a[0] - b[0]);

  const mergedPeriods = [];
  let currentPeriod = workPeriods[0];

  for (let i = 1; i < workPeriods.length; i++) {
    const [currentStart, currentEnd] = currentPeriod;
    const [nextStart, nextEnd] = workPeriods[i];

    // Step 2: Merge overlapping periods
    if (currentEnd >= nextStart) {
      currentPeriod = [currentStart, Math.max(currentEnd, nextEnd)];
    } else {
      mergedPeriods.push(currentPeriod);
      currentPeriod = workPeriods[i];
    }
  }
  mergedPeriods.push(currentPeriod);

  // Step 3: Remove lunch break time (710 to 800)
  const result = [];
  mergedPeriods.forEach(([start, end]) => {
    if (start < lunchBreakStart && end > lunchBreakEnd) {
      result.push([start, lunchBreakStart], [lunchBreakEnd, end]);
    } else if (end > lunchBreakStart && start < lunchBreakEnd) {
      if (start < lunchBreakStart) result.push([start, lunchBreakStart]);
      if (end > lunchBreakEnd) result.push([lunchBreakEnd, end]);
    } else {
      result.push([start, end]);
    }
  });

  return result;
}

const removeLaunchPeriod = ([start, end]) => {
  const lunchBreakStart = 710;
  const lunchBreakEnd = 800;
  const result = [];

  if (start < lunchBreakStart && end > lunchBreakEnd) {
    result.push([start, lunchBreakStart], [lunchBreakEnd, end]);
  } else if (end > lunchBreakStart && start < lunchBreakEnd) {
    if (start < lunchBreakStart) result.push([start, lunchBreakStart]);
    if (end > lunchBreakEnd) result.push([lunchBreakEnd, end]);
  } else {
    result.push([start, end]);
  }

  return result;
};

const onRowReorder = (event) => {
  const reorderedTasks = event.value;
  _tasks.value = reorderedTasks;

  saveTaskInfo();
};

const calEffort = (workData) => {
  let totalMinutes = workData.reduce((totalMinutes, day) => {
    const dayMinutes = day.periods.reduce((dayTotal, period) => {
      const [start, end] = period;
      return dayTotal + (end - start);
    }, 0);
    return totalMinutes + dayMinutes;
  }, 0);

  const personDays = Math.ceil(totalMinutes / 60) * 0.125;

  return personDays;
};

// 時間軸編輯器
const computedStartTimeHour = computed({
  get() {
    return hourGetter(_period.value, 0);
  },
  set(value) {
    hourSetter(_period.value, 0, value);
    periodSwitcher(_period.value);
    periodLimiter(_period.value);
  }
});
const computedStartTimeMinute = computed({
  get() {
    return minuteGetter(_period.value, 0);
  },
  set(value) {
    minuteSetter(_period.value, 0, value);
    periodSwitcher(_period.value);
    periodLimiter(_period.value);
  }
});
const computedEndTimeHour = computed({
  get() {
    return hourGetter(_period.value, 1);
  },
  set(value) {
    hourSetter(_period.value, 1, value);
    periodSwitcher(_period.value);
    periodLimiter(_period.value);
  }
});
const computedEndTimeMinute = computed({
  get() {
    return minuteGetter(_period.value, 1);
  },
  set(value) {
    minuteSetter(_period.value, 1, value);
    periodSwitcher(_period.value);
    periodLimiter(_period.value);
  }
});

watch(
  () => _period.value,
  (period) => {
    periodSwitcher(period);
  }
);

// 時間軸片段修改視窗
const periodEditorComputedStartTimeHour = computed({
  get() {
    return hourGetter(periodEditorData.value.period, 0);
  },
  set(value) {
    hourSetter(periodEditorData.value.period, 0, value);
    periodSwitcher(periodEditorData.value.period);
    periodLimiter(periodEditorData.value.period);
  }
});
const periodEditorComputedStartTimeMinute = computed({
  get() {
    return minuteGetter(periodEditorData.value.period, 0);
  },
  set(value) {
    minuteSetter(periodEditorData.value.period, 0, value);
    periodSwitcher(periodEditorData.value.period);
    periodLimiter(periodEditorData.value.period);
  }
});
const periodEditorComputedEndTimeHour = computed({
  get() {
    return hourGetter(periodEditorData.value.period, 1);
  },
  set(value) {
    hourSetter(periodEditorData.value.period, 1, value);
    periodSwitcher(periodEditorData.value.period);
    periodLimiter(periodEditorData.value.period);
  }
});
const periodEditorComputedEndTimeMinute = computed({
  get() {
    return minuteGetter(periodEditorData.value.period, 1);
  },
  set(value) {
    minuteSetter(periodEditorData.value.period, 1, value);
    periodSwitcher(periodEditorData.value.period);
    periodLimiter(periodEditorData.value.period);
  }
});

const periodEditorLoadPeriod = (emitData) => {
  periodEditorData.value.showPeriodEditor = emitData.showPeriodEditor;
  periodEditorData.value.date = emitData.date;
  periodEditorData.value.periodIndex = emitData.periodIndex;

  periodEditorData.value.period = [..._data.value.times.filter((t) => t.date == periodEditorData.value.date)[0].periods[periodEditorData.value.periodIndex]];
};
const periodEditorSavePeriod = () => {
  _data.value.times.filter((t) => t.date == periodEditorData.value.date)[0].periods[periodEditorData.value.periodIndex] = periodEditorData.value.period;
  _data.value.times.filter((t) => t.date == periodEditorData.value.date)[0].periods = processWorkPeriods(_data.value.times.filter((t) => t.date == periodEditorData.value.date)[0].periods);

  const taskIndex = _tasks.value.findIndex((t) => t.id === _data.value.id);
  _tasks.value[taskIndex] = { ..._data.value };

  saveTasks();
  saveCache();
};
const periodEditorDeletePeriod = () => {
  const timeIndex = _data.value.times.findIndex((t) => t.date == periodEditorData.value.date);
  _data.value.times[timeIndex].periods.splice(periodEditorData.value.periodIndex, 1);

  const taskIndex = _tasks.value.findIndex((t) => t.id === _data.value.id);
  _tasks.value[taskIndex] = { ..._data.value };

  saveTasks();
  saveCache();
};

const hourGetter = (periodArray, index) => {
  return Math.floor(periodArray[index] / 60);
};
const hourSetter = (periodArray, index, value) => {
  periodArray[index] = +value * 60 + (periodArray[index] % 60);
};
const minuteGetter = (periodArray, index) => {
  return periodArray[index] % 60;
};
const minuteSetter = (periodArray, index, value) => {
  periodArray[index] = Math.floor(periodArray[index] / 60) * 60 + +value;
};
const periodSwitcher = (periodArray) => {
  if (periodArray[1] < periodArray[0]) {
    [periodArray[0], periodArray[1]] = [periodArray[1], periodArray[0]];
  }
};
const periodLimiter = (periodArray) => {
  if (periodArray[0] < 0) {
    periodArray[0] = 0;
  }
  if (periodArray[1] > 1440) {
    periodArray[1] = 1440;
  }
};

const selectedDateTimeline = computed(() => {
  return _data.value.times.filter((t) => t.date == _time.value.date)[0];
});

const sortedTimelines = computed(() => _data.value.times.sort((b, a) => (a.date > b.date ? 1 : b.date > a.date ? -1 : 0)));

// 週月分群
const getWeekDates = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  const week = [];
  for (let i = 0; i < 7; i++) {
    week.push(new Date(monday.getFullYear(), monday.getMonth(), monday.getDate() + i));
  }
  return week;
};
const getMonthWeek = (date, month) => {
  const d = new Date(date);
  const firstDayOfMonth = new Date(d.getFullYear(), month, 1);
  const firstDayOfWeek = new Date(firstDayOfMonth);
  firstDayOfWeek.setDate(firstDayOfMonth.getDate() - firstDayOfMonth.getDay() + 1);

  if (firstDayOfWeek > d) {
    firstDayOfWeek.setDate(firstDayOfWeek.getDate() - 7);
  }

  const daysDifference = Math.floor((d - firstDayOfWeek) / (24 * 60 * 60 * 1000));
  return Math.floor(daysDifference / 7) + 1;
};
const determineWeekMonth = (dates) => {
  const counts = dates.reduce((acc, date) => {
    const month = date.getMonth();
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {});

  const [month, count] = Object.entries(counts).reduce((max, entry) => (entry[1] > max[1] ? entry : max));

  return Number(month);
};
const formatMonthWeek = (dates) => {
  const monthNames = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];
  const weekDates = getWeekDates(dates[0]);
  const weekMonth = determineWeekMonth(weekDates);
  const year = weekDates[0].getFullYear();
  const weekNumber = getMonthWeek(weekDates[0], weekMonth);
  const month = monthNames[weekMonth];
  const displayYear = weekMonth === 11 && weekDates[0].getMonth() === 0 ? year - 1 : year;
  return `${displayYear}年 ${month} 第${weekNumber}週`;
};
const groupedTimelines = computed(() => {
  const grouped = {};
  sortedTimelines.value.forEach((timeline) => {
    const date = new Date(timeline.date);
    const weekDates = getWeekDates(date);
    const key = weekDates[0].toISOString().split('T')[0];

    if (!grouped[key]) {
      grouped[key] = [];
    }
    grouped[key].push(timeline);
  });
  return Object.entries(grouped).map(([key, value]) => ({
    weekKey: key,
    formattedWeek: formatMonthWeek(value.map((v) => new Date(v.date))),
    days: value
  }));
});

// 下載
const downloadOnClick = () => {
  let dlAnchorElem = document.getElementById('downloadAnchorElem');

  var dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(_tasks.value));
  dlAnchorElem.setAttribute('href', dataStr);
  dlAnchorElem.setAttribute('download', `taskdata-${new Date().toLocaleDateString().replaceAll('/', '-')}.json`);
  dlAnchorElem.click();
};

// 上傳
async function fileOnChange(event) {
  const file = event.files[0];

  if (file && file.type === 'application/json') {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const jsonData = JSON.parse(e.target.result);

        if (!validateTaskData(jsonData)) {
          return;
        }

        _tasks.value = jsonData;
        saveTasks();
      } catch (error) {
        console.error('無法解析 JSON 文件:', error);
      }
    };

    reader.onerror = (e) => {
      console.error('文件讀取錯誤:', e);
    };

    reader.readAsText(file);
  } else {
    console.error('請上傳 JSON 文件');
  }
}
// 上傳驗證格式
function validateTaskData(tasks) {
  if (!Array.isArray(tasks)) {
    console.error('tasks 必須是 array');
    return false;
  }

  for (const task of tasks) {
    if (typeof task.id !== 'number') {
      console.error('id 必須是 number');
      return false;
    }

    if (typeof task.taskHeader !== 'string') {
      console.error('taskHeader 必須是 string');
      return false;
    }

    if (typeof task.taskUrl !== 'string') {
      console.error('taskUrl 必須是 string');
      return false;
    }

    if (typeof task.taskBranch !== 'string') {
      console.error('taskBranch 必須是 string');
      return false;
    }

    if (!Array.isArray(task.times)) {
      console.error('times 必須是 array');
      return false;
    }

    for (const time of task.times) {
      if (typeof time.date !== 'string') {
        console.error('date 必須是 string');
        return false;
      }

      if (!Array.isArray(time.periods)) {
        console.error('periods 必須是 array');
        return false;
      }

      for (const period of time.periods) {
        if (!Array.isArray(period) || period.length !== 2 || typeof period[0] !== 'number' || typeof period[1] !== 'number') {
          console.error('每個 period 必須是 [number, number]');
          return false;
        }
      }
    }
  }

  return true;
}

// 刪除
function deleteTask(rowid) {
  const taskIndex = _tasks.value.findIndex((t) => t.id === rowid);

  if (taskIndex === -1) return;

  confirm.require({
    group: 'deleteTask',
    header: '確認刪除任務?',
    message: `#${rowid}: ${_tasks.value[taskIndex].taskHeader}`,
    icon: 'pi pi-info-circle',
    rejectProps: {
      label: '取消',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: '刪除',
      severity: 'danger'
    },
    accept: () => {
      _tasks.value.splice(taskIndex, 1);

      if (_data.value.id == rowid) {
        _data.value = {
          taskHeader: '',
          taskUrl: '',
          taskBranch: '',
          times: []
        };

        if (_tasks.value.length) {
          _data.value.id = Math.max(..._tasks.value.map((item) => item.id)) + 1;
        } else {
          _data.value.id = 0;
          showBlock.value.taskEditor = 2;
        }

        saveCache();
      }
      saveTasks();
    },
    reject: () => {}
  });
}
function deleteDate(rowdate) {
  const taskIndex = _tasks.value.findIndex((t) => t.id === _data.value.id);

  if (taskIndex === -1) return;

  if (rowdate) {
    const timesIndex = _tasks.value[taskIndex].times.findIndex((t) => t.date === rowdate);
    if (timesIndex !== -1) {
      _tasks.value[taskIndex].times.splice(timesIndex, 1);
    }

    const dataTimeIndex = _data.value.times.findIndex((t) => t.date === rowdate);
    if (dataTimeIndex !== -1) {
      _data.value.times.splice(dataTimeIndex, 1);
    }

    saveTasks();
    saveCache();
  }
}

const handleKeydown = (event) => {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault();
    downloadOnClick();
  }
};
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

.cursorPointer {
  cursor: pointer;
}

.floatEffect {
  padding: 2px;
  background-color: #f0f0f0;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
  cursor: pointer;
}

.floatEffect:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.2);
}

.orangeBackground {
  background-color: #f99c165c;
}
</style>
