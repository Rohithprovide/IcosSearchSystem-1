// Images Full Screen Layout Handler

class ImagesFullscreenHandler {
    constructor() {
        this.init();
    }

    init() {
        // Check if we're on the images tab and apply full screen layout
        this.checkAndApplyImagesLayout();
        
        // Monitor for navigation changes to other tabs
        this.monitorTabChanges();
    }

    checkAndApplyImagesLayout() {
        const urlParams = new URLSearchParams(window.location.search);
        const tbm = urlParams.get('tbm');
        
        if (tbm === 'isch') {
            // We're on the images tab
            document.body.classList.add('images-tab');
            console.log('ImagesFullscreenHandler: Applied full screen layout for images tab');
        } else {
            // We're not on the images tab
            document.body.classList.remove('images-tab');
        }
    }

    monitorTabChanges() {
        // Monitor clicks on navigation tabs
        const navTabs = document.querySelectorAll('a[href*="tbm="], a[href*="search?"], .header-tab-div a');
        
        navTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                setTimeout(() => {
                    this.checkAndApplyImagesLayout();
                }, 100);
            });
        });

        // Monitor URL changes for single page navigation
        let currentUrl = window.location.href;
        const urlObserver = new MutationObserver(() => {
            if (currentUrl !== window.location.href) {
                currentUrl = window.location.href;
                this.checkAndApplyImagesLayout();
            }
        });

        urlObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Also monitor popstate events for browser navigation
        window.addEventListener('popstate', () => {
            setTimeout(() => {
                this.checkAndApplyImagesLayout();
            }, 100);
        });
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ImagesFullscreenHandler();
});

// Also initialize immediately in case DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new ImagesFullscreenHandler();
    });
} else {
    new ImagesFullscreenHandler();
}