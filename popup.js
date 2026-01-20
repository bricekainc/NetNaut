// Tab Switching
document.getElementById('tabFeeds').onclick = () => {
  showView('viewFeeds', 'tabFeeds');
};

document.getElementById('tabSettings').onclick = () => {
  showView('viewSettings', 'tabSettings');
};

function showView(viewId, tabId) {
  document.querySelectorAll('.content').forEach(v => v.classList.add('hidden'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(viewId).classList.remove('hidden');
  document.getElementById(tabId).classList.add('active');
}

// RSS Detection (Matches the FluxFeed method)
chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
  if (!tabs[0].url.startsWith('http')) {
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
    if (!results || !results[0].result || results[0].result.length === 0) { 
      resContainer.innerHTML = "No feeds detected on this page."; 
      return; 
    }
    
    resContainer.innerHTML = results[0].result.map(f => `
      <div class="feed-card">
        <span style="overflow:hidden; text-overflow:ellipsis; white-space:nowrap; max-width:180px;">
          <strong>${f.title}</strong><br>${f.url}
        </span>
        <button class="copy-btn" data-url="${f.url}">Copy</button>
      </div>`).join('');

    // Handle Copy Buttons
    document.querySelectorAll('.copy-btn').forEach(btn => {
      btn.onclick = () => {
        navigator.clipboard.writeText(btn.getAttribute('data-url'));
        const original = btn.innerText;
        btn.innerText = 'Copied!';
        setTimeout(() => btn.innerText = original, 1500);
      };
    });
  });
});

// Settings persistence
const options = ['resumeToggle', 'adblockToggle'];
options.forEach(id => {
  const el = document.getElementById(id);
  chrome.storage.local.get([id], (res) => { 
    // Default to 'true' if never set
    el.checked = res[id] !== false; 
  });
  el.onchange = () => chrome.storage.local.set({ [id]: el.checked });
});