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
        
        // Force rebuild of image grid with proper columns
        this.rebuildImageGrid();
    }
    
    rebuildImageGrid() {
        const imageTable = document.querySelector('.GpQGbf');
        if (!imageTable) return;
        
        // Get all existing image cells
        const imageCells = Array.from(imageTable.querySelectorAll('td.e3goi'));
        if (imageCells.length === 0) return;
        
        // Calculate images per row based on screen size
        const screenWidth = window.innerWidth;
        let imagesPerRow;
        if (screenWidth >= 1920) imagesPerRow = 7;
        else if (screenWidth >= 1400) imagesPerRow = 6;
        else if (screenWidth >= 1024) imagesPerRow = 5;
        else if (screenWidth >= 768) imagesPerRow = 4;
        else if (screenWidth >= 480) imagesPerRow = 3;
        else imagesPerRow = 2;
        
        // Clear existing table rows
        imageTable.innerHTML = '';
        
        // Rebuild with proper number of columns
        for (let i = 0; i < imageCells.length; i += imagesPerRow) {
            const row = document.createElement('tr');
            
            for (let j = 0; j < imagesPerRow && (i + j) < imageCells.length; j++) {
                const cell = imageCells[i + j].cloneNode(true);
                row.appendChild(cell);
            }
            
            imageTable.appendChild(row);
        }
        
        console.log('ImagesFullscreenHandler: Rebuilt image grid with', imagesPerRow, 'images per row');
    }

    monitorTabChanges() {
        // Monitor clicks on navigation tabs - be more specific about Images tab
        document.addEventListener('click', (event) => {
            const target = event.target.closest('a');
            if (target && (target.href.includes('tbm=isch') || target.textContent.includes('Images'))) {
                console.log('ImagesFullscreenHandler: Images tab clicked, applying layout');
                setTimeout(() => {
                    this.checkAndApplyImagesLayout();
                }, 200);
            }
        });

        // Monitor URL changes for single page navigation
        let currentUrl = window.location.href;
        const urlObserver = new MutationObserver(() => {
            if (currentUrl !== window.location.href) {
                currentUrl = window.location.href;
                console.log('ImagesFullscreenHandler: URL changed, checking layout');
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
            }, 200);
        });
        
        // Monitor window resize to rebuild grid
        window.addEventListener('resize', () => {
            if (document.body.classList.contains('images-tab')) {
                this.rebuildImageGrid();
            }
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