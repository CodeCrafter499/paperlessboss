import React, { useState, useEffect, useCallback } from 'react';
import { Building2, MapPin, CreditCard, Hash, Mail, Phone, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { profileApi } from '../utils/authApi';
import styles from './ProfileForms.module.css';

function CompanyProfileForm() {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    gstin: '',
    pan: '',
    cin: '',
    labour_identification_number: '',
    email: '',
    mobile_no: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [errors, setErrors] = useState({});

  // Fetch company profile on mount
  useEffect(() => {
    profileApi.getCompany()
      .then((data) => {
        setFormData({
          name: data.name || '',
          address: data.address || '',
          gstin: data.gstin || '',
          pan: data.pan || '',
          cin: data.cin || '',
          labour_identification_number: data.labour_identification_number || '',
          email: data.email || '',
          mobile_no: data.mobile_no || ''
        });
      })
      .catch((err) => {
        // If 404, company is not filled yet, which is expected.
        if (err.message && err.message.includes('not been filled out')) {
          setStatus({ type: 'info', message: 'Please set up your Company Profile first.' });
        } else {
          setStatus({ type: 'error', message: err.message || 'Failed to load company profile.' });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = useCallback((e) => {
    let { name, value } = e.target;
    
    // Apply dynamic alphanumeric/numeric controls
    if (name === 'gstin' || name === 'pan' || name === 'cin') {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    } else if (name === 'mobile_no') {
      value = value.replace(/[^0-9]/g, '');
    }

    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      
      // Auto-extract PAN from GSTIN if PAN is not explicitly edited or if it is empty
      if (name === 'gstin' && value.length >= 12 && !next.pan) {
        const extracted = value.slice(2, 12).toUpperCase();
        if (/^[A-Z]{5}\d{4}[A-Z]{1}$/.test(extracted)) {
          next.pan = extracted;
        }
      }
      return next;
    });

    // Clear error for this field
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Company Name is required.';
    
    // GSTIN: 15 characters, pattern matching
    if (formData.gstin) {
      const gstinRegex = /^\d{2}[A-Za-z]{5}\d{4}[A-Za-z]{1}[A-Za-z0-9]{3}$/;
      if (!gstinRegex.test(formData.gstin)) {
        newErrors.gstin = 'Invalid GSTIN format (e.g. 37ABCDE1234F1ZK).';
      }
    }

    // PAN: 10 characters, pattern matching
    if (formData.pan) {
      const panRegex = /^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/;
      if (!panRegex.test(formData.pan)) {
        newErrors.pan = 'Invalid PAN format (e.g. ABCDE1234F).';
      }
    }

    // Cross validation: PAN must match 3rd to 12th characters of GSTIN
    if (formData.gstin && formData.pan && !newErrors.gstin && !newErrors.pan) {
      const extractedPan = formData.gstin.slice(2, 12).toUpperCase();
      if (formData.pan.toUpperCase() !== extractedPan) {
        newErrors.pan = `PAN must match characters 3 to 12 of GSTIN (expected: ${extractedPan}).`;
      }
    }

    // CIN: 21 characters, pattern matching
    if (formData.cin) {
      const cinRegex = /^[A-Za-z0-9]{21}$/;
      if (!cinRegex.test(formData.cin)) {
        newErrors.cin = 'CIN must be exactly 21 alphanumeric characters.';
      }
    }

    // Labour Identification Number (LIN)
    if (formData.labour_identification_number) {
      if (formData.labour_identification_number.length > 50) {
        newErrors.labour_identification_number = 'Labour Identification Number (LIN) cannot exceed 50 characters.';
      }
    }

    // Mobile Number: 10 digits
    if (formData.mobile_no) {
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(formData.mobile_no)) {
        newErrors.mobile_no = 'Corporate Contact Number must be exactly 10 digits.';
      }
    }

    // Email
    if (formData.email) {
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,8}$/;
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
      const updated = await profileApi.upsertCompany(payload);
      setFormData({
        name: updated.name || '',
        address: updated.address || '',
        gstin: updated.gstin || '',
        pan: updated.pan || '',
        cin: updated.cin || '',
        labour_identification_number: updated.labour_identification_number || '',
        email: updated.email || '',
        mobile_no: updated.mobile_no || ''
      });
      setStatus({ type: 'success', message: 'Company Profile updated successfully.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to update company profile.' });
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
        <h2 className={styles.title}>Company Profile</h2>
        <p className={styles.subtitle}>Specify the statutory business entity details. Mapped to generated employee letters.</p>
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
          {/* Company Name */}
          <div className={styles.field}>
            <label className={styles.label}>
              <span>Company Name</span>
              <span className={styles.required}>*</span>
            </label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><Building2 size={16} /></span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Acme Technologies Ltd"
                className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                disabled={saving}
                maxLength={255}
              />
            </div>
            {errors.name && <span className={styles.errorMsg}><AlertCircle size={12} /> {errors.name}</span>}
          </div>

          {/* Labour Identification Number */}
          <div className={styles.field}>
            <label className={styles.label}>Labour Identification Number (LIN)</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><Hash size={16} /></span>
              <input
                type="text"
                name="labour_identification_number"
                value={formData.labour_identification_number}
                onChange={handleChange}
                placeholder="1234567890"
                className={`${styles.input} ${errors.labour_identification_number ? styles.inputError : ''}`}
                disabled={saving}
                maxLength={50}
              />
            </div>
            {errors.labour_identification_number && <span className={styles.errorMsg}><AlertCircle size={12} /> {errors.labour_identification_number}</span>}
          </div>

          {/* GSTIN */}
          <div className={styles.field}>
            <label className={styles.label}>GSTIN</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><CreditCard size={16} /></span>
              <input
                type="text"
                name="gstin"
                value={formData.gstin}
                onChange={handleChange}
                placeholder="37ABCDE1234F1ZK"
                className={`${styles.input} ${errors.gstin ? styles.inputError : ''}`}
                disabled={saving}
                maxLength={15}
              />
            </div>
            {errors.gstin && <span className={styles.errorMsg}><AlertCircle size={12} /> {errors.gstin}</span>}
          </div>

          {/* PAN */}
          <div className={styles.field}>
            <label className={styles.label}>PAN (Company)</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><CreditCard size={16} /></span>
              <input
                type="text"
                name="pan"
                value={formData.pan}
                onChange={handleChange}
                placeholder="ABCDE1234F"
                className={`${styles.input} ${errors.pan ? styles.inputError : ''}`}
                disabled={saving}
                maxLength={10}
              />
            </div>
            {errors.pan && <span className={styles.errorMsg}><AlertCircle size={12} /> {errors.pan}</span>}
          </div>

          {/* CIN */}
          <div className={styles.field}>
            <label className={styles.label}>CIN</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><Hash size={16} /></span>
              <input
                type="text"
                name="cin"
                value={formData.cin}
                onChange={handleChange}
                placeholder="L17110MH1973PLC019786"
                className={`${styles.input} ${errors.cin ? styles.inputError : ''}`}
                disabled={saving}
                maxLength={21}
              />
            </div>
            {errors.cin && <span className={styles.errorMsg}><AlertCircle size={12} /> {errors.cin}</span>}
          </div>

          {/* Mobile No */}
          <div className={styles.field}>
            <label className={styles.label}>Corporate Contact Number</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><Phone size={16} /></span>
              <input
                type="text"
                name="mobile_no"
                value={formData.mobile_no}
                onChange={handleChange}
                placeholder="9876543210"
                className={`${styles.input} ${errors.mobile_no ? styles.inputError : ''}`}
                disabled={saving}
                maxLength={10}
              />
            </div>
            {errors.mobile_no && <span className={styles.errorMsg}><AlertCircle size={12} /> {errors.mobile_no}</span>}
          </div>

          {/* Email */}
          <div className={styles.field}>
            <label className={styles.label}>Corporate Email Address</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><Mail size={16} /></span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="corporate@acme.com"
                className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
                disabled={saving}
                maxLength={255}
              />
            </div>
            {errors.email && <span className={styles.errorMsg}><AlertCircle size={12} /> {errors.email}</span>}
          </div>

          {/* Address */}
          <div className={styles.field} style={{ gridColumn: 'span 2' }}>
            <label className={styles.label}>
              <MapPin size={16} />
              <span>Registered Office Address</span>
            </label>
            <div className={styles.inputWrap}>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="101, Tech Park, Sector 5, Bangalore"
                className={styles.input}
                style={{ paddingLeft: '12px', minHeight: '60px', resize: 'vertical' }}
                disabled={saving}
                maxLength={1000}
              />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          {status.message && (
            <div className={`${styles.statusMessageInline} ${
              status.type === 'success' ? styles.statusSuccess :
              status.type === 'info' ? styles.statusInfo : styles.statusError
            }`}>
              {status.type === 'success' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              <span>{status.message}</span>
            </div>
          )}
          <button type="submit" className={styles.btn} disabled={saving}>
            {saving ? <><Loader2 className={styles.loadingSpinner} /> Saving Profile…</> : 'Save Company Details'}
          </button>
        </div>
      </form>
    </div>
  );
}
export default React.memo(CompanyProfileForm);
