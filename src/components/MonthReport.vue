<template>
  <div></div>
</template>
<script setup>
function getMonthlyWorkPeriods(tasks, year, month) {
  const monthlyPeriods = [];

  tasks.forEach(task => {
    task.times.forEach(time => {
      const [taskYear, taskMonth] = time.date.split('/').map(Number);

      if (taskYear === year && taskMonth === month) {
        monthlyPeriods.push(...time.periods);
      }
    });
  });

  return processWorkPeriods(monthlyPeriods);
}
</script>

<style scoped></style>
