<template>
  <div>
    <span v-if="props.showDateAndSum">
      <Button v-if="props.deleteMode" class="h-1rem w-1rem" icon="pi pi-trash" severity="danger" size="small" raised @click="emit('deleteDate', $event)" />
      {{ props.date }}
      <Tag class="h-1rem" severity="info" :value="new Intl.DateTimeFormat('zh-TW', { weekday: 'short' }).format(new Date(props.date))"></Tag>
      ({{ calHour }})
    </span>

    <div class="timeline">
      <div
        v-for="(period, index) in filteredWorkTime"
        :key="index"
        class="time-block cursorPointer"
        :style="getPeriodStyle(period, '#35B303')"
        @dblclick="editTimePeriod($event, index)"
        v-tooltip.bottom="`${formatTime(period[0])}-${formatTime(period[1])} (${Math.floor((period[1] - period[0]) / 60)}h ${(period[1] - period[0]) % 60}min)`"></div>

      <div
        v-for="(period, index) in filteredRestTime"
        :key="index"
        class="time-block"
        :style="getPeriodStyle(period, '#757575')"
        v-tooltip.bottom="`休息 ${formatTime(period[0])}-${formatTime(period[1])}`"></div>
    </div>

    <div v-if="props.showScale" class="timeline-scale">
      <div v-for="hour in filteredTimeMarks" :key="hour" class="time-mark" :style="{ left: `${((hour * 60 - props.displayStartTime) / (props.displayEndTime - props.displayStartTime)) * 100}%` }">
        <div class="tick"></div>
        {{ hour }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmits, onMounted, onUnmounted, ref, watch } from 'vue';
import Button from 'primevue/button';
import Tag from 'primevue/tag';

const props = defineProps({
  modelValue: Array,
  date: String,
  workTime: { type: Array, default: [] },
  restTime: { type: Array, default: [] },
  showScale: Boolean,
  showDateAndSum: Boolean,
  deleteMode: Boolean,
  displayStartTime: { type: Number, default: 0 },
  displayEndTime: { type: Number, default: 1440 }
});

const emit = defineEmits(['deleteDate', 'periodEditorData']);

const filteredWorkTime = computed(() => {
  return props.workTime.filter((period) => period[1] > props.displayStartTime && period[0] < props.displayEndTime);
});

const filteredRestTime = computed(() => {
  return props.restTime.filter((period) => period[1] > props.displayStartTime && period[0] < props.displayEndTime);
});

const timeMarks = ref([]);
const filteredTimeMarks = computed(() =>
  timeMarks.value.filter((hour) => {
    const minute = hour * 60;
    return minute >= props.displayStartTime && minute <= props.displayEndTime;
  })
);

const rwdHourStep = ref(2);
const updateTimeMarks = () => {
  timeMarks.value = [];
  for (let i = 0; i <= 24; i += rwdHourStep.value) {
    timeMarks.value.push(i);
  }
};

const updateHourStep = () => {
  if (window.innerWidth < 570) {
    rwdHourStep.value = 4;
  } else if (window.innerWidth < 1200) {
    rwdHourStep.value = 2;
  } else {
    rwdHourStep.value = 1;
  }
  updateTimeMarks();
};

onMounted(() => {
  updateHourStep();
  window.addEventListener('resize', updateHourStep);
});

onUnmounted(() => {
  window.removeEventListener('resize', updateHourStep);
});

watch(rwdHourStep, updateTimeMarks);

const calHour = computed(() => {
  const dayMinutes = props.workTime?.reduce((sum, period) => sum + (period[1] - period[0]), 0);
  return dayMinutes ? `${String(Math.floor(dayMinutes / 60)).padStart(2, '0')}:${String(dayMinutes % 60).padStart(2, '0')}` : '00:00';
});

const formatTime = (minute) => `${String(Math.floor(minute / 60)).padStart(2, '0')}:${String(minute % 60).padStart(2, '0')}`;

const editTimePeriod = (event, periodIndex) => {
  emit('periodEditorData', { showPeriodEditor: true, date: props.date, periodIndex });
};

const getPeriodStyle = (period, color) => {
  const start = ((Math.max(period[0], props.displayStartTime) - props.displayStartTime) / (props.displayEndTime - props.displayStartTime)) * 100;
  const duration = ((Math.min(period[1], props.displayEndTime) - Math.max(period[0], props.displayStartTime)) / (props.displayEndTime - props.displayStartTime)) * 100;
  return { left: `${start}%`, width: `${duration}%`, backgroundColor: color };
};
</script>

<style scoped>
.timeline {
  position: relative;
  width: 100%;
  height: 10px;
  background-color: rgba(204, 204, 204, 0.35);
  overflow: hidden;
}

.time-block {
  position: absolute;
  height: 100%;
  top: 0;
}

.timeline-scale {
  position: relative;
  width: 100%;
  height: 20px;
}

.time-mark {
  position: absolute;
  font-size: 12px;
  color: #333;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tick {
  width: 1px;
  height: 6px;
  background-color: #333;
}

.cursorPointer {
  cursor: pointer;
}
</style>
