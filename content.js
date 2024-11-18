// content.js with added debugging
console.log('Git Branch Extension loaded!');

// content.js
function createGitBranchName() {
    try {
        // Let's add more debug logging to see what we're finding
        const idContainerElement = document.querySelector('.flex-row.body-xl.padding-bottom-4');
        console.log('ID container found:', idContainerElement?.innerHTML);
        
        // Try to get the ID by finding the first text node with just numbers
        const idText = Array.from(idContainerElement?.childNodes || [])
            .find(node => node.nodeType === Node.TEXT_NODE && /^\d+$/.test(node.textContent.trim()))
            ?.textContent.trim();
            
        if (!idText) {
            // Fallback: try to get from the link text
            const linkText = document.querySelector('a.bolt-link').textContent.trim();
            const idMatch = linkText.match(/\d+/);
            if (idMatch) {
                idText = idMatch[0];
            } else {
                throw new Error('Could not find ticket ID');
            }
        }
        
        console.log('Found ticket ID:', idText);

        // Get the title
        const titleElement = document.querySelector('.work-item-title-textfield input');
        if (!titleElement) {
            throw new Error('Could not find title element');
        }
        const ticketTitle = titleElement.value.trim();
        console.log('Found ticket title:', ticketTitle);
        
        // Format the title
        const formattedTitle = ticketTitle
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')  // Remove special characters
            .replace(/\s+/g, '-')          // Replace spaces with hyphens
            .substring(0, 50)              // Limit length
            .replace(/-+$/, '');           // Remove trailing hyphens
            
        console.log('Formatted title:', formattedTitle);
        
        // Create branch name with confirmed ticket ID
        const branchName = `AB#${idText}-${formattedTitle}`;
        console.log('Final branch name:', branchName);
        
        return branchName;
    } catch (error) {
        console.error('Error creating branch name:', error);
        console.log('DOM state:', {
            idContainer: document.querySelector('.flex-row.body-xl.padding-bottom-4')?.innerHTML,
            linkText: document.querySelector('a.bolt-link')?.textContent,
            titleElement: document.querySelector('.work-item-title-textfield input')?.value
        });
        throw error;
    }
}

function copyToClipboard(text) {
    console.log('Attempting to copy:', text);
    navigator.clipboard.writeText(text).then(
        () => {
            console.log('Successfully copied to clipboard');
            const button = document.querySelector('.git-branch-button');
            // Show a temporary tooltip or change the icon to indicate success
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

// content.js
function addButton() {
    try {
        if (document.querySelector('.git-branch-button')) {
            return;
        }
        
        const buttonWrapper = document.createElement('div');
        buttonWrapper.className = 'bolt-header-command-item-button git-branch-wrapper';  // Added specific class
        
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

        const commandBar = document.querySelector('.work-item-header-command-bar');
        if (commandBar && commandBar.firstElementChild) {
            commandBar.firstElementChild.appendChild(buttonWrapper);
            
            // Add specific styles after appending
            const style = document.createElement('style');
            style.textContent = `
                .git-branch-wrapper {
                    order: 3 !important;
                }
                /* Target the more actions button to ensure it's last */
                .bolt-expandable-button {
                    order: 4 !important;
                }
            `;
            document.head.appendChild(style);
            
            console.log('Button appended successfully with positioning styles');
        }
    } catch (error) {
        console.error('Error in addButton:', error);
    }
}

// Simplify the observer to reduce potential errors
let attempts = 0;
const maxAttempts = 5;

const tryAddButton = () => {
    if (attempts >= maxAttempts) return;
    attempts++;
    
    if (!document.querySelector('.git-branch-button')) {
        setTimeout(addButton, 1000);
    }
};

// Try once on initial load
tryAddButton();

// Simple observer that just triggers tryAddButton
const observer = new MutationObserver(tryAddButton);

observer.observe(document.body, {
    childList: true,
    subtree: true
});