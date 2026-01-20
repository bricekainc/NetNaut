// Auto-Resume logic
chrome.downloads.onChanged.addListener((downloadDelta) => {
  chrome.storage.local.get(['resumeToggle'], (res) => {
    if (res.resumeToggle === false) return;

    const isInterrupted = downloadDelta.state?.current === "interrupted";
    const isPaused = downloadDelta.paused?.current === true;
    const canResume = downloadDelta.canResume?.current === true;

    if ((isInterrupted || isPaused) && canResume) {
      chrome.downloads.resume(downloadDelta.id);
    }
  });
});

// Sync Ad-blocker state with Settings
chrome.storage.onChanged.addListener((changes) => {
  if (changes.adblockToggle) {
    const enabled = changes.adblockToggle.newValue;
    chrome.declarativeNetRequest.updateEnabledRulesets({
      [enabled ? "enableRulesetIds" : "disableRulesetIds"]: ["ruleset_1"]
    });
  }
});