# Quick Start Guide

Get up and running with the Alloy API Integration app in 5 minutes!

## Prerequisites

- Python 3.8+
- Node.js 16+
- npm
- Alloy API credentials ([Get them here](https://dashboard.alloy.com/))

## One-Command Setup

```bash
./setup.sh
```

This will:
- ✅ Create Python virtual environment
- ✅ Install backend dependencies
- ✅ Install frontend dependencies

## Configure API Credentials

Create `backend/.env` file:

```bash
cd backend
cat > .env << EOF
ALLOY_API_KEY=your_api_key_here
ALLOY_API_SECRET=your_api_secret_here
EOF
```

**Replace the values** with your actual Alloy credentials!

## Run the Application

### Option 1: Using Scripts (Recommended)

**Terminal 1 - Backend:**
```bash
./start-backend.sh
```

**Terminal 2 - Frontend:**
```bash
./start-frontend.sh
```

### Option 2: Manual

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python app.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

## Access the Application

Open your browser to: **http://localhost:3000**

## Test Form Submission

Use this test data:

```
First Name: John
Last Name: Doe
Email: john.doe@example.com
Phone: 5555551234
Address Line 1: 123 Main St
City: New York
State: NY
Zip: 10001
Country: US (pre-filled)
SSN: 123456789
Birth Date: 1990-01-01
```

## View Results

Check the log file:
```bash
cat backend/results/results.log
```

## Troubleshooting

**Port already in use?**
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

**API errors?**
- Verify `.env` file has correct credentials
- Check Alloy dashboard for valid API keys
- Ensure backend server is running

**Form validation errors?**
- Required fields: email, phone, address line 1, country
- Must provide either (first name + last name) OR business name
- SSN: 9 digits, no dashes
- State: 2-letter code (NY, CA, etc.)
- Birth date: YYYY-MM-DD format

## Need More Help?

See the full [README.md](./README.md) for detailed documentation.

---

🚀 **Ready to go!** Your app is now running at http://localhost:3000

