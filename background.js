// Background service worker for Meta Tag Fetcher
chrome.runtime.onInstalled.addListener(() => {
  console.log('Meta Tag Fetcher installed');
});

// Listen for messages from other parts of the extension
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle any messages sent to the background script
  if (request.type === 'FETCH_META_TAGS') {
    console.log('Received request to fetch meta tags');
    // Add your meta tag fetching logic here if needed
    sendResponse({ success: true });
  }
  return true; // Required to use sendResponse asynchronously
});
