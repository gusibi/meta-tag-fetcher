// Function to format date
function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

// Function to group history by date
function groupHistoryByDate(history) {
  const groups = {};
  history.forEach(item => {
    const date = new Date(item.timestamp).toDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(item);
  });
  return groups;
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

// Function to create history item element
async function createHistoryItem(item) {
  const div = document.createElement('div');
  div.className = 'history-item card p-4 mb-3';
  div.dataset.timestamp = item.timestamp;
  
  const time = new Date(item.timestamp).toLocaleTimeString();
  const title = item.metaTags['title'] || item.metaTags['og:title'] || 'Untitled';
  const siteName = item.metaTags['og:site_name'] || new URL(item.url).hostname;
  
  // Get and apply key mapping
  const keyMapping = await getKeyMapping();
  const mappedData = applyKeyMapping(item.metaTags, keyMapping);
  
  // Add timestamp and url to mapped data
  mappedData._timestamp = item.timestamp;
  mappedData._url = item.url;
  
  div.innerHTML = `
    <div class="flex flex-col space-y-4">
      <div class="flex items-center space-x-4">
        <div class="checkbox-wrapper">
          <input type="checkbox" class="history-select" data-timestamp="${item.timestamp}">
        </div>
        <div class="site-name min-w-[120px] max-w-[150px] truncate font-medium text-gray-700">
          ${siteName}
        </div>
        <div class="separator text-gray-300">/</div>
        <div class="title min-w-[200px] max-w-[300px] truncate font-medium text-gray-900">
          ${title}
        </div>
        <div class="separator text-gray-300">/</div>
        <div class="url flex-1 min-w-[200px] max-w-[400px] truncate text-gray-500">
          ${item.url}
        </div>
        <div class="separator text-gray-300">/</div>
        <div class="time min-w-[80px] text-gray-400">
          ${time}
        </div>
        <div class="actions flex space-x-2 ml-4">
          <button class="btn-icon view-json" title="View JSON">
            <i class="fas fa-code"></i>
          </button>
          <button class="btn-icon delete-item" title="Delete" data-timestamp="${item.timestamp}">
            <i class="fas fa-trash text-red-500"></i>
          </button>
        </div>
      </div>
      <div class="json-preview hidden">
        <pre class="bg-gray-50 p-4 rounded-lg text-sm overflow-x-auto">${JSON.stringify(mappedData, null, 2)}</pre>
        <div class="flex justify-end mt-2">
          <button class="btn btn-secondary copy-json">
            <i class="fas fa-copy mr-2"></i>Copy JSON
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add click handlers
  const viewJsonBtn = div.querySelector('.view-json');
  const jsonPreview = div.querySelector('.json-preview');
  const copyJsonBtn = div.querySelector('.copy-json');
  const deleteBtn = div.querySelector('.delete-item');
  
  viewJsonBtn.addEventListener('click', () => {
    jsonPreview.classList.toggle('hidden');
  });
  
  copyJsonBtn.addEventListener('click', async () => {
    const jsonContent = JSON.stringify(mappedData, null, 2);
    try {
      await navigator.clipboard.writeText(jsonContent);
      showToast('JSON copied to clipboard');
    } catch (error) {
      showToast('Failed to copy JSON', true);
    }
  });
  
  deleteBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to delete this item?')) {
      await deleteHistoryItem(item.timestamp);
    }
  });
  
  return div;
}

// Function to delete a single history item
async function deleteHistoryItem(timestamp) {
  try {
    const { history = [] } = await chrome.storage.local.get('history');
    const newHistory = history.filter(item => item.timestamp !== timestamp);
    await chrome.storage.local.set({ history: newHistory });
    await loadHistory(); // Reload the list
    showToast('Item deleted successfully');
  } catch (error) {
    console.error('Error deleting history item:', error);
    showToast('Failed to delete item', true);
  }
}

// Function to delete selected history items
async function deleteSelectedItems() {
  try {
    const selectedTimestamps = Array.from(document.querySelectorAll('.history-select:checked'))
      .map(checkbox => checkbox.dataset.timestamp);
    
    if (selectedTimestamps.length === 0) {
      showToast('Please select items to delete', true);
      return;
    }
    
    if (!confirm(`Are you sure you want to delete ${selectedTimestamps.length} selected items?`)) {
      return;
    }
    
    const { history = [] } = await chrome.storage.local.get('history');
    const newHistory = history.filter(item => !selectedTimestamps.includes(item.timestamp));
    await chrome.storage.local.set({ history: newHistory });
    await loadHistory();
    showToast('Selected items deleted successfully');
  } catch (error) {
    console.error('Error deleting selected items:', error);
    showToast('Failed to delete selected items', true);
  }
}

// Function to export selected history items
async function exportSelectedItems() {
  try {
    const selectedTimestamps = Array.from(document.querySelectorAll('.history-select:checked'))
      .map(checkbox => checkbox.dataset.timestamp);
    
    if (selectedTimestamps.length === 0) {
      showToast('Please select items to export', true);
      return;
    }
    
    // Get history and key mapping
    const [{ history = [] }, keyMapping] = await Promise.all([
      chrome.storage.local.get('history'),
      getKeyMapping()
    ]);
    
    // Filter selected items and apply mapping
    const selectedItems = history
      .filter(item => selectedTimestamps.includes(item.timestamp))
      .map(item => {
        // Apply mapping to meta tags and flatten the structure
        const mappedData = applyKeyMapping(item.metaTags, keyMapping);
        return {
          ...mappedData,
          _timestamp: item.timestamp,
          _url: item.url
        };
      });
    
    // Create export data
    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      items: selectedItems,
      _keyMapping: keyMapping // Include the key mapping for reference
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meta-tag-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast(`Exported ${selectedItems.length} items successfully`);
  } catch (error) {
    console.error('Error exporting selected items:', error);
    showToast('Failed to export selected items', true);
  }
}

// Function to load and display history
async function loadHistory() {
  try {
    const result = await chrome.storage.local.get('history');
    const history = result.history || [];
    const historyContent = document.getElementById('historyContent');
    historyContent.innerHTML = '';
    
    if (history.length === 0) {
      historyContent.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <i class="fas fa-history text-4xl mb-2"></i>
          <p>No history yet</p>
        </div>
      `;
      return;
    }
    
    const groupedHistory = groupHistoryByDate(history);
    
    for (const [date, items] of Object.entries(groupedHistory).sort(([dateA], [dateB]) => new Date(dateB) - new Date(dateA))) {
      const dateGroup = document.createElement('div');
      dateGroup.className = 'date-group mb-6';
      dateGroup.innerHTML = `
        <h2 class="text-lg font-semibold text-gray-700 mb-3">${formatDate(date)}</h2>
        <div class="space-y-3"></div>
      `;
      
      const itemsContainer = dateGroup.querySelector('.space-y-3');
      
      // Create history items asynchronously
      for (const item of items) {
        try {
          const historyItem = await createHistoryItem(item);
          itemsContainer.appendChild(historyItem);
        } catch (error) {
          console.error('Error creating history item:', error);
          // Continue with next item if one fails
          continue;
        }
      }
      
      historyContent.appendChild(dateGroup);
    }
    
    // Add delete selected button
    const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
    deleteSelectedBtn.addEventListener('click', deleteSelectedItems);
    
    // Add export selected button
    const exportSelectedBtn = document.getElementById('exportSelectedBtn');
    exportSelectedBtn.addEventListener('click', exportSelectedItems);
  } catch (error) {
    console.error('Error loading history:', error);
    showToast('Failed to load history', true);
  }
}

