#!/bin/bash

# AirWise Startup Script
# This script helps users get started with the AirWise application

echo "============================================="
echo "       AirWise - Air Quality Dashboard       "
echo "============================================="
echo ""

# Check if Docker is installed
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null
then
    echo "✅ Docker and Docker Compose are installed."
else
    echo "❌ Docker and/or Docker Compose not found."
    echo "Please install Docker and Docker Compose to continue."
    echo "Visit https://docs.docker.com/get-docker/ for installation instructions."
    exit 1
fi

# Check if .env file exists in backend directory
if [ ! -f "./backend/.env" ]; then
    echo ""
    echo "⚠️  No .env file found in the backend directory."
    echo "Creating one now. You'll need to add your OpenWeatherMap API key."
    echo ""
    
    # Ask for API key
    echo "Do you have an OpenWeatherMap API key? (y/n)"
    read -r has_key
    
    if [[ $has_key == "y" || $has_key == "Y" ]]; then
        echo "Please enter your OpenWeatherMap API key:"
        read -r api_key
        echo "OPENWEATHERMAP_API_KEY=$api_key" > ./backend/.env
        echo "✅ API key saved to ./backend/.env"
    else
        echo "OPENWEATHERMAP_API_KEY=your_api_key_here" > ./backend/.env
        echo "⚠️  Created .env file with placeholder API key."
        echo "You need to get an API key from https://openweathermap.org/api"
        echo "Then update the .env file or docker-compose.yml with your key."
    fi
fi

# Check if the API key in docker-compose.yml needs to be updated
if grep -q "your_api_key_here" docker-compose.yml; then
    if [ -f "./backend/.env" ]; then
        # Try to get API key from .env file
        api_key=$(grep OPENWEATHERMAP_API_KEY ./backend/.env | cut -d '=' -f2)
        
        if [[ $api_key != "your_api_key_here" ]]; then
            echo ""
            echo "Updating docker-compose.yml with your API key..."
            sed -i "s/OPENWEATHERMAP_API_KEY=your_api_key_here/OPENWEATHERMAP_API_KEY=$api_key/g" docker-compose.yml
            echo "✅ docker-compose.yml updated with your API key."
        else
            echo ""
            echo "⚠️  API key in .env file is still the placeholder."
            echo "You need to update it before the application will work properly."
        fi
    fi
fi

echo ""
echo "How would you like to run AirWise?"
echo "1. Development mode (separate frontend and backend)"
echo "2. Production mode (Docker containers)"
echo "3. Run API key validation check"
echo "4. Exit"
read -r option

case $option in
    1)
        echo ""
        echo "Starting in development mode..."
        echo ""
        echo "Setting up backend..."
        cd backend || exit
        
        # Check for Python virtual environment
        if [ ! -d "venv" ]; then
            echo "Creating Python virtual environment..."
            python -m venv venv
        fi
        
        # Activate virtual environment
        echo "Activating virtual environment..."
        if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
            source venv/Scripts/activate
        else
            source venv/bin/activate
        fi
        
        # Install requirements
        echo "Installing Python dependencies..."
        pip install -r requirements.txt
        
        # Start backend in background
        echo "Starting backend server..."
        python app.py &
        BACKEND_PID=$!
        
        cd ..
        
        # Set up frontend
        echo ""
        echo "Setting up frontend..."
        echo "Installing Node dependencies..."
        npm install
        
        echo "Starting frontend development server..."
        npm run dev
        
        # When frontend is terminated, also terminate backend
        kill $BACKEND_PID
        ;;
        
    2)
        echo ""
        echo "Starting in production mode with Docker..."
        
        # Check if API key is set
        if grep -q "your_api_key_here" docker-compose.yml && grep -q "your_api_key_here" ./backend/.env; then
            echo ""
            echo "⚠️  Warning: API key is still set to the default placeholder."
            echo "The application may not work properly without a valid API key."
            echo ""
            echo "Do you want to continue anyway? (y/n)"
            read -r continue_anyway
            
            if [[ $continue_anyway != "y" && $continue_anyway != "Y" ]]; then
                echo "Exiting. Please update your API key and try again."
                exit 0
            fi
        fi
        
        echo ""
        echo "Building and starting containers..."
        docker-compose up -d
        
        echo ""
        echo "✅ Containers started successfully!"
        echo "The application is now available at: http://localhost"
        echo ""
        echo "To view logs, run: docker-compose logs -f"
        echo "To stop the application, run: docker-compose down"
        ;;
        
    3)
        echo ""
        echo "Running API key validation check..."
        cd backend || exit
        
        # Check for Python virtual environment
        if [ ! -d "venv" ]; then
            echo "Creating Python virtual environment..."
            python -m venv venv
        fi
        
        # Activate virtual environment
        echo "Activating virtual environment..."
        if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
            source venv/Scripts/activate
        else
            source venv/bin/activate
        fi
        
        # Install requirements if needed
        if ! pip show requests &> /dev/null || ! pip show python-dotenv &> /dev/null; then
            echo "Installing required packages..."
            pip install requests python-dotenv
        fi
        
        # Run the validation script
        python get_api_key.py
        cd ..
        ;;
        
    4)
        echo "Exiting."
        exit 0
        ;;
        
    *)
        echo "Invalid option. Exiting."
        exit 1
        ;;
esac 