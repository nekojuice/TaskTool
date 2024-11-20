<template>
  <div :class="props.class">
    <span class="flex p-inputtext p-0" :style="props.displayButton ? `border-radius: 4px 0 0 4px` : ``">
      <input
        v-if="props.format.match(/y/g)?.length"
        v-model="inputYear"
        ref="refYear"
        :disabled="props.disabled"
        inputmode="numeric"
        class="w-3rem text-center border-none p-0 p-inputtext p-component hideSpinButton"
        style="background-color: transparent"
        @input="onInput($event, 'y')"
        @change="onChange($event, 'y')"
        @keydown="onKeydown($event, 'y')"
        @wheel.prevent="onWheel($event, 'y')" />
      <span v-if="props.format.match(/y/g)?.length" class="align-self-center">{{ props.separator }}</span>
      <input
        v-if="props.format.match(/M/g)?.length"
        v-model="inputMonth"
        ref="refMonth"
        :disabled="props.disabled"
        inputmode="numeric"
        class="w-2rem text-center border-none p-0 p-inputtext p-component hideSpinButton"
        style="background-color: transparent"
        @input="onInput($event, 'M')"
        @change="onChange($event, 'M')"
        @keydown="onKeydown($event, 'M')"
        @wheel.prevent="onWheel($event, 'M')" />
      <span v-if="props.format.match(/d/g)?.length" class="align-self-center">{{ props.separator }}</span>
      <input
        v-if="props.format.match(/d/g)?.length"
        v-model="inputDate"
        ref="refDate"
        :disabled="props.disabled"
        inputmode="numeric"
        class="w-2rem text-center border-none p-0 p-inputtext p-component hideSpinButton"
        style="background-color: transparent"
        @input="onInput($event, 'd')"
        @change="onChange($event, 'd')"
        @keydown="onKeydown($event, 'd')"
        @wheel.prevent="onWheel($event, 'd')" />
    </span>
    <DatePicker v-if="displayButton" v-model="dateObject" :disabled="props.disabled" showIcon :view="props.view" inputClass="hidden" />
    <Button v-if="props.nullable" icon="pi pi-times" severity="danger" text rounded aria-label="Cancel" @click="emit('update:modelValue', '')" />
  </div>
</template>
<script setup>
import { computed, ref } from 'vue';
import DatePicker from 'primevue/datepicker';
import Button from 'primevue/button';

const emit = defineEmits(['update:modelValue', 'change']);

const props = defineProps({
  // 時間字串 需對齊格式和分隔符號
  modelValue: { type: String, default: '' },
  class: { type: String, default: 'inline-block' },
  disabled: { type: Boolean, default: false },
  // 是否可回傳空字串
  nullable: { type: Boolean, default: false },
  // 是否顯示日曆按鈕
  displayButton: { type: Boolean, default: true },
  // DatePicker 屬性傳遞
  view: { type: String, default: 'date' },

  // 時間格式
  format: { type: String, default: 'yyyyMMdd' },
  // 分隔符號 為空字串時, 時間格式必須月份MM, 日期dd
  separator: { type: String, default: '/' },
  // 輸入 1911 計算為民國年
  yearOffset: { type: Number, default: 0 }
});

const refYear = ref();
const refMonth = ref();
const refDate = ref();

const dateObject = computed({
  get: () => {
    if (!props.nullable && (!props.modelValue || !props.modelValue.trim())) {
      return new Date();
    } else if (props.nullable && (!props.modelValue || !props.modelValue.trim())) {
      return null;
    } else {
      return convertStringToDate(props.modelValue, props.format, { yearOffset: +props.yearOffset, separator: props.separator });
    }
  },
  set: (val) => {
    emit('update:modelValue', convertDateToString(val, props.format, { yearOffset: +props.yearOffset, separator: props.separator }));
  }
});

const inputDateValues = ref({
  year: dateObject.value ? dateObject.value.getFullYear() : '',
  month: dateObject.value ? dateObject.value.getMonth() + 1 : 1,
  date: dateObject.value ? dateObject.value.getDate() : 1
});

