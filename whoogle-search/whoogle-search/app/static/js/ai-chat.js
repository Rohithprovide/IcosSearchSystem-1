/**
 * AI Chat Panel - ChatGPT-style interface for Whoogle Search
 */

class AIChatPanel {
    constructor() {
        this.panel = null;
        this.isOpen = false;
        this.messages = [];
        this.isLoading = false;
        
        this.init();
    }
    
    init() {
        // Only initialize on search results pages
        if (!this.isSearchResultsPage()) {
            return;
        }
        
        console.log('AI Chat: Initializing chat panel...');
        this.createPanel();
        this.createToggleButton();
        this.bindEvents();
    }
    
    isSearchResultsPage() {
        // Check if we're on a search results page
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has('q') || document.querySelector('.search-bar-desktop') || document.querySelector('#search-bar');
    }
    
    createPanel() {
        this.panel = document.createElement('div');
        this.panel.className = 'ai-panel';
        this.panel.innerHTML = `
            <div class="ai-panel-header">
                <h3 class="ai-panel-title">
                    <i class="fas fa-robot ai-icon"></i>
                    AI Chat
                </h3>
                <button class="ai-panel-close" type="button">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="ai-chat-messages">
                <div class="ai-welcome">
                    <div class="ai-welcome-title">How can I help you today?</div>
                    <div class="ai-welcome-subtitle">Ask me anything while you browse search results</div>
                </div>
            </div>
            <div class="ai-chat-input">
                <div class="ai-input-container">
                    <textarea 
                        class="ai-text-input" 
                        placeholder="Type your message here..."
                        rows="1"></textarea>
                    <button class="ai-send-button" type="button">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.panel);
    }
    
    createToggleButton() {
        this.toggleBtn = document.createElement('button');
        this.toggleBtn.className = 'ai-toggle-btn';
        this.toggleBtn.innerHTML = '<i class="fas fa-comments"></i>';
        this.toggleBtn.title = 'Open AI Chat';
        
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
        
        // Send button click
        const sendBtn = this.panel.querySelector('.ai-send-button');
        sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });
        
        // Text input events
        const textInput = this.panel.querySelector('.ai-text-input');
        
        // Auto-resize textarea
        textInput.addEventListener('input', () => {
            this.autoResizeTextarea(textInput);
            this.updateSendButton();
        });
        
        // Send on Enter (but allow Shift+Enter for new lines)
        textInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // Escape key to close
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });
    }
    
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
    
    updateSendButton() {
        const textInput = this.panel.querySelector('.ai-text-input');
        const sendBtn = this.panel.querySelector('.ai-send-button');
        const hasText = textInput.value.trim().length > 0;
        
        sendBtn.disabled = !hasText || this.isLoading;
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        this.isOpen = true;
        this.panel.classList.add('active');
        this.toggleBtn.classList.add('active');
        document.body.classList.add('ai-panel-open');
        
        // Focus on text input
        setTimeout(() => {
            const textInput = this.panel.querySelector('.ai-text-input');
            textInput.focus();
        }, 300);
    }
    
    close() {
        this.isOpen = false;
        this.panel.classList.remove('active');
        this.toggleBtn.classList.remove('active');
        document.body.classList.remove('ai-panel-open');
    }
    
    async sendMessage() {
        const textInput = this.panel.querySelector('.ai-text-input');
        const messageText = textInput.value.trim();
        
        if (!messageText || this.isLoading) {
            return;
        }
        
        // Clear input and add user message
        textInput.value = '';
        this.autoResizeTextarea(textInput);
        this.updateSendButton();
        
        this.addMessage('user', messageText);
        
        // Show loading state
        this.isLoading = true;
        this.updateSendButton();
        const loadingMessageId = this.addMessage('assistant', '', true);
        
        try {
            const response = await fetch('/ai-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: messageText
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Remove loading message
            this.removeMessage(loadingMessageId);
            
            if (data.success) {
                this.addMessage('assistant', data.response);
            } else {
                this.addMessage('assistant', `Sorry, I encountered an error: ${data.error}`);
            }
            
        } catch (error) {
            console.error('AI Chat: Error sending message:', error);
            
            // Remove loading message and show error
            this.removeMessage(loadingMessageId);
            this.addMessage('assistant', 'Sorry, I\'m having trouble connecting right now. Please try again.');
        } finally {
            this.isLoading = false;
            this.updateSendButton();
        }
    }
    
    addMessage(type, content, isLoading = false) {
        const messagesContainer = this.panel.querySelector('.ai-chat-messages');
        const messageId = 'msg-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
        
        // Remove welcome message if it exists
        const welcome = messagesContainer.querySelector('.ai-welcome');
        if (welcome) {
            welcome.remove();
        }
        
        const messageElement = document.createElement('div');
        messageElement.className = `ai-message ${type}`;
        messageElement.id = messageId;
        
        if (isLoading) {
            messageElement.innerHTML = `
                <div class="ai-message-content">
                    <div class="ai-loading">
                        <div class="ai-loading-spinner"></div>
                        Thinking...
                    </div>
                </div>
            `;
        } else {
            const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            messageElement.innerHTML = `
                <div class="ai-message-content">${this.formatMessage(content)}</div>
                <div class="ai-message-time">${time}</div>
            `;
        }
        
        messagesContainer.appendChild(messageElement);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        return messageId;
    }
    
    removeMessage(messageId) {
        const messageElement = document.getElementById(messageId);
        if (messageElement) {
            messageElement.remove();
        }
    }
    
    formatMessage(text) {
        // Basic formatting for AI response
        return text
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^\s*/, '<p>')
            .replace(/\s*$/, '</p>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }
}

// Initialize AI Chat Panel when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('AI Chat: DOM loaded, initializing...');
    
    // Wait a bit for other scripts to load
    setTimeout(() => {
        try {
            new AIChatPanel();
        } catch (error) {
            console.error('AI Chat: Failed to initialize:', error);
        }
    }, 500);
});

// Handle dynamic content loading
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Check if search results were dynamically loaded
            const hasSearchResults = Array.from(mutation.addedNodes).some(node => {
                return node.nodeType === Node.ELEMENT_NODE && 
                       (node.querySelector('.search-result') || node.classList?.contains('search-result'));
            });
            
            if (hasSearchResults && !document.querySelector('.ai-panel')) {
                setTimeout(() => {
                    try {
                        new AIChatPanel();
                    } catch (error) {
                        console.error('AI Chat: Failed to initialize on dynamic load:', error);
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