#!/bin/bash
cd "$(dirname "$0")"
echo "======================================"
echo "    Starting Backend Server...        "
echo "======================================"

python3 server.py

echo "If this window closes immediately, there was an error."
# Keep terminal open if there's an error
read -p "Press enter to exit..."
