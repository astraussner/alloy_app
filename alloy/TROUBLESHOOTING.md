# Troubleshooting Guide

Common issues and solutions for the Alloy API Integration application.

---

## Table of Contents
1. [Backend Issues](#backend-issues)
2. [Frontend Issues](#frontend-issues)
3. [API Issues](#api-issues)
4. [Validation Issues](#validation-issues)
5. [Environment Issues](#environment-issues)

---

## Backend Issues

### Port 5000 Already in Use

**Problem:** Cannot start Flask server because port 5000 is occupied.

**Solution:**
```bash
# Find and kill the process using port 5000
lsof -ti:5000 | xargs kill -9

# Or use a different port by modifying app.py:
# Change: app.run(debug=True, port=5000)
# To: app.run(debug=True, port=5001)
```

### Virtual Environment Not Activating

**Problem:** `source venv/bin/activate` doesn't work.

**Solution:**
```bash
# On Windows Git Bash or PowerShell:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate

# If venv doesn't exist, create it:
python3 -m venv venv
```

### Module Not Found Errors

**Problem:** `ModuleNotFoundError: No module named 'flask'`

**Solution:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

### Results Directory Not Found

**Problem:** Error creating log file.

**Solution:**
```bash
# Create the results directory manually
cd backend
mkdir -p results
```

---

## Frontend Issues

### Port 3000 Already in Use

**Problem:** React says port 3000 is already in use.

**Solution 1:** React will prompt you to use port 3001. Type `y` to accept.

**Solution 2:** Kill the process on port 3000:
```bash
lsof -ti:3000 | xargs kill -9
```

### npm Install Fails

**Problem:** Errors during `npm install`.

**Solution:**
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Cannot Connect to Backend

**Problem:** Frontend shows "Network Error" or cannot reach API.

**Solution:**
1. Check backend is running on http://localhost:5000
2. Verify `proxy` setting in `frontend/package.json`:
   ```json
   "proxy": "http://localhost:5000"
   ```
3. Check browser console for CORS errors
4. Restart both frontend and backend

### Module Not Found React Errors

**Problem:** `Module not found: Can't resolve '../../../inputs.json'`

**Solution:**
The `inputs.json` file must be at the project root:
```bash
# Verify file location
ls -la /path/to/alloy/inputs.json

# If file is missing, it needs to be restored
```

---

## API Issues

### 401 Unauthorized

**Problem:** API returns 401 Unauthorized error.

**Solution:**
1. Verify `.env` file exists in `backend/` directory
2. Check API credentials are correct:
   ```bash
   cat backend/.env
   ```
3. Ensure no spaces around `=` in `.env` file:
   ```
   # WRONG:
   ALLOY_API_KEY = your_key
   
   # CORRECT:
   ALLOY_API_KEY=your_key
   ```
4. Verify credentials in Alloy Dashboard
5. Check if API key is for sandbox or production environment

### 403 Forbidden

**Problem:** API returns 403 Forbidden error.

**Solution:**
1. Verify workflow token is correct
2. Check if workflow is enabled in Alloy dashboard
3. Ensure your API key has proper permissions

### 500 Internal Server Error

**Problem:** API returns 500 error.

**Solution:**
1. Check backend terminal for detailed error logs
2. Verify payload format matches API requirements
3. Check if all required fields are provided
4. Review Alloy API documentation for changes

### Connection Timeout

**Problem:** Request times out after 30 seconds.

**Solution:**
1. Check internet connection
2. Verify Alloy API endpoint is correct
3. Try increasing timeout in `backend/app.py`:
   ```python
   response = requests.post(
       alloy_url,
       headers=headers,
       json=alloy_payload,
       timeout=60  # Increase from 30 to 60 seconds
   )
   ```

---

## Validation Issues

### SSN Validation Fails

**Problem:** Form rejects valid SSN.

**Expected Format:** 9 digits, no dashes
- ✅ Correct: `123456789`
- ❌ Wrong: `123-45-6789`

**Solution:** Remove all dashes and ensure exactly 9 digits.

### Date Validation Fails

**Problem:** Date of birth not accepted.

**Expected Format:** ISO-8601 (YYYY-MM-DD)
- ✅ Correct: `1990-01-01`
- ❌ Wrong: `01/01/1990`, `1990/01/01`, `Jan 1, 1990`

**Solution:** Use YYYY-MM-DD format with dashes.

### State Code Validation Fails

**Problem:** State code not accepted.

**Expected Format:** 2-letter state code
- ✅ Correct: `NY`, `CA`, `TX`
- ❌ Wrong: `New York`, `California`, `texas`

**Solution:** Use uppercase 2-letter state abbreviation.

### Country Code Error

**Problem:** Cannot change country field.

**Explanation:** Country is locked to "US" as per requirements.

**Solution:** This is intentional. The field is read-only and set to "US".

### Name Requirements Not Met

**Problem:** "First name is required" error even when filled.

**Explanation:** Must provide EITHER:
- First Name AND Last Name, OR
- Business Name

**Solution:**
1. Fill in both First Name and Last Name fields, OR
2. Add a `business_name` field to the form (currently not in UI)

---

## Environment Issues

### Environment Variables Not Loading

**Problem:** Backend can't find API credentials.

**Solution:**
1. Verify `.env` file is in `backend/` directory
2. Check file name is exactly `.env` (not `.env.txt`)
3. On macOS/Linux, check if file is hidden:
   ```bash
   ls -la backend/.env
   ```
4. Ensure proper format (no quotes around values):
   ```
   # WRONG:
   ALLOY_API_KEY="your_key"
   
   # CORRECT:
   ALLOY_API_KEY=your_key
   ```

### Python Version Issues

**Problem:** Syntax errors or incompatible features.

**Solution:**
```bash
# Check Python version (need 3.8+)
python3 --version

# If version is too old, install newer Python
# macOS:
brew install python@3.11

# Ubuntu/Debian:
sudo apt-get install python3.11
```

### Node.js Version Issues

**Problem:** npm errors related to Node version.

**Solution:**
```bash
# Check Node version (need 16+)
node --version

# Update Node.js:
# Using nvm (recommended):
nvm install 18
nvm use 18

# Or download from: https://nodejs.org/
```

---

## Debug Mode

### Enable Verbose Logging (Backend)

Add to `backend/app.py`:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

### Enable React DevTools

Install React Developer Tools browser extension:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### Check Backend Logs

```bash
# Run backend in foreground to see all logs
cd backend
source venv/bin/activate
python app.py
```

### Check Frontend Console

Open browser DevTools:
- Chrome/Firefox: Press F12 or Cmd+Option+I (Mac)
- Look for errors in Console tab
- Check Network tab for API requests

---

## Testing API Connection

### Test Backend Directly

```bash
# Test health endpoint
curl http://localhost:5000/api/health

# Test submission endpoint
curl -X POST http://localhost:5000/api/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name_first": "John",
    "name_last": "Doe",
    "email_address": "john.doe@example.com",
    "phone_number": "5555551234",
    "address_line_1": "123 Main St",
    "address_country_code": "US"
  }'
```

### Test Alloy API Directly

```bash
# Replace with your actual credentials
curl -X POST https://sandbox.alloy.co/v1/evaluations \
  -u "YOUR_API_KEY:YOUR_API_SECRET" \
  -H "Content-Type: application/json" \
  -H "Alloy-Workflow-Token: YOUR_WORKFLOW_TOKEN" \
  -d '{
    "name_first": "John",
    "name_last": "Doe",
    "email_address": "john.doe@example.com",
    "address_line_1": "123 Main St",
    "address_country_code": "US",
    "phone_number": "5555551234"
  }'
```

---

## Still Having Issues?

### Check the Logs

1. **Backend Logs:** Check terminal where Flask is running
2. **Frontend Logs:** Check browser console (F12)
3. **Results Log:** Check `backend/results/results.log`

### Verify Setup

```bash
# Run comprehensive check
./setup.sh

# Verify file structure
find . -type f -not -path '*/node_modules/*' -not -path '*/venv/*'
```

### Clean Install

```bash
# Backend
cd backend
rm -rf venv
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../frontend
rm -rf node_modules package-lock.json
npm install
```

### Get Help

If issues persist:
1. Check [Alloy API Documentation](https://developer.alloy.com/)
2. Review [Full README](./README.md)
3. Check Alloy Support
4. Review error messages in terminal/console carefully

---

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `EADDRINUSE` | Port already in use | Kill process on that port |
| `ModuleNotFoundError` | Missing Python package | Run `pip install -r requirements.txt` |
| `Cannot find module` | Missing npm package | Run `npm install` |
| `401 Unauthorized` | Invalid API credentials | Check `.env` file |
| `CORS error` | Backend not running | Start Flask server |
| `Network Error` | Cannot reach backend | Verify backend is on port 5000 |
| `Invalid format` | Validation error | Check field format requirements |

---

**Last Updated:** October 12, 2025

