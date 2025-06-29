#!/bin/bash

# Setup script to clone WhoogleSearch repository and prepare it for Replit
echo "Setting up WhoogleSearch on Replit..."

# Check if whoogle-search directory already exists
if [ -d "whoogle-search" ]; then
    echo "WhoogleSearch directory already exists, skipping clone..."
else
    echo "Cloning WhoogleSearch repository..."
    git clone https://github.com/benbusby/whoogle-search.git
    if [ $? -eq 0 ]; then
        echo "Successfully cloned WhoogleSearch repository"
    else
        echo "Failed to clone repository"
        exit 1
    fi
fi

# Navigate to the whoogle-search directory
cd whoogle-search

# Install dependencies
echo "Installing dependencies..."
pip install -r requirements.txt

echo "Setup complete! WhoogleSearch is ready to run."
