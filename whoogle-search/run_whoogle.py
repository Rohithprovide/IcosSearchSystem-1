#!/usr/bin/env python3
"""
Whoogle Search Runner for Replit
This script handles the setup and running of Whoogle Search on Replit
"""

import os
import sys
import subprocess
import signal
import time
from pathlib import Path

def run_command(command, cwd=None, shell=True):
    """Run a command and return the result"""
    try:
        result = subprocess.run(
            command,
            shell=shell,
            cwd=cwd,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        print("Command timed out")
        return False, "", "Command timed out"
    except Exception as e:
        print(f"Error running command: {e}")
        return False, "", str(e)

def setup_whoogle():
    """Setup Whoogle Search if not already done"""
    whoogle_dir = Path("whoogle-search")
    
    if not whoogle_dir.exists():
        print("🔄 Whoogle Search not found. Setting up...")
        
        # Run the setup script
        success, stdout, stderr = run_command("bash clone_and_setup.sh")
        
        if not success:
            print("❌ Setup failed!")
            print("STDOUT:", stdout)
            print("STDERR:", stderr)
            return False
        
        print("✅ Setup completed successfully!")
    else:
        print("✅ Whoogle Search directory found!")
    
    return True

def run_whoogle():
    """Run Whoogle Search application"""
    whoogle_dir = Path("whoogle-search")
    
    if not whoogle_dir.exists():
        print("❌ Whoogle Search directory not found!")
        return False
    
    print("🚀 Starting Whoogle Search...")
    print("📍 Application will be available on port 5000")
    print("🌐 Replit will automatically forward the port for external access")
    print()
    
    # Change to whoogle directory
    os.chdir(whoogle_dir)
    
    # Check if virtual environment exists
    venv_dir = Path("venv")
    if venv_dir.exists():
        print("🔧 Activating virtual environment...")
        # Set up environment variables for virtual environment
        venv_path = venv_dir.absolute()
        os.environ["VIRTUAL_ENV"] = str(venv_path)
        os.environ["PATH"] = f"{venv_path}/bin:{os.environ.get('PATH', '')}"
        python_executable = str(venv_path / "bin" / "python3")
    else:
        print("⚠️  Virtual environment not found, using system Python")
        python_executable = "python3"
    
    # Set environment variables for Whoogle
    os.environ["WHOOGLE_CONFIG_URL"] = "0.0.0.0:5000"
    os.environ["WHOOGLE_CONFIG_DEBUG"] = "0"
    
    # Set environment variables for proper host and port binding
    os.environ["ADDRESS"] = "0.0.0.0"
    os.environ["PORT"] = "5000"
    
    # Use the official run script which properly starts Whoogle
    run_commands = [
        "./run",
        f"{python_executable} -um app --host 0.0.0.0 --port 5000"
    ]
    
    for cmd in run_commands:
        print(f"🔄 Trying to run: {cmd}")
        try:
            # Use Popen for non-blocking execution
            if cmd.startswith("./run"):
                # For shell script, use shell=True
                process = subprocess.Popen(
                    cmd,
                    shell=True,
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    bufsize=1,
                    universal_newlines=True
                )
            else:
                process = subprocess.Popen(
                    cmd.split(),
                    stdout=subprocess.PIPE,
                    stderr=subprocess.PIPE,
                    text=True,
                    bufsize=1,
                    universal_newlines=True
                )
            
            # Wait a moment to see if the process starts successfully
            time.sleep(3)
            
            if process.poll() is None:  # Process is still running
                print("✅ Whoogle Search started successfully!")
                print("📱 Access your search engine at the Replit URL")
                print("🛑 Press Ctrl+C to stop the server")
                
                # Handle graceful shutdown
                def signal_handler(sig, frame):
                    print("\n🛑 Shutting down Whoogle Search...")
                    process.terminate()
                    try:
                        process.wait(timeout=10)
                    except subprocess.TimeoutExpired:
                        process.kill()
                    sys.exit(0)
                
                signal.signal(signal.SIGINT, signal_handler)
                
                # Stream output
                try:
                    while True:
                        if process.stdout:
                            output = process.stdout.readline()
                            if output == '' and process.poll() is not None:
                                break
                            if output:
                                print(output.strip())
                        else:
                            time.sleep(0.1)
                            if process.poll() is not None:
                                break
                except KeyboardInterrupt:
                    signal_handler(None, None)
                
                return True
            else:
                # Process exited immediately, check for errors
                stdout, stderr = process.communicate()
                print(f"❌ Command failed: {cmd}")
                if stderr:
                    print(f"Error: {stderr}")
                continue
                
        except Exception as e:
            print(f"❌ Error running {cmd}: {e}")
            continue
    
    print("❌ Failed to start Whoogle Search with any of the attempted commands")
    return False

def main():
    """Main function"""
    print("=" * 50)
    print("🔍 WHOOGLE SEARCH - REPLIT RUNNER")
    print("=" * 50)
    print()
    
    # Setup Whoogle if needed
    if not setup_whoogle():
        print("❌ Setup failed. Exiting.")
        sys.exit(1)
    
    print()
    print("=" * 50)
    
    # Run Whoogle
    if not run_whoogle():
        print("❌ Failed to start Whoogle Search")
        sys.exit(1)

if __name__ == "__main__":
    main()
