/**
 * Favicon functionality for Whoogle Search
 * Adds website favicons to search results dynamically
 */

function addFavicons() {
    // Find all result links that should have favicons
    const resultLinks = document.querySelectorAll('a[href*="://"]');
    
    resultLinks.forEach(link => {
        const href = link.getAttribute('href');
        
        // Skip if not a proper external link or already has favicon
        if (!href || !href.startsWith('http') || 
            link.querySelector('.site-favicon') || 
            link.previousElementSibling?.classList.contains('site-favicon')) {
            return;
        }
        
        // Skip if link doesn't have meaningful text (likely not a title link)
        const linkText = link.textContent.trim();
        if (!linkText || linkText.length < 3) {
            return;
        }
        
        // Extract domain from URL
        try {
            const url = new URL(href);
            const domain = url.hostname;
            
            // Create favicon element
            const favicon = document.createElement('img');
            favicon.className = 'site-favicon';
            favicon.src = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
            favicon.alt = '';
            favicon.style.cssText = `
                width: 18px !important;
                height: 18px !important;
                margin-right: 8px !important;
                margin-top: 2px !important;
                border-radius: 50% !important;
                object-fit: cover !important;
                vertical-align: top !important;
                display: inline-block !important;
                flex-shrink: 0 !important;
            `;
            
            // Handle favicon load error - use a fallback
            favicon.onerror = function() {
                this.src = `https://icons.duckduckgo.com/ip3/${domain}.ico`;
                this.onerror = function() {
                    // Final fallback - create a colored circle with first letter
                    const canvas = document.createElement('canvas');
                    canvas.width = 18;
                    canvas.height = 18;
                    const ctx = canvas.getContext('2d');
                    
                    // Generate color based on domain
                    const colors = ['#4285f4', '#34a853', '#fbbc05', '#ea4335', '#9c27b0', '#ff9800'];
                    const colorIndex = domain.charCodeAt(0) % colors.length;
                    
                    ctx.fillStyle = colors[colorIndex];
                    ctx.beginPath();
                    ctx.arc(9, 9, 9, 0, 2 * Math.PI);
                    ctx.fill();
                    
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 10px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(domain.charAt(0).toUpperCase(), 9, 9);
                    
                    this.src = canvas.toDataURL();
                    this.onerror = null;
                };
            };
            
            // Insert favicon before the link
            link.parentNode.insertBefore(favicon, link);
            
        } catch (e) {
            console.log('Error adding favicon for:', href, e);
        }
    });
}

// Run when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', addFavicons);
} else {
    addFavicons();
}

// Also run after a short delay to catch any dynamically loaded content
setTimeout(addFavicons, 500);