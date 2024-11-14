<template>
  <div class="sidenav p-0 flex justify-content-center flex-wrap">
    <div class="w-2rem flex justify-content-center align-content-start flex-wrap">
      <Button
        v-tooltip="'在瀏覽器新分頁開啟'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-tag"
        severity="secondary"
        outlined
        @click="
          _optionsData.hasExecutedOpenMode = true;
          saveOptions();
          openInNewTab('/index.html');
        " />
      <Button
        v-tooltip="'在瀏覽器新視窗開啟'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-window-maximize"
        severity="secondary"
        outlined
        @click="
          _optionsData.hasExecutedOpenMode = true;
          saveOptions();
          openInNewWindow('/index.html');
        " />
      <Button
        v-tooltip="'在側邊欄開啟'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-bars"
        severity="secondary"
        outlined
        @click="openInSidePanel('/index.html')"
        :style="isSidePanel ? 'background-color: lightgray;' : ''" />
      <div class="h-1rem w-2rem"></div>
      <Button
        v-tooltip="'任務清單'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-book"
        severity="info"
        :outlined="!showTaskListDrawer"
        @click="[(showTaskListDrawer = !showTaskListDrawer), saveCache()]" />
      <Button
        v-tooltip="'固定顯示任務清單'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-thumbtack"
        severity="info"
        :outlined="!_showBlock.taskListBlockPin"
        @click="[(_showBlock.taskListBlockPin = !_showBlock.taskListBlockPin), saveCache()]" />
      <div class="h-1rem w-2rem"></div>
      <Button
        v-tooltip="'任務內容編輯器'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-pen-to-square"
        severity="info"
        :outlined="!_showBlock.taskEditor"
        @click="[toggleTaskBlock(), saveCache()]" />
      <Button
        v-tooltip="'新增任務'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-plus"
        severity="success"
        :outlined="_showBlock.taskEditor != 2"
        @click="[toggleNewTask(), saveCache()]" />
      <div class="h-1rem w-2rem"></div>
      <Button
        v-tooltip="'時間軸編輯器'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-clock"
        severity="info"
        :outlined="!_showBlock.timeEditor"
        @click="[(_showBlock.timeEditor = !_showBlock.timeEditor), saveCache()]" />
      <div class="h-1rem w-2rem"></div>
      <Button
        v-tooltip="'顯示刪除按鈕'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-unlock"
        severity="danger"
        :outlined="!_showBlock.deleteMode"
        @click="[(_showBlock.deleteMode = !_showBlock.deleteMode), saveCache()]" />
      <div class="h-1rem w-2rem"></div>
      <Button
        v-tooltip="'選項'"
        class="h-2rem w-2rem flex align-items-center justify-content-center"
        icon="pi pi-cog"
        severity="secondary"
        :outlined="true"
        :style="showOptions ? 'background-color: lightgray;' : ''"
        @click="showOptions = !showOptions" />
    </div>
    <!-- debugblock -->
    <div v-if="_showBlock.debugBlock" class="w-2rem flex justify-content-center align-content-end flex-wrap">
      <Button v-tooltip="'DEBUG, all tasks and cache'" class="h-2rem w-2rem flex align-items-center justify-content-center" label="A" outlined @click="showStorageData()" />
      <Button v-tooltip="'DEBUG, current data'" class="h-2rem w-2rem flex align-items-center justify-content-center" label="D" outlined @click="console.log('data', _data)" />
      <Button v-tooltip="'DEBUG, current data all times'" class="h-2rem w-2rem flex align-items-center justify-content-center" label="T" outlined @click="console.log('time', _time)" />
      <Button v-tooltip="'DEBUG, current period'" class="h-2rem w-2rem flex align-items-center justify-content-center" label="P" outlined @click="console.log('period', _period)" />
      <Button v-tooltip="'DEBUG, current optionsData'" class="h-2rem w-2rem flex align-items-center justify-content-center" label="O" outlined @click="console.log('optionsData', _optionsData)" />
      <Button v-tooltip="'⚠️刪除所有資料'" class="h-2rem w-2rem flex align-items-center justify-content-center" icon="pi pi-trash" severity="danger" outlined @click="deleteAllData()" />
    </div>
  </div>
  <div class="main">
    <!-- Task Info -->
    <Panel v-if="_showBlock.taskEditor" :pt:root:style="taskBlockColor()" pt:header:style="padding: 0;" pt:content:style="padding: 18px;">
      <h2 v-if="_showBlock.taskEditor == 2" class="w-full">新增任務</h2>
      <div class="flex">
        <div class="flex flex-shrink-0 flex-column mr-2">
          <label v-if="_showBlock.taskEditor == 2" class="white-space-nowrap">新增</label>
          <label v-if="_showBlock.taskEditor == 1" class="white-space-nowrap">儲存</label>
          <Button icon="pi pi-save" :severity="!_data.taskHeader?.trim() ? 'secondary' : 'warn'" outlined raised @click="saveTaskInfo()" :disabled="!_data.taskHeader?.trim()" />
        </div>
        <div v-if="_showBlock.debugBlock" class="flex flex-shrink-0 flex-column mr-2">
          <label for="taskId" class="white-space-nowrap">編號</label>
          <InputNumber id="taskId" v-model="_data.id" inputClass="w-4rem" :min="0" :disabled="true" />
        </div>
        <div class="flex flex-grow-1 flex-shrink-1 flex-column">
          <label for="taskHeader" class="white-space-nowrap">標題<label v-if="checkUnsaved" style="color: gray"> (未儲存)</label></label>
          <InputText id="taskHeader" class="w-full" type="text" v-model="_data.taskHeader" @change="saveCache()" />
        </div>
      </div>
      <div class="grid">
        <div class="col-6">
          <label for="taskUrl" class="white-space-nowrap">
            連結 <Button class="h-1rem w-1rem" icon="pi pi-link" severity="secondary" @click="if (_data.taskUrl?.trim()) openInNewTab(_data.taskUrl);" text size="small" />
          </label>
          <InputText id="taskUrl" class="w-full" type="text" v-model="_data.taskUrl" @change="saveCache()" />
        </div>
        <div class="col-6">
          <label for="taskBranch" class="white-space-nowrap">分支</label>
          <InputText id="taskBranch" class="w-full" type="text" v-model="_data.taskBranch" @change="saveCache()" />
        </div>
      </div>
    </Panel>
    <!-- Time Editor -->
    <Panel v-if="_showBlock.timeEditor" class="" :pt:root:style="timeBlockColor() + 'margin-top: -2px;'" pt:header:style="padding: 0;" pt:content:style="padding: 18px;">
      <div class="flex flex-wrap">
        <div class="flex flex-column flex-shrink-0 mr-2">
          <label v-if="_showBlock.timeEditor == 1">加入</label>
          <Button icon="pi pi-save" :severity="!_data.taskHeader?.trim() ? 'secondary' : 'warn'" outlined raised @click="saveTime" :disabled="!_data.taskHeader?.trim()" />
        </div>
        <div class="flex flex-column flex-shrink-0 mr-2">
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
          <InputTextDate class="w-9rem" v-model="_time.date" title="資料日期" format="yyyyMMdd" separator="/" @change="saveCache()"></InputTextDate>
        </div>

        <div class="flex flex-column">
          <div class="flex flex-row mt-2 justify-content-center">
            <Button
              class="h-1rem mr-2"
              outlined
              raised
              @click="_period = [new Date().getHours() * 60 + new Date().getMinutes() - 60, new Date().getHours() * 60 + new Date().getMinutes()]"
              icon="pi pi-sign-in"
              v-tooltip.top="'設定現在為結束點'"
              size="small" />
            <Button
              class="h-1rem"
              outlined
              raised
              @click="_period = [new Date().getHours() * 60 + new Date().getMinutes(), new Date().getHours() * 60 + new Date().getMinutes() + 60]"
              icon="pi pi-sign-out"
              v-tooltip.top="'設定現在為起始點'"
              size="small" />
          </div>
          <div class="flex flex-row mt-2">
            <PeriodInput
              v-model="_period"
              :min="_optionsData.restTime && _optionsData.restTime.enableWorkOn && _optionsData.restTime.hideNotWorking ? _optionsData.restTime.workOn : 0"
              :max="_optionsData.restTime && _optionsData.restTime.enableWorkOff && _optionsData.restTime.hideNotWorking ? _optionsData.restTime.workOff : 1440" />
          </div>
        </div>
      </div>

      <div class="pl-3 pr-3" style="margin-top: 30px">
        <Slider
          class=""
          v-model="_period"
          range
          :step="1"
          :min="_optionsData.restTime && _optionsData.restTime.enableWorkOn && _optionsData.restTime.hideNotWorking ? _optionsData.restTime.workOn : 0"
          :max="_optionsData.restTime && _optionsData.restTime.enableWorkOff && _optionsData.restTime.hideNotWorking ? _optionsData.restTime.workOff : 1440"
          pt:startHandler:style="margin-left: -10px; margin-top: -23px; z-index: 10; border-radius: 0; background: transparent; width: 0; height: 0; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-left: 10px solid gray;"
          pt:endHandler:style="margin-left: 0px; margin-top: -23px; z-index: 10; z-index: 10; border-radius: 0; background: transparent; width: 0; height: 0; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-right: 10px solid gray;"
          pt:range:style="height: 10px; margin-top: -3px; background: repeating-linear-gradient(45deg, rgba(249, 115, 22, 1),  rgba(249, 115, 22, 0.5) 4px, transparent 4px, transparent 7px);"
          style="background: rgba(0, 0, 0, 0)" />
        <br />
        <Timeline
          class="p-0"
          :date="_time.date"
          :workTime="selectedDateTimeline?.periods"
          :restTime="getRestPeriods()"
          :displayStartTime="_optionsData.restTime && _optionsData.restTime.enableWorkOn && _optionsData.restTime.hideNotWorking ? _optionsData.restTime.workOn : 0"
          :displayEndTime="_optionsData.restTime && _optionsData.restTime.enableWorkOff && _optionsData.restTime.hideNotWorking ? _optionsData.restTime.workOff : 1440"
          :showScale="true"
          style="margin-top: -30px"
          @periodEditorData="(data) => periodEditorLoadPeriod(data)" />
      </div>
    </Panel>
    <!-- Tasks List and Data -->
    <ConfirmDialog group="deleteTask"></ConfirmDialog>
    <div class="scrollTarget">
      <div class="custom-grid">
        <div v-if="_showBlock.taskListBlockPin" class="custom-col-8">
          <DataTable :value="_tasks" @rowReorder="onRowReorder($event)" dataKey="id">
            <Column rowReorder class="pr-0" style="width: 36px; max-width: 36px" />
            <Column v-if="_showBlock.debugBlock" header="#" class="w-1 white-space-nowrap">
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
            <Column v-if="_showBlock.deleteMode" field="delete" header="刪除">
              <template #body="slotProps">
                <Button icon="pi pi-trash" severity="danger" size="small" raised @click="deleteTask(slotProps.data.id)" />
              </template>
            </Column>
          </DataTable>
        </div>
        <div v-if="_tasks.filter((t) => t.id == _data.id).length" :class="_showBlock.taskListBlockPin ? 'custom-col-4' : 'col-12'" style="min-width: 180px">
          <Tag severity="warn">
            <h3 class="font-bold" style="max-width: 178px">{{ _data.taskHeader }}</h3>
          </Tag>
          <br />
          <span v-if="!sortedTimelines.length">此任務沒有時數紀錄</span>
          <div class="grouped-timeline">
            <div v-for="week in groupedTimelines" :key="week.weekKey" class="mt-2">
              <Tag :value="week.formattedWeek"></Tag>
              <div>
                <Timeline
                  v-for="day in week.days"
                  :date="day.date"
                  :workTime="day.periods"
                  :restTime="getRestPeriods()"
                  :displayStartTime="_optionsData.restTime && _optionsData.restTime.enableWorkOn && _optionsData.restTime.hideNotWorking ? _optionsData.restTime.workOn : 0"
                  :displayEndTime="_optionsData.restTime && _optionsData.restTime.enableWorkOff && _optionsData.restTime.hideNotWorking ? _optionsData.restTime.workOff : 1440"
                  :showDateAndSum="true"
                  :deleteMode="_showBlock.deleteMode"
                  @click="[(_time.date = day.date), (_showBlock.timeEditor = 1)]"
                  @deleteDate="deleteDate(day.date)"
                  @periodEditorData="(data) => periodEditorLoadPeriod(data)"
                  :class="(day.date == _time.date ? 'orangeBackground' : '') + ' floatEffect cursorPointer'" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Drawer v-model:visible="showTaskListDrawer" position="right" header="任務清單">
      <DataTable :value="_tasks" @rowReorder="onRowReorder($event)" dataKey="id">
        <Column rowReorder class="pr-0" style="width: 36px; max-width: 36px" />
        <Column v-if="_showBlock.debugBlock" header="#" class="w-1 white-space-nowrap">
          <template #body="slotProps">
            {{ slotProps.data.id }}
          </template>
        </Column>
        <Column field="taskHeader" header="標題" class="w-10">
          <template #body="slotProps">
            <Button @click="[taskListSelect(slotProps.data), saveCache(), (showTaskListDrawer = false)]" :severity="taskListSelectedColor(slotProps.data.id)">
              {{ slotProps.data.taskHeader }}
            </Button>
          </template>
        </Column>
        <Column field="effort" header="effort" class="w-2">
          <template #body="slotProps">
            {{ calEffort(slotProps.data.times) }}
          </template>
        </Column>
        <Column v-if="_showBlock.deleteMode" field="delete" header="刪除">
          <template #body="slotProps">
            <Button icon="pi pi-trash" severity="danger" size="small" raised @click="deleteTask(slotProps.data.id)" />
          </template>
        </Column>
      </DataTable>
    </Drawer>
    <!-- period editor -->
    <Dialog v-model:visible="periodEditorData.showPeriodEditor" modal header="更改時間軸片段" :style="{ width: '25rem' }">
      <div>日期: {{ periodEditorData.date }} <Tag class="h-1rem" severity="info" :value="new Intl.DateTimeFormat('zh-TW', { weekday: 'short' }).format(new Date(periodEditorData.date))"></Tag></div>
      <div class="w-full">
        <PeriodInput v-model="periodEditorData.period" />
      </div>
      <div class="grid mt-4">
        <Button class="col-2" type="button" label="刪除" severity="danger" @click="[(periodEditorData.showPeriodEditor = false), periodEditorDeletePeriod()]"></Button>
        <span class="col-6"></span>
        <Button class="col-2" type="button" label="取消" severity="secondary" @click="periodEditorData.showPeriodEditor = false"></Button>
        <Button class="col-2" type="button" label="修改" @click="[(periodEditorData.showPeriodEditor = false), periodEditorSavePeriod()]"></Button>
      </div>
    </Dialog>
    <!-- options -->
    <Dialog v-model:visible="showOptions" header="選項" :style="{ width: '25rem' }" :modal="true" :draggable="false">
      <h3 class="font-bold">
        開啟方式 <span v-tooltip.top="'按下擴充功能icon時的預設動作'" class="pi pi-info-circle text-sm align-self-center" style="color: lightblue"></span
        ><span class="text-sm" style="color: red">{{ defaultOpenModeMessage }}</span>
      </h3>
      <div class="flex flex-wrap gap-4">
        <div class="flex items-center gap-2">
          <RadioButton
            v-model="_optionsData.defaultOpenMode"
            inputId="defaultOpenMode.popup"
            name="defaultOpenMode"
            value="popup"
            @change="[saveOptions(), (defaultOpenModeMessage = '將改變下次開啟方式')]" />
          <label for="defaultOpenMode.popup">懸浮小窗</label>
        </div>
        <!-- 側邊欄無法由code打開 -->
        <!-- <div class="flex items-center gap-2">
          <RadioButton
            v-model="_optionsData.defaultOpenMode"
            inputId="defaultOpenMode.sidePanel"
            name="defaultOpenMode"
            value="sidePanel"
            @change="[saveOptions(), (defaultOpenModeMessage = '將改變下次開啟方式')]" />
          <label for="defaultOpenMode.sidePanel">側邊欄</label>
        </div> -->
        <div class="flex items-center gap-2">
          <RadioButton
            v-model="_optionsData.defaultOpenMode"
            inputId="defaultOpenMode.newTab"
            name="defaultOpenMode"
            value="newTab"
            @change="[saveOptions(), (defaultOpenModeMessage = '將改變下次開啟方式')]" />
          <label for="defaultOpenMode.newTab">新分頁</label>
        </div>
        <div class="flex items-center gap-2">
          <RadioButton
            v-model="_optionsData.defaultOpenMode"
            inputId="defaultOpenMode.newWindow"
            name="defaultOpenMode"
            value="newWindow"
            @change="[saveOptions(), (defaultOpenModeMessage = '將改變下次開啟方式')]" />
          <label for="defaultOpenMode.newWindow">新視窗(800×600)</label>
        </div>
        <div class="flex items-center gap-2">
          <RadioButton
            v-model="_optionsData.defaultOpenMode"
            inputId="defaultOpenMode.newWindow_maximized"
            name="defaultOpenMode"
            value="newWindow_maximized"
            @change="[saveOptions(), (defaultOpenModeMessage = '將改變下次開啟方式')]" />
          <label for="defaultOpenMode.newWindow_maximized">新視窗(視窗最大化)</label>
        </div>
      </div>
      <h3 class="font-bold mt-4">
        固定休息時段 <span v-tooltip.top="'重疊在灰色區段內時段會被刪除\n- 僅套用在新登記資料\n- 不會影響舊資料'" class="pi pi-info-circle text-sm align-self-center" style="color: lightblue"></span>
      </h3>
      <div class="flex align-content-center mb-1">
        <ToggleSwitch v-model="_optionsData.restTime.enableWorkOn" @change="saveOptions()" />
        <span>上班&nbsp;</span>
        <TimeInput v-model="_optionsData.restTime.workOn" @change="saveOptions()" />
        <span v-tooltip.top="'此時間以前設為灰色區塊'" class="pi pi-info-circle text-sm align-self-center" style="color: lightblue"></span>
        <Checkbox class="ml-2" id="hideNotWorking" v-model="_optionsData.restTime.hideNotWorking" binary @change="saveOptions()" />
        <label for="hideNotWorking">隱藏非上班時段</label>
        <span v-tooltip.top="'時間軸將隱藏非上班時段'" class="pi pi-info-circle text-sm align-self-center" style="color: lightblue"></span>
      </div>
      <div class="flex align-content-center mb-1">
        <ToggleSwitch v-model="_optionsData.restTime.enableWorkOff" @change="saveOptions()" />
        <span>下班&nbsp;</span>
        <TimeInput v-model="_optionsData.restTime.workOff" @change="saveOptions()" />
        <span v-tooltip.top="'此時間以後設為灰色區塊'" class="pi pi-info-circle text-sm align-self-center" style="color: lightblue"></span>
      </div>
      <div class="flex align-content-center">
        <ToggleSwitch v-model="_optionsData.restTime.enableLunch" @change="saveOptions()" />
        <span>午休&nbsp;</span>
        <PeriodInput v-model="_optionsData.restTime.lunch" @change="saveOptions()" />
      </div>
      <Timeline
        class="p-0 mt-2"
        :restTime="getRestPeriods()"
        :displayStartTime="_optionsData.restTime && _optionsData.restTime.enableWorkOn && _optionsData.restTime.hideNotWorking ? _optionsData.restTime.workOn : 0"
        :displayEndTime="_optionsData.restTime && _optionsData.restTime.enableWorkOff && _optionsData.restTime.hideNotWorking ? _optionsData.restTime.workOff : 1440"
        :showScale="true" />
      <h3 class="font-bold mt-4">其他</h3>
      <div class="flex flex-row">
        <Button
          v-tooltip.top="'開啟debug模式'"
          class="h-2rem w-2rem flex"
          icon="pi pi-ellipsis-v"
          severity="secondary"
          :outlined="true"
          :style="_showBlock.debugBlock ? 'background-color: lightgray;' : ''"
          @click="_showBlock.debugBlock = !_showBlock.debugBlock" />
        <div class="h-2rem w-1rem flex"></div>
        <FileUpload
          v-tooltip.top="'上傳並覆蓋資料'"
          name="demo[]"
          mode="basic"
          auto
          customUpload
          chooseIcon="pi pi-upload"
          :chooseButtonProps="{ label: '', class: 'h-2rem w-2rem flex ', severity: 'danger', outlined: true }"
          accept=".json"
          :maxFileSize="1000000"
          @select="fileOnChange($event)">
        </FileUpload>
        <Button v-tooltip.top="'下載資料(ctrl + s)'" class="h-2rem w-2rem flex" icon="pi pi-download" severity="danger" outlined @click="downloadOnClick()" />
        <a id="downloadAnchorElem" style="display: none" :href="datatable" download="launch.json"></a>
      </div>
      <div class="h-1rem w-2rem"></div>
      <h3 class="font-bold mt-4">刪除設定檔</h3>
      <Button v-tooltip.focus="'重新開啟擴充功能以重新整理設定檔'" label="還原為預設值" icon="pi pi-trash" severity="danger" size="small" raised @click="deleteStorage(['optionsData'])" />
    </Dialog>
  </div>
