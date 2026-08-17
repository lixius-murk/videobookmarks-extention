(() => {
    let youtubeLeftControls, youtubePlayer;
    let yandexLeftControls, yandexPlayer;
    let currVideo = "";
    let currBookmarks = [];
    let videoSource = "youtube";
    let intervalId = null; 
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
            console.log("PING received, responding");
            response({status: "alive"});
            return true;
        }
        else if(type == "SEEK") {
             console.log("SEEK message received:", obj);
            if(source === "youtube") {
            const video = document.querySelector("video");
            if(video) {
                video.currentTime = obj.time;
                console.log(`YouTube video seeked to ${time} seconds`);
                response({success: true});
            } else {
                console.error("YouTube video element not found");
                response({success: false, error: "Video not found"});
            }
            }
            else if(source === "yandexDisk") {
            const video = document.querySelector("video");
            if(video) {
                video.currentTime = obj.time;
                console.log(`Yandex video seeked to ${time} seconds`);
                response({success: true});
            } else {
                console.error("Yandex video element not found");
                response({success: false, error: "Video not found"});
            }
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
                        yandexLeftControls = document.getElementsByClassName("bottom-toolbar")[0];
                        
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
                        }, 10000);
                    }
                    break;
            }
        }
    };
    
    const addNewBookmarkEventHandler = () => {
        let currentTime = youtubePlayer?.currentTime;
        if(!currentTime && yandexPlayer){
            currentTime = yandexPlayer.currentTime;
        }
        
        if(!currentTime) {
            console.error("Could not get current video time");
            return;
        }
        
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
        }; 
        //using spread operator to insert new bookmark
        const updatedBookmarks = [...currBookmarks, newBookmark].sort((a, b) => a.time - b.time);
        
        chrome.storage.sync.set({
            [currVideo]: JSON.stringify(updatedBookmarks)}, () => {
            currBookmarks = updatedBookmarks;
            console.log("Bookmark saved:", newBookmark);
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
    const goToTime = (t) =>{
            switch(videoSource) {
                case "youtube":
                    if (youtubePlayer.getCurrentTime() != t){
                        youtubePlayer.currentTime = t;
                    }

                    break;
                    
                case "yandexDisk":
                    if (yandexPlayer.getCurrentTime() != t){
                        yandexPlayer.currentTime = t;
                    }       
                    break;
            }
        }

})();