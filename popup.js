// Tab Switching
const tabs = ['tabFeeds', 'tabSettings', 'tabHelp'];
const views = ['viewFeeds', 'viewSettings', 'viewHelp'];

tabs.forEach((tabId, index) => {
  document.getElementById(tabId).onclick = () => {
    views.forEach(v => document.getElementById(v).classList.add('hidden'));
    tabs.forEach(t => document.getElementById(t).classList.remove('active'));
    document.getElementById(views[index]).classList.remove('hidden');
    document.getElementById(tabId).classList.add('active');
  };
});

// RSS Detection logic
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  if (!tabs[0]?.url || !tabs[0].url.startsWith('http')) {
    document.getElementById('feedResults').innerHTML = "Navigate to a website to scan.";
    return;
  }
  
  chrome.scripting.executeScript({
    target: {tabId: tabs[0].id},
    func: () => {
      const selectors = [
        'link[type="application/rss+xml"]',
        'link[type="application/atom+xml"]',
        'link[type="application/rdf+xml"]',
        'link[type="rss+xml"]'
      ];
      return Array.from(document.querySelectorAll(selectors.join(','))).map(l => ({
        title: l.title || 'Untitled Feed', 
        url: l.href
      }));
    }
  }, (results) => {
    const resContainer = document.getElementById('feedResults');
    if (!results || !results[0]?.result || results[0].result.length === 0) { 
      resContainer.innerHTML = "No feeds detected on this page."; 
      return; 
    }
    
    resContainer.innerHTML = results[0].result.map(f => `
      <div class="feed-card">
        <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:170px;">
          <strong>${f.title}</strong><br>${f.url}
        </span>
        <button class="copy-btn" data-url="${f.url}">Copy</button>
      </div>`).join('');

    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.onclick = () => {
        navigator.clipboard.writeText(btn.getAttribute('data-url'));
        const originalText = btn.innerText;
        btn.innerText = 'Copied!';
        setTimeout(() => btn.innerText = originalText, 1500);
      };
    });
  });
});

// Settings persistence
const options = ['resumeToggle', 'adblockToggle', 'shortenToggle'];
options.forEach(id => {
  const el = document.getElementById(id);
  chrome.storage.local.get([id], (res) => { 
    el.checked = res[id] !== false; 
  });
  el.onchange = () => {
    chrome.storage.local.set({ [id]: el.checked });
    // Reload active tab to apply/remove shortener icons immediately
    if (id === 'shortenToggle') {
      chrome.tabs.query({active: true, currentWindow: true}, (t) => {
        if (t[0]) chrome.tabs.reload(t[0].id);
      });
    }
  };
});
