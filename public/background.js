chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed')
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'setStorage') {
    chrome.storage.local.set(message.obj, () => {
      sendResponse({ status: 'success', message: 'Data saved' })
    })
    return true
  }
  if (message.action === 'getStorage') {
    chrome.storage.local.get(message.key, (result) => {
      sendResponse({ status: 'success', message: result[message.key] })
    })
    return true
  }
})
