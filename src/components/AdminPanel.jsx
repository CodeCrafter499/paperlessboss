import React, { useState, useEffect } from 'react';
import { Settings, Shield, IndianRupee, Hash, Loader2, AlertCircle, CheckCircle, Plus, Trash2, Edit, Eye, EyeOff, X } from 'lucide-react';
import { billingApi } from '../utils/authApi';
import styles from './ProfileForms.module.css';

export default function AdminPanel() {
  const [activeSubTab, setActiveSubTab] = useState('billing_config'); // 'billing_config' or 'subscription_plans'
  const [formData, setFormData] = useState({
    tier2_threshold: 1000,
    tier2_copies: 45,
    tier1_threshold: 500,
    tier1_copies: 20,
    base_rate: 30,
  });

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });

  // Plan editing form state
  const [editingPlan, setEditingPlan] = useState(null); // null, or { isNew: true }, or plan object

  // Load config on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const configData = await billingApi.getConfig();
      setFormData({
        tier2_threshold: configData.tier2_threshold,
        tier2_copies: configData.tier2_copies,
        tier1_threshold: configData.tier1_threshold,
        tier1_copies: configData.tier1_copies,
        base_rate: configData.base_rate,
      });

      const plansData = await billingApi.getPlans(false);
      setPlans(plansData);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to load configurations.' });
    } finally {
      setLoading(false);
    }
  };

  const handleConfigChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  const handleConfigSubmit = async (e) => {
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
      setStatus({ type: 'success', message: 'Billing quota configuration updated successfully.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to update billing configuration.' });
    } finally {
      setSaving(false);
    }
  };

  // Plan editing handlers
  const handleEditPlan = (plan) => {
    setEditingPlan({
      id: plan.id,
      name: plan.name,
      min_employees: plan.min_employees,
      max_employees: plan.max_employees || '',
      price: plan.price,
      is_custom: plan.is_custom,
      is_active: plan.is_active,
      features: plan.features,
    });
  };

  const handleAddNewPlan = () => {
    setEditingPlan({
      isNew: true,
      name: '',
      min_employees: 1,
      max_employees: '',
      price: 0,
      is_custom: false,
      is_active: true,
      features: '',
    });
  };

  const handlePlanFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingPlan((prev) => {
      if (!prev) return null;
      let val = value;
      if (type === 'checkbox') {
        val = checked;
      } else if (name === 'min_employees' || name === 'price') {
        val = parseFloat(value) || 0;
      } else if (name === 'max_employees') {
        val = value === '' ? '' : parseInt(value, 10);
      }
      return {
        ...prev,
        [name]: val,
      };
    });
  };

  const handleSavePlanSubmit = async (e) => {
    e.preventDefault();
    if (!editingPlan) return;
    setStatus({ type: '', message: '' });
    setSaving(true);

    const payload = {
      name: editingPlan.name,
      min_employees: parseInt(editingPlan.min_employees, 10),
      max_employees: editingPlan.max_employees === '' ? null : parseInt(editingPlan.max_employees, 10),
      price: editingPlan.is_custom ? 0.0 : parseFloat(editingPlan.price),
      is_custom: !!editingPlan.is_custom,
      is_active: !!editingPlan.is_active,
      features: editingPlan.features,
    };

    try {
      if (editingPlan.isNew) {
        await billingApi.createPlan(payload);
        setStatus({ type: 'success', message: 'New subscription plan created successfully.' });
      } else {
        await billingApi.updatePlan(editingPlan.id, payload);
        setStatus({ type: 'success', message: 'Subscription plan updated successfully.' });
      }
      setEditingPlan(null);
      // Reload plans
      const plansData = await billingApi.getPlans(false);
      setPlans(plansData);
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to save subscription plan.' });
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePlanActive = async (plan) => {
    try {
      const payload = {
        name: plan.name,
        min_employees: plan.min_employees,
        max_employees: plan.max_employees,
        price: plan.price,
        is_custom: plan.is_custom,
        is_active: !plan.is_active,
        features: plan.features,
      };
      await billingApi.updatePlan(plan.id, payload);
      // Update local state
      setPlans((prev) =>
        prev.map((p) => (p.id === plan.id ? { ...p, is_active: !p.is_active } : p))
      );
      setStatus({ type: 'success', message: `Plan "${plan.name}" visibility updated.` });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to toggle plan status.' });
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm("Are you sure you want to delete this subscription plan?")) return;
    setStatus({ type: '', message: '' });

    try {
      await billingApi.deletePlan(id);
      setPlans((prev) => prev.filter((p) => p.id !== id));
      setStatus({ type: 'success', message: 'Subscription plan deleted successfully.' });
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to delete subscription plan.' });
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
    <div className={styles.card} style={{ maxWidth: '900px' }}>
      <div className={styles.cardHeader} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ background: 'rgba(46, 125, 50, 0.1)', padding: '8px', borderRadius: '8px', color: 'var(--color-primary)' }}>
          <Shield size={24} />
        </div>
        <div>
          <h2 className={styles.title}>Admin Billing & Subscriptions</h2>
          <p className={styles.subtitle}>Configure dynamic billing quotas and manage active subscription pricing tiers.</p>
        </div>
      </div>

      <div className={styles.tabsContainer} style={{ display: 'flex', gap: '16px', borderBottom: '1px solid var(--color-gray-200)', marginBottom: '24px', paddingBottom: '4px' }}>
        <button
          type="button"
          onClick={() => { setActiveSubTab('billing_config'); setStatus({ type: '', message: '' }); }}
          className={`${styles.tabButton} ${activeSubTab === 'billing_config' ? styles.tabButtonActive : ''}`}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 600,
            color: activeSubTab === 'billing_config' ? 'var(--color-primary)' : 'var(--color-gray-500)',
            borderBottom: activeSubTab === 'billing_config' ? '2px solid var(--color-primary)' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Quota & Pricing Config
        </button>
        <button
          type="button"
          onClick={() => { setActiveSubTab('subscription_plans'); setStatus({ type: '', message: '' }); }}
          className={`${styles.tabButton} ${activeSubTab === 'subscription_plans' ? styles.tabButtonActive : ''}`}
          style={{
            background: 'none',
            border: 'none',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 600,
            color: activeSubTab === 'subscription_plans' ? 'var(--color-primary)' : 'var(--color-gray-500)',
            borderBottom: activeSubTab === 'subscription_plans' ? '2px solid var(--color-primary)' : '2px solid transparent',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          Manage Subscription Plans
        </button>
      </div>

      {status.message && (
        <div className={`${styles.statusMessage} ${
          status.type === 'success' ? styles.statusSuccess : styles.statusError
        }`} style={{ marginBottom: '20px' }}>
          {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{status.message}</span>
        </div>
      )}

      {/* TAB 1: Billing Config */}
      {activeSubTab === 'billing_config' && (
        <form className={styles.form} onSubmit={handleConfigSubmit} noValidate>
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
                  onChange={handleConfigChange}
                  placeholder="30"
                  className={styles.input}
                  disabled={saving}
                  min="0.01"
                  step="0.01"
                />
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }}><hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-200)' }} /></div>

            {/* Tier 1 Threshold */}
            <div className={styles.field}>
              <label className={styles.label}>Tier 1 Threshold (₹)</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><IndianRupee size={16} /></span>
                <input
                  type="number"
                  name="tier1_threshold"
                  value={formData.tier1_threshold}
                  onChange={handleConfigChange}
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
                  onChange={handleConfigChange}
                  placeholder="20"
                  className={styles.input}
                  disabled={saving}
                  min="1"
                />
              </div>
            </div>

            <div style={{ gridColumn: 'span 2' }}><hr style={{ border: 'none', borderTop: '1px solid var(--color-gray-200)' }} /></div>

            {/* Tier 2 Threshold */}
            <div className={styles.field}>
              <label className={styles.label}>Tier 2 Threshold (₹)</label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}><IndianRupee size={16} /></span>
                <input
                  type="number"
                  name="tier2_threshold"
                  value={formData.tier2_threshold}
                  onChange={handleConfigChange}
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
                  onChange={handleConfigChange}
                  placeholder="45"
                  className={styles.input}
                  disabled={saving}
                  min="1"
                />
              </div>
            </div>
          </div>

          <div className={styles.actions} style={{ marginTop: '20px' }}>
            <button type="submit" className={styles.btn} disabled={saving}>
              {saving ? <><Loader2 className={styles.loadingSpinner} /> Saving Settings…</> : 'Save Configuration'}
            </button>
          </div>
        </form>
      )}

      {/* TAB 2: Subscription Plans CRUD */}
      {activeSubTab === 'subscription_plans' && editingPlan && (
        <form onSubmit={handleSavePlanSubmit} className={styles.form}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-gray-800)', marginBottom: '8px' }}>
            {editingPlan.isNew ? 'Create New Subscription Plan' : `Edit Subscription Plan: ${editingPlan.name}`}
          </h3>
          <div className={styles.grid}>
            {/* Name */}
            <div className={styles.field}>
              <label className={styles.label}>Plan Name</label>
              <input
                type="text"
                name="name"
                value={editingPlan.name}
                onChange={handlePlanFormChange}
                placeholder="e.g. Starter"
                className={styles.input}
                required
                disabled={saving}
              />
            </div>

            {/* Price Option */}
            <div className={styles.field}>
              <label className={styles.label}>Price Configuration</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', height: '42px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="is_custom"
                    checked={editingPlan.is_custom}
                    onChange={handlePlanFormChange}
                    disabled={saving}
                  />
                  Custom / Quote Pricing (displays "Custom" or contact option)
                </label>
              </div>
            </div>

            {/* Price (if not custom) */}
            {!editingPlan.is_custom && (
              <div className={styles.field}>
                <label className={styles.label}>Monthly Price (₹)</label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}><IndianRupee size={16} /></span>
                  <input
                    type="number"
                    name="price"
                    value={editingPlan.price}
                    onChange={handlePlanFormChange}
                    placeholder="499"
                    className={styles.input}
                    required
                    min="0"
                    disabled={saving}
                  />
                </div>
              </div>
            )}

            {/* Employee Min */}
            <div className={styles.field}>
              <label className={styles.label}>Min Employees</label>
              <input
                type="number"
                name="min_employees"
                value={editingPlan.min_employees}
                onChange={handlePlanFormChange}
                placeholder="1"
                className={styles.input}
                required
                min="0"
                disabled={saving}
              />
            </div>

            {/* Employee Max */}
            <div className={styles.field}>
              <label className={styles.label}>Max Employees (leave blank for unlimited/500+)</label>
              <input
                type="number"
                name="max_employees"
                value={editingPlan.max_employees}
                onChange={handlePlanFormChange}
                placeholder="e.g. 25"
                className={styles.input}
                min="0"
                disabled={saving}
              />
            </div>

            {/* Active status */}
            <div className={styles.field}>
              <label className={styles.label}>Visibility status</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', height: '42px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={editingPlan.is_active}
                    onChange={handlePlanFormChange}
                    disabled={saving}
                  />
                  Active (Visible on Landing Page)
                </label>
              </div>
            </div>

            {/* Features list */}
            <div className={styles.field} style={{ gridColumn: 'span 2' }}>
              <label className={styles.label}>Features (Comma-separated list)</label>
              <textarea
                name="features"
                value={editingPlan.features}
                onChange={handlePlanFormChange}
                placeholder="e.g. Appointment Letters, Wage Slips, Document Storage"
                className={styles.input}
                style={{ minHeight: '80px', padding: '10px 14px', fontFamily: 'inherit', resize: 'vertical' }}
                required
                disabled={saving}
              />
              <p style={{ fontSize: '11px', color: 'var(--color-gray-400)', marginTop: '2px' }}>
                Provide comma-separated features that will appear as bullet points on the pricing cards.
              </p>
            </div>
          </div>

          <div className={styles.actions} style={{ marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setEditingPlan(null)}
              className={styles.btnSecondary}
              style={{
                background: 'none',
                border: '1px solid var(--color-gray-300)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer'
              }}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className={styles.btn} disabled={saving}>
              {saving ? <Loader2 className={styles.loadingSpinner} /> : 'Save Plan'}
            </button>
          </div>
        </form>
      )}

      {activeSubTab === 'subscription_plans' && !editingPlan && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--color-gray-800)' }}>Active Tiers</h3>
            <button
              type="button"
              onClick={handleAddNewPlan}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                backgroundColor: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                padding: '8px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Plus size={14} /> Add Plan
            </button>
          </div>

          {plans.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--color-gray-400)' }}>
              No subscription plans found.
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className={styles.desktopOnly} style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--color-gray-200)', color: 'var(--color-gray-600)', fontWeight: 600 }}>
                      <th style={{ padding: '12px 8px' }}>Plan Name</th>
                      <th style={{ padding: '12px 8px' }}>Employees</th>
                      <th style={{ padding: '12px 8px' }}>Price (Monthly)</th>
                      <th style={{ padding: '12px 8px' }}>Status</th>
                      <th style={{ padding: '12px 8px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plans.map((plan) => (
                      <tr key={plan.id} style={{ borderBottom: '1px solid var(--color-gray-100)', verticalAlign: 'middle' }}>
                        <td style={{ padding: '14px 8px', fontWeight: 600, color: 'var(--color-gray-800)' }}>{plan.name}</td>
                        <td style={{ padding: '14px 8px', color: 'var(--color-gray-600)' }}>
                          {plan.min_employees}{plan.max_employees ? `–${plan.max_employees}` : '+'}
                        </td>
                        <td style={{ padding: '14px 8px', color: 'var(--color-gray-800)', fontWeight: 600 }}>
                          {plan.is_custom ? 'Custom' : `₹${parseFloat(plan.price).toLocaleString('en-IN')}`}
                        </td>
                        <td style={{ padding: '14px 8px' }}>
                          <button
                            type="button"
                            onClick={() => handleTogglePlanActive(plan)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              backgroundColor: plan.is_active ? 'rgba(76, 175, 80, 0.1)' : 'rgba(158, 158, 158, 0.1)',
                              color: plan.is_active ? '#2e7d32' : '#616161',
                            }}
                          >
                            {plan.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                            {plan.is_active ? 'Active' : 'Inactive'}
                          </button>
                        </td>
                        <td style={{ padding: '14px 8px', textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button
                              type="button"
                              onClick={() => handleEditPlan(plan)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: 'var(--color-gray-500)',
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '4px',
                                borderRadius: '4px',
                              }}
                              title="Edit Plan"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeletePlan(plan.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#c62828',
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '4px',
                                borderRadius: '4px',
                              }}
                              title="Delete Plan"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className={styles.mobileOnly} style={{ display: 'none' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {plans.map((plan) => (
                    <div key={plan.id} style={{ border: '1px solid var(--color-gray-200)', borderRadius: '8px', padding: '16px', background: 'var(--color-bg-surface)', boxShadow: 'var(--shadow-sm)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontWeight: 600, fontSize: '15px', color: 'var(--color-gray-800)' }}>{plan.name}</span>
                        <button
                          type="button"
                          onClick={() => handleTogglePlanActive(plan)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            backgroundColor: plan.is_active ? 'rgba(76, 175, 80, 0.1)' : 'rgba(158, 158, 158, 0.1)',
                            color: plan.is_active ? '#2e7d32' : '#616161',
                          }}
                        >
                          {plan.is_active ? <Eye size={12} /> : <EyeOff size={12} />}
                          {plan.is_active ? 'Active' : 'Inactive'}
                        </button>
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-gray-600)', marginBottom: '4px' }}>
                        <strong>Employees:</strong> {plan.min_employees}{plan.max_employees ? `–${plan.max_employees}` : '+'}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-gray-800)', fontWeight: 600, marginBottom: '12px' }}>
                        <strong>Price:</strong> {plan.is_custom ? 'Custom' : `₹${parseFloat(plan.price).toLocaleString('en-IN')}`}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', borderTop: '1px solid var(--color-gray-100)', paddingTop: '10px' }}>
                        <button
                          type="button"
                          onClick={() => handleEditPlan(plan)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-gray-600)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePlan(plan.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c62828', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '13px' }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
