# Meta Tag Fetcher

A powerful Chrome extension for extracting, managing, and customizing meta tags from web pages. Built with modern web technologies and designed with user experience in mind.

![Meta Tag Fetcher Banner](assets/banner.png)

## 🌟 Features

- **Real-time Meta Tag Extraction**
  - Automatically fetches meta tags from the active tab
  - Supports all standard meta tags, Open Graph, and Twitter Card tags
  - Displays page title, favicon, and canonical URL

- **Customizable Field Mapping**
  - Map meta tag fields to custom names (e.g., 'og:description' → 'description')
  - Save and manage multiple field mappings
  - Reset to default mappings with one click

- **Modern User Interface**
  - Clean, responsive design using Pure CSS
  - Intuitive navigation and controls
  - Toast notifications for user feedback
  - History tracking and management

- **Advanced Data Management**
  - View data in both table and JSON formats
  - Copy individual values or entire JSON data
  - Download images and favicons directly
  - Export history data in JSON format

## 📥 Installation

1. Clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select the cloned directory

## 🚀 Usage

1. Click the extension icon to view meta tags of the current page
2. Use the toggle button to switch between table and JSON views
3. Access history and settings through the toolbar buttons
4. Customize field mappings in the options page

## 🛠️ Project Structure
```
meta-tag-fetcher/
├── manifest.json        # Extension manifest
├── popup.html          # Main popup interface
├── popup.js            # Popup functionality
├── options.html        # Settings page
├── options.js          # Settings functionality
├── history.html        # History page
├── history.js          # History functionality
├── background.js       # Service worker
└── icons/             # Extension icons
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by [gusibi](https://github.com/gusibi)
