#!/bin/bash

echo "🚀 Starting AISvoi - Your Personal AI Assistant"
echo "=============================================="
echo ""

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose found"
echo ""

# Ask user if they have GPU
read -p "Do you have NVIDIA GPU? (y/n): " has_gpu

if [[ $has_gpu == "y" || $has_gpu == "Y" ]]; then
    echo "🎮 Starting with GPU support..."
    docker-compose up -d
else
    echo "💻 Starting with CPU only..."
    docker-compose -f docker-compose.cpu.yml up -d
fi

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

# Check if services are running
if docker ps | grep -q aisvoi; then
    echo ""
    echo "✅ AISvoi is running!"
    echo ""
    echo "📍 Access points:"
    echo "   Frontend:  http://localhost:3000"
    echo "   Backend:   http://localhost:8000"
    echo "   API Docs:  http://localhost:8000/docs"
    echo ""
    echo "📖 Next steps:"
    echo "   1. Open http://localhost:3000 in your browser"
    echo "   2. Click on the model selector (top right)"
    echo "   3. Pull a model (e.g., 'llama2' or 'phi')"
    echo "   4. Start chatting!"
    echo ""
    echo "💡 Useful commands:"
    echo "   Stop:     docker-compose down"
    echo "   Logs:     docker-compose logs -f"
    echo "   Restart:  docker-compose restart"
    echo ""
else
    echo "❌ Failed to start services. Check logs with:"
    echo "   docker-compose logs"
fi
