// Side Panel Main Script

// DOM Elements
const elements = {
  // Tabs
  modeTabs: document.querySelectorAll('.tab'),
  imageInputContainer: document.getElementById('image-input-container'),
  usernameInputContainer: document.getElementById('username-input-container'),
  
  // Image Input
  dropZone: document.getElementById('drop-zone'),
  fileInput: document.getElementById('file-input'),
  filePickerBtn: document.getElementById('file-picker-btn'),
  imageUrlInput: document.getElementById('image-url-input'),
  imagePreviewContainer: document.getElementById('image-preview-container'),
  imagePreview: document.getElementById('image-preview'),
  removeImageBtn: document.getElementById('remove-image'),
  searchImageBtn: document.getElementById('search-image-btn'),
  
  // Username Input
  usernameInput: document.getElementById('username-input'),
  usernameCharCount: document.getElementById('username-char-count'),
  usernameError: document.getElementById('username-error'),
  checkUsernameBtn: document.getElementById('check-username-btn'),
  
  // Results
  resultsSection: document.getElementById('results-section'),
  platformFilters: document.querySelectorAll('.filter'),
  resultsContainer: document.getElementById('results-container'),
  
  // Footer
  searchHistory: document.getElementById('search-history'),
  clearHistoryBtn: document.getElementById('clear-history'),
  
  // Header
  closePanel: document.getElementById('close-panel')
};

// State
let currentMode = 'image';
let currentImageData = null;
let currentImageSource = null; // 'upload' or 'url'

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  initializeTabs();
  initializeImageInput();
  initializeUsernameInput();
  initializeResults();
  initializeHistory();
  initializeCloseButton();
});

// Tab Navigation
function initializeTabs() {
  elements.modeTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.mode;
      switchMode(mode);
    });
  });
}

function switchMode(mode) {
  currentMode = mode;
  
  // Update tab active state
  elements.modeTabs.forEach(tab => {
    if (tab.dataset.mode === mode) {
      tab.classList.add('active');
    } else {
      tab.classList.remove('active');
    }
  });
  
  // Show/hide input containers
  if (mode === 'image') {
    elements.imageInputContainer.classList.add('active');
    elements.usernameInputContainer.classList.remove('active');
  } else {
    elements.imageInputContainer.classList.remove('active');
    elements.usernameInputContainer.classList.add('active');
  }
  
  // Hide results when switching modes
  elements.resultsSection.style.display = 'none';
}

// Image Input Initialization
function initializeImageInput() {
  // Drag and drop
  setupDragAndDrop();
  
  // File picker
  setupFilePicker();
  
  // URL input
  setupUrlInput();
  
  // Remove image
  elements.removeImageBtn.addEventListener('click', clearImageInput);
  
  // Search button
  elements.searchImageBtn.addEventListener('click', handleImageSearch);
}


// Drag and Drop Setup
function setupDragAndDrop() {
  const dropZone = elements.dropZone;
  
  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });
  
  // Highlight drop zone when dragging over
  ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.add('drag-over');
    }, false);
  });
  
  ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, () => {
      dropZone.classList.remove('drag-over');
    }, false);
  });
  
  // Handle dropped files
  dropZone.addEventListener('drop', handleDrop, false);
}

function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

function handleDrop(e) {
  const dt = e.dataTransfer;
  const files = dt.files;
  
  if (files.length > 0) {
    handleFileUpload(files[0]);
  }
}


// File Picker Setup
function setupFilePicker() {
  // Trigger file input when button is clicked
  elements.filePickerBtn.addEventListener('click', () => {
    elements.fileInput.click();
  });
  
  // Handle file selection
  elements.fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  });
}

// Handle File Upload (common for drag-drop and file picker)
async function handleFileUpload(file) {
  try {
    // Clear URL input if file is uploaded
    elements.imageUrlInput.value = '';
    
    // Validate and process using ImageProcessor
    const processedImage = await ImageProcessor.validateAndProcess(file);
    
    currentImageData = processedImage.base64;
    currentImageSource = 'upload';
    
    // Show preview
    showImagePreview(processedImage.base64);
    
    // Enable search button
    elements.searchImageBtn.disabled = false;
    
    console.log('Image processed:', {
      name: processedImage.name,
      size: ImageProcessor.formatFileSize(processedImage.size),
      dimensions: `${processedImage.width}x${processedImage.height}`
    });
    
  } catch (error) {
    console.error('Error handling file upload:', error);
    const errorMessage = ImageProcessor.getErrorMessage(error.message);
    showError(errorMessage);
  }
}


