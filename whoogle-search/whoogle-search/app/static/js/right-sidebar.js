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
        
        // Calculate sidebar positioning with fixed width
        const availableRightSpace = window.innerWidth - searchResultsRight - rightMargin;
        const sidebarGap = 20; // Gap from search results
        const sidebarWidth = Math.max(300, availableRightSpace - 20); // Take most of the available space
        const sidebarLeft = searchResultsRight + sidebarGap;
        
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
            <div class="ai-chat-interface">
                <div class="chat-header">
                    <div style="font-size: 16px; font-weight: 500; color: var(--whoogle-text);">AI Assistant</div>
                    <div style="font-size: 12px; color: var(--whoogle-secondary-text);">Powered by Gemini</div>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="welcome-message">
                        <div style="padding: 12px; background: #f8f9fa; border-radius: 8px; margin-bottom: 10px;">
                            <div style="font-size: 14px; color: #5f6368;">Welcome! I'll provide AI insights for your searches.</div>
                        </div>
                    </div>
                </div>
                <div class="chat-input-container">
                    <div class="loading-indicator" id="loading-indicator" style="display: none;">
                        <div style="padding: 8px; text-align: center; color: #5f6368; font-size: 12px;">
                            AI is thinking...
                        </div>
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
                const newSidebarWidth = Math.max(300, newAvailableRightSpace - 20); // Take most of the available space
                const newSidebarLeft = newSearchResultsRight + 20; // Gap from search results
                
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
    
    initializeChatFunctionality() {
        // Capture search queries and send to AI
        this.captureSearchQueries();
        console.log('Right Sidebar: Chat functionality initialized');
    }
    
    captureSearchQueries() {
        // Monitor when searches are performed
        const originalSubmit = HTMLFormElement.prototype.submit;
        const self = this;
        
        HTMLFormElement.prototype.submit = function() {
            const searchInput = this.querySelector('input[name="q"], input[type="search"], #search-bar');
            if (searchInput && searchInput.value.trim()) {
                self.handleSearchQuery(searchInput.value.trim());
            }
            return originalSubmit.apply(this, arguments);
        };
        
        // Also monitor form submissions
        document.addEventListener('submit', function(e) {
            const form = e.target;
            const searchInput = form.querySelector('input[name="q"], input[type="search"], #search-bar');
            if (searchInput && searchInput.value.trim()) {
                self.handleSearchQuery(searchInput.value.trim());
            }
        });
        
        // Monitor search button clicks
        document.addEventListener('click', function(e) {
            if (e.target.closest('.search-button') || e.target.closest('button[type="submit"]')) {
                const form = e.target.closest('form');
                if (form) {
                    const searchInput = form.querySelector('input[name="q"], input[type="search"], #search-bar');
                    if (searchInput && searchInput.value.trim()) {
                        self.handleSearchQuery(searchInput.value.trim());
                    }
                }
            }
        });
    }
    
    async handleSearchQuery(query) {
        console.log('Search query captured:', query);
        await this.sendToAI(query);
    }
    
    async sendToAI(query) {
        const chatMessages = document.getElementById('chat-messages');
        const loadingIndicator = document.getElementById('loading-indicator');
        
        if (!chatMessages) return;
        
        // Add user query to chat
        this.addMessageToChat('user', query);
        
        // Show loading
        if (loadingIndicator) {
            loadingIndicator.style.display = 'block';
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
                this.addMessageToChat('ai', data.response);
            } else {
                this.addMessageToChat('ai', 'Sorry, I encountered an error processing your request.');
            }
        } catch (error) {
            console.error('AI request failed:', error);
            this.addMessageToChat('ai', 'Sorry, I couldn\'t process your request at the moment.');
        } finally {
            // Hide loading
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
        }
    }
    
    addMessageToChat(sender, message) {
        const chatMessages = document.getElementById('chat-messages');
        if (!chatMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${sender}-message`;
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div style="text-align: right; margin-bottom: 10px;">
                    <div style="display: inline-block; background: #1a73e8; color: white; padding: 8px 12px; border-radius: 12px; max-width: 80%; font-size: 14px;">
                        ${this.escapeHtml(message)}
                    </div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div style="text-align: left; margin-bottom: 10px;">
                    <div style="display: inline-block; background: #f8f9fa; color: #202124; padding: 8px 12px; border-radius: 12px; max-width: 80%; font-size: 14px; border: 1px solid #e8eaed;">
                        ${this.escapeHtml(message)}
                    </div>
                </div>
            `;
        }
        
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
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
    const sidebarWidth = 550; // Increased width further
    const leftPosition = searchResultsRight + sidebarGap - 50; // Move left by 50px to expand to the left
    
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
        box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
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
        
        const newLeftPosition = window.innerWidth - 550 - 200;
        sidebar.style.width = '550px';
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