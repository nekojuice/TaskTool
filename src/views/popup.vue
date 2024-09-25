<script setup>
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import DatePicker from 'primevue/datepicker'
import FloatLabel from 'primevue/floatlabel'
import { ref } from 'vue'

const data = ref({ time: null })

const openInNewTab = () => {
  window.open('/index.html', '_blank') // 打開新分頁並加載新路由
}
</script>
<template>
  <div>
    <Button icon="pi pi-window-maximize" severity="secondary" @click="openInNewTab" />

    <div class="grid">
      <div class="col mb-3">
        <FloatLabel>
          <label for="taskHeader">標題</label>
          <InputText id="taskHeader" type="text" v-model="value" />
        </FloatLabel>
      </div>
      <div class="col mb-3">
        <FloatLabel>
          <label for="taskUrl">連結</label>
          <InputText id="taskUrl" type="text" v-model="value" />
        </FloatLabel>
      </div>
      <div class="col mb-3">
        <FloatLabel>
          <label>時間</label>
          <DatePicker v-model="data.time" selectionMode="range" :manualInput="false" />
        </FloatLabel>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
