#!/bin/bash

echo "🛑 Stopping AISvoi..."
echo ""

docker-compose down

echo ""
echo "✅ AISvoi stopped successfully"
echo ""
echo "💡 To start again, run: ./start.sh"
echo "💡 To remove all data: docker-compose down -v"
