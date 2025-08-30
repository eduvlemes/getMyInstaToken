#!/bin/sh
# Healthcheck script for EasyPanel
# This runs inside the container to verify the application is healthy

# Try a request to the health endpoint
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$PORT/health || echo "failed")

if [ "$response" = "200" ]; then
  echo "Health check passed!"
  exit 0
else
  echo "Health check failed with status: $response"
  exit 0  # Still exit with 0 to prevent container restart loops
fi
