// Default field mappings
const DEFAULT_MAPPINGS = [
  { from: 'og:description', to: 'description' },
  { from: 'og:title', to: 'title' },
  { from: 'twitter:description', to: 'description' },
  { from: 'twitter:title', to: 'title' }
];

// Utility function to save field mappings
async function saveFieldMappings(mappings) {
  try {
    await chrome.storage.sync.set({ fieldMappings: mappings });
    showToast('Settings saved successfully');
  } catch (error) {
    console.error('Error saving settings:', error);
    showToast('Failed to save settings', true);
  }
}

// Utility function to load field mappings
async function loadFieldMappings() {
  try {
    const { fieldMappings = DEFAULT_MAPPINGS } = await chrome.storage.sync.get(['fieldMappings']);
    return fieldMappings;
  } catch (error) {
    console.error('Error loading settings:', error);
    showToast('Failed to load settings', true);
    return DEFAULT_MAPPINGS;
  }
}

// Function to create a new mapping row
function createMappingRow(mapping = { from: '', to: '' }) {
  const row = document.createElement('div');
  row.className = 'mapping-row';
  
  // From field
  const fromInput = document.createElement('input');
  fromInput.type = 'text';
  fromInput.className = 'from-field';
  fromInput.placeholder = 'Original field (e.g., og:description)';
  fromInput.value = mapping.from;
  
  // Arrow
  const arrow = document.createElement('span');
  arrow.className = 'arrow';
  arrow.innerHTML = '<i class="fas fa-arrow-right"></i>';
  
  // To field
  const toInput = document.createElement('input');
  toInput.type = 'text';
  toInput.className = 'to-field';
  toInput.placeholder = 'New field (e.g., description)';
  toInput.value = mapping.to;
  
  // Delete button
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'delete-btn';
  deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
  deleteBtn.title = 'Delete mapping';
  deleteBtn.onclick = () => {
    row.classList.add('fade-out');
    setTimeout(() => row.remove(), 200);
  };
  
  row.appendChild(fromInput);
  row.appendChild(arrow);
  row.appendChild(toInput);
  row.appendChild(deleteBtn);
  
  return row;
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
    ? '<i class="fas fa-circle-xmark text-red-500"></i>'
    : '<i class="fas fa-circle-check text-green-500"></i>';
  
  toast.classList.remove('translate-y-full', 'opacity-0');
  
  toast.hideTimeout = setTimeout(() => {
    toast.classList.add('translate-y-full', 'opacity-0');
  }, 3000);
}

// Function to validate mappings
function validateMappings() {
  const rows = document.querySelectorAll('.mapping-row');
  const mappings = [];
  let isValid = true;
  
  rows.forEach(row => {
    const fromField = row.querySelector('.from-field').value.trim();
    const toField = row.querySelector('.to-field').value.trim();
    
    if (fromField && toField) {
      mappings.push({ from: fromField, to: toField });
    } else if (fromField || toField) {
      isValid = false;
      showToast('Please fill in both fields for each mapping', true);
    }
  });
  
  return isValid ? mappings : null;
}

// Initialize the options page
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('mappingContainer');
  const addBtn = document.getElementById('addMappingBtn');
  const saveBtn = document.getElementById('saveBtn');
  const resetBtn = document.getElementById('resetBtn');
  
  // Load existing mappings
  const mappings = await loadFieldMappings();
  mappings.forEach(mapping => {
    container.appendChild(createMappingRow(mapping));
  });
  
  // Add mapping button
  addBtn.onclick = () => {
    container.appendChild(createMappingRow());
  };
  
  // Save button
  saveBtn.onclick = async () => {
    const mappings = validateMappings();
    if (mappings) {
      await saveFieldMappings(mappings);
    }
  };
  
  // Reset button
  resetBtn.onclick = async () => {
    if (confirm('Are you sure you want to reset to default mappings?')) {
      container.innerHTML = '';
      DEFAULT_MAPPINGS.forEach(mapping => {
        container.appendChild(createMappingRow(mapping));
      });
      await saveFieldMappings(DEFAULT_MAPPINGS);
    }
  };
});