// Function to show toast notification
function showToast(message, isError = false) {
  // Remove existing toast
  const existingToast = document.querySelector('.toast');
  if (existingToast) {
    existingToast.remove();
  }

  // Create new toast
  const toast = document.createElement('div');
  toast.className = `toast ${isError ? 'error' : ''}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 100);

  // Hide toast after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

// Function to handle export
async function handleExport(selectedDates) {
  try {
    const { history = [] } = await chrome.storage.local.get('history');
    const keyMapping = await getKeyMapping();
    
    // Filter and map the data
    const exportData = history
      .filter(item => {
        const date = new Date(item.timestamp).toDateString();
        return selectedDates.includes(date);
      })
      .map(item => ({
        ...item,
        metaTags: applyKeyMapping(item.metaTags, keyMapping)
      }));
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meta-tag-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('History exported successfully');
  } catch (error) {
    console.error('Error exporting history:', error);
    showToast('Failed to export history', true);
  }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', async () => {
  try {
    await initHistoryPage();
    
    // Add event listeners for action buttons
    document.getElementById('exportSelectedBtn').addEventListener('click', exportSelectedItems);
    document.getElementById('deleteSelectedBtn').addEventListener('click', deleteSelectedItems);
    
    // Initial state update
    updateSelectAllState();
  } catch (error) {
    console.error('Error initializing page:', error);
    showToast('Failed to initialize page', true);
  }
});

// Initialize history page
async function initHistoryPage() {
  try {
    const { history = [] } = await chrome.storage.local.get('history');
    const historyContent = document.getElementById('historyContent');
    historyContent.innerHTML = '';

    // Sort history by timestamp in descending order
    const sortedHistory = [...history].sort((a, b) => b.timestamp - a.timestamp);
    
    // Create and append history items
    for (const item of sortedHistory) {
      const historyItem = await createHistoryItem(item);
      historyContent.appendChild(historyItem);
    }

    // Setup select all functionality
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', () => {
        const allCheckboxes = document.querySelectorAll('.history-item .history-select');
        allCheckboxes.forEach(checkbox => {
          checkbox.checked = selectAllCheckbox.checked;
        });
        updateSelectAllState();
      });
    }

    // Add change listener to individual checkboxes
    const historyContentElem = document.getElementById('historyContent');
    if (historyContentElem) {
      historyContentElem.addEventListener('change', (e) => {
        if (e.target.classList.contains('history-select')) {
          updateSelectAllState();
        }
      });
    }

  } catch (error) {
    console.error('Error initializing history page:', error);
    throw error; // Re-throw to be caught by the main error handler
  }
}

// Update select all checkbox state based on individual selections
function updateSelectAllState() {
  const selectAllCheckbox = document.getElementById('selectAll');
  if (!selectAllCheckbox) return;

  const allCheckboxes = Array.from(document.querySelectorAll('.history-item .history-select'));
  const checkedCount = allCheckboxes.filter(cb => cb.checked).length;

  if (checkedCount === 0) {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = false;
  } else if (checkedCount === allCheckboxes.length) {
    selectAllCheckbox.checked = true;
    selectAllCheckbox.indeterminate = false;
  } else {
    selectAllCheckbox.checked = false;
    selectAllCheckbox.indeterminate = true;
  }

  // Update buttons state
  const exportBtn = document.getElementById('exportSelectedBtn');
  const deleteBtn = document.getElementById('deleteSelectedBtn');
  if (!exportBtn || !deleteBtn) return;

  const hasSelection = checkedCount > 0;

  exportBtn.disabled = !hasSelection;
  deleteBtn.disabled = !hasSelection;
  
  if (hasSelection) {
    exportBtn.classList.remove('opacity-50', 'cursor-not-allowed');
    deleteBtn.classList.remove('opacity-50', 'cursor-not-allowed');
  } else {
    exportBtn.classList.add('opacity-50', 'cursor-not-allowed');
    deleteBtn.classList.add('opacity-50', 'cursor-not-allowed');
  }
}
