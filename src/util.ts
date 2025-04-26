/// <reference types="chrome"/>

import { COLORS } from "./const";

export function isTargetPage(host: string, allowedDomains: string[]): boolean {
  if (allowedDomains.length > 0 && !allowedDomains.includes(host)) {
    return false;
  }
  return /^\/[^\/]+\/[^\/]+\/(?:issues|pull)\/\d+/.test(
    window.location.pathname
  );
}

export function findLoadButtons(pattern: RegExp): HTMLButtonElement[] {
  console.log("[AllComments] Finding load buttons...");
  return Array.from(document.querySelectorAll("button")).filter((btn) => {
    const t = btn.textContent?.trim();
    return t !== undefined && pattern.test(t);
  }) as HTMLButtonElement[];
}

export function hasHiddenItemsIndicator(pattern: RegExp): boolean {
  return Array.from(document.querySelectorAll("span, div")).some((el) => {
    const txt = el.textContent?.trim();
    return txt !== undefined && pattern.test(txt);
  });
}

export function insertSpinnerStyles(): void {
  if (!document.getElementById("gh-spinner-style")) {
    const style = document.createElement("style");
    style.id = "gh-spinner-style";
    style.textContent = `
      @keyframes gh-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .gh-spinner {
        display: inline-block;
        width: 12px;
        height: 12px;
        margin-right: 8px;
        border: 2px solid #fff;
        border-top: 2px solid transparent;
        border-radius: 50%;
        animation: gh-spin 1s linear infinite;
        vertical-align: middle;
      }
    `;
    document.head.appendChild(style);
  }
}

export function showLoadingToast(
  message: string = "Loading comments..."
): void {
  insertSpinnerStyles();
  let toast = document.getElementById(
    "gh-unhider-loading-toast"
  ) as HTMLDivElement | null;
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "gh-unhider-loading-toast";
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      background: COLORS.info,
      color: "#fff",
      padding: "8px 16px",
      borderRadius: "4px",
      zIndex: 10000,
      fontSize: "14px",
    });
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<span class="gh-spinner"></span>${message}`;
  toast.style.opacity = "1";
}

export function hideLoadingToast(): void {
  const toast = document.getElementById("gh-unhider-loading-toast");
  if (toast) toast.remove();
}

export function showToast(
  message: string,
  type: "info" | "success" | "warning" | "error" = "info"
): void {
  let toast = document.getElementById(
    "gh-unhider-toast"
  ) as HTMLDivElement | null;
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "gh-unhider-toast";
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      background: COLORS[type],
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
    toast!.style.opacity = "0";
  }, 1500);
}

export function injectButton(onClick: () => void): void {
  if (document.getElementById("gh-unhider-btn")) return;
  const btn = document.createElement("button");
  btn.id = "gh-unhider-btn";
  btn.textContent = "Show all comments";
  Object.assign(btn.style, {
    position: "fixed",
    bottom: "20px",
    left: "50%",
    transform: "translateX(-50%)",
    background: COLORS.success,
    color: "#fff",
    padding: "8px 16px",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    zIndex: 10000,
    boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
  });
  btn.addEventListener("click", onClick);
  document.body.appendChild(btn);
}
