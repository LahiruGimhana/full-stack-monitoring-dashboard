#!/bin/bash

# Default values
DEFAULT_IP="0.0.0.0"
DEFAULT_PORT=9000
CONTAINER_PREFIX="zaion-monitoringapi"

# Function to find the next available port
find_available_port() {
    local port=$1
    while netstat -tuln | grep -q ":$port "; do
        port=$((port + 1))
    done
    echo $port
}

# Check arguments for IP and starting port
BIND_IP=${1:-$DEFAULT_IP}
START_PORT=${2:-$DEFAULT_PORT}

# Find an available port starting from START_PORT
AVAILABLE_PORT=$(find_available_port $START_PORT)

# Determine the next available container number
CONTAINER_COUNT=$(docker ps -a --filter "name=$CONTAINER_PREFIX" --format "{{.Names}}" | grep -oE '[0-9]+$' | sort -n | tail -1)
NEXT_CONTAINER_NUMBER=$((CONTAINER_COUNT + 1))
CONTAINER_NAME="${CONTAINER_PREFIX}_${NEXT_CONTAINER_NUMBER}"

echo "Starting container $CONTAINER_NAME on IP $BIND_IP and port $AVAILABLE_PORT..."
docker run -d \
    -p $BIND_IP:$AVAILABLE_PORT:9000 \
    --name $CONTAINER_NAME \
    zaion-monitoringapi

# Output the information about the running container
echo "Container $CONTAINER_NAME is running on IP $BIND_IP and port $AVAILABLE_PORT"
