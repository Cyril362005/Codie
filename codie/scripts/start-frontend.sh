#!/bin/bash
# Script to start the Codie frontend dev server from anywhere

# Get the directory of this script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Go to the codie-chat directory (one level up from scripts)
cd "$SCRIPT_DIR/../../codie-chat" || { echo "codie-chat directory not found"; exit 1; }

# Start the Vite dev server
npm run dev 