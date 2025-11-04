#!/bin/bash

# Affective Computing - Setup Script
# This script helps set up the development environment

set -e

echo "🎭 Affective Computing - Setup Script"
echo "======================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✓${NC} Node.js: $NODE_VERSION"
else
    echo -e "${RED}✗${NC} Node.js not found. Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✓${NC} npm: $NPM_VERSION"
else
    echo -e "${RED}✗${NC} npm not found"
    exit 1
fi

# Check Python
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version)
    echo -e "${GREEN}✓${NC} Python: $PYTHON_VERSION"
else
    echo -e "${RED}✗${NC} Python 3 not found. Please install Python 3.9+ from https://www.python.org/"
    exit 1
fi

# Check pip
if command_exists pip3; then
    PIP_VERSION=$(pip3 --version)
    echo -e "${GREEN}✓${NC} pip: $PIP_VERSION"
else
    echo -e "${RED}✗${NC} pip not found"
    exit 1
fi

# Check FFmpeg
if command_exists ffmpeg; then
    FFMPEG_VERSION=$(ffmpeg -version | head -n1)
    echo -e "${GREEN}✓${NC} FFmpeg: $FFMPEG_VERSION"
else
    echo -e "${YELLOW}⚠${NC} FFmpeg not found. Install with:"
    echo "  macOS: brew install ffmpeg"
    echo "  Ubuntu: sudo apt-get install ffmpeg"
    exit 1
fi

echo ""
echo "✅ All prerequisites met!"
echo ""

# Setup Frontend
echo "🎨 Setting up Frontend..."
cd frontend

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓${NC} Created frontend/.env"
else
    echo -e "${YELLOW}⚠${NC} frontend/.env already exists, skipping..."
fi

echo "Installing npm dependencies..."
npm install
echo -e "${GREEN}✓${NC} Frontend dependencies installed"

cd ..
echo ""

# Setup Backend
echo "🐍 Setting up Backend..."
cd backend

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}✓${NC} Virtual environment created"
else
    echo -e "${YELLOW}⚠${NC} Virtual environment already exists, skipping..."
fi

echo "Activating virtual environment..."
source venv/bin/activate

if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cp .env.example .env
    echo -e "${GREEN}✓${NC} Created backend/.env"
else
    echo -e "${YELLOW}⚠${NC} backend/.env already exists, skipping..."
fi

echo "Installing Python dependencies..."
pip install -r requirements.txt
echo -e "${GREEN}✓${NC} Backend dependencies installed"

echo "Creating necessary directories..."
mkdir -p uploads temp
echo -e "${GREEN}✓${NC} Created uploads and temp directories"

cd ..
echo ""

# Final instructions
echo "======================================"
echo "✅ Setup Complete!"
echo "======================================"
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Or use Docker:"
echo "  docker-compose up --build"
echo ""
echo "Then open: http://localhost:3000"
echo ""
echo "📚 See QUICKSTART.md for more details"
