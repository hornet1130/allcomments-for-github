(function () {
  // Configurable settings (will be overridden)
  let allowedDomains = [];
  let INTERVAL_MS = 2000;
  let MAX_ATTEMPTS = 20;
  let findLoadButtonsRegex =
    /Load more|Show more replies|Show \d+ more replies/i;
  let hiddenItemsRegex = /\d+\s+(remaining|hidden)\s+(items|replies|comments)/i;

  // Load settings from storage
  chrome.storage.sync.get(
    {
      allowedDomains: [],
      intervalMs: INTERVAL_MS,
      maxAttempts: MAX_ATTEMPTS,
      loadButtonsPattern: findLoadButtonsRegex.source,
      hiddenItemsPattern: hiddenItemsRegex.source,
    },
    (settings) => {
      allowedDomains = settings.allowedDomains;
      INTERVAL_MS = Number(settings.intervalMs);
      MAX_ATTEMPTS = Number(settings.maxAttempts);
      findLoadButtonsRegex = new RegExp(settings.loadButtonsPattern, "i");
      hiddenItemsRegex = new RegExp(settings.hiddenItemsPattern, "i");
      init(); // initialize after loading settings
    }
  );

  // Persistent loading toast functions
  function showLoadingToast() {
    let toast = document.getElementById("gh-unhider-loading-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "gh-unhider-loading-toast";
      Object.assign(toast.style, {
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.7)",
        color: "#fff",
        padding: "8px 16px",
        borderRadius: "4px",
        zIndex: 10000,
        fontSize: "14px",
      });
      document.body.appendChild(toast);
    }
    toast.textContent = "Loading comments...";
    toast.style.opacity = "1";
  }

  function hideLoadingToast() {
    const toast = document.getElementById("gh-unhider-loading-toast");
    if (toast) {
      toast.remove();
    }
  }

  let attempts = 0;
  let timer = null;

  // 1) Check if current page is a GitHub issue page
  function isGithubIssuePage() {
    const host = window.location.host;
    if (allowedDomains.length > 0 && !allowedDomains.includes(host))
      return false;
    return /^\/[^\/]+\/[^\/]+\/issues\/\d+/.test(window.location.pathname);
  }

  // 2) Toast display function
  function showToast(message) {
    let toast = document.getElementById("gh-unhider-toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.id = "gh-unhider-toast";
      Object.assign(toast.style, {
        position: "fixed",
        bottom: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        background: "rgba(0,0,0,0.7)",
        color: "#fff",
        padding: "8px 16px",
        borderRadius: "4px",
        zIndex: 10000,
        fontSize: "14px",
        opacity: "0",
        transition: "opacity 0.3s",
      });
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.style.opacity = "1";
    setTimeout(() => {
      toast.style.opacity = "0";
    }, 1500);
  }

  // 3) Inject floating "Show all comments" button
  function injectButton() {
    if (document.getElementById("gh-unhider-btn")) return;
    const btn = document.createElement("button");
    btn.id = "gh-unhider-btn";
    btn.textContent = "Show all comments";
    Object.assign(btn.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      padding: "10px 14px",
      background: "#2ea44f",
      color: "#fff",
      border: "none",
      borderRadius: "6px",
      cursor: "pointer",
      zIndex: 10000,
      boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
    });
    btn.addEventListener("click", startLoading);
    document.body.appendChild(btn);
  }

  // 4) Find "Load more..." buttons
  function findLoadButtons() {
    console.log("Finding load buttons...");
    return Array.from(document.querySelectorAll("button")).filter((btn) => {
      const t = btn.textContent?.trim();
      return t && findLoadButtonsRegex.test(t);
    });
  }

  // 5a) Check for hidden comments indicator (any adjacent indicator)
  function hasHiddenItemsIndicator() {
    return Array.from(document.querySelectorAll("span, div")).some((el) => {
      const txt = el.textContent?.trim();
      return txt && hiddenItemsRegex.test(txt);
    });
  }

  // 5) Attempt to load comments
  function clickAll() {
    // showToast("Loading comments...");
    if (attempts >= MAX_ATTEMPTS) {
      clearInterval(timer);
      hideLoadingToast();
      showToast("Reached maximum attempts.");
      return;
    }
    const buttons = findLoadButtons();
    if (buttons.length === 0) {
      // 버튼이 없지만 남은 숨김 개수가 있으면 재시도
      const hiddenItems = hasHiddenItemsIndicator();
      console.log("Hidden items indicator:", hiddenItems);
      if (hasHiddenItemsIndicator()) {
        console.log("[Unhider] 아직 숨겨진 코멘트가 남아있어 재시도합니다.");
        return;
      }
      clearInterval(timer);
      hideLoadingToast();
      showToast("All comments loaded!");
      return;
    }
    // 버튼이 있으면 클릭
    buttons.forEach((btn) => btn.click());
    attempts++;
  }

  // 6) Start loading
  function startLoading() {
    if (timer) return; // 중복 실행 방지
    const btn = document.getElementById("gh-unhider-btn");
    if (btn) btn.style.display = "none";
    showLoadingToast();
    attempts = 0;
    timer = setInterval(clickAll, INTERVAL_MS);
  }

  // 7) Insert button after verifying page
  function init() {
    if (!isGithubIssuePage()) return;
    injectButton();
  }

  // Handle SPA navigation
  let lastPath = location.pathname;
  new MutationObserver(() => {
    if (location.pathname !== lastPath) {
      lastPath = location.pathname;
      init();
    }
  }).observe(document.body, { childList: true, subtree: true });

  // Initial execution (on page load)
  window.addEventListener("load", init);
})();
