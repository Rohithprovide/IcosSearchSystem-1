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

## User Preferences

Preferred communication style: Simple, everyday language.