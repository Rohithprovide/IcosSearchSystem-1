/**
 * AI Panel functionality for Whoogle Search
 * Integrates Gemini AI responses with search results
 */

class AIPanel {
    constructor() {
        this.panel = null;
        this.isOpen = false;
        this.currentQuery = '';
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        // Only initialize on search results pages
        if (!this.isSearchResultsPage()) {
            return;
        }
        
        this.createPanel();
        this.createToggleButton();
        this.extractSearchQuery();
        this.bindEvents();
        
        // Auto-open panel if there's a query
        if (this.currentQuery) {
            setTimeout(() => {
                this.open();
                this.fetchAIResponse();
            }, 1000);
        }
    }
    
    isSearchResultsPage() {
        // Check if we're on a search results page
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has('q') || document.querySelector('.search-bar-desktop');
    }
    
    extractSearchQuery() {
        // Extract query from URL or search bar
        const urlParams = new URLSearchParams(window.location.search);
        this.currentQuery = urlParams.get('q') || '';
        
        // If no query in URL, try to get from search bar
        if (!this.currentQuery) {
            const searchBar = document.querySelector('#search-bar, .search-bar-desktop');
            if (searchBar && searchBar.value) {
                this.currentQuery = searchBar.value;
            }
        }
        
        console.log('AI Panel: Extracted query:', this.currentQuery);
    }
    
    createPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'ai-panel';
        this.panel.innerHTML = `
            <div class="ai-panel-header">
                <h3 class="ai-panel-title">
                    <i class="fas fa-robot ai-icon"></i>
                    AI Assistant
                </h3>
                <button class="ai-panel-close" type="button">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="ai-panel-content">
                <div class="ai-query-section">
                    <div class="ai-query-label">Your Query</div>
                    <p class="ai-query-text">${this.escapeHtml(this.currentQuery)}</p>
                </div>
                <div class="ai-response-section">
                    <div class="ai-response-label">
                        <i class="fas fa-sparkles ai-icon"></i>
                        AI Response
                    </div>
                    <div class="ai-response-content">
                        <div class="ai-loading">
                            <div class="ai-loading-spinner"></div>
                            Getting AI insights...
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.panel);
    }
    
    createToggleButton() {
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.className = 'ai-toggle-btn';
        this.toggleBtn.innerHTML = '<i class="fas fa-robot"></i>';
        this.toggleBtn.title = 'Toggle AI Assistant';
        
        document.body.appendChild(this.toggleBtn);
    }
    
    bindEvents() {
        // Toggle button click
        this.toggleBtn.addEventListener('click', () => {
            this.toggle();
        });
        
        // Close button click
        const closeBtn = this.panel.querySelector('.ai-panel-close');
        closeBtn.addEventListener('click', () => {
            this.close();
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
            if (this.currentQuery && !this.hasResponse()) {
                this.fetchAIResponse();
            }
        }
    }
    
    open() {
        this.isOpen = true;
        this.panel.classList.add('active');
        this.toggleBtn.classList.add('active');
        document.body.classList.add('ai-panel-open');
    }
    
    close() {
        this.isOpen = false;
        this.panel.classList.remove('active');
        this.toggleBtn.classList.remove('active');
        document.body.classList.remove('ai-panel-open');
    }
    
    hasResponse() {
        const content = this.panel.querySelector('.ai-response-content');
        return !content.querySelector('.ai-loading') && !content.querySelector('.ai-error');
    }
    
    async fetchAIResponse() {
        if (this.isLoading || !this.currentQuery) {
            return;
        }
        
        this.isLoading = true;
        const responseContent = this.panel.querySelector('.ai-response-content');
        
        // Show loading state
        responseContent.innerHTML = `
            <div class="ai-loading">
                <div class="ai-loading-spinner"></div>
                Getting AI insights...
            </div>
        `;
        
        try {
            const response = await fetch('/ai-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: this.currentQuery
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                responseContent.innerHTML = `
                    <div class="ai-response-text">${this.formatResponse(data.response)}</div>
                `;
            } else {
                throw new Error(data.error || 'Failed to get AI response');
            }
            
        } catch (error) {
            console.error('AI Panel: Error fetching response:', error);
            responseContent.innerHTML = `
                <div class="ai-error">
                    <strong>Unable to get AI response</strong><br>
                    ${error.message || 'Please try again later.'}
                </div>
            `;
        } finally {
            this.isLoading = false;
        }
    }
    
    formatResponse(response) {
        // Basic formatting for AI response
        return response
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^\s*/, '<p>')
            .replace(/\s*$/, '</p>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize AI Panel when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Panel: Initializing...');
    new AIPanel();
});

// Handle dynamic content loading (for SPA-like behavior)
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Check if search results were dynamically loaded
            const hasSearchResults = Array.from(mutation.addedNodes).some(node => {
                return node.nodeType === Node.ELEMENT_NODE && 
                       (node.querySelector('.search-result') || node.classList?.contains('search-result'));
            });
            
            if (hasSearchResults) {
                setTimeout(() => {
                    if (!document.querySelector('.ai-panel')) {
                        new AIPanel();
                    }
                }, 500);
            }
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});