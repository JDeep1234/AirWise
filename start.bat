@echo off
REM AirWise Startup Script for Windows
REM This script helps users get started with the AirWise application

echo ==============================================
echo        AirWise - Air Quality Dashboard        
echo ==============================================
echo.

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo X Docker not found.
    echo Please install Docker Desktop to continue.
    echo Visit https://docs.docker.com/desktop/windows/install/ for installation instructions.
    goto end
) else (
    echo √ Docker is installed.
)

REM Check if .env file exists in backend directory
if not exist ".\backend\.env" (
    echo.
    echo ! No .env file found in the backend directory.
    echo Creating one now. You'll need to add your OpenWeatherMap API key.
    echo.
    
    REM Ask for API key
    set /p has_key="Do you have an OpenWeatherMap API key? (y/n): "
    
    if /i "%has_key%"=="y" (
        set /p api_key="Please enter your OpenWeatherMap API key: "
        echo OPENWEATHERMAP_API_KEY=%api_key%> .\backend\.env
        echo √ API key saved to .\backend\.env
    ) else (
        echo OPENWEATHERMAP_API_KEY=your_api_key_here> .\backend\.env
        echo ! Created .env file with placeholder API key.
        echo You need to get an API key from https://openweathermap.org/api
        echo Then update the .env file or docker-compose.yml with your key.
    )
)

echo.
echo How would you like to run AirWise?
echo 1. Development mode (separate frontend and backend)
echo 2. Production mode (Docker containers)
echo 3. Run API key validation check
echo 4. Exit
set /p option="Enter your choice: "

if "%option%"=="1" (
    echo.
    echo Starting in development mode...
    echo.
    echo Setting up backend...
    cd backend
    
    REM Check for Python virtual environment
    if not exist "venv" (
        echo Creating Python virtual environment...
        python -m venv venv
    )
    
    REM Activate virtual environment
    echo Activating virtual environment...
    call venv\Scripts\activate
    
    REM Install requirements
    echo Installing Python dependencies...
    pip install -r requirements.txt
    
    REM Start backend in background
    echo Starting backend server...
    start python app.py
    
    cd ..
    
    REM Set up frontend
    echo.
    echo Setting up frontend...
    echo Installing Node dependencies...
    call npm install
    
    echo Starting frontend development server...
    call npm run dev
) else if "%option%"=="2" (
    echo.
    echo Starting in production mode with Docker...
    
    REM Check if docker-compose.yml exists
    if not exist "docker-compose.yml" (
        echo Error: docker-compose.yml not found.
        goto end
    )
    
    echo.
    echo Building and starting containers...
    docker-compose up -d
    
    echo.
    echo √ Containers started successfully!
    echo The application is now available at: http://localhost
    echo.
    echo To view logs, run: docker-compose logs -f
    echo To stop the application, run: docker-compose down
) else if "%option%"=="3" (
    echo.
    echo Running API key validation check...
    cd backend
    
    REM Check for Python virtual environment
    if not exist "venv" (
        echo Creating Python virtual environment...
        python -m venv venv
    )
    
    REM Activate virtual environment
    echo Activating virtual environment...
    call venv\Scripts\activate
    
    REM Install requirements if needed
    pip install requests python-dotenv
    
    REM Run the validation script
    python get_api_key.py
    cd ..
) else if "%option%"=="4" (
    echo Exiting.
    goto end
) else (
    echo Invalid option. Exiting.
    goto end
)

:end
pause 