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
  - Clean, responsive design using Tailwind CSS
  - Intuitive navigation and controls
  - Toast notifications for user feedback
  - Dark mode support (coming soon)

- **Advanced Data Management**
  - View data in both table and JSON formats
  - Copy individual values or entire JSON data
  - Download images and favicons directly
  - Flattened JSON structure for better readability

## 📥 Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/meta-tag-fetcher.git
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked" and select the cloned directory

## 🚀 Usage

1. **Basic Usage**
   - Click the extension icon to view meta tags of the current page
   - Switch between table and JSON views using the toggle button
   - Copy values by clicking the copy button next to each field

2. **Customizing Field Mappings**
   - Click the settings icon to open the options page
   - Add new mappings using the "Add New Mapping" button
   - Enter the original field name and desired new name
   - Click "Save Changes" to apply your mappings

3. **JSON Data Export**
   - Switch to JSON view using the toggle button
   - Click "Copy JSON" to copy all data in JSON format
   - All field mappings will be applied to the copied JSON

## 🛠️ Development

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Chrome browser

### Setup
1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the extension:
   ```bash
   npm run build
   ```

3. For development with hot-reload:
   ```bash
   npm run dev
   ```

### Project Structure
```
meta-tag-fetcher/
├── manifest.json        # Extension manifest
├── popup.html          # Main popup interface
├── popup.js            # Popup functionality
├── options.html        # Settings page
├── options.js          # Settings functionality
├── styles/
│   ├── main.css       # Main styles
│   └── style.css      # Additional styles
└── assets/            # Images and icons
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Tailwind CSS](https://tailwindcss.com/) for the styling framework
- [Font Awesome](https://fontawesome.com/) for icons
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/) documentation

## 📞 Support

If you encounter any issues or have questions:
1. Check the [Issues](https://github.com/yourusername/meta-tag-fetcher/issues) page
2. Create a new issue if your problem isn't already listed
3. Provide as much detail as possible, including:
   - Chrome version
   - Extension version
   - Steps to reproduce
   - Expected vs actual behavior

## 🗺️ Roadmap

- [ ] Dark mode support
- [ ] Export/import settings
- [ ] Advanced filtering options
- [ ] Support for more meta tag types
- [ ] Batch operations
- [ ] Custom CSS injection
- [ ] Keyboard shortcuts

## 📊 Version History

- **1.0.0** (Current)
  - Initial release
  - Basic meta tag extraction
  - Field mapping functionality
  - JSON/Table view toggle
  - Settings page

## 💡 Tips

- Use the JSON view for a complete overview of all meta tags
- Create field mappings to standardize meta tag names across different websites
- Use the copy feature to quickly grab specific values
- Check the settings page for customization options

---

Made with ❤️ by [Your Name]
