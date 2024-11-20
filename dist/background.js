const _optionsData = {
  defaultOpenMode: 'popup',
  tempOpenMode: '',
  restTime: { workOn: 510, lunch: [710, 800], workOff: 1080, hideNotWorking: false, enableWorkOn: false, enableWorkOff: false, enableLunch: true }
};

chrome.action.onClicked.addListener(async (tab) => {
  const { optionsData } = await chrome.storage.local.get('optionsData');
  _optionsData.value = optionsData || _optionsData;

  switch (_optionsData.value.defaultOpenMode) {
    case 'newTab':
      chrome.tabs.create({
        url: chrome.runtime.getURL('index.html')
      });
      break;
    case 'newWindow':
      openInNewWindow();
      break;
    case 'newWindow_maximized':
      openInNewWindow(undefined, undefined, true);
      break;
    case 'popup':
    default:
      chrome.action.setPopup({ popup: 'index.html' });
      chrome.action.openPopup();
      break;
  }
});

function openInNewWindow(width = 800, height = 600, maximized = false) {
  const windowOptions = {
    url: chrome.runtime.getURL('index.html'),
    type: 'popup'
  };

  if (maximized) {
    windowOptions.state = 'maximized';
  } else {
    windowOptions.width = width;
    windowOptions.height = height;
  }

  chrome.windows.create(windowOptions);
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'setStorage') {
    chrome.storage.local.set(message.obj, () => {

      // 側邊欄開啟 設定方法不同
      if (Object.keys(message.obj)[0] == 'optionsData' && message.obj?.optionsData.defaultOpenMode == 'sidePanel') {
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
      } else {
        chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false });
      }

      sendResponse({ status: 'success', message: 'storage儲存成功' });
    });

    return true;
  }

  if (message.action === 'getStorage') {
    chrome.storage.local.get(message.key, (result) => {
      sendResponse({ status: 'success', message: result[message.key] });
    });

    return true;
  }

  if (message.action === 'deleteStorage') {
    chrome.storage.local.remove(message.keys, () => {
      sendResponse({ status: 'success', message: 'storage刪除成功' });
    });

    return true;
  }
});
