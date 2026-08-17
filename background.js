  //v=VIDEO_ID query parameter
  //Yandex Disk: /d/FILE_ID/FILENAME.mp4 or /i/FILE_ID/FILENAME.mp4

// background.js
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.status !== "complete" || !tab.url) return;

    const sendMessageWithRetry = (tabId, message, retries = 3) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                if (retries > 0) {
                    console.log(`Retrying message (${retries} left)...`);
                    setTimeout(() => {
                        sendMessageWithRetry(tabId, message, retries - 1);
                    }, 500);
                } else {
                    console.error("Failed to send message after retries:", chrome.runtime.lastError);
                }
            } else {
                console.log("Message sent successfully:", message);
            }
        });
    };

    let videoId = null;
    let source = null;
    
    if(tab.url.includes("youtube.com/watch")) {
        const urlParams = new URLSearchParams(new URL(tab.url).search);
        videoId = urlParams.get("v");
        source = "youtube";
    } else if(tab.url.includes("disk.yandex.ru")) {
        videoId = tab.url.split("/d/")[1] || tab.url.split("/i/")[1];
        source = "yandexDisk";
    }
    
    if(videoId && source) {
        setTimeout(() => {
            sendMessageWithRetry(tabId, {
                source: source,
                type: "NEW",
                videoId: videoId
            });
        }, 500); 
    }
});