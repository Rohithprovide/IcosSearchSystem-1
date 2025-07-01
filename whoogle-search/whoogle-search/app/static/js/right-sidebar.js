// Right Sidebar for Search Results
class RightSidebar {
    constructor() {
        this.init();
    }
    
    init() {
        // Only initialize on search results pages
        if (!this.isSearchResultsPage()) {
            return;
        }
        
        console.log('Right Sidebar: Initializing sidebar...');
        this.createSidebar();
        this.adjustLayout();
    }
    
    isSearchResultsPage() {
        // Check if we're on a search results page
        const hasMain = document.querySelector('#main') !== null;
        const hasMainColumn = document.querySelector('.main-column') !== null;
        const hasSearchPath = window.location.pathname === '/search';
        const hasQueryParam = window.location.search.includes('q=');
        
        console.log('Right Sidebar: Checking page type:', {
            hasMain,
            hasMainColumn,
            hasSearchPath,
            hasQueryParam,
            pathname: window.location.pathname,
            search: window.location.search
        });
        
        return hasMain || hasMainColumn || hasSearchPath || hasQueryParam;
    }
    
    createSidebar() {
        // Don't create if sidebar already exists
        if (document.querySelector('.right-sidebar')) {
            console.log('Right Sidebar: Already exists, skipping creation');
            return;
        }
        
        // Try multiple selectors to find the main content area
        const selectors = ['#main', '.main-column', 'body > div', '.content', '[id*="main"]'];
        let mainContainer = null;
        
        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element && element.offsetHeight > 100) { // Make sure it's a substantial element
                mainContainer = element;
                console.log(`Right Sidebar: Found main container using selector: ${selector}`);
                break;
            }
        }
        
        // Fallback: create sidebar after body content
        if (!mainContainer) {
            console.log('Right Sidebar: No main container found, creating standalone sidebar');
            this.createStandaloneSidebar();
            return;
        }
        
        // Create a wrapper for the search results and sidebar
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'search-content-wrapper';
        
        // Create the sidebar
        const sidebar = document.createElement('div');
        sidebar.className = 'right-sidebar';
        sidebar.innerHTML = `
            <div class="sidebar-content">
                <div style="font-size: 16px; font-weight: 500; margin-bottom: 10px; color: var(--whoogle-text);">Quick Info</div>
                <div style="color: var(--whoogle-text); font-size: 14px; line-height: 1.4;">
                    <p>Enhanced search experience</p>
                    <div style="margin-top: 15px; padding: 10px; background: var(--whoogle-element-bg); border-radius: 8px;">
                        <div style="font-weight: 500; margin-bottom: 5px;">Search Tools</div>
                        <div style="font-size: 13px; opacity: 0.8;">Quick access panel for enhanced functionality</div>
                    </div>
                </div>
            </div>
        `;
        
        // Wrap the main container and add sidebar
        const parent = mainContainer.parentNode;
        parent.insertBefore(contentWrapper, mainContainer);
        contentWrapper.appendChild(mainContainer);
        contentWrapper.appendChild(sidebar);
        
        console.log('Right Sidebar: Sidebar created and integrated with search results');
    }
    
    createStandaloneSidebar() {
        // Find where search results actually start by looking for the first search result
        const firstResult = document.querySelector('.result') || document.querySelector('[data-ved]') || document.querySelector('div[jscontroller]') || document.querySelector('h3') || document.querySelector('a[href*="http"]');
        const searchResults = document.querySelector('#main') || document.querySelector('.main-column') || document.querySelector('body > div:last-child');
        
        let topPosition = 280; // Start lower by default
        
        // Use the first search result position if available
        if (firstResult) {
            const resultRect = firstResult.getBoundingClientRect();
            topPosition = resultRect.top + window.scrollY + 40; // Add 40px buffer
            console.log('Right Sidebar: Using first search result position:', topPosition);
        } else {
            // Fallback: estimate based on typical header + tabs + autocomplete height
            topPosition = 260; // Moved down more
            console.log('Right Sidebar: Using fallback position:', topPosition);
        }
        
        // Calculate positioning based on actual search results area
        const searchResultsLeft = 120; // Based on CSS margin-left
        const rightMargin = 15; // Minimal right margin
        
        // Find the actual search results container width
        let searchResultsWidth = 600; // Default fallback
        let searchResultsRight = searchResultsLeft + searchResultsWidth;
        
        if (searchResults) {
            const resultsRect = searchResults.getBoundingClientRect();
            searchResultsWidth = resultsRect.width;
            searchResultsRight = resultsRect.right;
            console.log('Right Sidebar: Search results area:', { width: searchResultsWidth, right: searchResultsRight });
        }
        
        // Calculate sidebar to fill remaining space
        const availableRightSpace = window.innerWidth - searchResultsRight - rightMargin;
        const sidebarWidth = Math.max(300, availableRightSpace - 20); // Take most of the available space
        const sidebarLeft = searchResultsRight + 20; // Small gap from search results
        
        const finalWidth = Math.max(300, sidebarWidth);
        
        console.log('Right Sidebar: Positioning calculations:', {
            topPosition,
            searchResultsLeft,
            searchResultsWidth,
            searchResultsRight,
            sidebarLeft,
            sidebarWidth,
            finalWidth,
            windowWidth: window.innerWidth,
            availableRightSpace
        });
        
        // Create sidebar that attaches to body
        const sidebar = document.createElement('div');
        sidebar.className = 'right-sidebar standalone-sidebar';
        sidebar.style.cssText = `
            position: fixed;
            top: ${topPosition}px;
            left: ${sidebarLeft}px;
            width: ${finalWidth}px;
            height: calc(100vh - ${topPosition + 40}px);
            z-index: 1000;
            overflow-y: auto;
        `;
        sidebar.innerHTML = `
            <div class="sidebar-content">
                <div style="font-size: 16px; font-weight: 500; margin-bottom: 10px; color: var(--whoogle-text);">Quick Info</div>
                <div style="color: var(--whoogle-text); font-size: 14px; line-height: 1.4;">
                    <p>Enhanced search experience</p>
                    <div style="margin-top: 15px; padding: 10px; background: var(--whoogle-element-bg); border-radius: 8px;">
                        <div style="font-weight: 500; margin-bottom: 5px;">Search Tools</div>
                        <div style="font-size: 13px; opacity: 0.8;">Quick access panel for enhanced functionality</div>
                    </div>
                    <div style="margin-top: 15px; padding: 10px; background: var(--whoogle-element-bg); border-radius: 8px;">
                        <div style="font-weight: 500; margin-bottom: 5px;">Related Info</div>
                        <div style="font-size: 13px; opacity: 0.8;">Additional context and suggestions will appear here</div>
                    </div>
                    <div style="margin-top: 15px; padding: 10px; background: var(--whoogle-element-bg); border-radius: 8px;">
                        <div style="font-weight: 500; margin-bottom: 5px;">Quick Links</div>
                        <div style="font-size: 13px; opacity: 0.8;">Useful shortcuts and related content</div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(sidebar);
        
        // Update sidebar size and position on window resize
        const updateSidebarSize = () => {
            if (searchResults) {
                const resultsRect = searchResults.getBoundingClientRect();
                const newSearchResultsRight = resultsRect.right;
                const newAvailableRightSpace = window.innerWidth - newSearchResultsRight - rightMargin;
                const newSidebarWidth = Math.max(300, newAvailableRightSpace - 20);
                const newSidebarLeft = newSearchResultsRight + 20;
                
                sidebar.style.width = `${newSidebarWidth}px`;
                sidebar.style.left = `${newSidebarLeft}px`;
            }
        };
        
        window.addEventListener('resize', updateSidebarSize);
        
        console.log('Right Sidebar: Standalone sidebar created with dynamic sizing');
    }
    
    adjustLayout() {
        // Add class to body to trigger CSS layout adjustments
        document.body.classList.add('has-sidebar');
        console.log('Right Sidebar: Layout adjusted for sidebar');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Right Sidebar: DOM loaded, initializing...');
    
    // Try multiple times to ensure we catch the search results page
    let attempts = 0;
    const maxAttempts = 15;
    
    const tryInitialize = () => {
        attempts++;
        try {
            const sidebar = new RightSidebar();
            if (!document.querySelector('.right-sidebar') && attempts < maxAttempts) {
                console.log(`Right Sidebar: Attempt ${attempts}, retrying in 200ms...`);
                setTimeout(tryInitialize, 200);
            } else if (document.querySelector('.right-sidebar')) {
                console.log('Right Sidebar: Successfully initialized!');
            }
        } catch (error) {
            console.error('Right Sidebar: Failed to initialize:', error);
            if (attempts < maxAttempts) {
                setTimeout(tryInitialize, 200);
            }
        }
    };
    
    // Start initialization immediately and with multiple intervals
    tryInitialize();
    setTimeout(tryInitialize, 100);
    setTimeout(tryInitialize, 500);
    setTimeout(tryInitialize, 1000);
    
    // Also try when the page URL changes (for single-page app behavior)
    let currentURL = window.location.href;
    setInterval(() => {
        if (window.location.href !== currentURL) {
            currentURL = window.location.href;
            console.log('Right Sidebar: URL changed, reinitializing...');
            setTimeout(() => new RightSidebar(), 300);
        }
    }, 1000);
});