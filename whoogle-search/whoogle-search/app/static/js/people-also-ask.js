/**
 * People Also Ask section enhancement
 * Extracts Google's "People also ask" sections and moves them to the right side
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('People Also Ask: Script loaded and initializing...');
    
    // Delay execution to ensure page is fully loaded
    setTimeout(function() {
        console.log('People Also Ask: Starting extraction...');
        extractAndMovePeopleAlsoAsk();
        initializePeopleAlsoAsk();
    }, 1500); // Wait for page to fully load
});

function extractAndMovePeopleAlsoAsk() {
    console.log('Extracting Google PAA sections...');
    
    // Look for existing PAA sections using multiple possible selectors
    const paaSelectors = [
        '[jsname="yEVEwb"]', // Google's PAA container
        '[data-hveid*="CAs"]', // PAA with hveid
        '[data-md="50"]', // PAA section
        '.related-question-pair', // PAA question pairs
        '.g[data-ved*="QkQ"]', // PAA results container
        'div[jsname]', // Generic jsname containers
        '.xpc .g', // PAA in knowledge panel area
        '.kp-blk .g' // PAA in knowledge block
    ];
    
    let foundPAA = [];
    
    // Search for PAA sections
    paaSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // Check if this element contains PAA content
            const text = element.textContent;
            if (text && (
                text.includes('People also ask') ||
                text.includes('Related questions') ||
                element.querySelector('[role="button"]') // PAA questions are buttons
            )) {
                console.log('Found PAA element:', element);
                foundPAA.push(element);
            }
        });
    });
    
    // Also look for individual PAA questions
    const questionElements = document.querySelectorAll('div[data-ved*="QkQ"], [jsaction*="click"]');
    questionElements.forEach(element => {
        const text = element.textContent;
        if (text && text.includes('?') && text.length > 10 && text.length < 200) {
            console.log('Found potential PAA question:', element);
            foundPAA.push(element);
        }
    });
    
    if (foundPAA.length > 0) {
        console.log(`Found ${foundPAA.length} PAA elements, moving to sidebar...`);
        createPAASidebar(foundPAA);
    } else {
        console.log('No PAA sections found in search results');
    }
}

function createPAASidebar(paaElements) {
    // Remove existing sidebar if any
    const existing = document.getElementById('paa-sidebar');
    if (existing) {
        existing.remove();
    }
    
    // Create the sidebar container
    const sidebar = document.createElement('div');
    sidebar.id = 'paa-sidebar';
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
    
    // Create header
    const header = document.createElement('div');
    header.innerHTML = '<h2 style="font-size: 20px; font-weight: 400; color: #202124; margin: 0 0 16px 0;">People also ask</h2>';
    sidebar.appendChild(header);
    
    // Move PAA elements to sidebar
    paaElements.forEach((element, index) => {
        if (index < 4) { // Limit to 4 questions
            const clonedElement = element.cloneNode(true);
            
            // Hide original element
            element.style.display = 'none';
            
            // Style the cloned element for sidebar
            clonedElement.style.cssText = `
                border: 1px solid #dadce0;
                border-radius: 8px;
                margin: 8px 0;
                background: white;
                overflow: hidden;
                cursor: pointer;
            `;
            
            sidebar.appendChild(clonedElement);
        }
    });
    
    // Add to page
    document.body.appendChild(sidebar);
    
    console.log('PAA sidebar created with', paaElements.length, 'elements');
}

function generatePeopleAlsoAskSection(query) {
    // Generate relevant questions based on the query
    const questions = generateQuestions(query);
    
    if (questions.length === 0) {
        return; // No questions to show
    }
    
    // Find the best place to insert the PAA section
    const insertionPoint = findInsertionPoint();
    if (!insertionPoint) {
        return; // No suitable place found
    }
    
    // Create the PAA section
    const paaSection = createPaaSection(questions);
    
    // Insert the section into the right container
    insertionPoint.appendChild(paaSection);
    
    console.log('People Also Ask: Generated section with', questions.length, 'questions');
}

function generateQuestions(query) {
    const questions = [];
    const cleanQuery = query.toLowerCase().trim();
    
    // Question generation patterns based on query type
    const questionPatterns = {
        what: [
            `What does ${query} mean?`,
            `What is ${query}?`,
            `What are the benefits of ${query}?`,
            `What is the purpose of ${query}?`
        ],
        how: [
            `How to use ${query}?`,
            `How does ${query} work?`,
            `How to get ${query}?`,
            `How to learn ${query}?`
        ],
        why: [
            `Why is ${query} important?`,
            `Why do people use ${query}?`,
            `Why choose ${query}?`,
            `Why does ${query} matter?`
        ],
        when: [
            `When to use ${query}?`,
            `When was ${query} created?`,
            `When is the best time for ${query}?`,
            `When should I start with ${query}?`
        ],
        where: [
            `Where can I find ${query}?`,
            `Where to learn ${query}?`,
            `Where is ${query} used?`,
            `Where to buy ${query}?`
        ]
    };
    
    // Generate questions based on query characteristics
    if (cleanQuery.startsWith('what ')) {
        questions.push(...questionPatterns.how.slice(0, 2));
        questions.push(...questionPatterns.why.slice(0, 2));
    } else if (cleanQuery.startsWith('how ')) {
        questions.push(...questionPatterns.what.slice(0, 2));
        questions.push(...questionPatterns.why.slice(0, 2));
    } else if (cleanQuery.startsWith('why ')) {
        questions.push(...questionPatterns.what.slice(0, 2));
        questions.push(...questionPatterns.how.slice(0, 2));
    } else {
        // For general queries, provide a mix of question types
        questions.push(...questionPatterns.what.slice(0, 1));
        questions.push(...questionPatterns.how.slice(0, 1));
        questions.push(...questionPatterns.why.slice(0, 1));
        questions.push(...questionPatterns.when.slice(0, 1));
    }
    
    // Limit to 4 questions max and ensure uniqueness
    return [...new Set(questions)].slice(0, 4);
}

function findInsertionPoint() {
    // Create a right-side container for PAA instead of inserting in main results
    const body = document.body;
    
    // Check if right-side container already exists
    let rightContainer = document.getElementById('paa-right-container');
    if (rightContainer) {
        return rightContainer;
    }
    
    // Create right-side container
    rightContainer = document.createElement('div');
    rightContainer.id = 'paa-right-container';
    // Check if dark theme is active
    const isDarkTheme = document.body.classList.contains('dark') || 
                       document.documentElement.classList.contains('dark') ||
                       document.querySelector('meta[name="theme"]')?.content === 'dark';
    
    // Responsive design - hide on mobile/tablet
    const isMobile = window.innerWidth <= 1200;
    
    rightContainer.style.cssText = `
        position: fixed;
        top: 150px;
        right: 20px;
        width: 350px;
        max-height: calc(100vh - 200px);
        overflow-y: auto;
        z-index: 1000;
        background: ${isDarkTheme ? '#303134' : 'white'};
        border: 1px solid ${isDarkTheme ? '#5f6368' : '#dadce0'};
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,${isDarkTheme ? '0.3' : '0.1'});
        padding: 16px;
        display: ${isMobile ? 'none' : 'block'};
        color: ${isDarkTheme ? '#e8eaed' : '#202124'};
    `;
    
    body.appendChild(rightContainer);
    return rightContainer;
}

function createPaaSection(questions) {
    const section = document.createElement('div');
    section.className = 'people-also-ask-container generated-paa';
    section.innerHTML = `
        <div class="people-also-ask-header">
            <h2>People also ask</h2>
        </div>
        <div class="questions-container">
            ${questions.map((question, index) => `
                <div class="people-also-ask-question" data-question-index="${index}">
                    <div class="question-text">
                        ${question}
                    </div>
                    <div class="answer-content" style="display: none;">
                        <p>Loading answer...</p>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    return section;
}

function initializePeopleAlsoAsk() {
    // Find and enhance People also ask sections
    enhancePeopleAlsoAskSections();
    
    // Add click handlers for questions
    setupQuestionClickHandlers();
}

function enhancePeopleAlsoAskSections() {
    // Look for various possible People also ask containers
    const possibleContainers = [
        // Direct text matching
        ...Array.from(document.querySelectorAll('*')).filter(el => 
            el.textContent && el.textContent.includes('People also ask')
        ),
        
        // Common Google class patterns
        ...document.querySelectorAll('[data-initq]'),
        ...document.querySelectorAll('.g'),
        ...document.querySelectorAll('div[role="group"]'),
        ...document.querySelectorAll('section'),
        
        // Details elements (sometimes used for expandable content)
        ...document.querySelectorAll('details')
    ];

    possibleContainers.forEach(container => {
        if (isPeopleAlsoAskContainer(container)) {
            enhanceContainer(container);
        }
    });
}

function isPeopleAlsoAskContainer(element) {
    const text = element.textContent || '';
    const innerHTML = element.innerHTML || '';
    
    return (
        text.includes('People also ask') ||
        text.includes('people also ask') ||
        innerHTML.includes('People also ask') ||
        innerHTML.includes('people also ask') ||
        element.getAttribute('data-initq')?.includes('people also ask')
    );
}

function enhanceContainer(container) {
    // Add styling class
    container.classList.add('people-also-ask-container');
    
    // Find and style the header
    const header = findHeaderElement(container);
    if (header) {
        header.classList.add('people-also-ask-header');
    }
    
    // Find and enhance question elements
    const questions = findQuestionElements(container);
    questions.forEach(enhanceQuestion);
}

function findHeaderElement(container) {
    // Look for heading elements
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6, [role="heading"]');
    for (let heading of headings) {
        if (heading.textContent.includes('People also ask')) {
            return heading;
        }
    }
    
    // Look for any element containing the header text
    const allElements = container.querySelectorAll('*');
    for (let element of allElements) {
        if (element.textContent === 'People also ask' || 
            element.textContent.trim() === 'People also ask') {
            return element;
        }
    }
    
    return null;
}

function findQuestionElements(container) {
    const questions = [];
    
    // Look for elements with data-q attribute (common Google pattern)
    const dataQElements = container.querySelectorAll('[data-q]');
    questions.push(...dataQElements);
    
    // Look for details elements
    const detailsElements = container.querySelectorAll('details');
    questions.push(...detailsElements);
    
    // Look for clickable divs that might be questions
    const clickableDivs = container.querySelectorAll('div[role="button"], div[tabindex], .clickable');
    questions.push(...clickableDivs);
    
    // Look for elements that appear to be questions (contain question marks)
    const allDivs = container.querySelectorAll('div');
    allDivs.forEach(div => {
        const text = div.textContent || '';
        if (text.includes('?') && text.length > 10 && text.length < 200) {
            // Check if it's not already included and looks like a question
            if (!questions.includes(div) && isLikelyQuestion(text)) {
                questions.push(div);
            }
        }
    });
    
    return questions;
}

function isLikelyQuestion(text) {
    const questionWords = ['what', 'how', 'why', 'when', 'where', 'who', 'which', 'is', 'are', 'can', 'does', 'do'];
    const lowerText = text.toLowerCase();
    
    return questionWords.some(word => lowerText.startsWith(word)) && text.includes('?');
}

function enhanceQuestion(questionElement) {
    // Don't enhance if already enhanced
    if (questionElement.classList.contains('people-also-ask-question')) {
        return;
    }
    
    questionElement.classList.add('people-also-ask-question');
    
    // If it's a details element, handle it differently
    if (questionElement.tagName.toLowerCase() === 'details') {
        enhanceDetailsQuestion(questionElement);
        return;
    }
    
    // For other elements, create the question structure
    enhanceRegularQuestion(questionElement);
}

function enhanceDetailsQuestion(details) {
    const summary = details.querySelector('summary');
    const content = details.querySelector('summary ~ *') || details.innerHTML.replace(summary?.outerHTML || '', '');
    
    if (summary) {
        summary.classList.add('question-text');
        
        // Add click handler
        summary.addEventListener('click', function(e) {
            e.preventDefault();
            toggleQuestion(details);
        });
    }
    
    // Style the content
    const contentElements = details.querySelectorAll('summary ~ *');
    contentElements.forEach(el => {
        el.classList.add('answer-content');
    });
}

function enhanceRegularQuestion(questionElement) {
    const originalText = questionElement.textContent || '';
    
    // Create question structure
    const questionDiv = document.createElement('div');
    questionDiv.className = 'question-text';
    questionDiv.textContent = originalText;
    
    // Create answer placeholder (will be populated when clicked)
    const answerDiv = document.createElement('div');
    answerDiv.className = 'answer-content';
    answerDiv.style.display = 'none';
    
    // Replace original content
    questionElement.innerHTML = '';
    questionElement.appendChild(questionDiv);
    questionElement.appendChild(answerDiv);
    
    // Add click handler
    questionDiv.addEventListener('click', function() {
        toggleQuestion(questionElement);
    });
}

function toggleQuestion(questionElement) {
    const isExpanded = questionElement.classList.contains('expanded');
    
    if (isExpanded) {
        // Collapse
        questionElement.classList.remove('expanded');
        const answerContent = questionElement.querySelector('.answer-content');
        if (answerContent) {
            answerContent.style.display = 'none';
        }
    } else {
        // Expand
        questionElement.classList.add('expanded');
        const answerContent = questionElement.querySelector('.answer-content');
        if (answerContent) {
            answerContent.style.display = 'block';
            
            // Load answer content if empty
            if (!answerContent.textContent.trim()) {
                loadAnswerContent(answerContent, questionElement);
            }
        }
    }
}

function loadAnswerContent(answerElement, questionElement) {
    // For now, show a placeholder. In a real implementation, 
    // this would fetch the answer from Google or other sources
    const questionText = questionElement.querySelector('.question-text')?.textContent || '';
    
    answerElement.innerHTML = `
        <p>Loading answer for: "${questionText}"</p>
        <p><em>Answer content would be loaded here from the original Google results.</em></p>
    `;
}

function setupQuestionClickHandlers() {
    // Handle any existing question elements that might have been missed
    document.addEventListener('click', function(e) {
        const questionElement = e.target.closest('.people-also-ask-question .question-text');
        if (questionElement) {
            const container = questionElement.closest('.people-also-ask-question');
            if (container) {
                toggleQuestion(container);
            }
        }
    });
}

// Handle dynamic content loading
const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            // Re-run enhancement for new content
            setTimeout(initializePeopleAlsoAsk, 100);
        }
    });
});

observer.observe(document.body, {
    childList: true,
    subtree: true
});