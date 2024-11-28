// Meta tag categories with improved classification
const META_CATEGORIES = {
  'Basic Information': {
    pattern: /^(title|description|keywords|author|viewport|robots|charset|language)$/i,
    icon: 'fa-info-circle'
  },
  'Open Graph': {
    pattern: /^og:/,
    icon: 'fa-share-nodes'
  },
  'Twitter Card': {
    pattern: /^twitter:/,
    icon: 'fa-twitter'
  },
  'SEO Information': {
    pattern: /^(robots|googlebot|bingbot|canonical|alternate|amphtml)$/i,
    icon: 'fa-magnifying-glass'
  },
  'Other': {
    pattern: /.*/,
    icon: 'fa-circle-info'
  }
};

// Function to extract meta tags and other SEO information from the current tab
async function getMetaTags() {
  try {
    // Get the current active tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!tab) {
      throw new Error('No active tab found');
    }

    // Execute script in the active tab to get metadata
    const result = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      function: () => {
        const metadata = {
          metaTags: {},
          title: document.title,
          url: window.location.href,
          canonicalUrl: '',
          favicon: ''
        };

        // Get meta tags
        document.querySelectorAll('meta').forEach(meta => {
          const key = meta.getAttribute('name') || meta.getAttribute('property') || meta.getAttribute('itemprop');
          const content = meta.getAttribute('content');
          if (key && content) {
            metadata.metaTags[key] = content;
          }
        });

        // Add page title to meta tags
        metadata.metaTags['title'] = document.title;

        // Get canonical URL
        const canonical = document.querySelector('link[rel="canonical"]');
        if (canonical) {
          metadata.canonicalUrl = canonical.href;
        }

        // Get favicon
        const favicon = document.querySelector('link[rel="icon"], link[rel="shortcut icon"]');
        if (favicon) {
          metadata.favicon = favicon.href;
        } else {
          // Fallback to default favicon path
          metadata.favicon = new URL('/favicon.ico', window.location.origin).href;
        }

        return metadata;
      }
    });

    if (!result || !result[0] || !result[0].result) {
      throw new Error('Failed to execute script in tab');
    }

    return result[0].result;
  } catch (error) {
    console.error('Error getting meta tags:', error);
    showToast('Error getting meta tags: ' + error.message, true);
    return {
      metaTags: {},
      title: 'Error',
      url: '',
      canonicalUrl: '',
      favicon: ''
    };
  }
}

