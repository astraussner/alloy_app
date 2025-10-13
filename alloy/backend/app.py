from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
from datetime import datetime
import os
import base64
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for React frontend

# Load the validation schema
with open('../frontend/src/inputs.json', 'r') as f:
    validation_schema = json.load(f)

# Create results directory if it doesn't exist
os.makedirs('results', exist_ok=True)

def validate_field(field_key, field_value):
    """Validate a field based on the schema"""
    # Find the field in the schema
    all_fields = validation_schema.get('required', []) + validation_schema.get('optional', [])
    
    for field in all_fields:
        if field['key'] == field_key:
            # Check regex if exists
            if field.get('regex'):
                import re
                if not re.match(field['regex'], str(field_value)):
                    return False, f"Invalid format for {field_key}"
            
            # Type validation
            field_type = field.get('type')
            if field_type == 'string' and not isinstance(field_value, str):
                return False, f"{field_key} must be a string"
            elif field_type == 'date':
                # Validate ISO-8601 date format
                try:
                    datetime.strptime(field_value, '%Y-%m-%d')
                except ValueError:
                    return False, f"{field_key} must be in YYYY-MM-DD format"
            
            return True, None
    
    return True, None  # Field not in schema, allow it

def log_result(data):
    """Log result to results.log file"""
    timestamp = datetime.now().isoformat()
    log_file = 'results/results.log'
    
    with open(log_file, 'a') as f:
        f.write(f"\n{'='*80}\n")
        f.write(f"Timestamp: {timestamp}\n")
        for key, value in data.items():
            f.write(f"{key}: {value}\n")

@app.route('/api/submit', methods=['POST'])
def submit_form():
    """Handle form submission and call Alloy API"""
    try:
        form_data = request.json
        
        # Validate required fields from schema
        required_fields = validation_schema.get('required', [])
        for field in required_fields:
            field_key = field['key']
            if field_key not in form_data or not form_data[field_key]:
                return jsonify({
                    'error': f"Missing required field: {field_key}"
                }), 400
        
        # Check "or" requirements (either business_name OR (name_first AND name_last))
        or_requirements = validation_schema.get('or', [])
        or_satisfied = False
        for or_group in or_requirements:
            group_satisfied = True
            for field in or_group.get('required', []):
                field_key = field['key']
                if field_key not in form_data or not form_data[field_key]:
                    group_satisfied = False
                    break
            if group_satisfied:
                or_satisfied = True
                break
        
        if not or_satisfied:
            return jsonify({
                'error': 'Must provide either business_name OR (name_first AND name_last)'
            }), 400
        
        # Validate each field
        for field_key, field_value in form_data.items():
            if field_value:  # Only validate non-empty fields
                is_valid, error_msg = validate_field(field_key, field_value)
                if not is_valid:
                    return jsonify({'error': error_msg}), 400
        
        # Prepare payload for Alloy API
        alloy_payload = {
            'evaluation_token': form_data.get('evaluation_token'),
            **{k: v for k, v in form_data.items() if k != 'evaluation_token' and v}
        }
        
        # Get API credentials from environment variables
        alloy_api_key = os.getenv('ALLOY_API_KEY')
        alloy_api_secret = os.getenv('ALLOY_API_SECRET')
        
        if not alloy_api_key or not alloy_api_secret:
            return jsonify({
                'error': 'Server configuration error: Missing API credentials'
            }), 500
        
        # Concatenate token and secret with colon, then base64 encode
        credentials = f'{alloy_api_key}:{alloy_api_secret}'
        encoded_credentials = base64.b64encode(credentials.encode('utf-8')).decode('utf-8')
        
        # Make request to Alloy API
        headers = {
            'Accept': 'application/json',
            'Authorization': f'Basic {encoded_credentials}',
            'Content-Type': 'application/json'
        }
        
        # Use sandbox URL
        alloy_url = 'https://sandbox.alloy.co/v1/evaluations'
        
        response = requests.post(
            alloy_url,
            headers=headers,
            json=alloy_payload,
            timeout=30
        )
        
        response_data = response.json()
        
        # Check if successful and get outcome
        if response.status_code == 200 or response.status_code == 201:
            summary = response_data.get('summary', {})
            outcome = summary.get('outcome', '').lower()
            evaluation_token = response_data.get('evaluation_token', '')
            timestamp = datetime.now().isoformat()
            outcome_reasons = summary.get('outcome_reasons', [])
            
            # Determine message and status based on outcome
            if outcome == 'approved':
                status_label = 'Approved'
                message = 'Success!'
                success = True
            elif outcome == 'manual_review' or outcome == 'manual review':
                status_label = 'Manual Review'
                message = "Thanks for submitting your application, we'll be in touch shortly"
                success = True
            elif outcome == 'denied' or outcome == 'deny':
                status_label = 'Denied'
                message = 'Sorry, your application was not successful'
                success = False
            else:
                # Handle any other outcome
                status_label = outcome.title()
                message = f'Application status: {outcome}'
                success = False
            
            # Log result
            log_result({
                'Status': status_label,
                'Outcome': outcome,
                'Outcome Reasons': ', '.join(outcome_reasons) if outcome_reasons else 'None provided',
                'Evaluation Token': evaluation_token,
                'Timestamp': timestamp
            })
            
            return jsonify({
                'success': success,
                'message': message,
                'outcome': outcome,
                'outcome_reasons': outcome_reasons,
                'evaluation_token': evaluation_token,
                'timestamp': timestamp
            }), 200
        else:
            # API call failed
            error_message = response_data.get('error', {}).get('message', 'Unknown error')
            return jsonify({
                'error': f'Alloy API error: {error_message}',
                'details': response_data
            }), response.status_code
            
    except requests.exceptions.RequestException as e:
        return jsonify({
            'error': f'Network error: {str(e)}'
        }), 500
    except Exception as e:
        return jsonify({
            'error': f'Server error: {str(e)}'
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'}), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)

