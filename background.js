console.log("from bg");
chrome.tabs.onActivated.addListener((tab) => {
  console.log(tab);
  chrome.tabs.get(tab.tabId, (current_tab_info) => {
    chrome.tabs.executeScript(
      null,
      {
        file: "./foreground.js",
      },
      () => console.log("i injected")
    );
  });
});
