console.log('Git Branch Extension loaded!');

function createGitBranchName() {
    try {
        // Get ID
        const idContainerElement = document.querySelector('.flex-row.body-xl.padding-bottom-4');
        console.log('ID container found:', idContainerElement?.innerHTML);
        
        const idText = Array.from(idContainerElement?.childNodes || [])
            .find(node => node.nodeType === Node.TEXT_NODE && /^\d+$/.test(node.textContent.trim()))
            ?.textContent.trim();
            
        if (!idText) {
            const linkText = document.querySelector('a.bolt-link').textContent.trim();
            const idMatch = linkText.match(/\d+/);
            if (idMatch) {
                idText = idMatch[0];
            } else {
                throw new Error('Could not find ticket ID');
            }
        }

        // Get title
        const titleElement = document.querySelector('.work-item-title-textfield input');
        if (!titleElement) {
            throw new Error('Could not find title element');
        }
        const ticketTitle = titleElement.value.trim();
        
        // Format the title with 50 char limit
        // Note: We apply the limit AFTER the AB#id- prefix to ensure we get 50 chars of actual title
        const prefix = `AB#${idText}-`;
        const maxTitleLength = 50;
        
        const formattedTitle = ticketTitle
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
            .replace(/\s+/g, '-')          // Replace spaces with hyphens
            .trim()
            .substring(0, maxTitleLength)   // Limit to 50 chars
            .replace(/-+$/, '');           // Remove trailing hyphens
            
        return `${prefix}${formattedTitle}`;
    } catch (error) {
        console.error('Error creating branch name:', error);
        throw error;
    }
}

function addButton() {
    try {
        // Don't add if already exists
        if (document.querySelector('.git-branch-button')) {
            return;
        }
        
        const commandBar = document.querySelector('.work-item-header-command-bar');
        if (!commandBar) {
            return; // Exit if command bar isn't found yet
        }

        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'bolt-header-command-item-button git-branch-wrapper';
        
        const button = document.createElement('button');
        button.className = 'git-branch-button bolt-button bolt-icon-button enabled subtle icon-only bolt-focus-treatment';
        button.setAttribute('data-is-focusable', 'true');
        button.setAttribute('role', 'menuitem');
        button.setAttribute('aria-label', 'Copy Git Branch Name');
        
        const iconWrapper = document.createElement('span');
        iconWrapper.className = 'fluent-icons-enabled';
        const icon = document.createElement('span');
        icon.className = 'left-icon flex-noshrink fabric-icon ms-Icon--BranchMerge medium';
        icon.setAttribute('aria-hidden', 'true');
        
        iconWrapper.appendChild(icon);
        button.appendChild(iconWrapper);
        buttonWrapper.appendChild(button);
        
        button.addEventListener('click', () => {
            try {
                const branchName = createGitBranchName();
                copyToClipboard(branchName);
            } catch (error) {
                console.error('Error in click handler:', error);
                alert('Failed to generate branch name. See console for details.');
            }
        });

        // Add to command bar
        commandBar.firstElementChild.appendChild(buttonWrapper);
        
        // Add positioning styles
        const style = document.createElement('style');
        style.textContent = `
            .git-branch-wrapper {
                order: 3 !important;
            }
            .bolt-expandable-button {
                order: 4 !important;
            }
        `;
        if (!document.querySelector('style[data-git-branch-styles]')) {
            style.setAttribute('data-git-branch-styles', 'true');
            document.head.appendChild(style);
        }
        
        console.log('Branch copy button added successfully');
    } catch (error) {
        console.error('Error in addButton:', error);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(
        () => {
            const button = document.querySelector('.git-branch-button');
            button.setAttribute('aria-label', 'Copied!');
            setTimeout(() => {
                button.setAttribute('aria-label', 'Copy Git Branch Name');
            }, 1500);
        },
        (err) => {
            console.error('Failed to copy text: ', err);
            alert('Failed to copy to clipboard: ' + err.message);
        }
    );
}

// Function to check if we're on a work item
function isWorkItemVisible() {
    // Check for the existence of work item elements
    return !!(
        document.querySelector('.work-item-form-header') && 
        document.querySelector('.work-item-header-command-bar') &&
        document.querySelector('.work-item-title-textfield input')
    );
}

// Function to handle page/state changes
function handleStateChange() {
    if (isWorkItemVisible()) {
        // Try adding the button multiple times to handle dynamic loading
        const attempts = [0, 100, 500, 1000, 2000];
        attempts.forEach(delay => {
            setTimeout(addButton, delay);
        });
    }
}

// Initial setup
handleStateChange();

// Listen for dynamic content changes
const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        const workItemForm = document.querySelector('.work-item-form-header');
        const commandBar = document.querySelector('.work-item-header-command-bar');
        
        // Check if we have a work item visible and don't have our button
        if (workItemForm && commandBar && !document.querySelector('.git-branch-button')) {
            console.log('Work item detected, adding button');
            handleStateChange();
            break;
        }
    }
});

// Start observing with a more specific target
observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false,
    characterData: false
});

// Also check when URL parameters change (for board navigation)
let lastSearch = location.search;
setInterval(() => {
    const currentSearch = location.search;
    if (currentSearch !== lastSearch) {
        lastSearch = currentSearch;
        console.log('URL parameters changed, checking for work item');
        handleStateChange();
    }
}, 500);