import React, { useState, useEffect, useCallback } from 'react';
import { User, MapPin, CreditCard, Mail, Phone, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { profileApi } from '../utils/authApi';
import styles from './ProfileForms.module.css';

export default function SignatoryProfileForm() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    pan: '',
    email: '',
    mobile_no: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});

  // Fetch signatory profile on mount
  useEffect(() => {
    profileApi.getSignatory()
      .then((data) => {
        setFormData({
          name: data.name || '',
          address: data.address || '',
          pan: data.pan || '',
          email: data.email || '',
          mobile_no: data.mobile_no || ''
        });
      })
      .catch((err) => {
        // If 404, signatory is not filled yet, which is expected.
        if (err.message && err.message.includes('not been filled out')) {
          setStatus({ type: 'info', message: 'Please set up your Authorised Signatory details.' });
        } else {
          setStatus({ type: 'error', message: err.message || 'Failed to load signatory profile.' });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Full Name is required.';
    
    // PAN: 10 characters, pattern matching
    if (formData.pan) {
      const panRegex = /^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/;
      if (!panRegex.test(formData.pan)) {
        newErrors.pan = 'Invalid PAN format (e.g. XYZAB1234C).';
      }
    }

    // Email
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Invalid email address format.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    if (!validate()) {
      setStatus({ type: 'error', message: 'Please correct the errors in the form.' });
      return;
    }

    setSaving(true);
    // Sanitize empty strings to null for backend schema compatibility
    const payload = {};
    Object.keys(formData).forEach((key) => {
      payload[key] = formData[key].trim() === '' ? null : formData[key].trim();
    });
    // Ensure name is present
    if (!payload.name) payload.name = formData.name;

    try {
      const updated = await profileApi.upsertSignatory(payload);
      setFormData({
        name: updated.name || '',
        address: updated.address || '',
        pan: updated.pan || '',
        email: updated.email || '',
        mobile_no: updated.mobile_no || ''
      });
      setStatus({ type: 'success', message: 'Authorised Signatory details updated successfully.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to update signatory profile.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <Loader2 className={styles.loadingSpinner} style={{ width: 24, height: 24, borderTopColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>Authorised Signatory Details</h2>
        <p className={styles.subtitle}>Specify the person authorized to sign appointment letters on behalf of the company.</p>
      </div>

      {status.message && (
        <div className={`${styles.statusMessage} ${
          status.type === 'success' ? styles.statusSuccess :
          status.type === 'info' ? styles.statusInfo : styles.statusError
        }`}>
          {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{status.message}</span>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.grid}>
          {/* Full Name */}
          <div className={styles.field}>
            <label className={styles.label}>
              <span>Full Name of Signatory</span>
              <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><User size={16} /></span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Johnathan Doe"
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                disabled={saving}
              />
            </div>
            {errors.name && <span className={styles.errorMsg}><AlertCircle size={12} /> {errors.name}</span>}
          </div>

          {/* PAN */}
          <div className={styles.field}>
            <label className={styles.label}>Personal PAN</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><CreditCard size={16} /></span>
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                placeholder="XYZAB1234C"
                className={`${styles.input} ${errors.pan ? styles.inputError : ''}`}
                disabled={saving}
              />
            </div>
            {errors.pan && <span className={styles.errorMsg}><AlertCircle size={12} /> {errors.pan}</span>}
          </div>

          {/* Mobile No */}
          <div className={styles.field}>
            <label className={styles.label}>Contact Mobile Number</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><Phone size={16} /></span>
              <input
                type="text"
                name="mobile_no"
                value={formData.mobile_no}
                onChange={handleChange}
                placeholder="9876543211"
                className={styles.input}
                disabled={saving}
              />
            </div>
          </div>

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label}>Email Address</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><Mail size={16} /></span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="john.doe@acme.com"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                disabled={saving}
              />
            </div>
            {errors.email && <span className={styles.errorMsg}><AlertCircle size={12} /> {errors.email}</span>}
          </div>

          {/* Address */}
          <div className={styles.field} style={{ gridColumn: 'span 2' }}>
            <label className={styles.label}>
              <MapPin size={16} />
              <span>Residential / Office Address</span>
            </label>
            <div className={styles.inputWrap}>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Villa 42, Green Meadows, Bangalore"
                className={styles.input}
                style={{ paddingLeft: '12px', minHeight: '60px', resize: 'vertical' }}
                disabled={saving}
              />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.btn} disabled={saving}>
            {saving ? <><Loader2 className={styles.loadingSpinner} /> Saving details…</> : 'Save Signatory Details'}
          </button>
        </div>
      </form>
    </div>
  );
}
