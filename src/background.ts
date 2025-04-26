/// <reference types="chrome"/>

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});
