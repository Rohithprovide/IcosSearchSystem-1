/**
 * Related searches enhancement to match Google's "People also search for" style
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Related Searches: Initializing...');
    // Try multiple times with different delays
    initializeRelatedSearches();
    setTimeout(initializeRelatedSearches, 500);
    setTimeout(initializeRelatedSearches, 1000);
    setTimeout(forceTransformRelatedSearches, 1500);
});

function initializeRelatedSearches() {
    console.log('Related Searches: Starting initialization...');
    
    // Debug: Check what's on the page
    console.log('Related Searches: Page HTML contains "Related searches":', document.body.innerHTML.includes('Related searches'));
    
    // Look for related searches sections
    const relatedSearchContainers = findRelatedSearchContainers();
    
    console.log('Related Searches: Found containers:', relatedSearchContainers.length);
    
    if (relatedSearchContainers.length === 0) {
        // Fallback: try a more aggressive search
        console.log('Related Searches: No containers found, trying fallback search...');
        fallbackSearchForRelatedSearches();
    } else {
        relatedSearchContainers.forEach(container => {
            enhanceRelatedSearchContainer(container);
        });
    }
}

function findRelatedSearchContainers() {
    const containers = [];
    
    console.log('Related Searches: Looking for containers...');
    
    // Look for details elements with "Related searches" in summary
    const detailsElements = document.querySelectorAll('details');
    console.log('Related Searches: Found', detailsElements.length, 'details elements');
    
    detailsElements.forEach(details => {
        const summary = details.querySelector('summary');
        if (summary) {
            console.log('Related Searches: Details summary text:', summary.textContent);
            if (summary.textContent.includes('Related searches')) {
                console.log('Related Searches: Found details container');
                containers.push(details);
            }
        }
    });
    
    // Look for any element containing "Related searches" - more comprehensive search
    const textNodes = document.evaluate(
        "//text()[contains(., 'Related searches')]",
        document,
        null,
        XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE,
        null
    );
    
    console.log('Related Searches: Found', textNodes.snapshotLength, 'text nodes with "Related searches"');
    
    for (let i = 0; i < textNodes.snapshotLength; i++) {
        const textNode = textNodes.snapshotItem(i);
        const parent = textNode.parentElement;
        if (parent) {
            console.log('Related Searches: Text node parent:', parent.tagName, parent.textContent.substring(0, 50));
            
            // Find the container that has the links
            let container = parent;
            while (container && container !== document.body) {
                const links = container.querySelectorAll('a');
                if (links.length > 0) {
                    // Check if these are search result links (not navigation)
                    const searchLinks = Array.from(links).filter(link => {
                        const href = link.getAttribute('href');
                        const text = link.textContent.trim();
                        return href && text && (href.includes('search?q=') || href.includes('q=')) && text.length > 2;
                    });
                    
                    if (searchLinks.length > 0) {
                        console.log('Related Searches: Found container with', searchLinks.length, 'search links');
                        containers.push(container);
                        break;
                    }
                }
                container = container.parentElement;
            }
        }
    }
    
    console.log('Related Searches: Total containers found:', containers.length);
    return [...new Set(containers)]; // Remove duplicates
}

function fallbackSearchForRelatedSearches() {
    console.log('Related Searches: Running fallback search...');
    
    // Look for any links that could be related searches
    const allLinks = document.querySelectorAll('a');
    const potentialRelatedSearches = [];
    
    allLinks.forEach(link => {
        const href = link.getAttribute('href');
        const text = link.textContent.trim();
        
        // Look for links that seem to be search queries
        if (href && text && 
            (href.includes('search?q=') || href.includes('q=')) && 
            text.length > 2 && text.length < 50) {
            
            // Check if this link is part of a group (has siblings with similar patterns)
            const parent = link.parentElement;
            const siblingLinks = parent ? parent.querySelectorAll('a') : [];
            
            if (siblingLinks.length > 1) {
                console.log('Related Searches: Found potential related search:', text, href);
                potentialRelatedSearches.push(link);
            }
        }
    });
    
    if (potentialRelatedSearches.length > 2) {
        console.log('Related Searches: Found', potentialRelatedSearches.length, 'potential related searches');
        
        // Group them by parent container
        const containers = new Map();
        potentialRelatedSearches.forEach(link => {
            const container = link.closest('div, section, details');
            if (container) {
                if (!containers.has(container)) {
                    containers.set(container, []);
                }
                containers.get(container).push(link);
            }
        });
        
        // Process containers with multiple links
        containers.forEach((links, container) => {
            if (links.length > 2) {
                console.log('Related Searches: Processing fallback container with', links.length, 'links');
                enhanceRelatedSearchContainerFallback(container, links);
            }
        });
    }
}

function enhanceRelatedSearchContainerFallback(container, searchLinks) {
    console.log('Related Searches: Enhancing fallback container');
    
    // Add a header if none exists
    let header = container.querySelector('h1, h2, h3, h4, h5, h6, summary');
    if (!header) {
        header = document.createElement('h3');
        header.textContent = 'People also search for';
        header.className = 'related-searches-header';
        container.insertBefore(header, container.firstChild);
    } else {
        header.textContent = 'People also search for';
        header.className = 'related-searches-header';
    }
    
    // Create grid container
    const gridContainer = createGridContainer();
    
    // Transform each link into a grid item
    searchLinks.forEach(link => {
        const gridItem = createGridItem(link);
        gridContainer.appendChild(gridItem);
    });
    
    // Remove original links
    searchLinks.forEach(link => {
        if (link.parentElement) {
            link.remove();
        }
    });
    
    // Insert grid container after header
    if (header.nextSibling) {
        container.insertBefore(gridContainer, header.nextSibling);
    } else {
        container.appendChild(gridContainer);
    }
    
    container.classList.add('related-searches-container');
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
    if (!href || !text || text.trim().length < 2) return false;
    
    // Common patterns for search links
    const searchPatterns = [
        'search?q=',
        'q=',
        '/search?',
        'tbm=',
        'apple' // Looking at your screenshot, these seem to be apple-related searches
    ];
    
    const hasSearchPattern = searchPatterns.some(pattern => 
        href.toLowerCase().includes(pattern.toLowerCase())
    );
    
    // Also check if text looks like a search query (contains common search terms)
    const textLower = text.toLowerCase().trim();
    const isReasonableLength = textLower.length > 2 && textLower.length < 100;
    
    return hasSearchPattern || isReasonableLength;
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
    return text.trim()
        .replace(/^\>+\s*/, '') // Remove leading > arrows
        .replace(/\s*\>+$/, '') // Remove trailing > arrows
        .replace(/^\s*-\s*/, '') // Remove leading dashes
        .replace(/\s*-\s*$/, '') // Remove trailing dashes
        .trim();
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

