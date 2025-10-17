#!/bin/bash

# Setup script for BookHub
echo "🚀 Setting up BookHub..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Create environment files if they don't exist
if [ ! -f .env ]; then
    echo "📄 Creating backend .env file..."
    cp .env.example .env
fi

if [ ! -f frontend/.env ]; then
    echo "📄 Creating frontend .env file..."
    cp frontend/.env.example frontend/.env
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 30

# Check if backend is healthy
echo "🏥 Checking backend health..."
while ! curl -f http://localhost:8000/health > /dev/null 2>&1; do
    echo "Waiting for backend to be ready..."
    sleep 5
done

# Initialize sample data
echo "📚 Generating sample books and ratings..."
docker-compose exec backend python ml/sample_data.py

# Train ML models
echo "🤖 Training recommendation models..."
docker-compose exec backend python ml/train.py

echo "✅ Setup complete!"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:3000"
echo "   Backend API: http://localhost:8000"
echo "   API Docs: http://localhost:8000/docs"
echo ""
echo "👤 Demo credentials:"
echo "   Admin: admin@bookapp.com / admin123"
echo "   User: user@example.com / password123"
echo ""
echo "🎉 Happy reading!"