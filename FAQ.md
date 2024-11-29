# Frequently Asked Questions (FAQ)

## General Questions

### What is Meta Tag Fetcher 
Meta Tag Fetcher is a Chrome extension that helps you extract, manage, and customize meta tags from web pages. It's designed for developers, SEO specialists, and content managers who need quick access to page metadata.

### Is it free to use?
Yes, Meta Tag Fetcher is completely free to use and open source.

### Which browsers are supported?
Currently, the extension supports Google Chrome and other Chromium-based browsers (version 88 or higher).

## Features

### What types of meta tags can it extract?
- Standard HTML meta tags
- Open Graph meta tags
- Twitter Card meta tags
- Page title and favicon
- Canonical URLs

### Can I customize the field names?
Yes! You can create custom field mappings in the settings page. For example, you can map 'og:description' to 'description' for a cleaner JSON output.

### How do I copy the data?
- Click the copy button next to individual fields
- Use the "Copy JSON" button for the complete dataset
- For images, click the copy button to copy the image URL

### Is there a keyboard shortcut?
Yes, you can use `Ctrl+Shift+M` (Windows/Linux) or `Command+Shift+M` (Mac) to open the extension.

## Data & Privacy

### Does the extension collect my data?
No, Meta Tag Fetcher does not collect any personal data. All processing happens locally on your device.

### Where are my settings stored?
Your settings (like field mappings) are stored locally in your browser using Chrome's storage API.

### Does it require an internet connection?
No, the extension works completely offline once installed.

## Troubleshooting

### The extension isn't extracting meta tags
Check if:
1. You're on a valid web page (not a Chrome internal page)
2. The page has finished loading
3. You have granted the necessary permissions

### My custom mappings aren't working
Make sure to:
1. Click the "Save Changes" button after making changes
2. Use the correct original field names
3. Avoid duplicate target field names

### The JSON view is empty
This usually means:
1. The page has no meta tags
2. The page is still loading
3. You're on a restricted page

## Support & Updates

### How do I report issues?
Visit our [GitHub Issues page](https://github.com/zongxiaocheng/meta-tag-fetcher/issues) to:
1. Report bugs
2. Request features
3. Get help with problems

### How often is the extension updated?
We release updates regularly to:
- Fix bugs
- Add new features
- Improve performance
- Enhance security

### Can I contribute to the project?
Yes! We welcome contributions. Visit our [GitHub repository](https://github.com/zongxiaocheng/meta-tag-fetcher) to:
1. Fork the project
2. Submit pull requests
3. Suggest improvements
4. Report issues

## Technical Details

### Permissions
The extension requires these permissions:
- `activeTab`: To read meta tags from the current tab
- `storage`: To save your settings
- `scripting`: To extract meta tag information

### Data Format
The JSON output follows this format:
```json
{
  "title": "Page Title",
  "description": "Meta description",
  "og:image": "https://example.com/image.jpg",
  // ... other meta tags
}
```

### Browser Compatibility
- Chrome: v88+
- Edge: v88+
- Opera: v74+
- Other Chromium-based browsers: Most recent versions

## Getting Started

### Installation Steps
1. Install from Chrome Web Store
2. Click the extension icon
3. Grant required permissions
4. Start extracting meta tags

### Basic Usage
1. Navigate to any web page
2. Click the extension icon
3. View meta tags in table format
4. Switch to JSON view if needed
5. Copy or download the data

### Advanced Features
1. Create custom field mappings
2. Use keyboard shortcuts
3. Download images and favicons
4. Filter and sort meta tags

Need more help? Visit our [documentation](https://github.com/zongxiaocheng/meta-tag-fetcher/wiki) or [contact us](mailto:hi@onlinestool.com).
