import React, { useState, useEffect, useCallback } from 'react';
import { User, MapPin, CreditCard, Mail, Phone, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { profileApi } from '../utils/authApi';
import styles from './ProfileForms.module.css';

function SignatoryProfileForm() {
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

  const [includeSignatureStamp, setIncludeSignatureStamp] = useState(() => {
    return localStorage.getItem('pb_include_signature_stamp') === 'true';
  });
  const [signatureImg, setSignatureImg] = useState(() => {
    return localStorage.getItem('pb_signature_img') || '';
  });
  const [stampImg, setStampImg] = useState(() => {
    return localStorage.getItem('pb_stamp_img') || '';
  });

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
        if (data.signature_image) {
          setSignatureImg(data.signature_image);
          localStorage.setItem('pb_signature_img', data.signature_image);
        }
        if (data.stamp_image) {
          setStampImg(data.stamp_image);
          localStorage.setItem('pb_stamp_img', data.stamp_image);
        }
        if (data.include_signature_stamp !== undefined) {
          setIncludeSignatureStamp(data.include_signature_stamp);
          localStorage.setItem('pb_include_signature_stamp', data.include_signature_stamp ? 'true' : 'false');
        }
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
    let { name, value } = e.target;
    
    if (name === 'name') {
      value = value.replace(/[^A-Za-z\s.]/g, '');
    } else if (name === 'pan') {
      value = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    } else if (name === 'mobile_no') {
      value = value.replace(/[^0-9]/g, '');
    }
    
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Full Name is required.';
    } else {
      const nameRegex = /^[A-Za-z\s.]+$/;
      if (!nameRegex.test(formData.name.trim())) {
        newErrors.name = 'Full Name should only contain letters, spaces, and dots.';
      }
    }
    
    // PAN: 10 characters, pattern matching
    if (formData.pan) {
      const panRegex = /^[A-Za-z]{5}\d{4}[A-Za-z]{1}$/;
      if (!panRegex.test(formData.pan)) {
        newErrors.pan = 'Invalid PAN format (e.g. XYZAB1234C).';
      }
    }

    // Mobile Number: 10 digits
    if (formData.mobile_no) {
      const mobileRegex = /^\d{10}$/;
      if (!mobileRegex.test(formData.mobile_no)) {
        newErrors.mobile_no = 'Contact Mobile Number must be exactly 10 digits.';
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
    
    // Add signature/stamp fields to payload
    payload.signature_image = signatureImg || null;
    payload.stamp_image = stampImg || null;
    payload.include_signature_stamp = includeSignatureStamp;

    try {
      const updated = await profileApi.upsertSignatory(payload);
      setFormData({
        name: updated.name || '',
        address: updated.address || '',
        pan: updated.pan || '',
        email: updated.email || '',
        mobile_no: updated.mobile_no || ''
      });
      if (updated.signature_image) setSignatureImg(updated.signature_image);
      if (updated.stamp_image) setStampImg(updated.stamp_image);
      if (updated.include_signature_stamp !== undefined) setIncludeSignatureStamp(updated.include_signature_stamp);

      localStorage.setItem('pb_include_signature_stamp', includeSignatureStamp ? 'true' : 'false');
      localStorage.setItem('pb_signature_img', signatureImg || '');
      localStorage.setItem('pb_stamp_img', stampImg || '');
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
                maxLength={255}
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
                maxLength={10}
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
                className={`${styles.input} ${errors.mobile_no ? styles.inputError : ''}`}
                disabled={saving}
                maxLength={10}
              />
            </div>
            {errors.mobile_no && <span className={styles.errorMsg}><AlertCircle size={12} /> {errors.mobile_no}</span>}
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
                maxLength={255}
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
                maxLength={1000}
              />
            </div>
          </div>

          {/* Signature & Stamp Options */}
          <div style={{ gridColumn: 'span 2', marginTop: '16px', paddingTop: '16px', borderTop: '1px dashed #cbd5e1' }}>
            <h3 style={{ fontSize: '14px', fontWeight: '700', marginBottom: '12px', color: '#0f172a' }}>Signature & Company Stamp Settings</h3>
            
            <div style={{ display: 'flex', gap: '24px', marginBottom: '16px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                <input 
                  type="radio" 
                  name="signature_stamp_toggle" 
                  checked={includeSignatureStamp} 
                  onChange={() => setIncludeSignatureStamp(true)} 
                />
                With Signature and Stamp
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', fontWeight: '600', color: '#334155' }}>
                <input 
                  type="radio" 
                  name="signature_stamp_toggle" 
                  checked={!includeSignatureStamp} 
                  onChange={() => setIncludeSignatureStamp(false)} 
                />
                Without Signature and Stamp
              </label>
            </div>

            {includeSignatureStamp && (
              <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
                {/* Signature Upload */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Authorised Signature (PNG/JPEG)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setSignatureImg(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }} 
                    style={{ fontSize: '12px', width: '100%' }}
                  />
                  {signatureImg && (
                    <div style={{ marginTop: '8px', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', background: '#fff', width: 'fit-content' }}>
                      <img src={signatureImg} alt="Signature Preview" style={{ maxHeight: '40px', maxWidth: '120px', objectFit: 'contain' }} />
                    </div>
                  )}
                </div>

                {/* Stamp Upload */}
                <div style={{ flex: 1, minWidth: '200px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#475569', display: 'block', marginBottom: '6px' }}>Company Stamp (PNG/JPEG)</label>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setStampImg(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }} 
                    style={{ fontSize: '12px', width: '100%' }}
                  />
                  {stampImg && (
                    <div style={{ marginTop: '8px', border: '1px solid #cbd5e1', padding: '6px', borderRadius: '4px', background: '#fff', width: 'fit-content' }}>
                      <img src={stampImg} alt="Stamp Preview" style={{ maxHeight: '40px', maxWidth: '100px', objectFit: 'contain' }} />
                    </div>
                  )}
                </div>
              </div>
            )}
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
            {saving ? <><Loader2 className={styles.loadingSpinner} /> Saving details…</> : 'Save Signatory Details'}
          </button>
        </div>
      </form>
    </div>
  );
}
export default React.memo(SignatoryProfileForm);
