const intervalInput = document.getElementById("interval");
const attemptsInput = document.getElementById("attempts");
const loadPatternInput = document.getElementById("loadPattern");
const hiddenPatternInput = document.getElementById("hiddenPattern");
const saveBtn = document.getElementById("save");
const statusMessage = document.getElementById("statusMessage");
const resetBtn = document.getElementById("reset");

const defaults = {
  // Default allowed domains include GitHub.com and internal ABC domain
  allowedDomains: ["github.com"],
  intervalMs: 2000,
  maxAttempts: 20,
  loadButtonsPattern: "Load more|Show more replies|Show \\d+ more replies",
  hiddenItemsPattern: "\\d+\\s+(remaining|hidden)\\s+(items|replies|comments)",
};

document.addEventListener("DOMContentLoaded", () => {
  let domains = [];
  const domainInput = document.getElementById("domainInput");
  const addDomainBtn = document.getElementById("addDomain");
  const domainListEl = document.getElementById("domainList");

  const domainPattern =
    /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

  function renderDomainList() {
    domainListEl.innerHTML = "";
    domains.forEach((d, i) => {
      const li = document.createElement("li");
      li.textContent = d;
      if (!defaults.allowedDomains.includes(d)) {
        const rm = document.createElement("button");
        rm.textContent = "x";
        rm.className = "remove-btn";
        rm.style.marginLeft = "8px";
        rm.addEventListener("click", () => {
          domains.splice(i, 1);
          renderDomainList();
        });
        li.appendChild(rm);
      }
      domainListEl.appendChild(li);
    });
  }

  // Load settings and populate fields
  chrome.storage.sync.get(defaults, (settings) => {
    domains = settings.allowedDomains;
    // Ensure GitHub.com is always included
    if (!domains.includes("github.com")) {
      domains.unshift("github.com");
    }
    renderDomainList();
    intervalInput.value = settings.intervalMs;
    attemptsInput.value = settings.maxAttempts;
    loadPatternInput.value = settings.loadButtonsPattern;
    hiddenPatternInput.value = settings.hiddenItemsPattern;
  });

  // Save settings
  saveBtn.addEventListener("click", () => {
    if (domains.length === 0) {
      alert("Please add at least one domain.");
      return;
    }

    // Ensure GitHub.com remains as a required domain
    if (!domains.includes("github.com")) {
      domains.unshift("github.com");
    }

    const interval = parseInt(intervalInput.value, 10) || defaults.intervalMs;
    const attempts = parseInt(attemptsInput.value, 10) || defaults.maxAttempts;
    const loadPattern =
      loadPatternInput.value.trim() || defaults.loadButtonsPattern;
    const hiddenPattern =
      hiddenPatternInput.value.trim() || defaults.hiddenItemsPattern;

    if (isNaN(interval) || interval < 500 || interval > 3000) {
      alert("Interval must be between 500 and 3000 milliseconds.");
      return;
    }
    if (isNaN(attempts) || attempts < 1 || attempts > 20) {
      alert("Max attempts must be between 1 and 20.");
      return;
    }
    if (loadPattern.length > 100) {
      alert("Load Buttons Regex must be 100 characters or fewer.");
      return;
    }
    if (hiddenPattern.length > 100) {
      alert("Hidden Items Regex must be 100 characters or fewer.");
      return;
    }

    chrome.storage.sync.set(
      {
        allowedDomains: domains,
        intervalMs: interval,
        maxAttempts: attempts,
        loadButtonsPattern: loadPattern,
        hiddenItemsPattern: hiddenPattern,
      },
      () => {
        // Show confirmation message
        statusMessage.style.visibility = "visible";
        setTimeout(() => {
          statusMessage.style.visibility = "hidden";
        }, 1500);
      }
    );
  });

  // Add domain
  addDomainBtn.addEventListener("click", () => {
    const v = domainInput.value.trim();

    // Validate domain format
    if (!domainPattern.test(v)) {
      alert("Invalid domain format.");
      return;
    }

    if (v && !domains.includes(v)) {
      domains.push(v);
      renderDomainList();
      domainInput.value = "";
    }
  });

  // Allow pressing Enter in input to add domain
  domainInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addDomainBtn.click();
    }
  });

  // Reset to defaults
  resetBtn.addEventListener("click", () => {
    chrome.storage.sync.set(defaults, () => {
      domains = defaults.allowedDomains;
      renderDomainList();
      intervalInput.value = defaults.intervalMs;
      attemptsInput.value = defaults.maxAttempts;
      loadPatternInput.value = defaults.loadButtonsPattern;
      hiddenPatternInput.value = defaults.hiddenItemsPattern;
      statusMessage.textContent = "Settings reset to defaults!";
      statusMessage.style.visibility = "visible";
      setTimeout(() => {
        statusMessage.style.visibility = "hidden";
        statusMessage.textContent = "Settings saved!";
      }, 1500);
    });
  });
});
