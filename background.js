chrome.tabs.onUpdated.addListener((tabId, tab) => {

  //v=VIDEO_ID query parameter
  //Yandex Disk: /d/FILE_ID/FILENAME.mp4 or /i/FILE_ID/FILENAME.mp4
  
  if(tab.url) {
    if(tab.url.includes("youtube.com/watch")) {
      const queryParams = new URLSearchParams(tab.url.split("?")[1]);
      const urlParams = new URLSearchParams(queryParams);
      chrome.tabs.sendMessage(tabId, {
        source: "youtube",
        type: "NEW",
        videoId: urlParams.get("v")
      });
    }

    if(tab.url.includes("disk.yandex.ru")) {
      const videoPath = tab.url.split("/d/")[1];
      if(!videoPath) videoPath = tab.url.split("/i/")[1];
      chrome.tabs.sendMessage(tabId, {
        source: "yandexDisk",
        type: "NEW",
        videoId: videoPath
      });
    }
  }

});