// Function to categorize meta tags
function categorizeMetaTags(metaTags) {
  const categorized = {};
  
  // Initialize all categories
  Object.keys(META_CATEGORIES).forEach(category => {
    categorized[category] = {};
  });
  
  // Add basic information
  categorized['Basic Information'] = {
    'Page Title': metaTags.title,
    'Canonical URL': metaTags.canonicalUrl || metaTags.url,
    'Page Icon': metaTags.favicon,
  };
  
  // Categorize meta tags
  for (const [name, content] of Object.entries(metaTags.metaTags)) {
    let assigned = false;
    for (const [category, { pattern }] of Object.entries(META_CATEGORIES)) {
      if (pattern.test(name)) {
        categorized[category][name] = content;
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      categorized['Other'][name] = content;
    }
  }
  
  return categorized;
}

// Function to create table for a category
function createMetaTable(category, data) {
  const section = document.createElement('div');
  section.className = 'meta-section mb-6';

  const template = document.getElementById('sectionTemplate');
  const content = template.content.cloneNode(true);
  
  // Set category title and icon
  const title = content.querySelector('h3');
  title.innerHTML = `<i class="fas ${META_CATEGORIES[category].icon} mr-2"></i>${category}`;
  
  const tbody = content.querySelector('tbody');
  
  // Create table rows
  Object.entries(data).forEach(([key, value]) => {
    const tr = document.createElement('tr');
    
    // Key cell
    const keyCell = document.createElement('td');
    keyCell.className = 'text-sm text-gray-900 font-medium';
    keyCell.textContent = key;
    
    // Value cell
    const valueCell = document.createElement('td');
    valueCell.className = 'text-sm text-gray-500 value-cell';
    
    if (value.startsWith('data:image') || /\.(jpg|jpeg|png|gif|ico)$/i.test(value)) {
      // Create image preview container with loading placeholder
      const imgContainer = document.createElement('div');
      imgContainer.className = 'image-preview-container';
      
      // Add loading placeholder
      const placeholder = document.createElement('div');
      placeholder.className = 'loading-placeholder';
      placeholder.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
      imgContainer.appendChild(placeholder);
      
      // Create image element
      const img = document.createElement('img');
      img.className = 'image-preview hidden';
      img.alt = key;
      
      // Load image asynchronously
      const loadImage = () => {
        return new Promise((resolve, reject) => {
          img.onload = () => {
            img.classList.remove('hidden');
            placeholder.remove();
            resolve();
          };
          img.onerror = () => {
            imgContainer.innerHTML = '<div class="error-placeholder"><i class="fas fa-image-slash"></i></div>';
            reject();
          };
          img.src = value;
        });
      };
      
      // Start loading the image
      loadImage().catch(error => {
        console.error('Failed to load image:', error);
      });
      
      const urlText = document.createElement('div');
      urlText.className = 'text-sm text-gray-500 mt-2';
      urlText.textContent = value;
      
      imgContainer.appendChild(img);
      imgContainer.appendChild(urlText);
      valueCell.appendChild(imgContainer);
    } else {
      valueCell.textContent = value;
    }
    
    // Actions cell
    const actionsCell = document.createElement('td');
    actionsCell.className = 'text-right text-sm font-medium';
    
    const copyButton = document.createElement('button');
    copyButton.className = 'btn-icon';
    copyButton.innerHTML = '<i class="fas fa-copy"></i>';
    copyButton.title = 'Copy value';
    copyButton.onclick = () => copyToClipboard(value, key);
    
    actionsCell.appendChild(copyButton);
    
    // Add cells to row
    tr.appendChild(keyCell);
    tr.appendChild(valueCell);
    tr.appendChild(actionsCell);
    
    tbody.appendChild(tr);
  });
  
  section.appendChild(content);
  return section;
}

// Function to copy text to clipboard
async function copyToClipboard(text, key = '') {
  try {
    // Always copy text/URL
    await navigator.clipboard.writeText(text);
    
    // Show appropriate message based on content type
    if (text.startsWith('data:image') || /\.(jpg|jpeg|png|gif|ico)$/i.test(text)) {
      showToast(`Successfully copied ${key.toLowerCase() || 'image'} URL to clipboard`);
    } else {
      showToast(`Successfully copied ${key.toLowerCase() || 'text'} to clipboard`);
    }
  } catch (error) {
    console.error('Copy failed:', error);
    showToast('Failed to copy to clipboard', true);
  }
}

// Function to get key mapping from storage
async function getKeyMapping() {
  try {
    const { fieldMappings = [] } = await chrome.storage.sync.get(['fieldMappings']);
    // Convert array of mappings to object format
    const mappingObject = {};
    fieldMappings.forEach(mapping => {
      if (mapping.from && mapping.to) {
        mappingObject[mapping.from] = mapping.to;
      }
    });
    return mappingObject;
  } catch (error) {
    console.error('Error getting key mapping:', error);
    return {};
  }
}

// Function to apply key mapping to data
function applyKeyMapping(data, mapping) {
  const result = {};
  Object.entries(data).forEach(([key, value]) => {
    // Check if this key has a mapping
    const mappedKey = mapping[key];
    if (mappedKey) {
      // If the mapped key already exists, merge the values
      if (result[mappedKey]) {
        // Only add if the values are different
        if (result[mappedKey] !== value) {
          result[mappedKey] = [result[mappedKey], value].flat();
        }
      } else {
        result[mappedKey] = value;
      }
    } else {
      // Keep original key if no mapping exists
      result[key] = value;
    }
  });
  return result;
}

// Function to toggle between table and JSON views
async function toggleView(showJson = false) {
  const metaContainer = document.getElementById('metaContainer');
  const jsonView = document.getElementById('jsonView');
  const toggleViewBtn = document.getElementById('toggleViewBtn');
  const backBtn = document.getElementById('backBtn');

  if (showJson) {
    // Switch to JSON view
    metaContainer.classList.add('hidden');
    jsonView.classList.remove('hidden');
    toggleViewBtn.classList.add('hidden');
    backBtn.classList.remove('hidden');

    // Create flattened JSON data from current meta tags
    const jsonData = {};
    document.querySelectorAll('.meta-section').forEach(section => {
      const rows = section.querySelectorAll('tbody tr');
      rows.forEach(row => {
        const key = row.querySelector('td:first-child').textContent;
        const value = row.querySelector('td:nth-child(2)').textContent.trim();
        jsonData[key] = value;
      });
    });

    // Get and apply key mapping
    const keyMapping = await getKeyMapping();
    const mappedData = applyKeyMapping(jsonData, keyMapping);

    // Sort keys alphabetically
    const sortedData = {};
    Object.keys(mappedData)
      .sort()
      .forEach(key => {
        sortedData[key] = mappedData[key];
      });

    // Update JSON view
    const jsonPre = jsonView.querySelector('pre');
    jsonPre.textContent = JSON.stringify(sortedData, null, 2);
  } else {
    // Switch back to table view
    metaContainer.classList.remove('hidden');
    jsonView.classList.add('hidden');
    toggleViewBtn.classList.remove('hidden');
    backBtn.classList.add('hidden');
  }
}

// Function to save history
async function saveToHistory(pageInfo) {
  try {
    const { history = [] } = await chrome.storage.local.get('history');
    const historyItem = {
      timestamp: new Date().toISOString(),
      url: pageInfo.url,
      metaTags: pageInfo.metaTags
    };
    
    // Check if this URL was the last one visited
    if (history.length > 0) {
      const lastItem = history[0];
      // Compare URLs and meta tags
      if (lastItem.url === historyItem.url) {
        // Deep compare meta tags
        const lastMetaTags = JSON.stringify(lastItem.metaTags);
        const currentMetaTags = JSON.stringify(historyItem.metaTags);
        if (lastMetaTags === currentMetaTags) {
          // Skip saving if it's the same
          return;
        }
      }
    }
    
    // Add to beginning of array
    history.unshift(historyItem);
    
    // Keep only last 1000 items
    if (history.length > 1000) {
      history.pop();
    }
    
    await chrome.storage.local.set({ history });
  } catch (error) {
    console.error('Error saving to history:', error);
  }
}

// Function to show toast notification
function showToast(message, isError = false) {
  const toast = document.getElementById('toast');
  const toastMessage = document.getElementById('toastMessage');
  const toastIcon = document.getElementById('toastIcon');
  
  // Clear any existing timeouts
  if (toast.hideTimeout) {
    clearTimeout(toast.hideTimeout);
  }
  
  toastMessage.textContent = message;
  toastIcon.innerHTML = isError 
    ? '<i class="fas fa-circle-xmark text-red-500 mr-2"></i>'
    : '<i class="fas fa-circle-check text-green-500 mr-2"></i>';
  
  // Remove hide classes and add show class
  toast.classList.remove('translate-y-full', 'opacity-0');
  toast.classList.add('show');
  
  // Set timeout to hide toast
  toast.hideTimeout = setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('translate-y-full', 'opacity-0');
  }, 3000);
}

