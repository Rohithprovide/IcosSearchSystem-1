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
        
        console.log('ImagesFullscreenHandler: Checking layout - URL:', window.location.href);
        console.log('ImagesFullscreenHandler: tbm parameter:', tbm);
        
        // Check if we're on the images tab
        const isImagesTab = tbm === 'isch';
        
        if (isImagesTab) {
            // We're on the images tab
            document.body.classList.add('images-tab');
            console.log('ImagesFullscreenHandler: ✓ Applied full screen layout for images tab');
            console.log('ImagesFullscreenHandler: Body classes:', document.body.className);
            
            // Also add a data attribute for CSS targeting
            document.body.setAttribute('data-images-fullscreen', 'true');
            
            // Force immediate layout application
            this.forceLayoutUpdate();
        } else {
            // We're not on the images tab
            document.body.classList.remove('images-tab');
            document.body.removeAttribute('data-images-fullscreen');
            console.log('ImagesFullscreenHandler: ✗ Removed full screen layout, not on images tab');
        }
    }
    
    forceLayoutUpdate() {
        // Force direct style overrides for full screen layout
        this.applyDirectStyles();
        
        // Force a layout recalculation
        const main = document.getElementById('main') || document.querySelector('body > div');
        if (main) {
            main.style.display = 'none';
            main.offsetHeight; // Trigger reflow
            main.style.display = '';
        }
    }
    
    applyDirectStyles() {
        // Directly override styles using JavaScript for immediate effect
        const main = document.getElementById('main');
        if (main) {
            main.style.marginLeft = '0';
            main.style.marginRight = '0';
            main.style.maxWidth = '100%';
            main.style.width = '100%';
            main.style.paddingLeft = '0';
            main.style.paddingRight = '0';
        }
        
        // Target all direct children of body (excluding header elements)
        const bodyChildren = Array.from(document.body.children);
        bodyChildren.forEach(child => {
            if (!child.className.includes('header') && !child.id.includes('header')) {
                child.style.marginLeft = '0';
                child.style.marginRight = '0';
                child.style.maxWidth = '100%';
                child.style.width = '100%';
            }
        });
        
        // Target the image container specifically
        const imageContainer = document.querySelector('.GpQGbf');
        if (imageContainer) {
            imageContainer.style.marginLeft = '0';
            imageContainer.style.marginRight = '0';
            imageContainer.style.maxWidth = '100%';
            imageContainer.style.width = '100%';
        }
        
        console.log('ImagesFullscreenHandler: Applied direct styles for full screen layout');
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