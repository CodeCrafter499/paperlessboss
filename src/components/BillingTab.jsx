import React, { useState, useEffect } from 'react';
import { CreditCard, ShieldCheck, HelpCircle, History, Sparkles, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { billingApi } from '../utils/authApi';
import styles from './ProfileForms.module.css';

export default function BillingTab({ credits, wageCredits = 0, refreshCredits }) {
  const [payAmount, setPayAmount] = useState('500');
  const [rechargeType, setRechargeType] = useState('offer_letter');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [config, setConfig] = useState({
    tier2_threshold: 1000.0,
    tier2_copies: 45,
    tier1_threshold: 500.0,
    tier1_copies: 20,
    base_rate: 30.0,
  });
  const [loading, setLoading] = useState(true);

  // Load config on mount
  useEffect(() => {
    billingApi.getConfig()
      .then((cfg) => {
        setConfig(cfg);
      })
      .catch((err) => {
        console.error('Failed to load billing config:', err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Calculate dynamic pricing preview on client side
  const calculateCopiesPreview = (amount) => {
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) return 0;
    if (val >= config.tier2_threshold) {
      const rate = config.tier2_copies > 0 ? (config.tier2_threshold / config.tier2_copies) : 9999.0;
      return Math.floor(val / rate);
    } else if (val >= config.tier1_threshold) {
      const rate = config.tier1_copies > 0 ? (config.tier1_threshold / config.tier1_copies) : 9999.0;
      return Math.floor(val / rate);
    } else {
      return config.base_rate > 0 ? Math.floor(val / config.base_rate) : 0;
    }
  };

  const previewCopies = calculateCopiesPreview(payAmount);

  const handlePay = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    const amount = parseFloat(payAmount);

    if (isNaN(amount) || amount <= 0) {
      setStatus({ type: 'error', message: 'Please enter a valid amount greater than zero.' });
      return;
    }

    setSaving(true);
    try {
      const res = await billingApi.pay(amount, rechargeType);
      setStatus({ 
        type: 'success', 
        message: `Payment of ₹${amount} simulated successfully! Added ${res.copies_added} copies to your ${rechargeType === 'offer_letter' ? 'Offer Letters' : 'Wage Slips'} balance.` 
      });
      refreshCredits();
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Payment simulation failed.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.card} style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
        <Loader2 className={styles.loadingSpinner} style={{ width: 24, height: 24, borderTopColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  const tier2Rate = config.tier2_copies > 0 ? (config.tier2_threshold / config.tier2_copies) : 0;
  const tier1Rate = config.tier1_copies > 0 ? (config.tier1_threshold / config.tier1_copies) : 0;

  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>Statutory Credits & Billing</h2>
        <p className={styles.subtitle}>Manage your dynamic pricing tariff and recharge your Offer Letter / Wage Slip balances.</p>
      </div>

      {status.message && (
        <div className={`${styles.statusMessage} ${
          status.type === 'success' ? styles.statusSuccess : styles.statusError
        }`}>
          {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{status.message}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '10px' }}>
        
        {/* Left Side: Current balance & Recharge form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ 
            background: 'linear-gradient(135deg, var(--color-primary) 0%, #1B5E20 100%)', 
            color: 'white', 
            padding: '20px', 
            borderRadius: '10px',
            boxShadow: '0 4px 12px rgba(46, 125, 50, 0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85 }}>Offer Letters Balance</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '4px 0' }}>{credits} Copies</div>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '10px' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.85 }}>Wage Slips Balance</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '4px 0' }}>{wageCredits} Copies</div>
            </div>
            <div style={{ fontSize: '10px', opacity: 0.8 }}>Deducted automatically as you generate documents.</div>
          </div>

          <form onSubmit={handlePay} className={styles.form} style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '12px' }}>Simulate Recharge / Payment</h3>
            
            <div className={styles.field} style={{ marginBottom: '12px' }}>
              <label className={styles.label}>Credit Type</label>
              <select
                value={rechargeType}
                onChange={(e) => setRechargeType(e.target.value)}
                className={styles.input}
                style={{ height: '38px', padding: '0 8px', borderRadius: '4px', border: '1px solid var(--color-border)', width: '100%' }}
                disabled={saving}
              >
                <option value="offer_letter">Offer Letters</option>
                <option value="wage_slip">Wage Slips (Form V)</option>
              </select>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Payment Amount (₹)</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><CreditCard size={16} /></span>
                <input
                  type="number"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  placeholder="Enter amount (e.g. 500, 1000)"
                  className={styles.input}
                  min="1"
                  disabled={saving}
                />
              </div>
            </div>

            {previewCopies > 0 && (
              <div style={{ 
                margin: '10px 0', 
                padding: '10px', 
                background: 'rgba(46, 125, 50, 0.08)', 
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--color-primary)',
                fontWeight: '600'
              }}>
                <Sparkles size={14} />
                <span>Dynamic Tariff: You will receive {previewCopies} copies (₹{(payAmount / previewCopies).toFixed(2)} / copy)</span>
              </div>
            )}

            <button type="submit" className={styles.btn} style={{ width: '100%', marginTop: '10px' }} disabled={saving}>
              {saving ? <><Loader2 className={styles.loadingSpinner} /> Simulating Payment…</> : 'Pay & Add Credits'}
            </button>
          </form>
        </div>

        {/* Right Side: Pricing Scenarios Explanation */}
        <div style={{ border: '1px solid var(--color-border)', borderRadius: '8px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <HelpCircle size={16} />
            <span>Dynamic Pricing Tariff Rules</span>
          </h3>

          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>Our pricing uses a tier-based progressive tariff:</div>
            <ul style={{ paddingLeft: '16px', listStyleType: 'disc', margin: '4px 0' }}>
              <li><b>₹{config.tier2_threshold.toLocaleString()}+ Payment:</b> Highly discounted rate of <b>₹{tier2Rate.toFixed(2)} / copy</b> (e.g., ₹{config.tier2_threshold.toLocaleString()} yields {config.tier2_copies} copies).</li>
              <li><b>₹{config.tier1_threshold.toLocaleString()}+ Payment:</b> Standard rate of <b>₹{tier1Rate.toFixed(2)} / copy</b> (e.g., ₹{config.tier1_threshold.toLocaleString()} yields {config.tier1_copies} copies).</li>
              <li><b>Under ₹{config.tier1_threshold.toLocaleString()}:</b> Base rate of <b>₹{config.base_rate.toFixed(2)} / copy</b>.</li>
            </ul>
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '8px 0' }} />
            <div><b>Scenario 1 (Cumulative Balance):</b></div>
            <div style={{ fontStyle: 'italic' }}>
              Day 1: Pay ₹{config.tier1_threshold} → Added {calculateCopiesPreview(config.tier1_threshold)} copies.<br />
              Day 100: Pay ₹{config.tier2_threshold} → Added {calculateCopiesPreview(config.tier2_threshold)} copies. Balance becomes cumulative.
            </div>
            <hr style={{ border: 'none', borderTop: '1px solid var(--color-border)', margin: '8px 0' }} />
            <div><b>Scenario 2 (Consumption & Recharge):</b></div>
            <div style={{ fontStyle: 'italic' }}>
              Day 1: Pay ₹{config.tier1_threshold} → Added {calculateCopiesPreview(config.tier1_threshold)} copies. Same day generate 15 letters → Counter updates.<br />
              Day 30: Pay ₹{config.tier2_threshold} → Added {calculateCopiesPreview(config.tier2_threshold)} copies. New balance: (remaining) + {calculateCopiesPreview(config.tier2_threshold)} copies.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
