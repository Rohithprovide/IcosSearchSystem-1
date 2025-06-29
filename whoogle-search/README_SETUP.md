# Whoogle Search - Replit Setup

This setup automatically clones and configures the Whoogle Search repository to run on Replit.

## 🚀 Quick Start

1. **Click the "Run" button** - That's it! The setup script will automatically:
   - Clone the Whoogle Search repository from GitHub
   - Install all required Python dependencies
   - Start the Whoogle Search server

2. **Access your search engine** - Once running, Whoogle will be available at:
   - Your Replit URL (automatically forwarded)
   - Running on port 5000

## 📋 What This Setup Does

### Automatic Repository Cloning
- Clones from: `https://github.com/Rohithprovide/whoogle-search.git`
- No code modifications - uses the exact repository as requested
- Sets up Python virtual environment
- Installs all dependencies from `requirements.txt`

### Replit Configuration
- Configures the "Run" button to start Whoogle Search
- Sets up proper environment variables
- Handles port forwarding (port 5000)
- Enables external access through Replit's URL

### Files Created
- `clone_and_setup.sh` - Script to clone and setup the repository
- `run_whoogle.py` - Python script to handle running Whoogle
- `.replit` - Replit configuration file
- `README_SETUP.md` - This documentation

## 🔧 Manual Setup (if needed)

If you need to set up manually:

1. **Clone the repository:**
   ```bash
   bash clone_and_setup.sh
   ```

2. **Run Whoogle:**
   ```bash
   python3 run_whoogle.py
   ```

## 🌐 Accessing Whoogle Search

Once running, you can access Whoogle Search through:
- **Replit URL**: Click the "Open in New Tab" button when the server starts
- **Direct Access**: The application runs on `0.0.0.0:5000`

## 📁 Repository Structure

After setup, you'll have:
