// Infinite Scroll for Images Tab
class InfiniteScrollImages {
    constructor() {
        this.currentPage = 1;
        this.loading = false;
        this.hasMore = true;
        this.baseQuery = '';
        this.init();
    }

    init() {
        // Only initialize on images search pages
        if (!this.isImagesPage()) {
            return;
        }

        console.log('InfiniteScrollImages: Initializing infinite scroll for images');
        
        this.setupInfiniteScroll();
        this.hidePagination();
        this.extractBaseQuery();
    }

    isImagesPage() {
        const urlParams = new URLSearchParams(window.location.search);
        const tbm = urlParams.get('tbm');
        return tbm === 'isch'; // 'isch' is Google's parameter for image search
    }

    extractBaseQuery() {
        const urlParams = new URLSearchParams(window.location.search);
        this.baseQuery = urlParams.get('q') || '';
        console.log('InfiniteScrollImages: Base query extracted:', this.baseQuery);
    }

    hidePagination() {
        // Hide existing pagination elements
        const paginationSelectors = [
            '.uZgmoc', // Google's pagination table class
            '[role="navigation"]',
            '.AaVjTc', // Another pagination class
            '.neb-region', // Page navigation region
            'table[role="navigation"]'
        ];

        paginationSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                if (element.textContent.includes('Next') || 
                    element.textContent.includes('Previous') ||
                    element.textContent.includes('More') ||
                    element.querySelector('a[aria-label*="Page"]')) {
                    element.style.display = 'none';
                    console.log('InfiniteScrollImages: Hidden pagination element');
                }
            });
        });
    }

    setupInfiniteScroll() {
        let ticking = false;

        const scrollHandler = () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.checkScrollPosition();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', scrollHandler);
        console.log('InfiniteScrollImages: Scroll listener attached');
    }

    checkScrollPosition() {
        if (this.loading || !this.hasMore) {
            return;
        }

        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const clientHeight = document.documentElement.clientHeight;

        // Trigger loading when user is 80% down the page
        const threshold = 0.8;
        if (scrollTop + clientHeight >= scrollHeight * threshold) {
            console.log('InfiniteScrollImages: Scroll threshold reached, loading more images');
            this.loadMoreImages();
        }
    }

    async loadMoreImages() {
        if (this.loading || !this.hasMore) {
            return;
        }

        this.loading = true;
        this.showLoadingIndicator();

        try {
            this.currentPage++;
            console.log('InfiniteScrollImages: Loading page', this.currentPage);

            // Create URL for next page of images
            const nextPageUrl = this.buildNextPageUrl();
            
            const response = await fetch(nextPageUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const html = await response.text();
            const newImages = this.parseImagesFromHtml(html);

            if (newImages.length === 0) {
                this.hasMore = false;
                this.showEndMessage();
                console.log('InfiniteScrollImages: No more images to load');
            } else {
                this.appendImages(newImages);
                console.log('InfiniteScrollImages: Loaded', newImages.length, 'new images');
            }

        } catch (error) {
            console.error('InfiniteScrollImages: Error loading more images:', error);
            this.showErrorMessage();
        } finally {
            this.loading = false;
            this.hideLoadingIndicator();
        }
    }

    buildNextPageUrl() {
        const currentUrl = new URL(window.location);
        const params = new URLSearchParams(currentUrl.search);
        
        // Calculate start parameter (Google uses start parameter for pagination)
        const imagesPerPage = 20; // Google typically shows 20 images per page
        const start = (this.currentPage - 1) * imagesPerPage;
        
        params.set('start', start.toString());
        
        return `${currentUrl.pathname}?${params.toString()}`;
    }

    parseImagesFromHtml(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const images = [];

        // Look for image result containers using the same classes as current implementation
        const imageContainers = doc.querySelectorAll('.lIMUZd');
        
        imageContainers.forEach(container => {
            const link = container.querySelector('a');
            const img = container.querySelector('img');
            
            if (link && img) {
                const href = link.getAttribute('href');
                const imgSrc = img.getAttribute('src');
                const alt = img.getAttribute('alt') || '';
                
                if (href && imgSrc) {
                    // Extract actual image URL and webpage URL from Google's format
                    const urlParams = new URLSearchParams(href.split('?')[1] || '');
                    const imgUrl = urlParams.get('imgurl') || imgSrc;
                    const webPageUrl = urlParams.get('imgrefurl') || href;
                    
                    images.push({
                        imgUrl: imgUrl,
                        imgThumbnail: imgSrc,
                        webPageUrl: webPageUrl,
                        alt: alt,
                        domain: this.extractDomain(webPageUrl)
                    });
                }
            }
        });

        return images;
    }

    extractDomain(url) {
        try {
            return new URL(url).hostname;
        } catch {
            return '';
        }
    }

    calculateImagesPerRow() {
        // Check if fullscreen images layout is active
        const isFullscreen = document.body.classList.contains('images-tab') || 
                            document.body.hasAttribute('data-images-fullscreen');
        
        if (isFullscreen) {
            // In fullscreen mode, use more images per row based on screen size
            const screenWidth = window.innerWidth;
            if (screenWidth >= 1920) return 7;  // Very large screens
            if (screenWidth >= 1400) return 6;  // Large screens
            if (screenWidth >= 1024) return 5;  // Medium-large screens
            if (screenWidth >= 768) return 4;   // Medium screens
            if (screenWidth >= 480) return 3;   // Small screens
            return 2;  // Mobile
        } else {
            // Original layout - 4 images per row
            return 4;
        }
    }

    appendImages(images) {
        const container = this.getImagesContainer();
        if (!container) {
            console.error('InfiniteScrollImages: Could not find images container');
            return;
        }

        // Find the table that contains the image grid
        const imageTable = container.querySelector('.GpQGbf') || container.querySelector('table');
        if (!imageTable) {
            console.error('InfiniteScrollImages: Could not find image table');
            return;
        }

        console.log('InfiniteScrollImages: Appending', images.length, 'new images');

        // Get all existing cells to understand current layout
        const allExistingCells = imageTable.querySelectorAll('td.e3goi');
        console.log('InfiniteScrollImages: Found', allExistingCells.length, 'existing image cells');
        
        // Calculate dynamic images per row based on screen size and whether fullscreen is enabled
        const imagesPerRow = this.calculateImagesPerRow();
        const totalImages = allExistingCells.length + images.length;
        
        // Calculate how many complete rows we should have
        const totalCompleteRows = Math.ceil(totalImages / imagesPerRow);
        
        // Remove any incomplete rows and rebuild the grid properly
        const existingRows = imageTable.querySelectorAll('tr');
        const lastRowIndex = existingRows.length - 1;
        const lastRow = existingRows[lastRowIndex];
        
        if (lastRow) {
            const cellsInLastRow = lastRow.querySelectorAll('td.e3goi').length;
            console.log('InfiniteScrollImages: Last row has', cellsInLastRow, 'cells');
            
            // If last row is incomplete, we'll rebuild from that row
            if (cellsInLastRow < imagesPerRow && cellsInLastRow > 0) {
                // Extract existing images from the incomplete row
                const existingCellsInLastRow = Array.from(lastRow.querySelectorAll('td.e3goi'));
                lastRow.remove();
                
                // Merge existing cells with new images
                let combinedImages = [];
                
                // Add existing cells as image objects
                existingCellsInLastRow.forEach(cell => {
                    const img = cell.querySelector('img');
                    const links = cell.querySelectorAll('a');
                    if (img && links.length >= 2) {
                        combinedImages.push({
                            imgThumbnail: img.src,
                            webPageUrl: links[0].href,
                            imgUrl: links[1].href,
                            alt: img.alt,
                            domain: this.extractDomain(links[0].href)
                        });
                    }
                });
                
                // Add new images
                combinedImages = combinedImages.concat(images);
                
                // Create complete rows with the combined images
                this.createCompleteRows(imageTable, combinedImages);
                return;
            }
        }
        
        // If last row is complete or doesn't exist, just add new rows
        this.createCompleteRows(imageTable, images);
    }
    
    createCompleteRows(imageTable, images) {
        const imagesPerRow = this.calculateImagesPerRow();
        
        for (let i = 0; i < images.length; i += imagesPerRow) {
            const row = document.createElement('tr');
            
            for (let j = 0; j < imagesPerRow && (i + j) < images.length; j++) {
                const image = images[i + j];
                const cell = this.createImageCell(image);
                row.appendChild(cell);
            }
            
            imageTable.appendChild(row);
        }
        
        console.log('InfiniteScrollImages: Added', Math.ceil(images.length / imagesPerRow), 'new rows');
    }

    createImageCell(image) {
        const cell = document.createElement('td');
        cell.className = 'e3goi';
        cell.align = 'center';
        
        cell.innerHTML = `
            <div class="svla5d">
                <div>
                    <div class="lIMUZd">
                        <div>
                            <table class="TxbwNb">
                                <tr>
                                    <td>
                                        <a href="${this.escapeHtml(image.webPageUrl)}">
                                            <div class="RAyV4b">
                                                <img alt="${this.escapeHtml(image.alt)}" 
                                                     class="t0fcAb" 
                                                     src="${this.escapeHtml(image.imgThumbnail)}" />
                                            </div>
                                        </a>
                                    </td>
                                </tr>
                                <tr>
                                    <td>
                                        <a href="${this.escapeHtml(image.webPageUrl)}">
                                            <div class="Tor4Ec">
                                                <span class="qXLe6d x3G5ab">
                                                    <span class="fYyStc">${this.escapeHtml(image.domain)}</span>
                                                </span>
                                            </div>
                                        </a>
                                        <a href="${this.escapeHtml(image.imgUrl)}">
                                            <div class="Tor4Ec">
                                                <span class="qXLe6d F9iS2e">
                                                    <span class="fYyStc">View Image</span>
                                                </span>
                                            </div>
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Apply image optimization for quality preservation and proper sizing
        this.optimizeImageCell(cell);
        
        return cell;
    }
    
    optimizeImageCell(cell) {
        // Apply the same optimization as in images-fullscreen.js
        const imageContainer = cell.querySelector('.RAyV4b');
        const image = cell.querySelector('.t0fcAb');
        
        if (imageContainer && image) {
            // Get optimal size for current screen
            const maxSize = this.getOptimalImageSize();
            
            // Preserve original aspect ratio and reduce artificial sizing
            image.style.width = 'auto';
            image.style.height = 'auto';
            image.style.maxWidth = maxSize + 'px';
            image.style.maxHeight = maxSize + 'px';
            image.style.objectFit = 'contain';
            
            imageContainer.style.width = 'auto';
            imageContainer.style.height = 'auto';
            imageContainer.style.maxWidth = maxSize + 'px';
            imageContainer.style.maxHeight = maxSize + 'px';
            imageContainer.style.lineHeight = 'normal';
            imageContainer.style.overflow = 'visible';
            imageContainer.style.display = 'flex';
            imageContainer.style.alignItems = 'center';
            imageContainer.style.justifyContent = 'center';
            
            // Reduce spacing between images
            cell.style.padding = '4px';
            cell.style.margin = '0';
            cell.style.width = 'auto';
            cell.style.height = 'auto';
            cell.style.flex = '0 0 auto';
        }
    }
    
    getOptimalImageSize() {
        const screenWidth = window.innerWidth;
        // Same sizing logic as images-fullscreen.js - smaller for 6-7 images per row
        if (screenWidth >= 1920) return 120;  // ~7-8 images per row
        if (screenWidth >= 1400) return 110;  // ~6-7 images per row
        if (screenWidth >= 1024) return 100;  // ~6 images per row
        if (screenWidth >= 768) return 90;    // ~5 images per row
        if (screenWidth >= 480) return 70;    // ~4 images per row
        return 50;                            // ~3 images per row
    }

    getImagesContainer() {
        // Try to find the main images container
        const selectors = [
            'div[role="main"]',
            '#main',
            '.main-column',
            'body > div'
        ];

        for (const selector of selectors) {
            const container = document.querySelector(selector);
            if (container && container.querySelector('.GpQGbf, table')) {
                return container;
            }
        }

        return document.body;
    }

    showLoadingIndicator() {
        this.removeExistingIndicators();
        
        const indicator = document.createElement('div');
        indicator.id = 'infinite-scroll-loading';
        indicator.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(255, 255, 255, 0.9);
            padding: 12px 24px;
            border-radius: 24px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            font-size: 14px;
            color: #5f6368;
            z-index: 1000;
            display: flex;
            align-items: center;
            gap: 8px;
        `;
        
        indicator.innerHTML = `
            <div style="width: 16px; height: 16px; border: 2px solid #f3f3f3; border-top: 2px solid #4285f4; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            Loading more images...
        `;
        
        // Add CSS animation for spinner
        if (!document.getElementById('infinite-scroll-styles')) {
            const style = document.createElement('style');
            style.id = 'infinite-scroll-styles';
            style.textContent = `
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(indicator);
    }

    hideLoadingIndicator() {
        const indicator = document.getElementById('infinite-scroll-loading');
        if (indicator) {
            indicator.remove();
        }
    }

    showEndMessage() {
        this.removeExistingIndicators();
        
        const message = document.createElement('div');
        message.id = 'infinite-scroll-end';
        message.style.cssText = `
            text-align: center;
            padding: 40px 20px;
            color: #5f6368;
            font-size: 14px;
            margin-top: 20px;
        `;
        message.textContent = 'No more images to show';
        
        const container = this.getImagesContainer();
        if (container) {
            container.appendChild(message);
        }
    }

    showErrorMessage() {
        this.removeExistingIndicators();
        
        const message = document.createElement('div');
        message.id = 'infinite-scroll-error';
        message.style.cssText = `
            text-align: center;
            padding: 20px;
            color: #d93025;
            font-size: 14px;
            background: #fce8e6;
            border-radius: 8px;
            margin: 20px;
        `;
        message.textContent = 'Failed to load more images. Please try again later.';
        
        const container = this.getImagesContainer();
        if (container) {
            container.appendChild(message);
        }
    }

    removeExistingIndicators() {
        const indicators = ['infinite-scroll-loading', 'infinite-scroll-end', 'infinite-scroll-error'];
        indicators.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.remove();
            }
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('InfiniteScrollImages: DOM loaded, checking for images page...');
    new InfiniteScrollImages();
});

// Also initialize on navigation changes (for SPA-like behavior)
window.addEventListener('popstate', function() {
    console.log('InfiniteScrollImages: Navigation detected, re-initializing...');
    new InfiniteScrollImages();
});