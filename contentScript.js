
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
})();


// const getTime = t => {
//     const seconds = Math.floor(t);
//     const minutes = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${minutes}:${secs.toString().padStart(2, "0")}`;
// }
// (() => {
//     let youtubeLeftControls = " ", youtubePlayer = " ";
//     let yandexLeftControls = " ", yandexPlayer = " ";
//     let currVideo = "";
//     let currBookmarks = [];
//     let videoSource = "youtube";
//     chrome.runtime.onMessage.addListener((obj, sender, response) => {
//         const {type, val, videoId, source} = obj;
//         if(type == "NEW") {
//             videoSource = source;
//             currVideo = videoId;
//             newVideoLoaded();
//         }

//     });


//     newVideoLoaded = () => {
//         const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
//         if(!bookmarkBtnExists) {
//             const bookmarkBtn = document.createElement("img");
//             bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
//             bookmarkBtn.className = "bookmark-btn";
//             bookmarkBtn.title = "Click to bookmark current timestamp";
            
//             switch(videoSource) {
//                 case "youtube":
//             const waitForPlayer = setInterval(() => {
//                     youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
//                     youtubePlayer = document.getElementsByClassName("video-stream")[0];
                    
//                     if(youtubeLeftControls && youtubePlayer) {
//                         clearInterval(waitForPlayer);
//                         youtubeLeftControls.appendChild(bookmarkBtn);
//                         bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
//                         console.log("YouTube player found, bookmark button added");
//                     }
//                 }, 500);
                
//                 setTimeout(() => clearInterval(waitForPlayer), 10000);
//                 break;

//                 // youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
//                     // youtubePlayer = document.getElementsByClassName("video-stream")[0];
//                     // youtubeLeftControls.appendChild(bookmarkBtn);
//                     // bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
//                     // break;
//             case "yandexDisk":
//                 yandexPlayer = document.querySelector("video");
                
//                 // Use the class you found
//                 yandexLeftControls = document.getElementsByClassName("bottom-toolbar")[0];
                
//                 if(yandexLeftControls && yandexPlayer) {
//                     yandexLeftControls.appendChild(bookmarkBtn);
//                     bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
//                     console.log("Yandex bookmark button added to bottom-toolbar");
//                 } else {
//                     // Fallback: wait for elements to load
//                     const waitForElements = setInterval(() => {
//                         yandexPlayer = document.querySelector("video");
//                         yandexLeftControls = document.getElementsByClassName("bottom-toolbar")[0];
                        
//                         if(yandexLeftControls && yandexPlayer) {
//                             clearInterval(waitForElements);
//                             yandexLeftControls.appendChild(bookmarkBtn);
//                             bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
//                             console.log("Yandex bookmark button added (delayed)");
//                         }
//                     }, 500);
                    
//                     setTimeout(() => clearInterval(waitForElements), 10000);
//                 }
//                 break;
//             }
//         }
//     };
//     const addNewBookmarkEventHandler = () => {
//         currentTime = youtubePlayer.currentTime;
//         if(!currentTime){
//             currentTime = yandexPlayer.currentTime;
//         }
//         const newBookmark = {
//             time: currentTime,
//             desc: "Bookmark at " + getTime(currentTime),
//         };
//         console.log(newBookmark);
//         //using spread operator to insert new bookmark
//         const updatedBookmarks = [...currBookmarks, newBookmark].sort((a, b) => a.time - b.time);

//         chrome.storage.sync.set({
//             [currVideo]: JSON.stringify(updatedBookmarks)
//         }, () => {
//             currBookmarks = updatedBookmarks;
//             console.log("Bookmark saved!");

//         });
//     }
//     newVideoLoaded();
// })();


