import React, { useState, useEffect } from 'react';
import axios from 'axios';
import validationSchema from '../inputs.json';
import './EvaluationForm.css';

const EvaluationForm = () => {
  const [formData, setFormData] = useState({
    name_first: '',
    name_last: '',
    address_line_1: '',
    address_line_2: '',
    address_city: '',
    address_state: '',
    address_postal_code: '',
    address_country_code: 'US',
    document_ssn: '',
    email_address: '',
    birth_date: '',
    phone_number: ''
  });

  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [requiredFields, setRequiredFields] = useState([]);

  useEffect(() => {
    // Extract required fields from validation schema
    const required = validationSchema.required.map(field => field.key);
    setRequiredFields(required);
  }, []);

  const validateField = (fieldKey, fieldValue) => {
    // Find field in schema
    const allFields = [...validationSchema.required, ...validationSchema.optional];
    const fieldSchema = allFields.find(field => field.key === fieldKey);

    if (!fieldSchema) return null;

    // Check regex validation
    if (fieldSchema.regex && fieldValue) {
      const regex = new RegExp(fieldSchema.regex);
      if (!regex.test(fieldValue)) {
        return `Invalid format for ${fieldSchema.description || fieldKey}`;
      }
    }

    // Additional validations
    if (fieldKey === 'address_country_code' && fieldValue !== 'US') {
      return 'Country must be US';
    }

    if (fieldKey === 'address_state' && fieldValue && fieldValue.length !== 2) {
      return 'State must be a two-letter code (e.g., NY, CA)';
    }

    if (fieldKey === 'document_ssn' && fieldValue) {
      if (!/^\d{9}$/.test(fieldValue)) {
        return 'SSN must be exactly 9 digits with no dashes';
      }
    }

    if (fieldKey === 'birth_date' && fieldValue) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fieldValue)) {
        return 'Date of Birth must be in YYYY-MM-DD format';
      }
    }

    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }

    // Clear submit status when user makes changes
    if (submitStatus) {
      setSubmitStatus(null);
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    // Check required fields
    requiredFields.forEach(fieldKey => {
      if (!formData[fieldKey] || formData[fieldKey].trim() === '') {
        newErrors[fieldKey] = `${fieldKey} is required`;
        isValid = false;
      }
    });

    // Check "or" requirements - either business_name OR (name_first AND name_last)
    const hasBusinessName = formData.business_name && formData.business_name.trim() !== '';
    const hasPersonName = formData.name_first && formData.name_first.trim() !== '' 
                         && formData.name_last && formData.name_last.trim() !== '';

    if (!hasBusinessName && !hasPersonName) {
      newErrors.name_first = 'First name is required (or provide business name)';
      newErrors.name_last = 'Last name is required (or provide business name)';
      isValid = false;
    }

    // Validate all filled fields
    Object.keys(formData).forEach(fieldKey => {
      if (formData[fieldKey] && formData[fieldKey].trim() !== '') {
        const error = validateField(fieldKey, formData[fieldKey]);
        if (error) {
          newErrors[fieldKey] = error;
          isValid = false;
        }
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setSubmitStatus(null);

    try {
      // Filter out empty fields
      const payload = Object.keys(formData).reduce((acc, key) => {
        if (formData[key] && formData[key].trim() !== '') {
          acc[key] = formData[key].trim();
        }
        return acc;
      }, {});

      const response = await axios.post('/api/submit', payload);

      // Log details to console
      console.log('Evaluation Response:', {
        outcome: response.data.outcome,
        outcome_reasons: response.data.outcome_reasons,
        evaluation_token: response.data.evaluation_token,
        timestamp: response.data.timestamp
      });
      
      // Determine status type based on outcome
      const statusType = response.data.success ? 'success' : 'error';
      
      setSubmitStatus({
        type: statusType,
        message: response.data.message,
        details: {
          outcome: response.data.outcome
        }
      });
      
      // Reset form for approved or manual_review outcomes
      if (response.data.outcome === 'approved' || 
          response.data.outcome === 'manual_review' || 
          response.data.outcome === 'manual review') {
        setFormData({
          name_first: '',
          name_last: '',
          address_line_1: '',
          address_line_2: '',
          address_city: '',
          address_state: '',
          address_postal_code: '',
          address_country_code: 'US',
          document_ssn: '',
          email_address: '',
          birth_date: '',
          phone_number: ''
        });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'An error occurred';
      setSubmitStatus({
        type: 'error',
        message: errorMessage,
        details: error.response?.data?.details || null
      });
    } finally {
      setLoading(false);
    }
  };

  const isFieldRequired = (fieldKey) => {
    return requiredFields.includes(fieldKey);
  };

  return (
    <div className="form-container">
      <div className="form-wrapper">
        <h1 className="form-title">Alloy Evaluation Form</h1>
        
        <form onSubmit={handleSubmit} className="evaluation-form">
          {/* Name Section */}
          <div className="form-section">
            <h2 className="section-title">Personal Information</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name_first">
                  First Name {!isFieldRequired('name_first') && <span className="optional">(optional)</span>}
                </label>
                <input
                  type="text"
                  id="name_first"
                  name="name_first"
                  value={formData.name_first}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.name_first ? 'error' : ''}
                />
                {errors.name_first && <span className="error-message">{errors.name_first}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="name_last">
                  Last Name {!isFieldRequired('name_last') && <span className="optional">(optional)</span>}
                </label>
                <input
                  type="text"
                  id="name_last"
                  name="name_last"
                  value={formData.name_last}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.name_last ? 'error' : ''}
                />
                {errors.name_last && <span className="error-message">{errors.name_last}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email_address">
                  Email Address {isFieldRequired('email_address') && <span className="required">*</span>}
                </label>
                <input
                  type="email"
                  id="email_address"
                  name="email_address"
                  value={formData.email_address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.email_address ? 'error' : ''}
                  required={isFieldRequired('email_address')}
                />
                {errors.email_address && <span className="error-message">{errors.email_address}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone_number">
                  Phone Number {isFieldRequired('phone_number') && <span className="required">*</span>}
                </label>
                <input
                  type="tel"
                  id="phone_number"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.phone_number ? 'error' : ''}
                  required={isFieldRequired('phone_number')}
                />
                {errors.phone_number && <span className="error-message">{errors.phone_number}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="birth_date">
                  Date of Birth (YYYY-MM-DD) {!isFieldRequired('birth_date') && <span className="optional">(optional)</span>}
                </label>
                <input
                  type="text"
                  id="birth_date"
                  name="birth_date"
                  value={formData.birth_date}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="YYYY-MM-DD"
                  className={errors.birth_date ? 'error' : ''}
                />
                {errors.birth_date && <span className="error-message">{errors.birth_date}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="document_ssn">
                  SSN (9 digits, no dashes) {!isFieldRequired('document_ssn') && <span className="optional">(optional)</span>}
                </label>
                <input
                  type="text"
                  id="document_ssn"
                  name="document_ssn"
                  value={formData.document_ssn}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="123456789"
                  maxLength="9"
                  className={errors.document_ssn ? 'error' : ''}
                />
                {errors.document_ssn && <span className="error-message">{errors.document_ssn}</span>}
              </div>
            </div>
          </div>

          {/* Address Section */}
          <div className="form-section">
            <h2 className="section-title">Address</h2>
            
            <div className="form-group">
              <label htmlFor="address_line_1">
                Address Line 1 {isFieldRequired('address_line_1') && <span className="required">*</span>}
              </label>
              <input
                type="text"
                id="address_line_1"
                name="address_line_1"
                value={formData.address_line_1}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.address_line_1 ? 'error' : ''}
                required={isFieldRequired('address_line_1')}
              />
              {errors.address_line_1 && <span className="error-message">{errors.address_line_1}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="address_line_2">
                Address Line 2 {!isFieldRequired('address_line_2') && <span className="optional">(optional)</span>}
              </label>
              <input
                type="text"
                id="address_line_2"
                name="address_line_2"
                value={formData.address_line_2}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.address_line_2 ? 'error' : ''}
              />
              {errors.address_line_2 && <span className="error-message">{errors.address_line_2}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address_city">
                  City {!isFieldRequired('address_city') && <span className="optional">(optional)</span>}
                </label>
                <input
                  type="text"
                  id="address_city"
                  name="address_city"
                  value={formData.address_city}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.address_city ? 'error' : ''}
                />
                {errors.address_city && <span className="error-message">{errors.address_city}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="address_state">
                  State (2-letter code) {!isFieldRequired('address_state') && <span className="optional">(optional)</span>}
                </label>
                <input
                  type="text"
                  id="address_state"
                  name="address_state"
                  value={formData.address_state}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="NY"
                  maxLength="2"
                  className={errors.address_state ? 'error' : ''}
                />
                {errors.address_state && <span className="error-message">{errors.address_state}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="address_postal_code">
                  Zip/Postal Code {!isFieldRequired('address_postal_code') && <span className="optional">(optional)</span>}
                </label>
                <input
                  type="text"
                  id="address_postal_code"
                  name="address_postal_code"
                  value={formData.address_postal_code}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.address_postal_code ? 'error' : ''}
                />
                {errors.address_postal_code && <span className="error-message">{errors.address_postal_code}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="address_country_code">
                  Country {isFieldRequired('address_country_code') && <span className="required">*</span>}
                </label>
                <input
                  type="text"
                  id="address_country_code"
                  name="address_country_code"
                  value={formData.address_country_code}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  readOnly
                  className={errors.address_country_code ? 'error' : ''}
                  required={isFieldRequired('address_country_code')}
                />
                {errors.address_country_code && <span className="error-message">{errors.address_country_code}</span>}
              </div>
            </div>
          </div>

          {/* Submit Status */}
          {submitStatus && (
            <div className={`submit-status ${submitStatus.type}`}>
              <h3>{submitStatus.message}</h3>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Evaluation'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EvaluationForm;

