// Extraction script for TikTok tabs
// Usage: run via tools.browser.evaluate with this script content

function extract(tabID) {
  const meta = document.querySelector('meta[property="og:description"]') ||
               document.querySelector('meta[name="og:description"]') ||
               document.querySelector('meta[name="description"]');
  return {
    title: document.title,
    desc: meta ? meta.content : "",
    body: document.body.innerText
  };
}