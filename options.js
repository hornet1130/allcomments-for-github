document.addEventListener("DOMContentLoaded", () => {
  const domainsInput = document.getElementById("domains");
  const intervalInput = document.getElementById("interval");
  const attemptsInput = document.getElementById("attempts");
  const loadPatternInput = document.getElementById("loadPattern");
  const hiddenPatternInput = document.getElementById("hiddenPattern");
  const saveBtn = document.getElementById("save");
  const statusMessage = document.getElementById("statusMessage");
  const resetBtn = document.getElementById("reset");

  const defaults = {
    allowedDomains: [],
    intervalMs: 2000,
    maxAttempts: 20,
    loadButtonsPattern: "Load more|Show more replies|Show \\d+ more replies",
    hiddenItemsPattern:
      "\\d+\\s+(remaining|hidden)\\s+(items|replies|comments)",
  };

  // Load settings and populate fields
  chrome.storage.sync.get(defaults, (settings) => {
    domainsInput.value = settings.allowedDomains.join(", ");
    intervalInput.value = settings.intervalMs;
    attemptsInput.value = settings.maxAttempts;
    loadPatternInput.value = settings.loadButtonsPattern;
    hiddenPatternInput.value = settings.hiddenItemsPattern;
  });

  // Save settings
  saveBtn.addEventListener("click", () => {
    const domains = domainsInput.value
      .split(",")
      .map((d) => d.trim())
      .filter((d) => d);

    const interval = parseInt(intervalInput.value, 10) || defaults.intervalMs;
    const attempts = parseInt(attemptsInput.value, 10) || defaults.maxAttempts;
    const loadPattern =
      loadPatternInput.value.trim() || defaults.loadButtonsPattern;
    const hiddenPattern =
      hiddenPatternInput.value.trim() || defaults.hiddenItemsPattern;

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

  // Reset to defaults
  resetBtn.addEventListener("click", () => {
    chrome.storage.sync.set(defaults, () => {
      domainsInput.value = defaults.allowedDomains.join(", ");
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