</template>
<script setup>
import { computed, onMounted, onUnmounted, onBeforeMount, ref, watch } from 'vue';

import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Slider from 'primevue/slider';
import InputNumber from 'primevue/inputnumber';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import FileUpload from 'primevue/fileupload';
import Panel from 'primevue/panel';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import RadioButton from 'primevue/radiobutton';
import Drawer from 'primevue/drawer';
import Checkbox from 'primevue/checkbox';
import ToggleSwitch from 'primevue/toggleswitch';

import InputTextDate from '@/components/InputTextDate.vue';
import Timeline from '@/components/Timeline.vue';
import TimeInput from '@/components/TimeInput.vue';
import PeriodInput from '@/components/PeriodInput.vue';

import { convertDateToString, isValidPage, sendTabMessage, setStorage, getStorage, deleteStorage, deepMerge } from '../service/commonService';

onBeforeMount(() => {
  loadOptions();
});

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
const _showBlock = ref({
  taskEditor: 0,
  timeEditor: false,
  debugBlock: false,
  deleteMode: false,
  taskListBlockPin: false
});
const _optionsData = ref({
  defaultOpenMode: 'popup',
  tempOpenMode: '',
  restTime: { workOn: 510, lunch: [710, 800], workOff: 1110, hideNotWorking: false, enableWorkOn: false, enableWorkOff: false, enableLunch: true }
});
const defaultOpenModeMessage = ref('');
const showOptions = ref(false);
const showTaskListDrawer = ref(false);
const isSidePanel = ref(false);
const periodEditorData = ref({
  showPeriodEditor: false,
  date: '',
  periodIndex: '',
  period: [0, 0]
});

