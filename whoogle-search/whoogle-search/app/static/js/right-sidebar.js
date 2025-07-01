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
        // Remove any existing sidebar first - try multiple selectors
        const existingSidebars = document.querySelectorAll('.right-sidebar, .standalone-sidebar');
        existingSidebars.forEach(sidebar => {
            sidebar.remove();
            console.log('Right Sidebar: Removed existing sidebar');
        });
        
        // Find where search results actually start by looking for the first search result
        const firstResult = document.querySelector('.result') || document.querySelector('[data-ved]') || document.querySelector('div[jscontroller]') || document.querySelector('h3') || document.querySelector('a[href*="http"]');
        const searchResults = document.querySelector('#main') || document.querySelector('.main-column') || document.querySelector('body > div:last-child');
        
        // FORCE sidebar to appear MUCH lower - override everything
        let topPosition = 600; // Force it VERY low - 600px from top
        
        console.log('Right Sidebar: FORCING position to 600px from top');
        
        // Ignore all calculations, just force it lower
        topPosition = 600;
        
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
        
        // Create sidebar that attaches to body with timestamp for uniqueness
        const sidebar = document.createElement('div');
        sidebar.className = 'right-sidebar standalone-sidebar';
        sidebar.id = `sidebar-${Date.now()}`; // Force unique ID
        sidebar.style.cssText = `
            position: fixed !important;
            top: ${topPosition}px !important;
            left: ${sidebarLeft}px !important;
            width: ${finalWidth}px !important;
            height: calc(100vh - ${topPosition + 40}px) !important;
            z-index: 1000 !important;
            overflow-y: auto !important;
        `;
        sidebar.innerHTML = `
            <div class="sidebar-content">
                <div style="font-size: 16px; font-weight: 500; margin-bottom: 10px; color: var(--whoogle-text);">Quick Info</div>
                <div style="color: var(--whoogle-text); font-size: 14px; line-height: 1.4;">
                    <div style="background: #f0f0f0; padding: 8px; border-radius: 4px; margin-bottom: 10px; font-size: 12px;">
                        Position: ${topPosition}px | Width: ${finalWidth}px | Time: ${new Date().toLocaleTimeString()}
                    </div>
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
        
        // FORCE repositioning after creation with multiple attempts
        setTimeout(() => {
            sidebar.style.top = '600px !important';
            console.log('Right Sidebar: Force repositioned to 600px after 100ms');
        }, 100);
        
        setTimeout(() => {
            sidebar.style.top = '600px !important';
            console.log('Right Sidebar: Force repositioned to 600px after 500ms');
        }, 500);
        
        setTimeout(() => {
            sidebar.style.top = '600px !important';
            console.log('Right Sidebar: Force repositioned to 600px after 1000ms');
        }, 1000);
        
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
                sidebar.style.top = '600px'; // Force position on resize too
            }
        };
        
        window.addEventListener('resize', updateSidebarSize);
        
        console.log('Right Sidebar: Standalone sidebar created with FORCED 600px positioning');
    }
    
    adjustLayout() {
        // Add class to body to trigger CSS layout adjustments
        document.body.classList.add('has-sidebar');
        console.log('Right Sidebar: Layout adjusted for sidebar');
    }
}

// FORCE sidebar creation - more aggressive approach
function forceCreateSidebar() {
    console.log('FORCE CREATE SIDEBAR: Starting forced creation');
    
    // Remove ALL existing sidebars
    document.querySelectorAll('.right-sidebar, .standalone-sidebar, [id*="sidebar"]').forEach(el => {
        el.remove();
        console.log('FORCE CREATE SIDEBAR: Removed existing element');
    });
    
    // Create sidebar directly without class logic
    const sidebar = document.createElement('div');
    sidebar.className = 'right-sidebar standalone-sidebar forced-sidebar';
    sidebar.id = `forced-sidebar-${Date.now()}`;
    sidebar.style.cssText = `
        position: fixed !important;
        top: 300px !important;
        right: 20px !important;
        width: 350px !important;
        height: 400px !important;
        background: white !important;
        border: 2px solid #007acc !important;
        border-radius: 12px !important;
        padding: 20px !important;
        z-index: 9999 !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
        overflow-y: auto !important;
    `;
    
    sidebar.innerHTML = `
        <div style="color: #333; font-family: Arial;">
            <h3 style="margin: 0 0 10px 0; color: #007acc;">Quick Info Panel</h3>
            <p style="margin: 0 0 10px 0; font-size: 14px;">FORCED POSITION: 300px from top</p>
            <div style="background: #f0f8ff; padding: 10px; border-radius: 6px; margin: 10px 0;">
                <strong>Search Tools</strong><br>
                <small>Enhanced functionality panel</small>
            </div>
            <div style="background: #f0f8ff; padding: 10px; border-radius: 6px; margin: 10px 0;">
                <strong>Related Info</strong><br>
                <small>Additional context area</small>
            </div>
        </div>
    `;
    
    document.body.appendChild(sidebar);
    console.log('FORCE CREATE SIDEBAR: Forced sidebar created at 300px');
    
    return sidebar;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Right Sidebar: DOM loaded, starting FORCED initialization...');
    
    // Force create immediately
    forceCreateSidebar();
    
    // Force create with delays
    setTimeout(forceCreateSidebar, 500);
    setTimeout(forceCreateSidebar, 1000);
    setTimeout(forceCreateSidebar, 2000);
});

// Also try on window load
window.addEventListener('load', function() {
    console.log('Right Sidebar: Window loaded, forcing sidebar...');
    setTimeout(forceCreateSidebar, 100);
});