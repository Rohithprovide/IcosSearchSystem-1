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
        
        document.body.appendChild(sidebar);
        console.log('Right Sidebar: Sidebar created and added to page');
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