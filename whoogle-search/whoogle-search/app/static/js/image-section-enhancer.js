/**
 * Image Section Enhancer for Whoogle Search
 * Enhances image sections in search results to match Google's clean, professional layout
 */

class ImageSectionEnhancer {
    constructor() {
        this.initialized = false;
        this.imagesSections = [];
        this.observer = null;
        this.init();
    }

    init() {
        if (this.initialized) return;
        
        // Run enhancement after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.enhanceImageSections());
        } else {
            // Add a small delay to ensure all content is loaded
            setTimeout(() => this.enhanceImageSections(), 100);
        }
        
        // Set up mutation observer for dynamic content
        this.setupMutationObserver();
        
        this.initialized = true;
        console.log('Image section enhancer initialized');
    }

    setupMutationObserver() {
        // Watch for new content being added to the page
        this.observer = new MutationObserver((mutations) => {
            let hasNewContent = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    hasNewContent = true;
                }
            });
            
            if (hasNewContent) {
                setTimeout(() => this.enhanceImageSections(), 100);
            }
        });
        
        this.observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    enhanceImageSections() {
        // Find all potential image sections in search results
        this.findImageSections();
        
        // Transform each section
        this.imagesSections.forEach(section => this.enhanceImageSection(section));
        
        console.log(`Enhanced ${this.imagesSections.length} image sections`);
    }

    findImageSections() {
        this.imagesSections = [];
        
        // Look for Google's specific image section patterns
        const potentialSections = [
            // Look for divs that contain "Images" text and have multiple images
            ...Array.from(document.querySelectorAll('div')).filter(div => {
                const text = div.textContent;
                const hasImagesText = text.includes('Images') && text.includes('View all');
                const images = div.querySelectorAll('img');
                return hasImagesText && images.length >= 2;
            }),
            
            // Look for containers with multiple image links
            ...Array.from(document.querySelectorAll('div')).filter(div => {
                const imgLinks = div.querySelectorAll('a[href*="imgres"]');
                const images = div.querySelectorAll('img');
                return imgLinks.length >= 3 && images.length >= 3;
            }),
            
            // Look for specific Google classes and patterns
            ...Array.from(document.querySelectorAll([
                'div[data-ved*="2ahUKEwi"]', // Google's data-ved pattern
                'div[jsname]', // Google's jsname attribute
                'div[data-async-context]' // Google's async context
            ].join(','))).filter(div => {
                const images = div.querySelectorAll('img');
                return images.length >= 2;
            })
        ];
        
        // Remove duplicates and invalid sections
        const uniqueSections = [...new Set(potentialSections)];
        this.imagesSections = uniqueSections.filter(section => this.isValidImageSection(section));
    }

    isValidImageSection(element) {
        // Check various indicators that this is a valid image section
        const text = element.textContent.toLowerCase();
        const hasImagesText = text.includes('images') || text.includes('view all');
        const hasMultipleImages = element.querySelectorAll('img').length >= 2;
        const hasImageLinks = element.querySelectorAll('a[href*="imgres"]').length >= 2;
        const hasImageClasses = element.className.toLowerCase().includes('image');
        
        // Check for specific Google image section patterns
        const hasDataVed = element.hasAttribute('data-ved');
        const hasJsName = element.hasAttribute('jsname');
        
        // Don't enhance if already enhanced
        if (element.classList.contains('image-section-enhanced')) {
            return false;
        }
        
        return (hasImagesText && hasMultipleImages) || 
               (hasMultipleImages && hasImageLinks) ||
               (hasImageClasses && hasMultipleImages) ||
               (hasDataVed && hasMultipleImages) ||
               (hasJsName && hasMultipleImages);
    }

    enhanceImageSection(section) {
        try {
            // Mark as enhanced to prevent duplicate processing
            section.classList.add('image-section-enhanced');
            
            // Apply enhanced styling instead of replacing
            this.applyEnhancedStyling(section);
            
        } catch (error) {
            console.warn('Failed to enhance image section:', error);
        }
    }

    applyEnhancedStyling(section) {
        // Add enhanced container class
        section.classList.add('image-section-container');
        
        // Find and enhance the header
        const headerElement = this.findOrCreateHeader(section);
        if (headerElement) {
            headerElement.classList.add('image-section-header');
        }
        
        // Find and enhance the image grid
        const imageContainer = this.findImageContainer(section);
        if (imageContainer) {
            imageContainer.classList.add('image-grid');
            this.enhanceImageItems(imageContainer);
        }
    }

    findOrCreateHeader(section) {
        // Look for existing header elements
        const possibleHeaders = section.querySelectorAll('h1, h2, h3, h4, h5, h6, div, span');
        
        for (const element of possibleHeaders) {
            const text = element.textContent.toLowerCase();
            if (text.includes('images') || text.includes('view all')) {
                return element;
            }
        }
        
        // Create header if none found
        const header = document.createElement('div');
        header.className = 'image-section-header';
        header.innerHTML = `
            <h3 class="image-section-title">Images</h3>
            <a href="search?tbm=isch&q=${encodeURIComponent(this.getCurrentQuery())}" class="image-section-view-all">View all</a>
        `;
        
        section.insertBefore(header, section.firstChild);
        return header;
    }

    findImageContainer(section) {
        // Find the container with the most images
        let bestContainer = null;
        let maxImages = 0;
        
        const containers = section.querySelectorAll('div');
        containers.forEach(container => {
            const images = container.querySelectorAll('img');
            if (images.length > maxImages) {
                maxImages = images.length;
                bestContainer = container;
            }
        });
        
        return bestContainer;
    }

    enhanceImageItems(container) {
        const images = container.querySelectorAll('img');
        
        images.forEach((img, index) => {
            const item = img.closest('div') || img.parentElement;
            if (item) {
                item.classList.add('image-item');
                
                // Add overlay for hover effects
                if (!item.querySelector('.image-overlay')) {
                    const overlay = document.createElement('div');
                    overlay.className = 'image-overlay';
                    
                    const source = document.createElement('div');
                    source.className = 'image-source';
                    
                    // Try to extract domain from link
                    const link = item.querySelector('a');
                    if (link) {
                        source.textContent = this.extractDomain(link.href) || 'Image';
                    } else {
                        source.textContent = 'Image';
                    }
                    
                    overlay.appendChild(source);
                    item.appendChild(overlay);
                }
            }
        });
    }

    extractImageData(section) {
        const imageData = [];
        const images = section.querySelectorAll('img');
        const links = section.querySelectorAll('a');
        
        images.forEach((img, index) => {
            // Find the associated link
            let link = img.closest('a');
            if (!link) {
                // Look for nearby links
                link = img.parentElement?.querySelector('a') || 
                       links[index] || 
                       links[0];
            }
            
            const data = {
                src: img.src,
                alt: img.alt || '',
                href: link?.href || '#',
                domain: this.extractDomain(link?.href || ''),
                title: link?.title || img.alt || ''
            };
            
            imageData.push(data);
        });
        
        // Limit to maximum 6 images for clean layout
        return imageData.slice(0, 6);
    }

    extractDomain(url) {
        try {
            if (url.includes('imgres?imgurl=')) {
                // Extract domain from Google image result URL
                const urlParams = new URLSearchParams(url.split('?')[1]);
                const imgrefurl = urlParams.get('imgrefurl');
                if (imgrefurl) {
                    return new URL(decodeURIComponent(imgrefurl)).hostname;
                }
            }
            return new URL(url).hostname;
        } catch {
            return '';
        }
    }

    createEnhancedSection(imageData) {
        const container = document.createElement('div');
        container.className = 'image-section-container';
        
        // Create header
        const header = document.createElement('div');
        header.className = 'image-section-header';
        
        const title = document.createElement('h3');
        title.className = 'image-section-title';
        title.textContent = 'Images';
        
        const viewAll = document.createElement('a');
        viewAll.className = 'image-section-view-all';
        viewAll.href = 'search?tbm=isch&q=' + encodeURIComponent(this.getCurrentQuery());
        viewAll.textContent = 'View all';
        
        header.appendChild(title);
        header.appendChild(viewAll);
        
        // Create image grid
        const grid = document.createElement('div');
        grid.className = 'image-grid';
        
        imageData.forEach((data, index) => {
            const item = this.createImageItem(data, index === imageData.length - 1 && imageData.length === 6);
            grid.appendChild(item);
        });
        
        container.appendChild(header);
        container.appendChild(grid);
        
        return container;
    }

    createImageItem(data, isLast = false) {
        const item = document.createElement('div');
        item.className = 'image-item' + (isLast ? ' more-images' : '');
        
        const link = document.createElement('a');
        link.href = data.href;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        
        const img = document.createElement('img');
        img.src = data.src;
        img.alt = data.alt;
        img.loading = 'lazy';
        
        // Add error handling for broken images
        img.onerror = () => {
            img.style.display = 'none';
            item.style.display = 'none';
        };
        
        const overlay = document.createElement('div');
        overlay.className = 'image-overlay';
        
        const source = document.createElement('div');
        source.className = 'image-source';
        source.textContent = data.domain || 'Image';
        
        overlay.appendChild(source);
        
        link.appendChild(img);
        item.appendChild(link);
        item.appendChild(overlay);
        
        // Add "More images" overlay for the last item
        if (isLast) {
            const moreOverlay = document.createElement('div');
            moreOverlay.className = 'more-images-overlay';
            moreOverlay.innerHTML = '<i class="fas fa-images"></i> More images';
            
            item.appendChild(moreOverlay);
        }
        
        return item;
    }

    getCurrentQuery() {
        // Extract current search query from URL or search input
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        
        if (query) {
            return decodeURIComponent(query);
        }
        
        // Fallback: try to get from search input
        const searchInput = document.querySelector('input[name="q"]');
        return searchInput ? searchInput.value : '';
    }
}

// Initialize the enhancer when the script loads
document.addEventListener('DOMContentLoaded', () => {
    new ImageSectionEnhancer();
});

// Also run immediately if DOM is already loaded
if (document.readyState !== 'loading') {
    new ImageSectionEnhancer();
}

console.log('Image section enhancer script loaded');