const showStorageData = async () => {
  console.log('cache', await getStorage('cache'));
  console.log('tasks', await getStorage('tasks'));
};

const loadCache = async () => {
  _data.value = (await getStorage('cache')) || _data.value;
  _showBlock.value = (await getStorage('UIcache')) || _showBlock.value;
  _showBlock.value.deleteMode = false;
};

const saveCache = () => {
  setStorage({ cache: _data.value });
  setStorage({ UIcache: _showBlock.value });
};

const loadTasks = async () => {
  _tasks.value = (await getStorage('tasks')) || _tasks.value;
};

const saveTasks = () => {
  chrome.runtime.sendMessage({ action: 'setStorage', obj: { tasks: _tasks.value } }, (response) => {
    console.log(response.message);
  });
};

const deleteAllData = async () => {
  await deleteStorage(['tasks', 'cache']);
  loadTasks();
  loadCache();
};

const openInNewTab = (url) => {
  window.open(url, '_blank');
};

const openInNewWindow = (url, width = 800, height = 600, maximized = false) => {
  const windowOptions = {
    url: url,
    type: 'popup'
  };

  if (maximized) {
    windowOptions.state = 'maximized';
  } else {
    windowOptions.width = width;
    windowOptions.height = height;
  }

  chrome.windows.create(windowOptions);
};