// URL Input Setup
function setupUrlInput() {
  let urlInputTimeout;
  
  elements.imageUrlInput.addEventListener('input', () => {
    // Debounce input to avoid validating on every keystroke
    clearTimeout(urlInputTimeout);
    urlInputTimeout = setTimeout(handleUrlInput, 500);
  });
  
  elements.imageUrlInput.addEventListener('paste', () => {
    // Handle paste immediately
    setTimeout(handleUrlInput, 100);
  });
  
  // Also handle when user presses Enter
  elements.imageUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      clearTimeout(urlInputTimeout);
      handleUrlInput();
    }
  });
}

async function handleUrlInput() {
  const url = elements.imageUrlInput.value.trim();
  
  console.log('URL input changed:', url);
  
  if (!url) {
    elements.searchImageBtn.disabled = true;
    clearImageInput();
    return;
  }
  
  // Check if it's a LinkedIn profile URL (not an image)
  if (url.includes('linkedin.com/in/') || url.includes('linkedin.com/pub/')) {
    console.warn('LinkedIn profile URL detected, not an image URL');
    elements.searchImageBtn.disabled = true;
    showError('⚠️ Please use the profile PHOTO URL, not the profile page URL.\n\n' +
              'How to get it:\n' +
              '1. Open the LinkedIn profile\n' +
              '2. Right-click on the profile photo\n' +
              '3. Select "Copy Image Address"\n' +
              '4. Paste that URL here');
    return;
  }
  
  // Check if it's other social media profile URLs
  if (url.match(/twitter\.com\/[^/]+$/) || 
      url.match(/x\.com\/[^/]+$/) ||
      url.match(/instagram\.com\/[^/]+\/?$/) ||
      url.match(/tiktok\.com\/@[^/]+\/?$/)) {
    console.warn('Social media profile URL detected, not an image URL');
    elements.searchImageBtn.disabled = true;
    showError('⚠️ Please use a profile PHOTO URL, not the profile page URL.\n\n' +
              'Right-click on the profile photo → "Copy Image Address"');
    return;
  }
  
  // Validate URL format using ImageProcessor
  if (!ImageProcessor.isValidUrl(url)) {
    console.warn('Invalid URL format:', url);
    elements.searchImageBtn.disabled = true;
    showError(ImageProcessor.getErrorMessage('INVALID_URL'));
    return;
  }
  
  console.log('✅ Valid image URL detected');
  
  // Clear file input if URL is provided
  elements.fileInput.value = '';
  
  // Set current image data
  currentImageData = url;
  currentImageSource = 'url';
  
  // Show preview
  console.log('Showing preview for URL:', url);
  showImagePreview(url);
  
  // Enable search button
  elements.searchImageBtn.disabled = false;
  
  console.log('✅ Image URL set and preview shown');
}


// Image Preview
function showImagePreview(imageData) {
  console.log('showImagePreview called with:', imageData.substring(0, 100));
  
  // Set the image source
  elements.imagePreview.src = imageData;
  
  // Show the preview container
  elements.imagePreviewContainer.style.display = 'block';
  
  // Add load and error handlers
  elements.imagePreview.onload = function() {
    console.log('✅ Image preview loaded successfully');
  };
  
  elements.imagePreview.onerror = function() {
    console.error('❌ Failed to load image preview');
    showError('Failed to load image. Please check the URL and try again.');
    elements.imagePreviewContainer.style.display = 'none';
  };
}

function clearImageInput() {
  console.log('Clearing image input');
  
  // Clear all inputs (but don't clear URL input if we're just clearing the file)
  elements.fileInput.value = '';
  
  // Only clear URL if we're doing a full clear
  if (currentImageSource !== 'url') {
    elements.imageUrlInput.value = '';
  }
  
  // Clear preview only if no URL is present
  if (!elements.imageUrlInput.value.trim()) {
    elements.imagePreview.src = '';
    elements.imagePreviewContainer.style.display = 'none';
    
    // Clear state
    currentImageData = null;
    currentImageSource = null;
    
    // Disable search button
    elements.searchImageBtn.disabled = true;
  }
}

// Error Display
function showError(message) {
  // For now, use alert. Can be improved with a toast notification
  alert(message);
}

