# Whoogle Search - Replit Setup

## Overview
This repository contains a Replit setup for Whoogle Search, a privacy-focused Google search proxy. The setup automatically clones and configures the official Whoogle Search repository to run on Replit. Whoogle provides Google search results without ads, JavaScript, AMP links, cookies, or IP address tracking.

## System Architecture

### Core Technologies
- **Backend Framework**: Flask (Python web framework)
- **Template Engine**: Jinja2
- **HTTP Parsing**: BeautifulSoup4 for HTML manipulation
- **Cryptography**: Fernet encryption for search queries and user sessions
- **Proxy Support**: SOCKS5 and Tor integration
- **Testing**: pytest framework
- **Deployment**: Waitress WSGI server for production

### Application Structure
```
whoogle-search/
├── app/                    # Main application code
│   ├── __init__.py        # Flask app initialization
│   ├── routes.py          # URL routing and request handling
│   ├── filter.py          # Search result filtering and cleaning
│   ├── request.py         # HTTP request handling and proxy support
│   ├── models/            # Data models (Config, Endpoint, etc.)
│   ├── utils/             # Utility functions
│   ├── templates/         # HTML templates
│   └── static/            # CSS, JS, and other static assets
├── test/                  # Test suite
├── misc/                  # Miscellaneous scripts and configurations
└── run_whoogle.py         # Replit-specific runner script
```

## Key Components

### Frontend Architecture
- **Responsive Design**: Mobile-first approach with desktop adaptations
- **Theme System**: Light, dark, and system themes with CSS variables
- **Search Interface**: Google-like search experience with autocomplete
- **Result Filtering**: Privacy-focused result cleaning and ad removal
- **Custom Styling**: Configurable CSS themes and user preferences

### Backend Architecture
- **Flask Application**: Modular design with blueprints for different functionalities
- **Request Processing**: Proxy-aware request handling with Tor support
- **Session Management**: Encrypted user sessions with Fernet encryption
- **Search Filtering**: BeautifulSoup-based HTML parsing and content filtering
- **Configuration System**: Environment variable and file-based configuration

### Privacy Features
- **Query Encryption**: All search queries are encrypted using Fernet
- **Session Isolation**: Each user session is cryptographically separated
- **Ad Removal**: Automatic filtering of sponsored content and tracking
- **Link Proxying**: External links are proxied to prevent tracking
- **No Logging**: No search queries or user data is logged

## Data Flow

1. **User Request**: User submits search query through the web interface
2. **Query Encryption**: Search terms are encrypted and stored in session
3. **Google Proxy**: Request is forwarded to Google with privacy headers
4. **Result Filtering**: HTML response is parsed and cleaned using BeautifulSoup
5. **Content Modification**: Ads, tracking scripts, and AMP links are removed
6. **Response Delivery**: Clean results are served to the user

## External Dependencies

### Python Packages
- **Flask**: Web framework and templating
- **BeautifulSoup4**: HTML parsing and manipulation
- **Cryptography**: Encryption and security functions
- **Requests**: HTTP client for external API calls
- **Waitress**: Production WSGI server
- **Stem**: Tor network integration
- **Validators**: URL and input validation

### Third-Party Services
- **Google Search**: Core search functionality (proxied)
- **DuckDuckGo**: Favicon retrieval service
- **Tor Network**: Optional anonymous browsing support
- **Font CDN**: Google Fonts for typography (configurable)

### Optional Integrations
- **Tor Proxy**: SOCKS5 proxy support for anonymity
- **Custom Bangs**: DuckDuckGo-style search shortcuts
- **Alternative Frontends**: Privacy-focused alternatives for social media sites

## Deployment Strategy

### Replit Configuration
- **Automatic Setup**: `clone_and_setup.sh` script handles repository cloning
- **Python Environment**: Virtual environment with dependency management
- **Port Configuration**: Flask app runs on port 5000 with automatic forwarding
- **Process Management**: `run_whoogle.py` handles startup and monitoring

### Environment Variables
- **WHOOGLE_URL_PREFIX**: URL prefix for the instance
- **WHOOGLE_USER/PASS**: Basic authentication credentials
- **WHOOGLE_PROXY_***: Proxy server configuration
- **WHOOGLE_CONFIG_***: Application behavior settings
- **HTTPS_ONLY**: Force HTTPS redirects

### Container Support
- **Docker**: Full containerization support with official images
- **Kubernetes**: Helm charts available for cluster deployment
- **Heroku**: One-click deployment with buildpack support

## Changelog
- June 28, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.