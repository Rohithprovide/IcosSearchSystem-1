#!/usr/bin/env python3
"""
Main entry point for running WhoogleSearch on Replit
This script sets up and starts the Whoogle Search application
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def setup_whoogle():
    """Setup WhoogleSearch if not already present"""
    whoogle_dir = Path("whoogle-search")
    
    if not whoogle_dir.exists():
        print("WhoogleSearch not found. Cloning repository...")
        try:
            # Clone the specified Whoogle Search repository
            subprocess.run([
                "git", "clone", 
                "https://github.com/Rohithprovide/WhoogleSearch.git", 
                "whoogle-search"
            ], check=True)
            print("Successfully cloned WhoogleSearch repository")
        except subprocess.CalledProcessError as e:
            print(f"Failed to clone repository: {e}")
            sys.exit(1)
    else:
        print("WhoogleSearch directory already exists")
    
    # Change to whoogle-search directory
    os.chdir(whoogle_dir)
    
    # Install dependencies if requirements.txt exists
    if Path("requirements.txt").exists():
        print("Installing dependencies...")
        try:
            subprocess.run([
                sys.executable, "-m", "pip", "install", "-r", "requirements.txt"
            ], check=True)
            print("Dependencies installed successfully")
        except subprocess.CalledProcessError as e:
            print(f"Failed to install dependencies: {e}")
    
def run_whoogle():
    """Run the WhoogleSearch application"""
    print("Starting WhoogleSearch...")
    
    # Set environment variables for Replit
    env = os.environ.copy()
    env.update({
        'WHOOGLE_HOST': '0.0.0.0',
        'WHOOGLE_PORT': '5000',
        'WHOOGLE_CONFIG_DISABLE_LOCATION': '1',
        'WHOOGLE_CONFIG_DISABLE_ADBLOCK': '0',
        'WHOOGLE_CONFIG_THEME': 'light',
        'WHOOGLE_CONFIG_LANGUAGE': 'lang_en',
        'WHOOGLE_CONFIG_SEARCH_LANGUAGE': 'lang_en',
        'WHOOGLE_CONFIG_SAFE_SEARCH': '0',
        'WHOOGLE_SHOW_FAVICONS': '1',
        'WHOOGLE_CONFIG_STYLE': '.site-favicon { display: inline-block !important; }',
        'GOOGLE_API_KEY': os.getenv('GOOGLE_API_KEY', '')
    })
    
    try:
        # Check for run_whoogle.py in the cloned repo
        if Path("run_whoogle.py").exists():
            subprocess.run(["python3", "run_whoogle.py"], env=env)
        # Check for the nested whoogle-search directory structure
        elif Path("whoogle-search/run").exists():
            # Change to nested directory and run
            os.chdir("whoogle-search")
            subprocess.run(["python3", "run"], env=env)
        elif Path("whoogle-search/app.py").exists():
            os.chdir("whoogle-search")
            subprocess.run(["python3", "app.py"], env=env)
        # Try standard locations
        elif Path("run").exists():
            subprocess.run(["python3", "run"], env=env)
        elif Path("app.py").exists():
            subprocess.run(["python3", "app.py"], env=env)
        elif Path("whoogle/__main__.py").exists():
            subprocess.run(["python3", "-m", "whoogle"], env=env)
        else:
            print("Could not find main application file")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\nShutting down WhoogleSearch...")
    except Exception as e:
        print(f"Error running WhoogleSearch: {e}")
        sys.exit(1)

if __name__ == "__main__":
    setup_whoogle()
    run_whoogle()