// Add CSS styles for loading and error states
const style = document.createElement('style');
style.textContent = `
  .loading-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    background-color: #f3f4f6;
    border-radius: 4px;
    color: #6b7280;
  }
  
  .error-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100px;
    background-color: #fee2e2;
    border-radius: 4px;
    color: #ef4444;
  }
  
  .image-preview {
    max-width: 200px;
    max-height: 150px;
    border-radius: 4px;
  }
  
  .image-preview.hidden {
    display: none;
  }
`;
document.head.appendChild(style);

// Initialize the popup
document.addEventListener('DOMContentLoaded', async () => {
  const toggleViewBtn = document.getElementById('toggleViewBtn');
  const backBtn = document.getElementById('backBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const historyBtn = document.getElementById('historyBtn');
  const copyJsonBtn = document.getElementById('copyJsonBtn');
  const metaContainer = document.getElementById('metaContainer');
  const jsonView = document.getElementById('jsonView');

  try {
    // Get meta tags from current tab
    const pageInfo = await getMetaTags();
    
    // Save to history
    await saveToHistory(pageInfo);
    
    const categorizedData = categorizeMetaTags(pageInfo);

    // Populate meta sections
    Object.entries(categorizedData).forEach(([category, data]) => {
      if (Object.keys(data).length > 0) {
        metaContainer.appendChild(createMetaTable(category, data));
      }
    });

    // Event listeners
    toggleViewBtn.addEventListener('click', () => toggleView(true));
    backBtn.addEventListener('click', () => toggleView(false));
    settingsBtn.addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
    historyBtn.addEventListener('click', () => {
      chrome.tabs.create({ url: 'history.html' });
    });
    
    // Copy JSON button handler
    copyJsonBtn.addEventListener('click', async () => {
      const jsonPre = jsonView.querySelector('pre');
      try {
        await navigator.clipboard.writeText(jsonPre.textContent);
        showToast('Successfully copied JSON data');
      } catch (error) {
        console.error('Failed to copy JSON:', error);
        showToast('Failed to copy JSON data', true);
      }
    });

  } catch (error) {
    console.error('Error initializing popup:', error);
    showToast('Error initializing popup', true);
  }
});
