# Whoogle Search - Replit Deployment

## Overview

This repository contains a Whoogle Search deployment wrapper for Replit. Whoogle Search is a privacy-focused Google search proxy that removes ads, tracking, and JavaScript while providing clean search results. The application is built with Python/Flask and designed to be easily deployable on various platforms including Replit.

## System Architecture

### Backend Architecture
- **Framework**: Flask web application written in Python
- **Core Components**:
  - Search proxy engine that queries Google and filters results
  - Request handling system with Tor support
  - Configuration management with user preferences
  - Session management with encryption
  - Filter system for cleaning search results
  - Bang shortcuts for quick navigation

### Frontend Architecture
- **Templates**: Jinja2 templating with responsive HTML
- **Styling**: CSS with theme support (light/dark/system)
- **JavaScript**: Vanilla JS for autocomplete, keyboard navigation, and utilities
- **Responsive Design**: Mobile-first approach with separate mobile templates

### Data Flow
1. User submits search query through web interface
2. Flask routes process the request and apply user configurations
3. Search class constructs Google search query with privacy parameters
4. Request module fetches results (optionally through Tor)
5. Filter module processes HTML, removes tracking, ads, and unwanted content
6. Results are rendered with custom templates and returned to user

## Key Components

### Core Modules
- **`app/__init__.py`**: Flask application initialization and configuration
- **`app/routes.py`**: Main route handlers for search, config, and utilities
- **`app/filter.py`**: HTML filtering and result cleaning logic
- **`app/request.py`**: HTTP request handling with Tor support
- **`app/utils/search.py`**: Search query processing and construction

### Models
- **`Config`**: User preference management and session handling
- **`Endpoint`**: URL endpoint enumeration
- **`GClasses`**: Google CSS class tracking for filtering

### Frontend Assets
- **Templates**: HTML templates for search results, configuration, and layouts
- **CSS**: Theming system with variables and responsive design
- **JavaScript**: Client-side functionality for search enhancement

### Configuration System
- Environment variable based configuration
- User session preferences with encryption
- Country, language, and search customization options
- Theme and appearance settings

## External Dependencies

### Python Packages
- **Flask**: Web framework and routing
- **BeautifulSoup4**: HTML parsing and manipulation
- **Requests**: HTTP client for search queries
- **Cryptography**: Session encryption and security
- **Stem**: Tor network integration
- **Waitress**: WSGI server for production deployment

### Optional Integrations
- **Tor Network**: Anonymous search routing
- **Proxy Support**: SOCKS and HTTP proxy compatibility
- **Translation Services**: Multi-language interface support

## Deployment Strategy

### Replit Deployment
- **Entry Point**: `main.py` - Sets up and runs Whoogle Search
- **Process**: 
  1. Clones Whoogle Search repository if not present
  2. Installs Python dependencies
  3. Configures environment for Replit hosting
  4. Starts Flask application server

### Environment Configuration
- Automatic dependency installation from `requirements.txt`
- Environment variable configuration for Replit compatibility
- Port and host configuration for cloud deployment

### Scalability Considerations
- Stateless application design for horizontal scaling
- Session-based user preferences without persistent storage
- Configurable proxy and Tor support for distributed deployment

