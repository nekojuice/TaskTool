<template>
  <div>
    <span>{{ props.date }}</span>
    <div class="timeline">
      <div
        v-for="period in props.workTime"
        v-tooltip.bottom="
          `${Math.floor(period[0] / 60)}:${period[0] % 60}-${Math.floor(period[1] / 60)}:${period[1] % 60} (${Math.floor((period[1] - period[0]) / 60)}h ${(period[1] - period[0]) % 60}min)`
        "
        :key="index"
        class="time-block"
        :style="getPeriodStyle(period, '#35B303')"
      ></div>
      <div
        v-for="period in props.restTime"
        v-tooltip.bottom="`午休${Math.floor(period[0] / 60)}:${period[0] % 60}-${Math.floor(period[1] / 60)}:${period[1] % 60}`"
        :key="index"
        class="time-block"
        :style="getPeriodStyle(period, '#757575')"
      ></div>
    </div>
    <div v-if="props.showScale" class="timeline-scale">
      <div v-for="hour in getTimeMarks()" :key="hour" class="time-mark" :style="{ left: `${(hour / 24) * 100}%` }">{{ hour }}:00</div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['modelValue', 'date', 'workTime', 'restTime', 'showScale'])

const getPeriodStyle = (period, color) => {
  const start = (period[0] / 1440) * 100
  const duration = ((period[1] - period[0]) / 1440) * 100

  return {
    left: `${start}%`,
    width: `${duration}%`,
    backgroundColor: color
  }
}

const getTimeMarks = () => {
  const marks = []
  for (let i = 0; i <= 24; i += 2) {
    marks.push(i)
  }
  return marks
}
</script>

<style scoped>
.timeline {
  position: relative;
  width: 100%;
  height: 10px;
  background-color: #e0e0e0;
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
  margin-top: 5px;
}

.time-mark {
  position: absolute;
  font-size: 12px;
  color: #333;
  transform: translateX(-50%);
}
</style>