const openInSidePanel = async () => {
  const currentWindow = await chrome.windows.getCurrent({});
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

  if (isSidePanel.value) {
    window.close();
  }

  _optionsData.value.tempOpenMode = 'sidePanel';
  saveOptions();
  await chrome.sidePanel.open({ tabId: tabs[0].id, windowId: currentWindow.id });
  _optionsData.value.tempOpenMode = '';
  saveOptions();
};

const saveOptions = () => {
  setStorage({ optionsData: _optionsData.value });
};

const loadOptions = async () => {
  _optionsData.value = deepMerge(_optionsData.value, await getStorage('optionsData'));
  executeDefaultOpenMode();
};
const executeDefaultOpenMode = () => {
  if (_optionsData.value.hasExecutedOpenMode) {
    _optionsData.value.hasExecutedOpenMode = false;
    saveOptions();
    return;
  }

  if (_optionsData.value.tempOpenMode === 'sidePanel') {
    _optionsData.value.tempOpenMode = '';
    isSidePanel.value = true;
    saveOptions();
    return;
  }
  if (_optionsData.value.defaultOpenMode === 'popup') {
    const app = document.getElementById('app');
    document.body.style.width = '800px';
    document.body.style.height = '600px';
    document.body.style.overflow = 'hidden';
    app.style.width = '800px';
    app.style.height = '600px';
    return;
  }
  if (_optionsData.value.defaultOpenMode === 'newTab') {
    openInNewTab('/index.html');
    window.close();
  }
  if (_optionsData.value.defaultOpenMode === 'newWindow') {
    openInNewWindow('/index.html');
    window.close();
  }
  if (_optionsData.value.defaultOpenMode === 'newWindow_maximized') {
    openInNewWindow('/index.html', undefined, undefined, true);
    window.close();
  }

  _optionsData.value.hasExecutedOpenMode = true;
  saveOptions();
};

