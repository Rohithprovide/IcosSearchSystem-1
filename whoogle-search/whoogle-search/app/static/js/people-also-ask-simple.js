/**
 * Simple People Also Ask implementation
 * Forces creation of People Also Ask section on the right side
 */

console.log('People Also Ask Simple: Script loading...');

// Run immediately and also on page load
(function() {
    'use strict';
    
    function createPeopleAlsoAsk() {
        console.log('Creating People Also Ask section...');
        
        // Get query from URL
        const urlParams = new URLSearchParams(window.location.search);
        const query = urlParams.get('q');
        
        if (!query) {
            console.log('No query found, skipping PAA');
            return;
        }
        
        console.log('Query found:', query);
        
        // Remove existing PAA if any
        const existing = document.getElementById('paa-sidebar');
        if (existing) {
            existing.remove();
        }
        
        // Create the sidebar
        const sidebar = document.createElement('div');
        sidebar.id = 'paa-sidebar';
        sidebar.innerHTML = `
            <div class="paa-header">
                <h2>People also ask</h2>
            </div>
            <div class="paa-questions">
                <div class="paa-question" onclick="togglePaaAnswer(this)">
                    <div class="paa-question-text">What does ${query} mean?</div>
                    <div class="paa-arrow">⌄</div>
                    <div class="paa-answer" style="display: none;">
                        <p>This is an explanation about ${query}. The answer would typically provide detailed information from search results.</p>
                    </div>
                </div>
                <div class="paa-question" onclick="togglePaaAnswer(this)">
                    <div class="paa-question-text">How to use ${query}?</div>
                    <div class="paa-arrow">⌄</div>
                    <div class="paa-answer" style="display: none;">
                        <p>Here's how you can use ${query} effectively. This answer would contain practical guidance and tips.</p>
                    </div>
                </div>
                <div class="paa-question" onclick="togglePaaAnswer(this)">
                    <div class="paa-question-text">Why is ${query} important?</div>
                    <div class="paa-arrow">⌄</div>
                    <div class="paa-answer" style="display: none;">
                        <p>The importance of ${query} lies in its various applications and benefits for users.</p>
                    </div>
                </div>
                <div class="paa-question" onclick="togglePaaAnswer(this)">
                    <div class="paa-question-text">Where can I learn more about ${query}?</div>
                    <div class="paa-arrow">⌄</div>
                    <div class="paa-answer" style="display: none;">
                        <p>You can learn more about ${query} through various online resources, documentation, and educational platforms.</p>
                    </div>
                </div>
            </div>
        `;
        
        // Style the sidebar
        sidebar.style.cssText = `
            position: fixed;
            top: 120px;
            right: 20px;
            width: 350px;
            max-height: calc(100vh - 150px);
            overflow-y: auto;
            background: white;
            border: 1px solid #dadce0;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            padding: 16px;
            z-index: 1000;
            font-family: arial, sans-serif;
        `;
        
        // Add to page
        document.body.appendChild(sidebar);
        
        console.log('People Also Ask sidebar created successfully');
    }
    
    // Global function for toggling answers
    window.togglePaaAnswer = function(questionElement) {
        const answer = questionElement.querySelector('.paa-answer');
        const arrow = questionElement.querySelector('.paa-arrow');
        
        if (answer.style.display === 'none') {
            answer.style.display = 'block';
            arrow.style.transform = 'rotate(180deg)';
            questionElement.classList.add('expanded');
        } else {
            answer.style.display = 'none';
            arrow.style.transform = 'rotate(0deg)';
            questionElement.classList.remove('expanded');
        }
    };
    
    // Add CSS styles
    function addPaaStyles() {
        const style = document.createElement('style');
        style.textContent = `
            #paa-sidebar .paa-header h2 {
                font-size: 20px;
                font-weight: 400;
                color: #202124;
                margin: 0 0 16px 0;
                padding: 0;
            }
            
            .paa-question {
                border: 1px solid #dadce0;
                border-radius: 8px;
                margin: 8px 0;
                background: white;
                overflow: hidden;
                cursor: pointer;
                transition: box-shadow 0.2s ease;
            }
            
            .paa-question:hover {
                box-shadow: 0 1px 6px rgba(32,33,36,.28);
            }
            
            .paa-question-text {
                padding: 12px 16px;
                font-size: 16px;
                color: #202124;
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-height: 48px;
                box-sizing: border-box;
                position: relative;
            }
            
            .paa-arrow {
                font-size: 18px;
                color: #5f6368;
                transition: transform 0.2s ease;
                margin-left: 8px;
                flex-shrink: 0;
            }
            
            .paa-answer {
                padding: 0 16px 16px 16px;
                font-size: 14px;
                color: #5f6368;
                line-height: 20px;
                border-top: 1px solid #f0f0f0;
                background: #fafafa;
            }
            
            .paa-question:hover .paa-question-text {
                background: #f8f9fa;
            }
            
            /* Dark theme support */
            .dark #paa-sidebar {
                background: #303134 !important;
                border-color: #5f6368 !important;
                color: #e8eaed;
            }
            
            .dark .paa-question {
                border-color: #5f6368 !important;
                background: #303134 !important;
            }
            
            .dark .paa-question-text {
                color: #e8eaed !important;
            }
            
            .dark .paa-question:hover .paa-question-text {
                background: #3c4043 !important;
            }
            
            .dark .paa-answer {
                color: #9aa0a6 !important;
                background: #3c4043 !important;
                border-top-color: #5f6368 !important;
            }
            
            .dark .paa-header h2 {
                color: #e8eaed !important;
            }
            
            /* Mobile responsive */
            @media (max-width: 1200px) {
                #paa-sidebar {
                    display: none !important;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Initialize everything
    function init() {
        console.log('Initializing People Also Ask...');
        addPaaStyles();
        createPeopleAlsoAsk();
    }
    
    // Run on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also run after a delay to ensure everything is loaded
    setTimeout(init, 1500);
    
})();

console.log('People Also Ask Simple: Script loaded');