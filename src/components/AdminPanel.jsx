import React, { useState, useEffect } from 'react';
import { Settings, Shield, IndianRupee, Hash, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { billingApi } from '../utils/authApi';
import styles from './ProfileForms.module.css';

export default function AdminPanel() {
  const [formData, setFormData] = useState({
    tier2_threshold: 1000,
    tier2_copies: 45,
    tier1_threshold: 500,
    tier1_copies: 20,
    base_rate: 30,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Load config on mount
  useEffect(() => {
    billingApi.getBillingConfig = async () => {
      // Inline helper in authApi if not globally registered, but we can do it directly:
      // Let's use request helper or billingApi wrapper:
      // Wait, we will add getBillingConfig to billingApi in authApi.js.
      // But we can call billingApi.getConfig()! Let's check how we defined it.
      // Ah, in billingApi: getBalance and pay are defined, but not getConfig/updateConfig yet!
      // We will add them to authApi.js. Let's make sure we call it.
      return billingApi.getConfig();
    };

    billingApi.getConfig()
      .then((data) => {
        setFormData({
          tier2_threshold: data.tier2_threshold,
          tier2_copies: data.tier2_copies,
          tier1_threshold: data.tier1_threshold,
          tier1_copies: data.tier1_copies,
          base_rate: data.base_rate,
        });
      })
      .catch((err) => {
        setStatus({ type: 'error', message: err.message || 'Failed to load billing configuration.' });
      })
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    setSaving(true);

    try {
      const res = await billingApi.updateConfig({
        tier2_threshold: parseFloat(formData.tier2_threshold),
        tier2_copies: parseInt(formData.tier2_copies, 10),
        tier1_threshold: parseFloat(formData.tier1_threshold),
        tier1_copies: parseInt(formData.tier1_copies, 10),
        base_rate: parseFloat(formData.base_rate),
      });
      setFormData({
        tier2_threshold: res.tier2_threshold,
        tier2_copies: res.tier2_copies,
        tier1_threshold: res.tier1_threshold,
        tier1_copies: res.tier1_copies,
        base_rate: res.base_rate,
      });
      setStatus({ type: 'success', message: 'Billing configuration updated successfully.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to update billing configuration.' });
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
      <div className={styles.cardHeader} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <div style={{ background: 'rgba(46, 125, 50, 0.1)', padding: '8px', borderRadius: '8px', color: 'var(--color-primary)' }}>
          <Shield size={24} />
        </div>
        <div>
          <h2 className={styles.title}>Admin Billing Control Panel</h2>
          <p className={styles.subtitle}>Configure dynamic pricing tiers and base tariffs for all system users.</p>
        </div>
      </div>

      {status.message && (
        <div className={`${styles.statusMessage} ${
          status.type === 'success' ? styles.statusSuccess : styles.statusError
        }`}>
          {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{status.message}</span>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.grid}>
          {/* Base Rate */}
          <div className={styles.field} style={{ gridColumn: 'span 2' }}>
            <label className={styles.label}>Base Rate (₹ per copy, applied for small payments)</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><IndianRupee size={16} /></span>
              <input
                type="number"
                name="base_rate"
                value={formData.base_rate}
                onChange={handleChange}
                placeholder="30"
                className={styles.input}
                disabled={saving}
                min="0.01"
                step="0.01"
              />
            </div>
          </div>

          <div style={{ gridColumn: 'span 2' }}><hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} /></div>

          {/* Tier 1 Threshold */}
          <div className={styles.field}>
            <label className={styles.label}>Tier 1 Threshold (₹)</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><IndianRupee size={16} /></span>
              <input
                type="number"
                name="tier1_threshold"
                value={formData.tier1_threshold}
                onChange={handleChange}
                placeholder="500"
                className={styles.input}
                disabled={saving}
                min="1"
              />
            </div>
          </div>

          {/* Tier 1 Copies */}
          <div className={styles.field}>
            <label className={styles.label}>Tier 1 Yield (Copies)</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><Hash size={16} /></span>
              <input
                type="number"
                name="tier1_copies"
                value={formData.tier1_copies}
                onChange={handleChange}
                placeholder="20"
                className={styles.input}
                disabled={saving}
                min="1"
              />
            </div>
          </div>

          <div style={{ gridColumn: 'span 2' }}><hr style={{ border: 'none', borderTop: '1px solid var(--color-border)' }} /></div>

          {/* Tier 2 Threshold */}
          <div className={styles.field}>
            <label className={styles.label}>Tier 2 Threshold (₹)</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><IndianRupee size={16} /></span>
              <input
                type="number"
                name="tier2_threshold"
                value={formData.tier2_threshold}
                onChange={handleChange}
                placeholder="1000"
                className={styles.input}
                disabled={saving}
                min="1"
              />
            </div>
          </div>

          {/* Tier 2 Copies */}
          <div className={styles.field}>
            <label className={styles.label}>Tier 2 Yield (Copies)</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}><Hash size={16} /></span>
              <input
                type="number"
                name="tier2_copies"
                value={formData.tier2_copies}
                onChange={handleChange}
                placeholder="45"
                className={styles.input}
                disabled={saving}
                min="1"
              />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button type="submit" className={styles.btn} disabled={saving}>
            {saving ? <><Loader2 className={styles.loadingSpinner} /> Saving Settings…</> : 'Save Configuration'}
          </button>
        </div>
      </form>
    </div>
  );
}
