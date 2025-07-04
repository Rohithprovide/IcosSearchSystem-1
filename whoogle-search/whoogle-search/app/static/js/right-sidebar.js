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
        
        // Add resize listener to dynamically adjust sidebar width
        this.addResizeListener();
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
        
        // Calculate sidebar positioning with increased width
        const availableRightSpace = window.innerWidth - searchResultsRight - rightMargin;
        const sidebarGap = 20; // Gap from search results
        const sidebarWidth = Math.max(400, availableRightSpace + 100); // Increase width by 100px
        const sidebarLeft = searchResultsRight + sidebarGap + 80 - 100; // Move left by 100px to expand leftward
        
        // Ensure minimum width but use maximum available space
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
            <div class="ai-overview-container">
                <div class="ai-overview-header">
                    <h3>
                        <div class="gemini-logo">G</div>
                        AI Overview
                    </h3>
                </div>
                <div class="ai-overview-content" id="ai-overview-content">
                    <div class="loading-state" id="loading-state" style="display: none;">
                        <div>Generating response...</div>
                        <div class="loading-dots">
                            <div></div>
                            <div></div>
                            <div></div>
                        </div>
                    </div>
                    <div class="ai-response" id="ai-response" style="display: none;">
                        <!-- AI response will be inserted here -->
                    </div>
                    <div class="error-state" id="error-state" style="display: none;">
                        Unable to generate AI overview
                    </div>
                </div>
                <div class="ai-disclaimer">
                    AI is experimental. <a href="#">Learn more</a>
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
                const newSidebarWidth = Math.max(400, newAvailableRightSpace + 100); // Increased width by 100px
                const newSidebarLeft = newSearchResultsRight + 20 + 80 - 100; // Expand leftward by 100px
                
                sidebar.style.width = `${newSidebarWidth}px`;
                sidebar.style.left = `${newSidebarLeft}px`;
                sidebar.style.top = '600px'; // Force position on resize too
            }
        };
        
        window.addEventListener('resize', updateSidebarSize);
        
        console.log('Right Sidebar: Standalone sidebar created with FORCED 600px positioning');
        
        // Initialize AI functionality
        this.initializeChatFunctionality();
    }
    
    adjustLayout() {
        // Add class to body to trigger CSS layout adjustments
        document.body.classList.add('has-sidebar');
        console.log('Right Sidebar: Layout adjusted for sidebar');
    }
    
    initializeChatFunctionality() {
        // Capture search queries and send to AI
        this.captureSearchQueries();
        console.log('Right Sidebar: Chat functionality initialized');
    }
    
    captureSearchQueries() {
        const self = this;
        
        // Method 1: Intercept form submissions immediately before navigation
        document.addEventListener('submit', function(e) {
            const form = e.target;
            const searchInput = form.querySelector('input[name="q"], input[type="search"], #search-bar');
            if (searchInput && searchInput.value.trim()) {
                // Send AI request immediately on search submission
                self.handleSearchQuery(searchInput.value.trim());
            }
        });
        
        // Method 2: Monitor search button clicks
        document.addEventListener('click', function(e) {
            if (e.target.closest('.search-button') || e.target.closest('button[type="submit"]')) {
                const form = e.target.closest('form');
                if (form) {
                    const searchInput = form.querySelector('input[name="q"], input[type="search"], #search-bar');
                    if (searchInput && searchInput.value.trim()) {
                        // Send AI request immediately on search button click
                        self.handleSearchQuery(searchInput.value.trim());
                    }
                }
            }
        });
        
        // Method 3: Monitor Enter key on search input
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                const searchInput = e.target;
                if ((searchInput.name === 'q' || searchInput.type === 'search' || searchInput.id === 'search-bar') && searchInput.value.trim()) {
                    // Send AI request immediately on Enter key
                    self.handleSearchQuery(searchInput.value.trim());
                }
            }
        });
        
        // Method 4: For search results pages, check URL parameters on page load
        if (window.location.search.includes('q=')) {
            const urlParams = new URLSearchParams(window.location.search);
            const query = urlParams.get('q');
            if (query && query.trim()) {
                // This handles cases where user navigates to search results directly
                self.handleSearchQuery(query.trim());
            }
        }
    }
    
    async handleSearchQuery(query) {
        console.log('Search query captured:', query);
        await this.sendToAI(query);
    }
    
    async sendToAI(query) {
        const loadingState = document.getElementById('loading-state');
        const aiResponse = document.getElementById('ai-response');
        const errorState = document.getElementById('error-state');
        
        // Hide previous states
        if (aiResponse) aiResponse.style.display = 'none';
        if (errorState) errorState.style.display = 'none';
        
        // Show loading
        if (loadingState) {
            loadingState.style.display = 'block';
        }
        
        try {
            const response = await fetch('/ai-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.showAIResponse(data.response);
            } else {
                this.showError();
            }
        } catch (error) {
            console.error('AI request failed:', error);
            this.showError();
        } finally {
            // Hide loading
            if (loadingState) {
                loadingState.style.display = 'none';
            }
        }
    }
    
    showAIResponse(response) {
        const aiResponse = document.getElementById('ai-response');
        if (!aiResponse) return;
        
        // Format the response into paragraphs
        const paragraphs = response.split('\n').filter(p => p.trim());
        const formattedResponse = paragraphs.map(p => `<p>${this.escapeHtml(p)}</p>`).join('');
        
        aiResponse.innerHTML = formattedResponse;
        aiResponse.style.display = 'block';
    }
    
    showError() {
        const errorState = document.getElementById('error-state');
        if (errorState) {
            errorState.style.display = 'block';
        }
    }
    

    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
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
    // Calculate positioning to use ALL available space from search results to page edge
    const searchResults = document.querySelector('#main') || document.querySelector('.main-column') || document.querySelector('body > div:last-child');
    let searchResultsRight = 800; // Default fallback if no search results found
    
    if (searchResults) {
        const resultsRect = searchResults.getBoundingClientRect();
        searchResultsRight = resultsRect.right;
    }
    
    const rightMargin = 200; // Adjusted margin for proper positioning
    const sidebarGap = 10; // Small gap from search results
    const availableSpace = window.innerWidth - searchResultsRight - rightMargin - sidebarGap;
    const sidebarWidth = 650; // Increased width further by 100px
    const leftPosition = searchResultsRight + sidebarGap + 60 - 100; // Move left by 100px to expand width leftward
    
    sidebar.style.cssText = `
        position: absolute !important;
        top: 160px !important;
        left: ${leftPosition}px !important;
        width: ${sidebarWidth}px !important;
        height: 550px !important;
        background: white !important;
        border: 2px solid #007acc !important;
        border-radius: 12px !important;
        padding: 20px !important;
        z-index: 9999 !important;
        box-shadow: none !important;
        overflow-y: auto !important;
    `;
    
    sidebar.innerHTML = `
        <div class="ai-chat-interface" style="height: 100%; display: flex; flex-direction: column;">
            <div class="chat-header" style="padding: 15px; border-bottom: 1px solid #e8eaed; flex-shrink: 0;">
                <div style="font-size: 16px; font-weight: 500; color: #202124;">AI Assistant</div>
                <div style="font-size: 12px; color: #5f6368;">Powered by Gemini</div>
            </div>
            <div class="chat-messages" id="chat-messages" style="flex: 1; padding: 15px; overflow-y: auto;">
                <div class="welcome-message">
                    <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
                        <div style="font-size: 14px; color: #5f6368;">Welcome! I'll provide AI insights for your searches.</div>
                    </div>
                </div>
            </div>
            <div class="chat-input-container" style="padding: 15px; border-top: 1px solid #e8eaed; flex-shrink: 0;">
                <div class="loading-indicator" id="loading-indicator" style="display: none;">
                    <div style="padding: 8px; text-align: center; color: #5f6368; font-size: 12px;">
                        AI is thinking...
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(sidebar);
    
    // Add resize listener to maintain positioning and width
    const updatePosition = () => {
        const searchResults = document.querySelector('#main') || document.querySelector('.main-column') || document.querySelector('body > div:last-child');
        let newSearchResultsRight = 800;
        
        if (searchResults) {
            const resultsRect = searchResults.getBoundingClientRect();
            newSearchResultsRight = resultsRect.right;
        }
        
        const newLeftPosition = window.innerWidth - 650 - 200 + 80;
        sidebar.style.width = '650px';
        sidebar.style.left = `${newLeftPosition}px`;
    };
    window.addEventListener('resize', updatePosition);
    
    console.log('FORCE CREATE SIDEBAR: Sidebar created with right positioning that scrolls with page');
    
    // Initialize chat functionality
    const rightSidebarInstance = new RightSidebar();
    rightSidebarInstance.initializeChatFunctionality();
    
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