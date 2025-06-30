/**
 * People Also Ask section enhancement
 * Adds Google-like styling and functionality to "People also ask" sections
 */

document.addEventListener('DOMContentLoaded', function() {
    initializePeopleAlsoAsk();
});

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