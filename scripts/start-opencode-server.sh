#!/bin/bash

# OpenCode Server Deployment Script
# This script starts the OpenCode server with proper configuration

# Configuration
PORT=4096
HOSTNAME=0.0.0.0
CORS_ORIGIN_1="https://tacits-candy-shop.vercel.app"
CORS_ORIGIN_2="https://opencode-web-pearl.vercel.app"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  OpenCode Server Deployment${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${GREEN}Configuration:${NC}"
echo -e "  Port: ${YELLOW}${PORT}${NC}"
echo -e "  Hostname: ${YELLOW}${HOSTNAME}${NC}"
echo -e "  CORS Origins:"
echo -e "    - ${YELLOW}${CORS_ORIGIN_1}${NC}"
echo -e "    - ${YELLOW}${CORS_ORIGIN_2}${NC}"
echo ""

# Check if opencode is installed
if ! command -v opencode &> /dev/null; then
    echo -e "${YELLOW}⚠️  opencode is not installed. Installing...${NC}"
    npm install -g @opencode-ai/cli
fi

# Start the server
echo -e "${GREEN}🚀 Starting OpenCode server...${NC}"
echo ""

opencode serve \
  --port ${PORT} \
  --hostname ${HOSTNAME} \
  --cors ${CORS_ORIGIN_1} \
  --cors ${CORS_ORIGIN_2}