function forceTransformRelatedSearches() {
    console.log('Related Searches: Force transformation starting...');
    
    // Look for any text containing "apple" and related search terms from your screenshot
    const searchTerms = ['apple usa', 'apple india', 'apple store', 'apple login', 'apple id', 'apple fruit', 'apple logo', 'apple owner'];
    
    // Find all links on the page
    const allLinks = Array.from(document.querySelectorAll('a'));
    
    // Group links that might be related searches
    const relatedSearchLinks = allLinks.filter(link => {
        const text = link.textContent.trim().toLowerCase();
        const href = link.getAttribute('href') || '';
        
        // Check if it's a search-like link
        return (href.includes('search') || href.includes('q=')) && 
               text.length > 2 && text.length < 50 &&
               (text.includes('apple') || searchTerms.some(term => text.includes(term.toLowerCase())));
    });
    
    console.log('Related Searches: Found potential links:', relatedSearchLinks.length);
    
    if (relatedSearchLinks.length > 2) {
        // Find their common parent or create a new container
        let container = null;
        
        // Try to find a common parent
        if (relatedSearchLinks.length > 0) {
            let parent = relatedSearchLinks[0].parentElement;
            while (parent && parent !== document.body) {
                const containsAllLinks = relatedSearchLinks.every(link => parent.contains(link));
                if (containsAllLinks) {
                    container = parent;
                    break;
                }
                parent = parent.parentElement;
            }
        }
        
        if (container) {
            console.log('Related Searches: Found container, applying transformation...');
            
            // Check if already transformed
            if (container.querySelector('.related-searches-grid')) {
                console.log('Related Searches: Already transformed, skipping...');
                return;
            }
            
            // Create header
            const header = document.createElement('h3');
            header.textContent = 'People also search for';
            header.className = 'related-searches-header';
            
            // Create grid
            const gridContainer = createGridContainer();
            
            // Transform links
            relatedSearchLinks.forEach(link => {
                const gridItem = createGridItem(link);
                gridContainer.appendChild(gridItem);
                link.style.display = 'none'; // Hide original instead of removing
            });
            
            // Insert the new elements
            container.insertBefore(header, container.firstChild);
            container.insertBefore(gridContainer, header.nextSibling);
            container.classList.add('related-searches-container');
            
            console.log('Related Searches: Transformation completed!');
        }
    }
}