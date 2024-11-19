/**
 * 通用方法
 */
class CommonService {
  /**
   * 驗證字串是否為合法日期
   * @param {String} dateString
   * @param {String} format 解析格式
   * @param {Object} options yearOffset: 年差1911為民國年, separator: 分隔符號
   * @returns {Boolean}
   */
  isValidDateString = (dateString, format = 'yyyyMMdd', options = {}) => {
    if (!dateString) {
      return false;
    }

    const { yearOffset = 0, separator = '' } = options;

    const formatRegex = format.replace(/(yyyy|yyy|yy|MM|M|dd|d)/g, (match) => {
      switch (match) {
        case 'yyyy':
          return '(\\d{4})';
        case 'yyy':
        case 'yy':
          return '(\\d{1,4})';
        case 'MM':
          return '(\\d{2})';
        case 'M':
          return '(\\d{1,2})';
        case 'dd':
          return '(\\d{2})';
        case 'd':
          return '(\\d{1,2})';
        default:
          return match;
      }
    });

    const regex = new RegExp(`^${formatRegex}$`);
    const match = dateString?.split(separator).join('').match(regex);

    if (!match) {
      return false;
    }

    let year = 0;
    let month = 0;
    let day = 1;
    const parts = format.match(/(yyyy|yyy|yy|MM|M|dd|d)/g);

    parts.forEach((part, index) => {
      const value = parseInt(match[index + 1], 10);
      switch (part) {
        case 'yyyy':
        case 'yyy':
        case 'yy':
          year = value + (part === 'yy' ? 2000 : 0) + yearOffset;
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

    const date = new Date(year, month, day);
    return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day;
  };

  /**
   * 轉換 Date 物件日期為字串
   * @param {Date} date
   * @param {String} format 顯示格式
   * @param {Object} options yearOffset: 年差1911為民國年, separator: 分隔符號
   * @returns
   */
  convertDateToString = (date, format = 'yyyyMMdd', options = {}) => {
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
  };

  /**
   * 轉換字串為 Date 物件日期
   * @param {String} dateString
   * @param {String} format 格式
   * @param {Object} options yearOffset: 年差1911為民國年, separator: 分隔符號
   * @returns {Date}
   */
  convertStringToDate = (dateString, format = 'yyyyMMdd', options = {}) => {
    if (!dateString) {
      return;
    }

    const { yearOffset = 0, separator = '' } = options;

    const formatRegex = format.replace(/(yyyy|yyy|yy|MM|M|dd|d)/g, (match) => {
      switch (match) {
        case 'yyyy':
          return '(\\d{4})';
        case 'yyy':
        case 'yy':
          return '(\\d{1,4})';
        case 'MM':
          return '(\\d{2})';
        case 'M':
          return '(\\d{1,2})';
        case 'dd':
          return '(\\d{2})';
        case 'd':
          return '(\\d{1,2})';
        default:
          return match;
      }
    });

    const regex = new RegExp(`^${formatRegex}$`);
    const match = dateString?.split(separator).join('').match(regex);

    if (!match) {
      throw new Error('Invalid date string or format');
    }

    let year = 0;
    let month = 0;
    let day = 1;
    const parts = format.match(/(yyyy|yyy|yy|MM|M|dd|d)/g);

    parts.forEach((part, index) => {
      const value = parseInt(match[index + 1], 10);
      switch (part) {
        case 'yyyy':
        case 'yyy':
        case 'yy':
          year = value + (part === 'yy' ? 2000 : 0) + yearOffset;
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
  };

  /**
   * 將多個物件合併
   * @param  {...any} objects
   * @returns
   */
  deepMerge(...objects) {
    const result = {};

    objects.forEach((obj) => {
      Object.keys(obj).forEach((key) => {
        if (Array.isArray(obj[key])) {
          result[key] = (result[key] || []).concat(obj[key]);
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          result[key] = deepMerge(result[key] || {}, obj[key]);
        } else {
          result[key] = obj[key];
        }
      });
    });

    return result;
  }

  /**
   * 檢查當前tab為不可插件互動的頁面
   * @param {string} tabsUrl 當前路由
   * @returns
   */
  isValidPage = (tabsUrl) => {
    const urlFilter = ['chrome://', 'chrome-extension://', 'edge://', 'about:blank'];
    if (!tabsUrl || urlFilter.some((x) => tabsUrl.startsWith(x))) {
      return false;
    }

    return true;
  };

  /**
   * 深拷貝
   * @param {*} targetObject
   * @returns
   */
  deepCopy(targetObject) {
    return JSON.parse(JSON.stringify(targetObject));
  }

  /**
   * 與當前tab (content.js) 通訊
   * @param {string} action 通訊名稱
   * @param {*} data 傳遞的資料
   * @returns
   */
  sendTabMessage = async (action, data = null) => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!isValidPage(tabs[0].url)) {
      return null;
    }

    const response = await chrome.tabs.sendMessage(tabs[0].id, {
      action: action,
      data: data
    });

    return response;
  };

  /**
   * 儲存物件至localStorage
   * @param {object} obj 物件的根屬性將會是查詢、刪除的key
   */
  setStorage = async (obj) => {
    const response = await chrome.runtime.sendMessage({ action: 'setStorage', obj: obj });
    console.log(response.message);
  };

  /**
   * 查詢物件
   * @param {string} key 物件key
   * @returns {*} 字串或物件
   */
  getStorage = async (key) => {
    const response = await chrome.runtime.sendMessage({ action: 'getStorage', key: key });
    return response.message;
  };

  /**
   * 刪除物件
   * @param {string[]} keys 物件key陣列
   */
  deleteStorage = async (keys) => {
    const response = await chrome.runtime.sendMessage({ action: 'deleteStorage', keys: keys });
    console.log(response.message);
  };

  /**
   *
   * @param {number} ms setTimeout延遲毫秒, 整數
   * @returns
   */
  delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  /**
   * 取得瀏覽器類別
   * @returns
   */
  getBrowserType = () => {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Chrome') && !userAgent.includes('Edg') && !userAgent.includes('OPR')) {
      return 'Chrome';
    } else if (userAgent.includes('Edg')) {
      return 'Edge';
    } else if (userAgent.includes('Firefox')) {
      return 'Firefox';
    } else if (userAgent.includes('OPR') || userAgent.includes('Opera')) {
      return 'Opera';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      return 'Safari';
    } else {
      return 'Unknown';
    }
  };

  /**
   * JS DATE 物件 加減天數
   * @param {Date} date
   * @param {Int} days
   * @returns Date
   */
  addDays = (date, days) => {
    var result = new Date(date);
    result.setDate(result.getDate() + days);

    return result;
  };
}

const commonService = new CommonService();
const isValidDateString = commonService.isValidDateString;
const convertDateToString = commonService.convertDateToString;
const convertStringToDate = commonService.convertStringToDate;
const deepMerge = commonService.deepMerge;
const isValidPage = commonService.isValidPage;
const deepCopy = commonService.deepCopy;
const sendTabMessage = commonService.sendTabMessage;
const setStorage = commonService.setStorage;
const getStorage = commonService.getStorage;
const deleteStorage = commonService.deleteStorage;
const delay = commonService.delay;
const getBrowserType = commonService.getBrowserType;
const addDays = commonService.addDays;

export default new CommonService();

export { isValidDateString, convertDateToString, convertStringToDate, deepMerge, isValidPage, deepCopy, sendTabMessage, setStorage, getStorage, deleteStorage, delay, getBrowserType, addDays };
