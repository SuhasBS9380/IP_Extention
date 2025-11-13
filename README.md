# Social Media Scanner Chrome Extension

A Chrome extension that enables reverse image searches and username availability checking across Twitter, Instagram, and TikTok.

## Features

- **Reverse Image Search**: Upload images or provide URLs to find where they appear across social media
- **Username Availability Check**: Check if a username is available on Twitter, Instagram, and TikTok simultaneously
- **Side Panel Interface**: Clean, persistent interface that opens alongside your browser
- **Platform Filtering**: Filter results by specific social media platforms
- **Search History**: Quick access to your last 5 searches
- **Smart Caching**: Reduces API calls by caching results for 1 hour

## Installation

### Quick Start (2 Steps)

#### Step 1: Start Backend Server
```bash
# Double-click START_SERVER.bat (Windows)
# OR run manually:
cd server
npm install
npm start
```

Server runs on `http://localhost:3000`

#### Step 2: Load Extension
1. Open Chrome: `chrome://extensions/`
2. Enable "Developer mode" (top right)
3. Click "Load unpacked"
4. Select this folder
5. Done! ✅

### API Keys Setup

This extension requires API keys to function:

#### Google Custom Search API (for reverse image search)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable "Custom Search API"
4. Create credentials (API Key)
5. Copy your API key

#### RapidAPI Username Checker (for username availability)
1. Go to [RapidAPI Hub](https://rapidapi.com/hub)
2. Search for "Username Availability Checker"
3. Subscribe to a plan (free tier available)
4. Copy your RapidAPI key

#### Configure Keys
- Open the extension
- Click the settings icon
- Paste your API keys
- Save

## Usage

### Image Search
1. Click the extension icon to open the side panel
2. Select "Image Search" tab
3. Upload an image (drag & drop or file picker) or paste an image URL
4. Click "Search"
5. View results filtered by platform

### Username Check
1. Click the extension icon to open the side panel
2. Select "Username Check" tab
3. Enter a username
4. Click "Check Availability"
5. See availability status with color coding:
   - 🟢 Green = Available
   - 🔴 Red = Taken (with link to profile)
   - 🟡 Yellow = Checking...

## Project Structure

```
social-media-scanner/
├── manifest.json              # Extension configuration
├── sidepanel.html            # Side panel UI
├── sidepanel.js              # Side panel logic
├── sidepanel.css             # Side panel styling
├── background.js             # Background service worker
├── utils/
│   ├── api-handler.js        # API integration
│   ├── image-processor.js    # Image validation & processing
│   ├── storage-manager.js    # Search history management
│   └── cache-manager.js      # Caching logic
├── icons/                    # Extension icons
└── assets/                   # Images and resources
```

## Requirements

- Chrome 88 or later
- Active internet connection
- Valid API keys (Google Custom Search, RapidAPI)

## Privacy

- Images are processed in-memory and never stored permanently
- Search history is stored locally and auto-clears after 24 hours
- All API calls use HTTPS
- No data is sent to external servers except API providers

## Known Limitations

- Google Custom Search API: 100 queries/day (free tier)
- RapidAPI: Varies by plan
- Instagram & TikTok: Limited API access, relies on reverse search results
- Side panel is tab-specific (doesn't persist across tabs)

## Troubleshooting

### Extension won't load
- Ensure you're using Chrome 88 or later
- Check that all required files are present
- Look for errors in `chrome://extensions/` (click "Errors")

### No search results
- Verify your API keys are configured correctly
- Check your internet connection
- Ensure you haven't exceeded API rate limits

### Side panel won't open
- Try reloading the extension
- Check Chrome console for errors (F12)
- Ensure sidePanel permission is granted

## Development

### Testing
Run manual tests for:
- Image upload (drag & drop, file picker, URL)
- Username validation
- Results display and filtering
- Error handling
- Cache functionality

### Building for Production
1. Remove console.log statements
2. Minify JavaScript files
3. Optimize images
4. Test on multiple platforms (Windows, macOS, Linux)
5. Create ZIP for Chrome Web Store submission

## License

MIT License - Feel free to use and modify for your projects.

## Support

For issues or questions, please check the troubleshooting section or review the code comments.
