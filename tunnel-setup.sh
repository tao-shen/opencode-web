#!/bin/bash

# OpenCode Tunnel Setup Script
# This script sets up a secure tunnel for HTTPS WebSocket access

set -e

SERVER_IP="170.9.12.37"
LOCAL_PORT="4096"
TUNNEL_PORT="56047"
TUNNEL_URL="bore.pub:${TUNNEL_PORT}"

echo "=========================================="
echo "  OpenCode Secure Tunnel Setup"
echo "=========================================="
echo ""
echo "Server: ${SERVER_IP}:${LOCAL_PORT}"
echo "Public URL: http://${TUNNEL_URL}"
echo ""

# Check if bore is installed
if ! command -v ./bore &> /dev/null; then
    echo "Installing bore tunnel..."
    curl -sL https://github.com/ekzhang/bore/releases/download/v0.4.1/bore-v0.4.1-x86_64-unknown-linux-musl.tar.gz -o bore.tar.gz
    tar -xzf bore.tar.gz
    rm bore.tar.gz
fi

# Kill existing bore process
pkill -f "bore local" 2>/dev/null || true

# Start bore tunnel
echo "Starting secure tunnel..."
nohup ./bore local ${LOCAL_PORT} --to bore.pub:${TUNNEL_PORT} > /tmp/bore.log 2>&1 &
sleep 3

# Check if tunnel is running
if curl -s http://${TUNNEL_URL}/global/health > /dev/null 2>&1; then
    echo ""
    echo "✅ Tunnel established successfully!"
    echo ""
    echo "Public URLs:"
    echo "  - Web Interface: http://${TUNNEL_URL}"
    echo "  - WebSocket: ws://${TUNNEL_URL}/pty/connect"
    echo ""
    echo "For HTTPS access via Vercel, you need a domain with SSL."
    echo "See README.md for setup instructions."
else
    echo "❌ Tunnel failed to start. Check /tmp/bore.log for details."
fi

echo ""
echo "Tunnel log: tail -f /tmp/bore.log"
echo "To stop: pkill -f 'bore local'"