## Changelog
- June 29, 2025. Initial repository clone and setup:
  - Cloned icos-search-3 repository from GitHub (https://github.com/Rohithprovide/icos-search-3.git)
  - Successfully cloned repository with all files and nested Whoogle Search components
  - Installed required Python dependencies including cssutils, stem, pysocks, validators, waitress, and python-dotenv
  - Configured main.py as entry point for Whoogle Search application
  - Application successfully running on port 5000 with proper dependency resolution
  - Whoogle Search proxy server is now fully operational and accessible
- June 29, 2025. Implemented modern settings interface:
  - Removed collapsible configuration section below search bar
  - Added hamburger menu icon (fa-bars) to top left corner
  - Created centered popup modal with clean, modern design
  - Implemented three core settings: Theme selection, Safe Search toggle, Open Links in New Tab toggle
  - Added smooth animations and proper accessibility features (ESC key, click outside to close)
  - Applied consistent styling across light and dark themes
  - Modal maintains full functionality of original settings system while providing cleaner UX
- June 29, 2025. Added navigation tab hover effects:
  - Implemented universal hover effects for all navigation tabs (All, Images, Maps, Videos, News)
  - Added text-decoration underline effect with custom styling (color: #dadce0, thickness: 2px)
  - Special handling for Maps tab: preserved hide-google-icons functionality while adding border-bottom hover effect
  - Consistent hover behavior across desktop and mobile interfaces
  - Enhanced user experience with visual feedback on tab interaction
- June 30, 2025. Enhanced search bar functionality and UI:
  - Successfully implemented clear icon (X) for search results page header with dynamic show/hide behavior
  - Added FontAwesome CDN support to display.html template for icon rendering
  - Clear icon appears only when text is present, disappears when search bar is empty
  - User customized clear icon positioning (top: 15%) for perfect vertical alignment
  - Clear icon functionality works correctly for clearing search text and refocusing input
  - Attempted to add magnifying glass icon to search results page but encountered rendering issues
- June 30, 2025. Added "People also ask" section functionality:
  - Removed "People also ask" from minimal_mode_sections filter to ensure it's always displayed
  - Modified collapse_sections() function to prevent "People also ask" sections from being collapsed into details elements
  - Created custom CSS styling (people-also-ask.css) to match Google's design with bordered question boxes
  - Implemented JavaScript functionality (people-also-ask.js) for expandable questions with dropdown arrows
  - Added Google-style pagination transformation from simple "Next >" to numbered pagination (1, 2, 3, 4, >)
  - Enhanced pagination with blue underline for current page and hover effects
  - Integrated both CSS and JavaScript files into display.html template for full functionality
  - Fixed core issue: "People also ask" sections now remain expanded and visible instead of being auto-collapsed
- June 30, 2025. Enhanced "Related searches" to match Google's "People also search for" design:
  - Created related-searches.css with Google-style grid layout and bordered search boxes
  - Implemented related-searches.js to transform existing text links into interactive grid items
  - Changed header from "Related searches" to "People also search for" to match Google
  - Added search icons and hover effects to each suggestion box
  - Applied responsive design for mobile devices with single-column layout
  - Added dark theme support for all related search elements
- June 30, 2025. Removed AI chat panel functionality per user request:
  - Removed ai-panel.css and ai-chat.js files completely
  - Removed /ai-query Flask route from routes.py
  - Removed AI panel CSS and JavaScript references from display.html template
  - Cleaned up all AI-related code to restore original search functionality
  - Search engine now operates without AI integration, maintaining privacy focus
- June 30, 2025. Added right sidebar to fill empty space on search results:
  - Created right-sidebar.css with rounded corners and multiple box shadows
  - Implemented right-sidebar.js for automatic sidebar initialization on search pages
  - Fixed positioning on right side of search results with responsive design
  - Added proper layout adjustments to prevent content overlap
  - Sidebar appears only on larger screens (hidden on mobile/tablet for better UX)
  - Clean, modern design with placeholder content and smooth scrolling
- July 1, 2025. Transformed sidebar into AI-powered chat interface:
  - Removed static placeholder content and created ChatGPT-style chat interface
  - Integrated Gemini AI API for intelligent responses to search queries
  - Added automatic search query capture and AI processing functionality
  - Created /ai-query Flask route to handle backend AI requests securely
  - Implemented real-time chat messages with user/AI message styling
  - Chat interface automatically captures search queries and provides AI insights
  - Added loading indicators and error handling for robust user experience
  - Sidebar dimensions: 550px width x 550px height with proper positioning
- July 3, 2025. Redesigned AI interface with Google-style AI Overview:
  - Changed timing mechanism: AI requests now sent immediately when user searches (not after page load)
  - Implemented Google-style AI Overview design matching official Google search AI panels
  - Replaced ChatGPT-style chat with Google's clean, professional AI overview layout
  - Added Google-style header with colorful Gemini logo and "AI Overview" title
  - Implemented proper loading states with animated dots and error handling
  - Updated API configuration to use GOOGLE_API_KEY instead of GEMINI_API_KEY
  - Enhanced search query capture with multiple methods: form submission, button clicks, Enter key
  - AI responses now display in Google's signature left-border style with proper typography
- July 4, 2025. Fixed AI sidebar empty div issue and restricted to All tab only:
  - Fixed JavaScript structure mismatch between HTML creation and element access
  - Added proper response-content div to sidebar HTML structure
  - Configured API key integration with environment variable fallback system
  - Added comprehensive debugging logs for API response tracking
  - Implemented tab detection to show AI sidebar only on "All" search tab
  - Added automatic sidebar hiding when users navigate to Images, Maps, Videos, or News tabs
  - Enhanced tab monitoring system with URL change detection and click event handling
  - Sidebar now properly displays rate limit messages when API quota is exceeded
- July 4, 2025. Implemented Google-style infinite scroll for Images tab:
  - Created comprehensive infinite scroll functionality for image search results
  - Replaced pagination with continuous loading as users scroll down (like Google Images)
  - Added automatic detection of Images tab (tbm=isch parameter)
  - Implemented smooth loading indicators with Google-style animations
  - Added error handling and "no more results" messages
  - Integrated with existing image grid layout (4 images per row)
  - Hidden pagination elements automatically when infinite scroll is active
  - Added loading threshold at 80% scroll position for optimal user experience
  - Fixed grid layout issue where new images created gaps instead of filling rows continuously
  - Enhanced appendImages function to properly fill incomplete rows before creating new ones
- July 4, 2025. Removed infinite scroll from Images tab per user request:
  - Deleted infinite-scroll-images.js file completely
  - Removed script reference from imageresults.html template
  - Removed script reference from display.html template
  - Performed comprehensive cleanup of all HTML, JavaScript, and CSS files
  - Verified no remaining infinite scroll code exists in templates or static files
  - Restored standard pagination functionality for image search results
  - Images tab now uses traditional page-by-page navigation instead of continuous scrolling
- July 4, 2025. Enhanced image grid layout to display 6 images per row:
  - Updated Jinja2 template logic to change from 4 images per row to 6 images per row
  - Modified array indexing calculations (i*4)+j to (i*6)+j for proper image rendering
  - Adjusted CSS image sizes from 110px to 95px for optimal 6-image layout
  - Updated responsive media queries for different screen sizes (110px, 95px, 90px, 75px, 60px)
  - Fixed conflicting CSS in images-fullscreen.css that was forcing 5 images per row
  - Set consistent 16.66% width (6 images per row) across all desktop screen sizes
  - Optimized mobile responsive design with 3 images per row on tablets, 2 on phones
  - Temporarily disabled images-fullscreen.css to eliminate CSS conflicts
  - Implemented simplified table-layout approach with fixed 16.66% column widths
  - Maintained aspect ratios and proper spacing for cleaner grid appearance
  - Increased WHOOGLE_RESULTS_PER_PAGE from 10 to 30 for better image grid display
  - Added environment variable configuration directly to main.py for persistence
  - Configuration now shows 30 images per page (5 full rows of 6 images each)
  - Further increased to 100 images per page per user request for more comprehensive results
  - Layout now displays approximately 16-17 rows of 6 images each (100 total images)
  - Fixed environment variable inheritance issue by modifying request.py directly
  - Changed default from 10 to 100 results and created .env file for persistence
  - Hardcoded 100 results per page to ensure consistent behavior across all searches
  - Implemented multi-page fetching system to overcome Google's 20-image limit per request
  - Added intelligent image search handler that fetches 5 pages (20 images each) and combines them
  - Created seamless 100-image display without pagination, maintaining 6-column grid layout
- July 4, 2025. Enhanced image visual design with Google-style modern aesthetics:
  - Added 8px rounded corners to all images for modern, polished appearance
  - Implemented smooth hover effects with box shadow (0 4px 8px rgba(0,0,0,0.2))
  - Added subtle lift animation (translateY -2px) on hover for interactive feedback
  - Applied consistent styling across all responsive breakpoints (1920px to 479px)
  - Enhanced both image containers (.t0fcAb) and image wrappers (.RAyV4b) with transitions
  - Maintained 6-column grid layout while improving visual hierarchy and user experience
- July 4, 2025. Fixed pagination calculation errors affecting both All and Images tabs:
  - Identified pagination logic was hardcoded to 10 results per page, causing incorrect page jumps
  - Updated pagination.js to detect search type and use appropriate results per page (10 for All, 100 for Images)
  - Fixed current page calculation to use dynamic results per page value
  - Corrected start parameter generation for proper sequential page navigation
  - Enhanced function signatures to pass results per page through pagination chain
  - Pagination now works correctly: All tab (0→10→20) and Images tab (0→100→200)

## User Preferences

Preferred communication style: Simple, everyday language.