/// <reference types="chrome"/>
import {
  DEFAULT_ALLOWED_DOMAINS,
  DEFAULT_INTERVAL_MS,
  DEFAULT_MAX_ATTEMPTS,
  DEFAULT_LOAD_PATTERN,
  DEFAULT_HIDDEN_PATTERN,
  isDev,
} from "./const";

import {
  isTargetPage,
  findLoadButtons,
  hasHiddenItemsIndicator,
  showLoadingToast,
  hideLoadingToast,
  showToast,
  injectButton,
} from "./util";

if (isDev) {
  // Debug: wrap addEventListener to log all events on window and document
  (function () {
    const originalAdd = EventTarget.prototype.addEventListener;
    EventTarget.prototype.addEventListener = function (
      type: string,
      listener: EventListenerOrEventListenerObject,
      options?: boolean | AddEventListenerOptions
    ) {
      const wrapped = function (this: any, event: Event) {
        console.log(
          `[DEBUG] ${
            this === window
              ? "window"
              : this === document
              ? "document"
              : this.constructor.name
          } event:`,
          type,
          event
        );
        if (typeof listener === "function") {
          return listener.call(this, event);
        } else {
          return (listener.handleEvent as EventListener).call(this, event);
        }
      };
      return originalAdd.call(this, type, wrapped, options);
    };
  })();
}

(function () {
  // Initialize settings
  chrome.storage.sync.get(
    {
      allowedDomains: DEFAULT_ALLOWED_DOMAINS,
      intervalMs: DEFAULT_INTERVAL_MS,
      maxAttempts: DEFAULT_MAX_ATTEMPTS,
      loadButtonsPattern: DEFAULT_LOAD_PATTERN,
      hiddenItemsPattern: DEFAULT_HIDDEN_PATTERN,
    },
    (settings) => {
      const allowedDomains: string[] = settings.allowedDomains;
      const INTERVAL_MS: number = Number(settings.intervalMs);
      const MAX_ATTEMPTS: number = Number(settings.maxAttempts);
      const findLoadButtonsRegex = new RegExp(settings.loadButtonsPattern, "i");
      const hiddenItemsRegex = new RegExp(settings.hiddenItemsPattern, "i");
      init(
        allowedDomains,
        INTERVAL_MS,
        MAX_ATTEMPTS,
        findLoadButtonsRegex,
        hiddenItemsRegex
      );
    }
  );

  // Implementation details moved to util.ts; internal init defined below
  function init(
    allowedDomains: string[],
    INTERVAL_MS: number,
    MAX_ATTEMPTS: number,
    findLoadButtonsRegex: RegExp,
    hiddenItemsRegex: RegExp
  ): void {
    let attempts = 0;
    let timer: number | null = null;

    function clickAll(): void {
      if (attempts >= MAX_ATTEMPTS) {
        if (timer !== null) {
          clearInterval(timer);
          timer = null;
        }
        hideLoadingToast();
        showToast("Reached maximum attempts.", "error");
        return;
      }
      const buttons = findLoadButtons(findLoadButtonsRegex);
      if (buttons.length === 0) {
        if (hasHiddenItemsIndicator(hiddenItemsRegex)) {
          console.log("[AllComments] Hidden comments remain, retrying...");
          return;
        }
        if (timer !== null) {
          clearInterval(timer);
          timer = null;
        }
        hideLoadingToast();
        showToast("All comments loaded!", "success");
        return;
      }
      buttons.forEach((btn) => btn.click());
      attempts++;
    }

    function startLoading(): void {
      if (timer !== null) return; // Prevent duplicate execution
      const btn = document.getElementById("gh-unhider-btn");
      if (btn) btn.style.display = "none";
      showLoadingToast();
      attempts = 0;
      clickAll();
      timer = window.setInterval(clickAll, INTERVAL_MS);
    }

    const onPageLoadOrNavigate = (function () {
      let timeoutId: number | null = null;

      return function (): void {
        if (timeoutId) {
          window.clearTimeout(timeoutId);
        }

        timeoutId = window.setTimeout(() => {
          console.log("[AllComments] Checking if page is a target page...");
          if (
            isTargetPage(window.location.host, allowedDomains) &&
            findLoadButtons(findLoadButtonsRegex).length > 0
          ) {
            injectButton(startLoading);
          } else {
            const btn = document.getElementById("gh-unhider-btn");
            if (btn) {
              console.log("[AllComments] Removing button...");
              btn.remove();
            }
          }
          timeoutId = null;
        }, 300);
      };
    })();

    // Handle SPA navigation via History API and popstate
    (function () {
      window.addEventListener("popstate", onPageLoadOrNavigate);
      document.addEventListener("turbo:load", onPageLoadOrNavigate);
      document.addEventListener("soft-nav:end", onPageLoadOrNavigate);

      onPageLoadOrNavigate();
    })();
  }
})();