// Image Search Handler
async function handleImageSearch() {
  if (!currentImageData) {
    showError('Please select an image first.');
    return;
  }
  
  console.log('Searching for image:', currentImageSource);
  
  // Disable search button
  elements.searchImageBtn.disabled = true;
  elements.searchImageBtn.textContent = 'Searching...';
  
  // Show loading state
  showLoadingState();
  
  try {
    // Send message to background script
    const response = await chrome.runtime.sendMessage({
      action: 'REVERSE_IMAGE_SEARCH',
      payload: {
        imageData: currentImageData
      }
    });
    
    if (response.success) {
      const { results, cached } = response.data;
      console.log(`Got ${results.length} results${cached ? ' (cached)' : ''}`);
      
      // Display results
      displayResults(results);
      
      // Add to history
      await addSearchToHistory('image', 'Image search', results.length);
      
    } else {
      throw new Error(response.error || 'Search failed');
    }
    
  } catch (error) {
    console.error('Error in image search:', error);
    showErrorState(error.message || 'Failed to search. Please try again.');
  } finally {
    // Re-enable search button
    elements.searchImageBtn.disabled = false;
    elements.searchImageBtn.textContent = 'Search Image';
  }
}


// Username Input Initialization
function initializeUsernameInput() {
  // Real-time character count and validation
  elements.usernameInput.addEventListener('input', handleUsernameInput);
  
  // Check button
  elements.checkUsernameBtn.addEventListener('click', handleUsernameCheck);
}

// Handle username input with real-time validation
function handleUsernameInput() {
  const username = elements.usernameInput.value;
  const length = username.length;
  
  // Update character count
  elements.usernameCharCount.textContent = `${length}/30`;
  
  // Validate username
  const validation = validateUsername(username);
  
  if (!validation.isValid && username.length > 0) {
    // Show error message
    elements.usernameError.textContent = validation.message;
    elements.usernameError.style.display = 'block';
    elements.checkUsernameBtn.disabled = true;
  } else if (username.length === 0) {
    // Empty input
    elements.usernameError.style.display = 'none';
    elements.checkUsernameBtn.disabled = true;
  } else {
    // Valid input
    elements.usernameError.style.display = 'none';
    elements.checkUsernameBtn.disabled = false;
  }
}

// Validate username format
function validateUsername(username) {
  const trimmed = username.trim();
  
  // Check if empty
  if (trimmed.length === 0) {
    return { isValid: false, message: '' };
  }
  
  // Check for valid characters (alphanumeric and underscore only)
  const validPattern = /^[a-zA-Z0-9_]+$/;
  if (!validPattern.test(trimmed)) {
    return { 
      isValid: false, 
      message: 'Only letters, numbers, and underscores allowed' 
    };
  }
  
  // Check length (1-30 characters)
  if (trimmed.length > 30) {
    return { 
      isValid: false, 
      message: 'Username must be 30 characters or less' 
    };
  }
  
  return { isValid: true, message: '' };
}

// Sanitize username input to prevent XSS
function sanitizeUsername(username) {
  // Remove any HTML tags and special characters except alphanumeric and underscore
  return username.replace(/[^a-zA-Z0-9_]/g, '');
}

// Username Check Handler
async function handleUsernameCheck() {
  const username = sanitizeUsername(elements.usernameInput.value.trim());
  
  if (!username) {
    showError('Please enter a username.');
    return;
  }
  
  // Validate one more time before checking
  const validation = validateUsername(username);
  if (!validation.isValid) {
    showError(validation.message);
    return;
  }
  
  console.log('Checking username availability:', username);
  
  // Disable button during check
  elements.checkUsernameBtn.disabled = true;
  elements.checkUsernameBtn.textContent = 'Checking...';
  
  // Show loading state
  showLoadingState();
  
  try {
    // Perform username check
    await performUsernameCheck(username);
    
  } catch (error) {
    console.error('Error checking username:', error);
    showErrorState('Failed to check username availability. Please try again.');
  } finally {
    // Re-enable button
    elements.checkUsernameBtn.disabled = false;
    elements.checkUsernameBtn.textContent = 'Check Availability';
  }
}