const newTaskRestoreTempID = ref(-1);
const toggleTaskBlock = () => {
  // off
  if (_showBlock.value.taskEditor) {
    _showBlock.value.taskEditor = 0;
  }
  // on
  else if (!_showBlock.value.taskEditor) {
    _showBlock.value.taskEditor = _tasks.value.filter((t) => t.id == _data.value.id).length ? 1 : 2;
  }
};
const toggleNewTask = () => {
  // off
  if (_showBlock.value.taskEditor == 2) {
    if (_tasks.value.filter((t) => t.id == newTaskRestoreTempID.value).length) {
      _data.value = { ..._tasks.value.filter((t) => t.id == newTaskRestoreTempID.value)[0] };
      _showBlock.value.taskEditor = 1;
    } else {
      _showBlock.value.taskEditor = 0;
    }

    return;
  }
  // on
  else if (!_showBlock.value.taskEditor || _showBlock.value.taskEditor == 1) {
    _showBlock.value.taskEditor = 2;
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
  if (_showBlock.value.taskEditor == 1) {
    return 'border-color: #F97316; border-width: 2px;';
  } else if (_showBlock.value.taskEditor == 2) {
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
  _data.value = { ...data };
  newTaskRestoreTempID.value = data.id;
  if (_showBlock.value.taskEditor == 2) {
    _showBlock.value.taskEditor = 1;
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

  if (_showBlock.value.taskEditor == 2) {
    _showBlock.value.taskEditor = 1;
    newTaskRestoreTempID.value = -1;
  }

  saveTasks();
};

const saveTime = () => {
  const taskIndex = _tasks.value.findIndex((t) => t.id === _data.value.id);
  const timeIndex = _data.value.times.findIndex((t) => t.date === _time.value.date);

  const updatedPeriod = removeRestPeriods([..._period.value]);
  if (timeIndex === -1) {
    _data.value.times.push({ ..._time.value, periods: updatedPeriod });
  } else {
    _data.value.times[timeIndex].periods = processWorkPeriods([..._data.value.times[timeIndex].periods, ...updatedPeriod]);
  }

  if (taskIndex === -1) {
    _tasks.value.push({ ..._data.value });
  } else {
    _tasks.value[taskIndex] = { ..._data.value };
  }

  if (_showBlock.value.taskEditor == 2) {
    _showBlock.value.taskEditor = 1;
  }

  saveTasks();
  saveCache();
};

const getRestPeriods = () => {
  const resultRestTimeArray = [];
  if (_optionsData.value.restTime?.enableWorkOn === true) {
    resultRestTimeArray.push([0, _optionsData.value.restTime?.workOn]);
  }
  if (_optionsData.value.restTime?.enableLunch === true) {
    resultRestTimeArray.push(_optionsData.value.restTime?.lunch);
  }
  if (_optionsData.value.restTime?.enableWorkOff === true) {
    resultRestTimeArray.push([_optionsData.value.restTime?.workOff, 1440]);
  }

  return resultRestTimeArray;
};

const processWorkPeriods = (workPeriods) => {
  workPeriods.sort((a, b) => a[0] - b[0]);

  const mergedPeriods = [];
  let currentPeriod = workPeriods[0];

  for (let i = 1; i < workPeriods.length; i++) {
    const [currentStart, currentEnd] = currentPeriod;
    const [nextStart, nextEnd] = workPeriods[i];

    if (currentEnd >= nextStart) {
      currentPeriod = [currentStart, Math.max(currentEnd, nextEnd)];
    } else {
      mergedPeriods.push(currentPeriod);
      currentPeriod = workPeriods[i];
    }
  }
  mergedPeriods.push(currentPeriod);

  const result = mergedPeriods.flatMap((period) => removeRestPeriods(period));

  return result;
};

const removeRestPeriods = ([start, end]) => {
  const restPeriods = getRestPeriods();
  let periods = [[start, end]];

  restPeriods.forEach(([restStart, restEnd]) => {
    periods = periods.flatMap(([s, e]) => {
      const result = [];

      if (s < restStart && e > restEnd) {
        result.push([s, restStart], [restEnd, e]);
      } else if (e > restStart && s < restEnd) {
        if (s < restStart) result.push([s, restStart]);
        if (e > restEnd) result.push([restEnd, e]);
      } else {
        result.push([s, e]);
      }

      return result;
    });
  });

  return periods;
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
  const targetYear = d.getFullYear();

  const firstDayOfMonth = new Date(targetYear, month, 1);
  const firstDayWeekDay = firstDayOfMonth.getDay();

  if (d.getDate() <= 7) {
    const firstWeekMonday = new Date(firstDayOfMonth);
    firstWeekMonday.setDate(firstDayOfMonth.getDate() - firstDayWeekDay + (firstDayWeekDay === 0 ? -6 : 1));

    if (d.getMonth() === month && firstWeekMonday.getMonth() !== month) {
      return 1;
    }
  }

  let firstWeekMonday = new Date(firstDayOfMonth);
  if (firstDayWeekDay !== 1) {
    const daysToAdd = firstDayWeekDay === 0 ? 1 : 8 - firstDayWeekDay;
    firstWeekMonday.setDate(firstDayOfMonth.getDate() + daysToAdd - 7);
  }

  const currentMonday = new Date(d);
  currentMonday.setDate(d.getDate() - (d.getDay() === 0 ? 6 : d.getDay() - 1));

  const diffTime = currentMonday.getTime() - firstWeekMonday.getTime();
  const diffDays = Math.floor(diffTime / (24 * 60 * 60 * 1000));
  const weekNum = Math.floor(diffDays / 7) + 1;

  return weekNum;
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
          if (_showBlock.value.taskEditor == 1) {
            _showBlock.value.taskEditor = 2;
          }
        } else {
          _data.value.id = 0;
          _showBlock.value.taskEditor = 2;
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

const handleDialogKeydown = (event) => {
  if (event.key === 'Enter') {
    handleSave();
  } else if (event.key === 'Delete') {
    handleDelete();
  }
};
const handleSave = () => {
  periodEditorData.value.showPeriodEditor = false;
  periodEditorSavePeriod();
};
const handleDelete = () => {
  periodEditorData.value.showPeriodEditor = false;
  periodEditorDeletePeriod();
};
watch(
  () => periodEditorData.value.showPeriodEditor,
  (newVal) => {
    if (newVal) {
      window.addEventListener('keydown', handleDialogKeydown);
    } else {
      window.removeEventListener('keydown', handleDialogKeydown);
    }
  }
);

const checkUnsaved = computed(() => {
  const taskIndex = _tasks.value.findIndex((t) => t.id == _data.value.id);
  if (taskIndex == -1) {
    return false;
  }

  if (_tasks.value[taskIndex].taskBranch != _data.value.taskBranch || _tasks.value[taskIndex].taskHeader != _data.value.taskHeader || _tasks.value[taskIndex].taskUrl != _data.value.taskUrl) {
    return true;
  } else {
    return false;
  }
});
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

.scrollTarget {
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

.custom-grid {
  display: flex;
  flex-wrap: wrap;
  margin-right: -0.5rem;
  margin-left: -0.5rem;
  margin-top: -0.5rem;
}
.custom-col-8 {
  flex: 0 0 auto;
  width: 66.6667%;
}
.custom-col-4 {
  flex: 0 0 auto;
  width: 33.3333%;
  padding: 0.5rem;
}
@media (max-width: 799px) {
  .dataBlock {
    display: flex;
    flex-direction: column;
  }

  .custom-col-8,
  .custom-col-4 {
    width: 100%;
    min-width: auto; /* 移除 min-width 的限制 */
  }
}
</style>
