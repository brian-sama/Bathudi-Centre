#!/bash
# Simple Auto-Deploy Script for Bathudi Training Center

# Configuration
PROJECT_DIR="/home/brian/Bathudi-Centre"
BACKEND_DIR="$PROJECT_DIR/backend"
VENV_PATH="$BACKEND_DIR/venv"
SERVICE_NAME="bathudi"

echo "🚀 Starting Deployment..."

# 1. Pull latest code
echo "📦 Pulling latest changes from Git..."
cd $PROJECT_DIR
git fetch --all
git reset --hard origin/main

# 2. Update Frontend
echo "💻 Building Frontend..."
export VITE_API_URL="https://bathudi.co.za/api"
npm install
npm run build

# 3. Update Backend
echo "🐍 Updating Backend dependencies and migrations..."
cd $BACKEND_DIR
source $VENV_PATH/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput

# 4. Restart Services
echo "🔄 Restarting Gunicorn and Nginx..."
sudo systemctl restart $SERVICE_NAME
sudo systemctl restart nginx

echo "✅ Deployment Successful!"
