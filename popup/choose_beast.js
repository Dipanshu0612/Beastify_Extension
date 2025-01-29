const hidePage = `body > :not(.beastify-image) {
  display: none;
}`;

var browser = chrome;

function listenForClicks() {
  document.addEventListener("click", (e) => {
    function beastNameToURL(beastName) {
      switch (beastName) {
        case "Frog":
          return chrome.runtime.getURL("beasts/frog.jpg");
        case "Snake":
          return chrome.runtime.getURL("beasts/snake.jpg");
        case "Turtle":
          return chrome.runtime.getURL("beasts/turtle.jpg");
      }
    }

    function beastify(tabs) {
      chrome.scripting
        .insertCSS({
          target: { tabId: tabs[0].id },
          css: hidePage,
        })
        .then(() => {
          const url = beastNameToURL(e.target.textContent);
          chrome.tabs.sendMessage(tabs[0].id, {
            command: "beastify",
            beastURL: url,
          });
        });
    }

    function reset(tabs) {
      chrome.scripting
        .removeCSS({
          target: { tabId: tabs[0].id },
          css: hidePage,
        })
        .then(() => {
          chrome.tabs.sendMessage(tabs[0].id, {
            command: "reset",
          });
        });
    }

    function reportError(error) {
      console.error(`Could not beastify: ${error}`);
    }

    if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
      return;
    }

    if (e.target.type === "reset") {
      chrome.tabs
        .query({ active: true, currentWindow: true })
        .then(reset)
        .catch(reportError);
    } else {
      chrome.tabs
        .query({ active: true, currentWindow: true })
        .then(beastify)
        .catch(reportError);
    }
  });
}

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const tabId = tabs[0].id;

  chrome.scripting
    .executeScript({
      target: { tabId: tabId },
      files: ["content_scripts/beastify.js"],
    })
    .then(listenForClicks)
    .catch((err) => {
      document.querySelector("#popup-content").classList.add("hidden");
      document.querySelector("#error-content").classList.remove("hidden");
      console.error(
        `Failed to execute beastify content script: ${err.message}`
      );
    });
});
