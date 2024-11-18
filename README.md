# Azure DevOps Git Branch Name Generator

A Chrome extension that adds a button to Azure DevOps work items for generating and copying standardized git branch names.

## Features
- Adds a branch icon button to the Azure DevOps work item command bar
- Automatically generates branch names in the format: `AB#<id>-<title>`
- Truncates long titles to 50 characters
- Works with dynamic page loads and board navigation
- Provides visual feedback when branch name is copied
- Maintains consistent position in the UI next to standard Azure DevOps controls

## Installation Instructions

1. **Download the Extension Files**
   Create a new directory containing these files:
   - `manifest.json` - Extension configuration
   - `content.js` - Main extension logic
   - `styles.css` - Styling for the button

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" using the toggle in the top right corner
   - Click "Load unpacked"
   - Select the directory containing your extension files

3. **Verify Installation**
   - Navigate to your Azure DevOps board
   - Open any work item
   - You should see a new branch icon button in the command bar
   - Click the button to copy the formatted branch name

## Usage

1. Open any work item in Azure DevOps
2. Locate the branch icon button in the command bar (next to Save, Follow, etc.)
3. Click the button to copy the branch name
4. The button will briefly display "Copied!" to confirm the action
5. Paste the branch name wherever needed

## Branch Name Format

The extension generates branch names following this format:
- Prefix: `AB#<id>-`
- Title: Up to 50 characters of the work item title
- Special characters are removed
- Spaces are replaced with hyphens
- All text is converted to lowercase

Example:
```
Original: Work Item #46600: "Update scheduler impersonation page to show all managers"
Generated: AB#46600-update-scheduler-impersonation-page-to-show-all
```

## Troubleshooting

If the button doesn't appear:
- Refresh the page
- Check if Developer mode is enabled in Chrome extensions
- Verify the extension is enabled
- Check the browser console for any error messages

If the button appears but copying fails:
- Check the browser console for error messages
- Ensure the work item has loaded completely
- Verify clipboard permissions are enabled for the extension

## Development

To modify the extension:
1. Make changes to the source files
2. Navigate to `chrome://extensions/`
3. Click the refresh icon on the extension card
4. Reload any Azure DevOps tabs to see the changes

Common customization points:
- Branch name format in `createGitBranchName()`
- Button styling in `styles.css`
- Position/order in the command bar (adjust the `order` CSS property)

## Files

- `manifest.json`: Extension configuration and permissions
```json
{
  "manifest_version": 3,
  "name": "Azure DevOps Git Branch Generator",
  "version": "1.0",
  "description": "Copies formatted Git branch names from Azure DevOps tickets",
  "permissions": ["clipboardWrite"],
  "content_scripts": [
    {
      "matches": ["*://*.visualstudio.com/*", "*://dev.azure.com/*"],
      "js": ["content.js"],
      "css": ["styles.css"]
    }
  ]
}
```

- `styles.css`: Button styling
```css
.git-branch-button {
    height: 32px;
    padding: 0 8px;
    margin: 0 4px;
    background: transparent;
    border: none;
    cursor: pointer;
    color: rgb(49, 49, 49);
    display: inline-flex;
    align-items: center;
}

.git-branch-wrapper {
    order: 3 !important;
}

.bolt-expandable-button {
    order: 4 !important;
}
```

## Updates and Maintenance

To update the extension:
1. Make your changes
2. Reload the extension in Chrome
3. Test thoroughly with different work items and navigation patterns

## License

Feel free to modify and use this extension according to your needs.

## Support

For issues or feature requests:
1. Check the browser console for error messages
2. Verify the Azure DevOps page structure hasn't changed
3. Ensure all permissions are correctly set