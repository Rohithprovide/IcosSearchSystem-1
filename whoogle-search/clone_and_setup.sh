#!/bin/bash

# Whoogle Search Repository Cloner and Setup Script for Replit
# This script clones the Whoogle Search repository and sets it up to run

echo "=== Whoogle Search Setup for Replit ==="
echo "Cloning Whoogle Search repository..."

# Remove existing whoogle-search directory if it exists
if [ -d "whoogle-search" ]; then
    echo "Removing existing whoogle-search directory..."
    rm -rf whoogle-search
fi

# Clone the repository
git clone https://github.com/Rohithprovide/whoogle-search.git

# Check if clone was successful
if [ ! -d "whoogle-search" ]; then
    echo "Error: Failed to clone repository"
    exit 1
fi

echo "Repository cloned successfully!"

# Navigate to the cloned directory
cd whoogle-search

echo "Setting up Python virtual environment..."
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

echo "=== Setup Complete! ==="
echo "Whoogle Search has been cloned and dependencies installed."
echo "You can now run the application using the run button in Replit."
echo ""
echo "The application will be available at:"
echo "- Local: http://localhost:5000"
echo "- Replit: Your repl URL will be automatically forwarded"
echo ""
echo "To run manually, navigate to whoogle-search directory and run:"
echo "source venv/bin/activate && python3 run"
