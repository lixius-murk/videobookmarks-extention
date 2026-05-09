
//popup actions

const addNewBookmark = () => {};

const viewBookmarks = () => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currentTab = tabs[0];
    let videoId = null;

    if(currentTab.url.includes("youtube.com/watch")) {
      const queryParams = new URLSearchParams(currentTab.url.split("?")[1]);
      videoId = queryParams.get("v");
    }
    else if(currentTab.url.includes("disk.yandex.ru")) {
      videoId = currentTab.url.split("/d/")[1] || currentTab.url.split("/i/")[1];
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

const onPlay = e => {};

const onDelete = e => {
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    const currentTab = tabs[0];
    let videoId = null;

    if(currentTab.url.includes("youtube.com/watch")) {
      const queryParams = new URLSearchParams(currentTab.url.split("?")[1]);
      videoId = queryParams.get("v");
    }
    else if(currentTab.url.includes("disk.yandex.ru")) {
      videoId = currentTab.url.split("/d/")[1] || currentTab.url.split("/i/")[1];
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
  viewBookmarks();

  document.getElementById("bookmarks").addEventListener("click", (e) => {
    if(e.target.classList.contains("delete-btn")) {
      onDelete(e);
    }
  });
});
