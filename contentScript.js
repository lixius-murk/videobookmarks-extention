
const getTime = t => {
    const seconds = Math.floor(t);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
}
(() => {
    let youtubeLeftControls = " ", youtubePlayer = " ";
    let yandexLeftControls = " ", yandexPlayer = " ";
    let currVideo = "";
    let currBookmarks = [];
    let videoSource = "youtube";
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const {type, val, videoId, source} = obj;
        if(type == "NEW") {
            videoSource = source;
            currVideo = videoId;
            newVideoLoaded();
        }

    });


    newVideoLoaded = () => {
        const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
        if(!bookmarkBtnExists) {
            const bookmarkBtn = document.createElement("img");
            bookmarkBtn.src = chrome.runtime.getURL("assets/bookmark.png");
            bookmarkBtn.className = "bookmark-btn";
            bookmarkBtn.title = "Click to bookmark current timestamp";
            
            switch(videoSource) {
                case "youtube":
            const waitForPlayer = setInterval(() => {
                    youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
                    youtubePlayer = document.getElementsByClassName("video-stream")[0];
                    
                    if(youtubeLeftControls && youtubePlayer) {
                        clearInterval(waitForPlayer);
                        youtubeLeftControls.appendChild(bookmarkBtn);
                        bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
                        console.log("YouTube player found, bookmark button added");
                    }
                }, 500);
                
                setTimeout(() => clearInterval(waitForPlayer), 10000);
                break;

                // youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
                    // youtubePlayer = document.getElementsByClassName("video-stream")[0];
                    // youtubeLeftControls.appendChild(bookmarkBtn);
                    // bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
                    // break;
                case "yandexDisk":
                    yandexPlayer = document.querySelector("video");
                    const selectors = [".video-controls", ".controls", ".player-controls", 
                    "[class*='control']", "[role='slider']", "video"];
                    selectors.forEach(selector => {
                        const elem = document.querySelector(selector);
                        if(elem) {
                            console.log(`Found: ${selector}`, elem);
                        yandexLeftControls = elem;}
                    });

                    yandexLeftControls.appendChild(bookmarkBtn);
                    bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);
                    break;
            }
        }
    };
    const addNewBookmarkEventHandler = () => {
        currentTime = youtubePlayer.currentTime;
        if(!currentTime){
            currentTime = yandexPlayer.currentTime;
        }
        const newBookmark = {
            time: currentTime,
            desc: "Bookmark at " + getTime(currentTime),
        };
        console.log(newBookmark);
        //using spread operator to insert new bookmark
        const updatedBookmarks = [...currBookmarks, newBookmark].sort((a, b) => a.time - b.time);

        chrome.storage.sync.set({
            [currVideo]: JSON.stringify(updatedBookmarks)
        }, () => {
            currBookmarks = updatedBookmarks;
            console.log("Bookmark saved!");

        });
    }
    newVideoLoaded();
})();