const inputYear = computed({
  get: () => {
    return convertDateToString(dateObject.value, 'y'.repeat([...props.format].reduce((count, find) => (find === 'y' ? ++count : count), 0)), {
      yearOffset: +props.yearOffset,
      separator: props.separator
    });
  },
  set: (val) => {
    inputDateValues.value.year = val;
  }
});

const inputMonth = computed({
  get: () => {
    return convertDateToString(dateObject.value, 'M'.repeat([...props.format].reduce((count, find) => (find === 'M' ? ++count : count), 0)), {
      yearOffset: +props.yearOffset,
      separator: props.separator
    });
  },
  set: (val) => {
    inputDateValues.value.month = val;
  }
});

const inputDate = computed({
  get: () => {
    return convertDateToString(dateObject.value, 'd'.repeat([...props.format].reduce((count, find) => (find === 'd' ? ++count : count), 0)), {
      yearOffset: +props.yearOffset,
      separator: props.separator
    });
  },
  set: (val) => {
    inputDateValues.value.date = val;
  }
});

const onKeydown = (event, field) => {
  if (event.key === 'ArrowUp') {
    event.target.value = +event.target.value + 1;

    onChange(event, field);
  }
  if (event.key === 'ArrowDown') {
    event.target.value = +event.target.value - 1;

    onChange(event, field);
  }
};

const onWheel = (event, field) => {
  if (event.deltaY < 0) {
    event.target.value = +event.target.value + 1;

    onChange(event, field);
  } else if (event.deltaY > 0) {
    event.target.value = +event.target.value - 1;

    onChange(event, field);
  }
};

const onChange = (event, field) => {
  if (!props.nullable && !event.target.value) {
    if (field === 'y') {
      event.target.value = inputYear.value;
    }
    if (field === 'M') {
      event.target.value = inputMonth.value;
    }
    if (field === 'd') {
      event.target.value = inputDate.value;
    }

    return;
  }

  const value = parseInt(event.target.value.replace(/\D/g, ''), 10);

  if (isNaN(value)) {
    event.target.value = '';

    return;
  }

  if (['ArrowUp', 'ArrowDown'].includes(event.key)) {
    inputYear.value = refYear.value?.value || inputYear.value;
    inputMonth.value = refMonth.value?.value || inputMonth.value;
    inputDate.value = refDate.value?.value || 1;
  } else {
    if (field === 'y') {
      const maxDigit = [...props.format].reduce((count, find) => (find === 'y' ? ++count : count), 0);

      if (value < 0) {
        event.target.value = '0'.padStart(maxDigit, '0');
      } else if (value > +'9'.padStart(maxDigit, '9')) {
        event.target.value = +'9'.padStart(maxDigit, '9');
      } else {
        event.target.value = value.toString().padStart(maxDigit, '0');
      }
      inputYear.value = event.target.value;
    }
    if (field === 'M') {
      const maxDigit = [...props.format].reduce((count, find) => (find === 'M' ? ++count : count), 0);

      if (value < 1) {
        event.target.value = '1'.padStart(maxDigit, '0');
      } else if (value > 12) {
        event.target.value = 12;
      } else {
        event.target.value = value.toString().padStart(maxDigit, '0');
      }
      inputMonth.value = event.target.value;
    }
    if (field === 'd') {
      const maxDigit = [...props.format].reduce((count, find) => (find === 'd' ? ++count : count), 0);
      const maxDays = new Date(+inputYear.value + +props.yearOffset, +inputMonth.value, 0).getDate();

      if (value < 1) {
        event.target.value = '1'.padStart(maxDigit, '0');
      } else if (value > maxDays) {
        event.target.value = maxDays;
      } else {
        event.target.value = value.toString().padStart(maxDigit, '0');
      }
      inputDate.value = event.target.value;
    }
  }

  dateObject.value = new Date(+inputDateValues.value.year + +props.yearOffset, inputDateValues.value.month - 1, +inputDateValues.value.date);
};

