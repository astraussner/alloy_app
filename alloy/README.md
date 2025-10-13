# Alloy API Integration Application

A full-stack web application that integrates with the Alloy API for running evaluations. Built with React (frontend) and Flask (backend).

## Features

- ✅ React-based form with validation
- ✅ Field validation based on `inputs.json` schema
- ✅ Custom styling inspired by Alloy's design system
- ✅ Flask backend API integration
- ✅ Real-time form validation
- ✅ Comprehensive error handling
- ✅ Results logging to file
- ✅ Responsive design

## Project Structure

```
alloy/
├── backend/
│   ├── app.py                 # Flask application
│   ├── requirements.txt       # Python dependencies
│   └── results/              # Log files directory (auto-created)
│       └── results.log       # Evaluation results log
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── components/
│   │   │   ├── EvaluationForm.js    # Main form component
│   │   │   └── EvaluationForm.css   # Form styling
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   └── package.json          # Node dependencies
├── inputs.json               # Field validation schema
├── alloy-styling.css        # Reference styling
└── README.md
```

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- pip (Python package manager)
- npm or yarn

## Setup Instructions

### 1. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment (recommended):

```bash
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file in the backend directory with your Alloy API credentials:

```bash
# backend/.env
ALLOY_API_KEY=your_api_key_here
ALLOY_API_SECRET=your_api_secret_here
ALLOY_WORKFLOW_TOKEN=your_workflow_token_here
```

> **Important:** Replace the placeholder values with your actual Alloy API credentials. You can obtain these from your [Alloy Dashboard](https://dashboard.alloy.com/).

Start the Flask server:

```bash
python app.py
```

The backend will run on `http://localhost:5000`

### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the React development server:

```bash
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## Using the Application

### Form Fields

The form includes the following fields:

**Personal Information:**
- First Name (optional, but required if not providing business name)
- Last Name (optional, but required if not providing business name)
- Email Address (required)
- Phone Number (required)
- Date of Birth (optional, format: YYYY-MM-DD)
- SSN (optional, must be 9 digits, no dashes)

**Address:**
- Address Line 1 (required)
- Address Line 2 (optional)
- City (optional)
- State (optional, must be 2-letter code like NY, CA)
- Zip/Postal Code (optional)
- Country (required, fixed as "US")

### Validation Rules

All validation rules are derived from the `inputs.json` file:

1. **Required Fields:** email_address, address_line_1, address_country_code, phone_number
2. **Name Requirements:** Must provide either:
   - Both First Name AND Last Name, OR
   - Business Name
3. **SSN:** Must be exactly 9 digits with no dashes (e.g., 123456789)
4. **State:** Must be a 2-letter state code (e.g., NY, CA, TX)
5. **Date of Birth:** Must be in ISO-8601 format (YYYY-MM-DD)
6. **Country:** Must be "US"

### Response Handling

#### Success (Approved)
When the evaluation is approved:
- Displays "Success!" message
- Logs outcome, timestamp, and evaluation token to `backend/results/results.log`
- Form is reset for new submission

#### Not Approved
When the evaluation is not approved:
- Displays the outcome status
- Shows outcome reasons if available
- Logs outcome, outcome reasons, evaluation token, and timestamp to results file

#### Error
If there's an API or validation error:
- Displays the error message
- No log entry is created for errors

## Results Logging

All evaluation results are logged to `backend/results/results.log` with the following information:

```
================================================================================
Timestamp: 2025-10-12T10:30:45.123456
Status: Success
Outcome: approved
Evaluation Token: eval_abc123xyz
Timestamp: 2025-10-12T10:30:45.123456
```

## API Integration

The application integrates with the Alloy API endpoint:

- **Endpoint:** `POST https://sandbox.alloy.co/v1/evaluations`
- **Authentication:** Basic Auth (API Key + Secret)
- **Headers:** Includes Alloy-Workflow-Token

### API Flow

1. User fills out form on frontend
2. Frontend validates data against `inputs.json` schema
3. Frontend sends validated data to Flask backend (`POST /api/submit`)
4. Backend validates and formats the payload
5. Backend makes authenticated request to Alloy API
6. Backend processes response and logs results
7. Backend returns formatted response to frontend
8. Frontend displays appropriate success or error message

## Development

### Backend Development

To run the Flask app in debug mode (auto-reload on changes):

```bash
cd backend
python app.py
```

### Frontend Development

React's development server includes hot-reloading:

```bash
cd frontend
npm start
```

### Environment Variables

**Backend (.env):**
- `ALLOY_API_KEY`: Your Alloy API key
- `ALLOY_API_SECRET`: Your Alloy API secret
- `ALLOY_WORKFLOW_TOKEN`: Your workflow token

## Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Kill process on port 5000
lsof -ti:5000 | xargs kill -9
```

**Missing dependencies:**
```bash
pip install -r requirements.txt
```

**API authentication errors:**
- Verify your `.env` file has correct credentials
- Check that environment variables are loaded
- Ensure your API credentials are active in Alloy dashboard

### Frontend Issues

**Port already in use:**
- React will prompt to use a different port (usually 3001)

**Module not found:**
```bash
rm -rf node_modules package-lock.json
npm install
```

**Proxy errors:**
- Ensure backend is running on port 5000
- Check `proxy` setting in `frontend/package.json`

## Testing

### Manual Testing

1. Fill out the form with valid data
2. Submit and verify the response
3. Check `backend/results/results.log` for logged data
4. Test validation by:
   - Leaving required fields empty
   - Entering invalid SSN format
   - Using incorrect date format
   - Providing invalid state codes

### Test Data Example

```json
{
  "name_first": "John",
  "name_last": "Doe",
  "email_address": "john.doe@example.com",
  "phone_number": "5555551234",
  "address_line_1": "123 Main St",
  "address_city": "New York",
  "address_state": "NY",
  "address_postal_code": "10001",
  "address_country_code": "US",
  "document_ssn": "123456789",
  "birth_date": "1990-01-01"
}
```

## Production Deployment

### Backend Deployment

1. Set up a production WSGI server (e.g., Gunicorn):
```bash
pip install gunicorn
gunicorn -w 4 app:app
```

2. Configure environment variables on your hosting platform
3. Set up proper logging and monitoring
4. Use HTTPS for API communications

### Frontend Deployment

1. Build the production version:
```bash
cd frontend
npm run build
```

2. Serve the `build` folder using a static file server
3. Update API endpoint if backend is hosted separately
4. Configure CORS properly for production domain

## Security Notes

- Never commit `.env` files to version control
- Keep API credentials secure
- Use HTTPS in production
- Implement rate limiting on backend API
- Validate all inputs on both frontend and backend
- Sanitize user inputs before logging

## License

This project is proprietary and confidential.

## Support

For issues related to:
- **Alloy API:** Contact [Alloy Support](https://www.alloy.com/support)
- **Application Issues:** Create an issue in the project repository

---

Built with ❤️ using React and Flask

