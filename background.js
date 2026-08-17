chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if(changeInfo.status !== "complete" || !tab.url) return;

    const sendMessageWithRetry = (tabId, message, retries = 3) => {
        chrome.tabs.sendMessage(tabId, message, (response) => {
            if (chrome.runtime.lastError) {
                if (retries > 0) {
                    setTimeout(() => {
                        sendMessageWithRetry(tabId, message, retries - 1);
                    }, 500);
                }
            }
        });
    };

    let videoId = null;
    let source = null;
    
    if(tab.url.includes("youtube.com/watch")) {
        const urlParams = new URLSearchParams(new URL(tab.url).search);
        videoId = urlParams.get("v");
        source = "youtube";
    } else if(tab.url.includes("disk.yandex.ru") || tab.url.includes("disk.yandex.com")) {
        const urlParams = new URLSearchParams(new URL(tab.url).search);
        videoId = urlParams.get("idDialog");
        if(!videoId) {
            videoId = tab.url.split("/d/")[1] || tab.url.split("/i/")[1];
        }
        if(videoId) {
            videoId = videoId.replace(/^%2Fdisk%2F/, '').split('/').pop();
        }
        source = "yandexDisk";
    }
    
    if(videoId && source) {
        setTimeout(() => {
            sendMessageWithRetry(tabId, {
                source: source,
                type: "NEW",
                videoId: videoId
            });
        }, 1500);
    }
});