// Perform username check via background script
async function performUsernameCheck(username) {
  try {
    // Get selected platform
    const platformSelect = document.getElementById('platform-select');
    const selectedPlatform = platformSelect ? platformSelect.value : 'all';
    
    // Determine platforms to check
    let platforms = [];
    if (selectedPlatform === 'all') {
      platforms = ['all'];
    } else {
      platforms = [selectedPlatform];
    }
    
    console.log(`Checking username "${username}" on:`, platforms);
    
    // Send message to background script
    const response = await chrome.runtime.sendMessage({
      action: 'USERNAME_CHECK',
      payload: {
        username,
        platforms
      }
    });
    
    if (response.success) {
      const { results, cached } = response.data;
      console.log(`Got ${results.length} results${cached ? ' (cached)' : ''}`);
      
      // Display results
      displayUsernameResults(results, username);
      
      // Add to history
      await addSearchToHistory('username', username, results.length);
      
    } else {
      throw new Error(response.error || 'Username check failed');
    }
    
  } catch (error) {
    console.error('Error checking username:', error);
    throw error;
  }
}

// Display username check results
function displayUsernameResults(results, username) {
  if (!results || results.length === 0) {
    showEmptyState();
    return;
  }
  
  elements.resultsSection.style.display = 'flex';
  
  // Separate suggestions from platform results
  const platformResults = results.filter(r => r.metadata && !r.metadata.isSuggestion);
  const suggestions = results.filter(r => r.metadata && r.metadata.isSuggestion);
  
  // Update filter counts
  updateFilterCounts(platformResults);
  
  // Render results
  let html = '';
  
  // Platform availability results
  if (platformResults.length > 0) {
    html += '<div class="results-section-header"><h3>Availability Check</h3></div>';
    html += platformResults.map(result => createUsernameResultCard(result)).join('');
  }
  
  // Username suggestions
  if (suggestions.length > 0) {
    html += '<div class="results-section-header"><h3>💡 Available Alternatives</h3></div>';
    html += suggestions.map(result => createSuggestionCard(result)).join('');
  }
  
  elements.resultsContainer.innerHTML = html;
  
  // Add click handlers
  document.querySelectorAll('.open-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = btn.dataset.url;
      if (url && url !== '#') {
        chrome.tabs.create({ url });
      }
    });
  });
}

// Create username result card
function createUsernameResultCard(result) {
  const isAvailable = result.metadata?.available;
  const exists = result.metadata?.exists;
  const similarity = result.metadata?.similarityPercentage || 0;
  const platformName = result.metadata?.platformName || result.platform;
  
  let statusBadge = '';
  let statusClass = '';
  
  if (isAvailable) {
    statusBadge = '<span class="status-badge available">✓ Available</span>';
    statusClass = 'available';
  } else if (exists) {
    statusBadge = '<span class="status-badge taken">✗ Taken</span>';
    statusClass = 'taken';
  } else {
    statusBadge = '<span class="status-badge unknown">? Unknown</span>';
    statusClass = 'unknown';
  }
  
  const similarityInfo = similarity > 0 
    ? `<p class="similarity-info">📊 ${similarity}% similar usernames found on this platform</p>`
    : '';
  
  return `
    <div class="result-card username-card ${statusClass}">
      <div class="result-info">
        <h3>${escapeHtml(result.title)}</h3>
        <p class="platform-name">${platformName}</p>
        ${similarityInfo}
        <div class="result-badges">
          <span class="platform-badge ${result.platform}">${result.platform}</span>
          ${statusBadge}
        </div>
      </div>
      ${!isAvailable && result.url !== '#' ? `<button class="open-link" data-url="${result.url}">View Profile</button>` : ''}
    </div>
  `;
}

// Create suggestion card
function createSuggestionCard(result) {
  const availableOn = result.metadata?.availableOn || [];
  const platformsList = availableOn.map(p => `<span class="platform-badge ${p}">${p}</span>`).join(' ');
  
  return `
    <div class="result-card suggestion-card">
      <div class="result-info">
        <h3>✨ ${escapeHtml(result.title)}</h3>
        <p class="suggestion-note">Available on: ${platformsList || 'multiple platforms'}</p>
        <div class="result-badges">
          <span class="status-badge available">✓ Available</span>
        </div>
      </div>
    </div>
  `;
}

// Results Initialization
function initializeResults() {
  // Platform filters
  elements.platformFilters.forEach(filter => {
    filter.addEventListener('click', () => {
      const platform = filter.dataset.platform;
      filterResults(platform);
    });
  });
}

