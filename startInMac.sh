#!/bin/bash

kill_port() {
    local port=$1
    echo "Checking processes on port $port..."
    
    if lsof -ti:$port >/dev/null; then
        echo "Found processes on port $port. Attempting to kill..."
        for pid in $(lsof -ti:$port); do
            echo "Killing process $pid"
            kill -9 $pid 2>/dev/null || {
                echo "Failed to kill process $pid. Trying with sudo..."
                sudo kill -9 $pid
            }
        done
    else
        echo "No processes found on port $port"
    fi
}

# Kill processes on both ports
kill_port 3000
kill_port 5001  # Changed from 5000 to 5001

# Wait a moment to ensure processes are fully terminated
sleep 2

# Verify ports are free
if lsof -ti:3000 >/dev/null || lsof -ti:5001 >/dev/null; then  # Changed from 5000 to 5001
    echo "ERROR: Some processes could not be terminated. Please check manually."
    exit 1
else
    echo "All processes on ports 3000 and 5001 have been terminated."  # Changed text to reflect new port
    # Start the application
    npm start
fi