const onInput = (event, field) => {
  const cursorPosition = event.target.selectionStart;

  if (event.data && /[^\d]/.test(event.data)) {
    event.target.value = event.target.value.replace(/[^0-9]/g, '');
    event.target.setSelectionRange(cursorPosition - 1, cursorPosition - 1);
  } else {
    let maxDigit = 0;
    if (field === 'y') {
      maxDigit = [...props.format].reduce((count, find) => (find === 'y' ? ++count : count), 0);
    }
    if (field === 'M') {
      maxDigit = 2;
    }
    if (field === 'd') {
      maxDigit = 2;
    }

    if (event.target.value.length > maxDigit) {
      event.target.value = replaceAt(event.target.value, cursorPosition, 1, '');
      event.target.setSelectionRange(cursorPosition, cursorPosition);
    }
    if (cursorPosition > maxDigit) {
      event.target.value = event.target.value.substring(0, maxDigit);
    }
  }
};

/**
 * 刪除一段文字 並替換為取代字串
 * @param {String} str 原始字串
 * @param {Number} index 原始字串起始索引
 * @param {Number} length 截斷長度
 * @param {String} replacement 取代字串
 */
function replaceAt(str, index, length, replacement) {
  if (index < 0 || index >= str.length) {
    console.warn('replaceAt: reaplcement fail, index out of range');
    return str;
  }

  return str.substring(0, index) + replacement + str.substring(index + length, str.length);
}

/**
 * 轉換 Date 物件日期為字串
 * @param {Date} date
 * @param {String} format 顯示格式
 * @param {Object} options yearOffset: 年差1911為民國年, separator: 分隔符號
 * @returns
 */
function convertDateToString(date, format = 'yyyyMMdd', options = {}) {
  if (!date) {
    return;
  }

  const { yearOffset = 0, separator = '' } = options;

  const inputDate = date instanceof Date ? date : new Date(date);
  const year = inputDate.getFullYear() - yearOffset;

  const formatParts = {
    yyyy: String(year).padStart(4, '0'),
    yyy: String(year).padStart(3, '0'),
    yy: String(year).slice(-2).padStart(2, '0'),
    MM: String(inputDate.getMonth() + 1).padStart(2, '0'),
    M: String(inputDate.getMonth() + 1),
    dd: String(inputDate.getDate()).padStart(2, '0'),
    d: String(inputDate.getDate())
  };

  return format
    .replace(/yyyy|yyy|yy|MM|M|dd|d/g, (match) => formatParts[match] + '-' || match)
    .replace(/-$/g, '')
    .replace(/-/g, separator);
}

/**
 * 轉換字串為 Date 物件日期
 * @param {String} dateString
 * @param {String} format 格式
 * @param {Object} options yearOffset: 年差1911為民國年, separator: 分隔符號
 * @returns {Date}
 */
function convertStringToDate(dateString, format = 'yyyyMMdd', options = {}) {
  if (!dateString) {
    return;
  }

  const { yearOffset = 0, separator = '' } = options;

  if (!separator && ((format.includes('M') && !format.includes('MM')) || (format.includes('d') && !format.includes('dd')))) {
    throw new Error('When separator is empty, month and day format must be MM and dd');
  }

  const parts = separator
    ? dateString.split(separator)
    : [
        format.includes('yyyy') ? dateString.slice(0, 4) : format.includes('yyy') ? dateString.slice(0, 3) : format.includes('yy') ? dateString.slice(0, 2) : null,
        dateString.slice(format.includes('yyyy') ? 4 : format.includes('yyy') ? 3 : 2, format.includes('MM') ? 6 : 5),
        dateString.slice(format.includes('MM') ? 6 : 5)
      ];

  if (parts.includes(null) || parts.some((part) => part === undefined)) {
    throw new Error('Invalid date string or format');
  }

  let year = 0;
  let month = 0;
  let day = 1;

  format.match(/(yyyy|yyy|yy|MM|M|dd|d)/g).forEach((part, index) => {
    const value = parseInt(parts[index], 10);
    switch (part) {
      case 'yyyy':
        year = value + yearOffset;
        break;
      case 'yyy':
        year = value + yearOffset;
        break;
      case 'yy':
        year = value + 2000 + yearOffset;
        break;
      case 'MM':
      case 'M':
        month = value - 1;
        break;
      case 'dd':
      case 'd':
        day = value;
        break;
    }
  });

  return new Date(year, month, day);
}
</script>

<style scoped>
input.hideSpinButton::-webkit-outer-spin-button,
input.hideSpinButton::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
