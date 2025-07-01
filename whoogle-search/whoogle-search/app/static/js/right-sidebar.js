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
        // Find the exact position where search results start
        const header = document.querySelector('header') || document.querySelector('.header-container');
        const tabs = document.querySelector('.header-tab-div') || document.querySelector('.desktop-header');
        const searchResults = document.querySelector('#main') || document.querySelector('.main-column') || document.querySelector('body > div');
        
        let topPosition = 140; // Default fallback
        
        // Calculate exact top position based on header and tabs
        if (header && tabs) {
            const headerRect = header.getBoundingClientRect();
            const tabsRect = tabs.getBoundingClientRect();
            topPosition = headerRect.height + tabsRect.height + 10;
        } else if (header) {
            const headerRect = header.getBoundingClientRect();
            topPosition = headerRect.height + 40;
        } else if (tabs) {
            const tabsRect = tabs.getBoundingClientRect();
            topPosition = tabsRect.bottom + 10;
        }
        
        // More accurate width calculation
        const searchResultsLeft = 120; // Based on the CSS margin-left for search results
        const rightMargin = 20; // Right margin for sidebar
        const gapBetweenContent = 30; // Gap between search results and sidebar
        
        // Calculate search results actual width
        let searchResultsWidth = 600; // Default
        if (searchResults) {
            const resultsRect = searchResults.getBoundingClientRect();
            searchResultsWidth = resultsRect.width || 600;
        }
        
        // Calculate available space for sidebar
        const totalAvailableWidth = window.innerWidth - searchResultsLeft - rightMargin;
        const sidebarWidth = Math.max(250, totalAvailableWidth - searchResultsWidth - gapBetweenContent);
        
        const finalWidth = Math.max(250, Math.min(450, sidebarWidth));
        
        console.log('Right Sidebar: Positioning calculations:', {
            topPosition,
            searchResultsLeft,
            searchResultsWidth,
            sidebarWidth,
            finalWidth,
            windowWidth: window.innerWidth
        });
        
        // Create sidebar that attaches to body
        const sidebar = document.createElement('div');
        sidebar.className = 'right-sidebar standalone-sidebar';
        sidebar.style.cssText = `
            position: fixed;
            top: ${topPosition}px;
            right: ${rightMargin}px;
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
        
        // Update sidebar size on window resize
        const updateSidebarSize = () => {
            const newSearchResultsWidth = searchResults ? searchResults.getBoundingClientRect().width : 600;
            const newTotalAvailableWidth = window.innerWidth - searchResultsLeft - rightMargin;
            const newSidebarWidth = Math.max(250, newTotalAvailableWidth - newSearchResultsWidth - gapBetweenContent);
            const newFinalWidth = Math.max(250, Math.min(450, newSidebarWidth));
            
            sidebar.style.width = `${newFinalWidth}px`;
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
    const maxAttempts = 10;
    
    const tryInitialize = () => {
        attempts++;
        try {
            const sidebar = new RightSidebar();
            if (!document.querySelector('.right-sidebar') && attempts < maxAttempts) {
                console.log(`Right Sidebar: Attempt ${attempts}, retrying...`);
                setTimeout(tryInitialize, 300);
            }
        } catch (error) {
            console.error('Right Sidebar: Failed to initialize:', error);
            if (attempts < maxAttempts) {
                setTimeout(tryInitialize, 300);
            }
        }
    };
    
    // Start initialization
    setTimeout(tryInitialize, 200);
    
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