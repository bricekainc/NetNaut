let isShortenerEnabled = true;

// Check settings on load
chrome.storage.local.get(['shortenToggle'], (res) => {
  isShortenerEnabled = res.shortenToggle !== false;
  if (isShortenerEnabled) injectShortenIcons();
});

function injectShortenIcons() {
  const links = document.querySelectorAll('a[href^="http"]');
  links.forEach(link => {
    if (link.dataset.netnaut) return;
    link.dataset.netnaut = "true";

    const btn = document.createElement('span');
    btn.innerHTML = "✂️";
    btn.className = "netnaut-shorten-btn";
    btn.title = "Shorten with Trimd";
    
    btn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const originalUrl = link.href;
      btn.innerHTML = "⏳";

      try {
        const r = await fetch('https://corsproxy.io/?https://trimd.cc/shorten', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({ url: originalUrl })
        });
        const j = await r.json();
        if (j.data?.shorturl) {
          navigator.clipboard.writeText(j.data.shorturl);
          btn.innerHTML = "✅";
          setTimeout(() => btn.innerHTML = "✂️", 2000);
        }
      } catch (err) {
        btn.innerHTML = "❌";
        setTimeout(() => btn.innerHTML = "✂️", 2000);
      }
    };
    link.parentNode.insertBefore(btn, link.nextSibling);
  });
}

// Watch for dynamically added links (infinite scroll)
const observer = new MutationObserver(() => {
  if (isShortenerEnabled) injectShortenIcons();
});
observer.observe(document.body, { childList: true, subtree: true });
