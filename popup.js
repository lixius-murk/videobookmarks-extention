
//popup actions

const addNewBookmark = () => {};

const viewBookmarks = () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currTab = tabs[0];
    let videoId = null;

    if(currTab.url.includes("youtube.com/watch")) {
      const queryParams = new URLSearchParams(currTab.url.split("?")[1]);
      videoId = queryParams.get("v");
    }
    else if(currTab.url.includes("disk.yandex.ru")) {
      videoId = currTab.url.split("/d/")[1] || currTab.url.split("/i/")[1];
    }

    if(!videoId) return;

    chrome.storage.sync.get([videoId], (result) => {
      const bookmarksJson = result[videoId];
      const bookmarks = bookmarksJson ? JSON.parse(bookmarksJson) : [];
      
      const bookmarksContainer = document.getElementById("bookmarks");
      bookmarksContainer.innerHTML = "";

      if(bookmarks.length === 0) {
        bookmarksContainer.innerHTML = "<p>No bookmarks yet</p>";
        return;
      }

      bookmarks.forEach((bookmark, index) => {
        const bookmarkElement = document.createElement("div");
        bookmarkElement.className = "bookmark";
        
        const time = Math.floor(bookmark.time);
        const minutes = Math.floor(time / 60);
        const seconds = time % 60;
        const timeStr = `${minutes}:${seconds.toString().padStart(2, "0")}`;

        bookmarkElement.innerHTML = `
          <span class="bookmark-time">${timeStr}</span>
          <span class="bookmark-desc">${bookmark.desc}</span>
          <button class="delete-btn" data-index="${index}">Delete</button>
        `;

        bookmarksContainer.appendChild(bookmarkElement);
      });
    });
  });
};

const onPlay = e => {
  const bookmarkEl = e.target.closest('.bookmark');
  if(!bookmarkEl) return;
  const timeStr = bookmarkEl.querySelector('.bookmark-time').textContent;
  const [minutes, seconds] = timeStr.split(':').map(Number);
  const targetTime = minutes * 60 + seconds;

  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currTab = tabs[0];
    if(currTab.url.includes("youtube.com/watch")) {
      chrome.tabs.sendMessage(currTab.id, {
        type: "SEEK",
        time: targetTime,
        source: "youtube"
      }, (response) => {
        if(chrome.runtime.lastError) {
          console.error("Error sending seek message:", chrome.runtime.lastError);
        } else {
          console.log(`Seeking to ${targetTime} seconds on YouTube`);
        }
    }
    );
    }
    else if(currTab.url.includes("disk.yandex.ru")) {
      chrome.tabs.sendMessage(currTab.id, {
        type: "SEEK",
        time: targetTime,
        source: "yandexDisk"
      }, (response) => {
        if(chrome.runtime.lastError) {
          console.error("Error sending seek message:", chrome.runtime.lastError);
        } else {
          console.log(`Seeking to ${targetTime} seconds on Yandex Disk`);
        }
      });
    }

  })

};

const onDelete = e => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currTab = tabs[0];
    let videoId = null;

    if(currTab.url.includes("youtube.com/watch")) {
      const queryParams = new URLSearchParams(currTab.url.split("?")[1]);
      videoId = queryParams.get("v");
    }
    else if(currTab.url.includes("disk.yandex.ru")) {
      videoId = currTab.url.split("/d/")[1] || currTab.url.split("/i/")[1];
    }

    if(!videoId) return;

    const index = e.target.dataset.index;
    chrome.storage.sync.get([videoId], (result) => {
      const bookmarksJson = result[videoId];
      let bookmarks = bookmarksJson ? JSON.parse(bookmarksJson) : [];
      
      bookmarks.splice(index, 1);
      
      chrome.storage.sync.set({
        [videoId]: JSON.stringify(bookmarks)
      }, () => {
        viewBookmarks();
      });
    });
  });
};

const setBookmarkAttributes =  () => {};


document.addEventListener("DOMContentLoaded", () => {
    // Check if extension context is valid
    try {
        chrome.runtime.getManifest();
        viewBookmarks();
        
        document.getElementById("bookmarks").addEventListener("click", (e) => {
            if(e.target.classList.contains("delete-btn")) {
                onDelete(e);
            } else {
                onPlay(e);
            }
        });
    } catch (e) {
        console.error("Extension context invalidated, please reload the extension");
        document.getElementById("bookmarks").innerHTML = "<p>Please reload the extension</p>";
    }
});

