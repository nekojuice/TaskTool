<template>
  <div>
    <span v-if="props.showDateAndSum">
      <Button v-if="props.deleteMode" class="h-1rem w-1rem" icon="pi pi-trash" severity="danger" size="small" raised @click="emit('deleteDate', $event)" />
      {{ props.date }} <Tag class="h-1rem" severity="info" :value="new Intl.DateTimeFormat('zh-TW', { weekday: 'short' }).format(new Date(props.date))"></Tag> ({{ calHour }})
    </span>
    <div class="timeline">
      <div
        v-for="(period, index) in props.workTime"
        v-tooltip.bottom="
          `${Math.floor(period[0] / 60)
            .toString()
            .padStart(2, '0')}:${(period[0] % 60).toString().padStart(2, '0')}-${Math.floor(period[1] / 60)
            .toString()
            .padStart(2, '0')}:${(period[1] % 60).toString().padStart(2, '0')} (${Math.floor((period[1] - period[0]) / 60)}h ${(period[1] - period[0]) % 60}min)`
        "
        :key="index"
        class="time-block cursorPointer"
        :style="getPeriodStyle(period, '#35B303')"
        @dblclick="editTimePeriod($event, index)"></div>
      <div
        v-for="period in props.restTime"
        v-tooltip.bottom="`休息${Math.floor(period[0] / 60)}:${period[0] % 60}-${Math.floor(period[1] / 60)}:${period[1] % 60}`"
        :key="index"
        class="time-block"
        :style="getPeriodStyle(period, '#757575')"></div>
    </div>
    <div v-if="props.showScale" class="timeline-scale">
      <div v-for="hour in getTimeMarks()" :key="hour" class="time-mark" :style="{ left: `${(hour / 24) * 100}%` }">{{ hour }}:00</div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineEmits } from 'vue';

import Button from 'primevue/button';
import Tag from 'primevue/tag';

const props = defineProps(['modelValue', 'date', 'workTime', 'restTime', 'showScale', 'showDateAndSum', 'deleteMode']);
const emit = defineEmits(['deleteDate', 'periodEditorData']);

const getPeriodStyle = (period, color) => {
  const start = (period[0] / 1440) * 100;
  const duration = ((period[1] - period[0]) / 1440) * 100;

  return {
    left: `${start}%`,
    width: `${duration}%`,
    backgroundColor: color
  };
};

const getTimeMarks = () => {
  const marks = [];
  for (let i = 0; i <= 24; i += 2) {
    marks.push(i);
  }
  return marks;
};

const calHour = computed(() => {
  const dayMinutes = props.workTime?.reduce((dayMinutes, period) => {
    const [start, end] = period;
    return dayMinutes + (end - start);
  }, 0);

  if (!dayMinutes) {
    return '00:00';
  }

  return `${Math.floor(dayMinutes / 60)
    .toString()
    .padStart(2, '0')}:${(dayMinutes % 60).toString().padStart(2, '0')}`;
});

const editTimePeriod = (event, periodIndex) => {
  emit('periodEditorData', { showPeriodEditor: true, date: props.date, periodIndex: periodIndex });
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
  margin-top: 8px;
}

.time-mark {
  position: absolute;
  font-size: 12px;
  color: #333;
  transform: translateX(-50%);
}

.cursorPointer {
  cursor: pointer;
}
</style>
