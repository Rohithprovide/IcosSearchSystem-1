"""
Rate limiting utilities for Whoogle Search
Helps avoid Google's rate limiting by tracking request patterns
"""

import time
import random
from collections import defaultdict
from datetime import datetime, timedelta

# Global request tracking
_request_counts = defaultdict(list)
_last_cleanup = time.time()

def cleanup_old_requests():
    """Remove request records older than 1 hour"""
    global _last_cleanup
    current_time = time.time()
    
    # Only cleanup every 5 minutes
    if current_time - _last_cleanup < 300:
        return
    
    cutoff_time = current_time - 3600  # 1 hour ago
    
    for ip in list(_request_counts.keys()):
        _request_counts[ip] = [req_time for req_time in _request_counts[ip] if req_time > cutoff_time]
        if not _request_counts[ip]:
            del _request_counts[ip]
    
    _last_cleanup = current_time

def should_rate_limit(client_ip):
    """Check if client should be rate limited"""
    cleanup_old_requests()
    
    current_time = time.time()
    recent_requests = _request_counts[client_ip]
    
    # Count requests in last 5 minutes
    five_min_ago = current_time - 300
    recent_count = sum(1 for req_time in recent_requests if req_time > five_min_ago)
    
    # Allow max 20 requests per 5 minutes per IP
    return recent_count >= 20

def record_request(client_ip):
    """Record a new request from the client"""
    cleanup_old_requests()
    _request_counts[client_ip].append(time.time())

def get_rate_limit_delay(client_ip):
    """Get recommended delay for this client"""
    cleanup_old_requests()
    
    recent_requests = _request_counts[client_ip]
    if len(recent_requests) < 2:
        return random.uniform(0.5, 1.5)
    
    # Calculate average time between recent requests
    recent_times = recent_requests[-5:]  # Last 5 requests
    if len(recent_times) >= 2:
        intervals = [recent_times[i] - recent_times[i-1] for i in range(1, len(recent_times))]
        avg_interval = sum(intervals) / len(intervals)
        
        # If requests are too frequent, suggest longer delay
        if avg_interval < 2.0:
            return random.uniform(3.0, 6.0)
        elif avg_interval < 5.0:
            return random.uniform(1.5, 3.0)
    
    return random.uniform(0.5, 2.0)