(() => {
    let youtubeLeftControls, youtubePlayer;
    let yandexLeftControls, yandexPlayer;
    let currVideo = "";
    let currBookmarks = [];
    let videoSource = "youtube";
    let intervalId = null;

    const getYandexId = () => {
        const url = window.location.href;
        const urlParams = new URLSearchParams(new URL(url).search);
        let id = urlParams.get("idDialog");
        if(!id) {
            id = url.split("/d/")[1] || url.split("/i/")[1];
        }
        if(id) {
            id = id.replace(/^%2Fdisk%2F/, '').split('/').pop();
        }
        return id;
    };

    const selfInitialize = () => {
        const url = window.location.href;
        if(url.includes("disk.yandex.ru") || url.includes("disk.yandex.com")) {
            const videoId = getYandexId();
            if(videoId && !currVideo) {
                videoSource = "yandexDisk";
                currVideo = videoId;
                chrome.storage.sync.get([currVideo], (result) => {
                    currBookmarks = result[currVideo] ? JSON.parse(result[currVideo]) : [];
                    setTimeout(newVideoLoaded, 2000);
                });
            }
        }
    };

    setTimeout(selfInitialize, 1000);

    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const {type, val, videoId, source} = obj;
        if(type == "NEW") {
            videoSource = source;
            currVideo = videoId;
            chrome.storage.sync.get([currVideo], (result) => {
                currBookmarks = result[currVideo] ? JSON.parse(result[currVideo]) : [];
                newVideoLoaded();
            });
        }
        else if(type === "PING") {
            response({status: "alive"});
            return true;
        }
        else if(type == "SEEK") {
            const video = document.querySelector("video");
            if(video) {
                video.currentTime = obj.time;
                response({success: true});
            } else {
                response({success: false, error: "Video not found"});
            }
        }
        return true;
    });

    newVideoLoaded = () => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        if(!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img");
            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";
            bookmarkBtn.style.width = "24px";
            bookmarkBtn.style.height = "24px";
            bookmarkBtn.style.cursor = "pointer";
            
            switch(videoSource) {
                case "youtube":
                    const tryYoutube = () => {
                        youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
                        youtubePlayer = document.getElementsByClassName("video-stream")[0];
                        
                        if(youtubeLeftControls && youtubePlayer && !document.querySelector(".bookmark-btn")) {
                            youtubeLeftControls.appendChild(bookmarkBtn);
                            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
                            if(intervalId) clearInterval(intervalId);
                            return true;
                        }
                        return false;
                    };
                    
                    if(!tryYoutube()) {
                        intervalId = setInterval(tryYoutube, 500);
                        setTimeout(() => {
                            if(intervalId) clearInterval(intervalId);
                        }, 10000);
                    }
                    break;
                    
                case "yandexDisk":
                    const tryYandex = () => {
                        yandexPlayer = document.querySelector("video");
                        yandexLeftControls = document.getElementsByClassName("slider__toolbar-right")[0];
                        
                        if(yandexLeftControls && yandexPlayer && !document.querySelector(".bookmark-btn")) {
                            yandexLeftControls.insertBefore(bookmarkBtn, yandexLeftControls.firstChild);
                            bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
                            if(intervalId) clearInterval(intervalId);
                            return true;
                        }
                        return false;
                    };
                    
                    if(!tryYandex()) {
                        intervalId = setInterval(tryYandex, 500);
                        setTimeout(() => {
                            if(intervalId) clearInterval(intervalId);
                        }, 15000);
                    }
                    break;
            }
        }
    };
    
    const addNewBookmarkEventHandler = () => {
        let currentTime = youtubePlayer?.currentTime;
        if(!currentTime) {
            const video = document.querySelector("video");
            if(video) currentTime = video.currentTime;
        }
        
        if(!currentTime) {
            return;
        }
        
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
        };
        
        const updatedBookmarks = [...currBookmarks, newBookmark].sort((a, b) => a.time - b.time);
        
        chrome.storage.sync.set({
            [currVideo]: JSON.stringify(updatedBookmarks)
        }, () => {
            currBookmarks = updatedBookmarks;
        });
    }

    const getTime = (t) => {
        const hours = Math.floor(t / 3600);
        const minutes = Math.floor((t % 3600) / 60);
        const seconds = Math.floor(t % 60);
        
        if(hours > 0) {
            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else {
            return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    };
})();