/**
 * Voice Search Functionality for Whoogle Search
 * Enables voice input via the microphone icon
 */

let recognition;
let isRecording = false;

function initVoiceSearch() {
    // Check if Web Speech API is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        
        // Configure speech recognition
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        // Handle speech recognition results
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            const searchInput = document.getElementById('search-bar');
            const micIcon = document.querySelector('.search-icon-right');
            
            if (searchInput && transcript.trim()) {
                searchInput.value = transcript;
                searchInput.focus();
            }
            
            // Reset microphone icon if it exists
            if (micIcon) {
                micIcon.classList.remove('recording');
                // Reset inline styles
                micIcon.style.backgroundColor = '';
                micIcon.style.color = '';
                micIcon.style.transform = '';
                micIcon.style.borderRadius = '';
            }
            isRecording = false;
        };
        
        // Handle speech recognition errors
        recognition.onerror = function(event) {
            console.log('Speech recognition error:', event.error);
            const micIcon = document.querySelector('.search-icon-right');
            if (micIcon) {
                micIcon.classList.remove('recording');
                // Reset inline styles
                micIcon.style.backgroundColor = '';
                micIcon.style.color = '';
                micIcon.style.transform = '';
                micIcon.style.borderRadius = '';
            }
            isRecording = false;
            
            // Show user-friendly error message
            if (event.error === 'not-allowed') {
                alert('Microphone access denied. Please allow microphone access and try again.');
            } else if (event.error === 'no-speech') {
                alert('No speech detected. Please try again.');
            } else {
                alert('Voice recognition error. Please try again.');
            }
        };
        
        // Handle when speech recognition ends
        recognition.onend = function() {
            const micIcon = document.querySelector('.search-icon-right');
            if (micIcon) {
                micIcon.classList.remove('recording');
            }
            isRecording = false;
        };
        
        // Add click event to microphone icon
        const micIcon = document.querySelector('.search-icon-right');
        if (micIcon) {
            micIcon.addEventListener('click', function() {
                if (!isRecording) {
                    startVoiceRecognition();
                } else {
                    stopVoiceRecognition();
                }
            });
            
            // Add tooltip
            micIcon.title = 'Voice search';
        }
    } else {
        // Hide microphone icon if not supported
        const micIcon = document.querySelector('.search-icon-right');
        if (micIcon) {
            micIcon.style.display = 'none';
        }
        console.log('Web Speech API not supported in this browser');
    }
}

function startVoiceRecognition() {
    if (!recognition) return;
    
    const micIcon = document.querySelector('.search-icon-right');
    
    try {
        recognition.start();
        micIcon.classList.add('recording');
        isRecording = true;
        
        // Force hover effect with inline styles as backup
        micIcon.style.backgroundColor = '#f1f3f4';
        micIcon.style.color = '#ea4335';
        micIcon.style.transform = 'scale(1.1)';
        micIcon.style.borderRadius = '50%';
        
        // Debug: Log to verify the class is added
        console.log('Recording class added, element classes:', micIcon.className);
        
        // Clear existing search text
        const searchInput = document.getElementById('search-bar');
        if (searchInput) {
            searchInput.value = '';
        }
    } catch (error) {
        console.error('Error starting voice recognition:', error);
        micIcon.classList.remove('recording');
        // Reset inline styles
        micIcon.style.backgroundColor = '';
        micIcon.style.color = '';
        micIcon.style.transform = '';
        micIcon.style.borderRadius = '';
        isRecording = false;
    }
}

function stopVoiceRecognition() {
    if (recognition && isRecording) {
        recognition.stop();
    }
}

// Initialize voice search when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initVoiceSearch();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVoiceSearch);
} else {
    initVoiceSearch();
}