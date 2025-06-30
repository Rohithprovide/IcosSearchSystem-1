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
        return document.querySelector('#main') !== null || 
               document.querySelector('.main-column') !== null ||
               window.location.pathname === '/search';
    }
    
    createSidebar() {
        // Don't create if sidebar already exists
        if (document.querySelector('.right-sidebar')) {
            return;
        }
        
        // Find the main search results container
        const mainContainer = document.querySelector('#main') || document.querySelector('.main-column');
        if (!mainContainer) {
            console.log('Right Sidebar: Main container not found');
            return;
        }
        
        // Create a wrapper for the search results and sidebar
        const contentWrapper = document.createElement('div');
        contentWrapper.className = 'search-content-wrapper';
        contentWrapper.style.cssText = `
            position: relative;
            display: flex;
            gap: 20px;
            max-width: 1200px;
            margin: 0 auto;
        `;
        
        // Create the sidebar
        const sidebar = document.createElement('div');
        sidebar.className = 'right-sidebar';
        sidebar.innerHTML = `
            <div class="sidebar-content">
                <div class="sidebar-title">Quick Info</div>
                <div class="sidebar-placeholder">
                    This space is available for additional content, widgets, or tools to enhance your search experience.
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
    
    adjustLayout() {
        // Add class to body to trigger CSS layout adjustments
        document.body.classList.add('has-sidebar');
        console.log('Right Sidebar: Layout adjusted for sidebar');
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('Right Sidebar: DOM loaded, initializing...');
    
    setTimeout(() => {
        try {
            new RightSidebar();
        } catch (error) {
            console.error('Right Sidebar: Failed to initialize:', error);
        }
    }, 500);
});