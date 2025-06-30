/**
 * Related searches enhancement to match Google's "People also search for" style
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Related Searches: Initializing...');
    initializeRelatedSearches();
});

function initializeRelatedSearches() {
    // Look for related searches sections
    const relatedSearchContainers = findRelatedSearchContainers();
    
    relatedSearchContainers.forEach(container => {
        enhanceRelatedSearchContainer(container);
    });
}

function findRelatedSearchContainers() {
    const containers = [];
    
    // Look for details elements with "Related searches" in summary
    const detailsElements = document.querySelectorAll('details');
    detailsElements.forEach(details => {
        const summary = details.querySelector('summary');
        if (summary && summary.textContent.includes('Related searches')) {
            containers.push(details);
        }
    });
    
    // Look for any element containing "Related searches"
    const allElements = document.querySelectorAll('*');
    allElements.forEach(element => {
        if (element.textContent && element.textContent.includes('Related searches')) {
            // Check if it's a header element or contains links
            const parent = element.closest('div, section, article');
            if (parent && parent.querySelectorAll('a').length > 0) {
                containers.push(parent);
            }
        }
    });
    
    return [...new Set(containers)]; // Remove duplicates
}

function enhanceRelatedSearchContainer(container) {
    console.log('Related Searches: Enhancing container', container);
    
    // Find the header
    const header = findRelatedSearchHeader(container);
    if (header) {
        header.classList.add('related-searches-header');
        // Change text to match Google's style
        if (header.textContent.includes('Related searches')) {
            header.textContent = 'People also search for';
        }
    }
    
    // Find all search links
    const searchLinks = findSearchLinks(container);
    
    if (searchLinks.length > 0) {
        // Create grid container
        const gridContainer = createGridContainer();
        
        // Transform each link into a grid item
        searchLinks.forEach(link => {
            const gridItem = createGridItem(link);
            gridContainer.appendChild(gridItem);
        });
        
        // Replace the original links with the grid
        const firstLink = searchLinks[0];
        const linksContainer = firstLink.closest('div') || firstLink.parentElement;
        
        // Remove original links
        searchLinks.forEach(link => {
            if (link.parentElement) {
                link.remove();
            }
        });
        
        // Insert grid container
        if (linksContainer) {
            linksContainer.appendChild(gridContainer);
        } else if (header) {
            header.parentElement.appendChild(gridContainer);
        }
        
        container.classList.add('related-searches-container');
    }
}

function findRelatedSearchHeader(container) {
    // Look for summary in details
    const summary = container.querySelector('summary');
    if (summary && summary.textContent.includes('Related searches')) {
        return summary;
    }
    
    // Look for any element with "Related searches" text
    const elements = container.querySelectorAll('*');
    for (let element of elements) {
        if (element.textContent === 'Related searches' || 
            element.textContent.trim() === 'Related searches') {
            return element;
        }
    }
    
    return null;
}

function findSearchLinks(container) {
    const links = [];
    
    // Get all links in the container
    const allLinks = container.querySelectorAll('a');
    
    allLinks.forEach(link => {
        const href = link.getAttribute('href');
        const text = link.textContent.trim();
        
        // Filter out non-search links (avoid header links, etc.)
        if (href && text && !isHeaderLink(link) && isSearchLink(href, text)) {
            links.push(link);
        }
    });
    
    return links;
}

function isHeaderLink(link) {
    // Check if this is a navigation or header link
    const text = link.textContent.toLowerCase();
    const headerTexts = ['images', 'videos', 'news', 'maps', 'shopping', 'books'];
    return headerTexts.some(headerText => text === headerText);
}

function isSearchLink(href, text) {
    // Check if this looks like a search query link
    return href.includes('search?q=') || href.includes('q=') || text.length > 2;
}

function createGridContainer() {
    const grid = document.createElement('div');
    grid.className = 'related-searches-grid';
    return grid;
}

function createGridItem(originalLink) {
    const item = document.createElement('a');
    item.className = 'related-search-item';
    item.href = originalLink.href;
    item.textContent = cleanSearchText(originalLink.textContent);
    
    // Copy any other relevant attributes
    if (originalLink.target) {
        item.target = originalLink.target;
    }
    
    return item;
}

function cleanSearchText(text) {
    // Clean up the search text - remove extra whitespace and symbols
    return text.trim().replace(/^\>/, '').replace(/\>$/, '').trim();
}

// Handle dynamic content loading
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Check if new related searches were added
            const hasRelatedSearches = Array.from(mutation.addedNodes).some(node => {
                return node.textContent && node.textContent.includes('Related searches');
            });
            
            if (hasRelatedSearches) {
                setTimeout(initializeRelatedSearches, 100);
            }
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});