function filterResults(platform) {
  // Update active filter
  elements.platformFilters.forEach(filter => {
    if (filter.dataset.platform === platform) {
      filter.classList.add('active');
    } else {
      filter.classList.remove('active');
    }
  });
  
  // Get current results from the last search
  const allCards = document.querySelectorAll('.result-card');
  
  allCards.forEach(card => {
    const cardPlatform = card.querySelector('.platform-badge')?.classList[1]; // Get platform class
    
    if (platform === 'all' || cardPlatform === platform) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
  
  console.log('Filtered by platform:', platform);
}

// Loading State
function showLoadingState() {
  elements.resultsSection.style.display = 'flex';
  elements.resultsContainer.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Searching...</p>
    </div>
  `;
}

// Empty State
function showEmptyState() {
  elements.resultsContainer.innerHTML = `
    <div class="empty-state">
      <svg class="empty-icon" viewBox="0 0 48 48" fill="currentColor">
        <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm0 36c-8.82 0-16-7.18-16-16S15.18 8 24 8s16 7.18 16 16-7.18 16-16 16zm-2-22h4v12h-4zm0 16h4v4h-4z"/>
      </svg>
      <p>No results found</p>
      <p class="hint">Try a different image or username</p>
    </div>
  `;
}

// Error State
function showErrorState(message) {
  elements.resultsSection.style.display = 'flex';
  elements.resultsContainer.innerHTML = `
    <div class="error-state">
      <svg class="error-icon" viewBox="0 0 48 48" fill="currentColor">
        <path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zm2 30h-4v-4h4v4zm0-8h-4V14h4v12z"/>
      </svg>
      <p>${message}</p>
      <button class="secondary-button" onclick="location.reload()">Try Again</button>
    </div>
  `;
}

// Display Results
function displayResults(results) {
  if (!results || results.length === 0) {
    showEmptyState();
    return;
  }
  
  elements.resultsSection.style.display = 'flex';
  
  // Update filter counts
  updateFilterCounts(results);
  
  // Render results
  renderResults(results);
}

// Update platform filter counts
function updateFilterCounts(results) {
  const counts = {
    all: results.length,
    twitter: results.filter(r => r.platform === 'twitter').length,
    instagram: results.filter(r => r.platform === 'instagram').length,
    tiktok: results.filter(r => r.platform === 'tiktok').length
  };
  
  elements.platformFilters.forEach(filter => {
    const platform = filter.dataset.platform;
    const countSpan = filter.querySelector('.count');
    if (countSpan) {
      countSpan.textContent = `(${counts[platform] || 0})`;
    }
  });
}

// Render results
function renderResults(results, filterPlatform = 'all') {
  const filteredResults = filterPlatform === 'all' 
    ? results 
    : results.filter(r => r.platform === filterPlatform);
  
  if (filteredResults.length === 0) {
    elements.resultsContainer.innerHTML = `
      <div class="empty-state">
        <p>No results for this platform</p>
      </div>
    `;
    return;
  }
  
  const html = filteredResults.map(result => createResultCard(result)).join('');
  elements.resultsContainer.innerHTML = html;
  
  // Add click handlers to open links
  document.querySelectorAll('.open-link').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const url = btn.dataset.url;
      chrome.tabs.create({ url });
    });
  });
}

// Create result card HTML
function createResultCard(result) {
  const isUsername = result.type === 'username';
  const isAvailable = result.metadata?.available;
  
  // Status badge for username checks
  let statusBadge = '';
  if (isUsername) {
    if (isAvailable) {
      statusBadge = '<span class="status-badge available">✓ Available</span>';
    } else {
      statusBadge = '<span class="status-badge taken">✗ Taken</span>';
    }
  }
  
  // Thumbnail image
  const thumbnail = result.thumbnailUrl 
    ? `<img src="${result.thumbnailUrl}" class="result-thumbnail" alt="Thumbnail" onerror="this.style.display='none'">` 
    : '';
  
  // Follower count
  const followerCount = result.metadata?.followerCount 
    ? `<p class="follower-count">👥 ${result.metadata.followerCount.toLocaleString()} followers</p>` 
    : '';
  
  // Snippet/description
  const snippet = result.metadata?.snippet 
    ? `<p class="result-snippet">${escapeHtml(result.metadata.snippet.substring(0, 150))}${result.metadata.snippet.length > 150 ? '...' : ''}</p>` 
    : '';
  
  // Match type badge
  const matchType = result.metadata?.matchType 
    ? `<span class="match-type">${result.metadata.matchType}</span>` 
    : '';
  
  // Extract username from URL if possible
  let displayUrl = result.url;
  if (result.url && result.url !== '#') {
    try {
      const urlObj = new URL(result.url);
      displayUrl = urlObj.hostname + urlObj.pathname;
      if (displayUrl.length > 40) {
        displayUrl = displayUrl.substring(0, 40) + '...';
      }
    } catch (e) {
      // Keep original URL if parsing fails
    }
  }
  
  return `
    <div class="result-card" data-url="${result.url}">
      ${thumbnail}
      <div class="result-info">
        <h3>${escapeHtml(result.title)}</h3>
        <p class="result-url">${escapeHtml(displayUrl)}</p>
        ${snippet}
        <div class="result-badges">
          <span class="platform-badge ${result.platform}">${result.platform}</span>
          ${matchType}
          ${statusBadge}
        </div>
        ${followerCount}
      </div>
      <button class="open-link" data-url="${result.url}">Open</button>
    </div>
  `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// History Initialization
async function initializeHistory() {
  // Load history on startup
  await loadHistory();
  
  // Clear history button
  elements.clearHistoryBtn.addEventListener('click', async () => {
    await clearHistory();
  });
  
  // History selection
  elements.searchHistory.addEventListener('change', async (e) => {
    const historyId = e.target.value;
    if (historyId) {
      await loadHistoryEntry(historyId);
    }
  });
}

// Load search history
async function loadHistory() {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'GET_HISTORY'
    });
    
    if (response.success && response.data) {
      const history = response.data;
      
      if (history.length > 0) {
        elements.searchHistory.innerHTML = '<option value="">Search History</option>';
        
        history.forEach(entry => {
          const option = document.createElement('option');
          option.value = entry.id;
          option.textContent = formatHistoryEntry(entry);
          elements.searchHistory.appendChild(option);
        });
        
        elements.searchHistory.disabled = false;
        elements.clearHistoryBtn.disabled = false;
      } else {
        elements.searchHistory.innerHTML = '<option value="">No history</option>';
        elements.searchHistory.disabled = true;
        elements.clearHistoryBtn.disabled = true;
      }
    }
  } catch (error) {
    console.error('Error loading history:', error);
  }
}

// Format history entry for display
function formatHistoryEntry(entry) {
  const typeIcon = entry.type === 'image' ? '🖼️' : '👤';
  const queryPreview = entry.query.length > 15 
    ? entry.query.substring(0, 15) + '...' 
    : entry.query;
  const timeStr = formatRelativeTime(entry.timestamp);
  
  return `${typeIcon} ${queryPreview} (${entry.resultCount}) - ${timeStr}`;
}

// Format relative time
function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  
  if (minutes < 1) return 'now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return 'yesterday';
}

// Add search to history
async function addSearchToHistory(type, query, resultCount) {
  try {
    await chrome.runtime.sendMessage({
      action: 'ADD_TO_HISTORY',
      payload: {
        type,
        query,
        resultCount
      }
    });
    
    // Reload history dropdown
    await loadHistory();
  } catch (error) {
    console.error('Error adding to history:', error);
  }
}

// Clear history
async function clearHistory() {
  try {
    await chrome.runtime.sendMessage({
      action: 'CLEAR_HISTORY'
    });
    
    elements.searchHistory.innerHTML = '<option value="">No history</option>';
    elements.searchHistory.disabled = true;
    elements.clearHistoryBtn.disabled = true;
    
    console.log('History cleared');
  } catch (error) {
    console.error('Error clearing history:', error);
  }
}

// Load a specific history entry
async function loadHistoryEntry(historyId) {
  try {
    const response = await chrome.runtime.sendMessage({
      action: 'GET_HISTORY_ENTRY',
      payload: { id: historyId }
    });
    
    if (response.success && response.data) {
      const entry = response.data;
      console.log('Loading history entry:', entry);
      
      // Switch to appropriate mode
      switchMode(entry.type);
      
      // TODO: Restore search state and results
      // This would require storing results with history
    }
  } catch (error) {
    console.error('Error loading history entry:', error);
  }
}

// Close Button
function initializeCloseButton() {
  elements.closePanel.addEventListener('click', () => {
    window.close();
  });
}
