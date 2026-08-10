import React, { useState, useEffect } from 'react';
import { ShieldCheck, Sparkles, Loader2, AlertCircle, CheckCircle, Check, ChevronRight, Zap, FileText, Calendar, Users } from 'lucide-react';
import { billingApi } from '../utils/authApi';
import styles from './ProfileForms.module.css';

export default function BillingTab() {
  const [subStatus, setSubStatus] = useState(null);
  const [plans, setPlans] = useState([]);
  const [planAddons, setPlanAddons] = useState({ overage_rate: 15, docx_addon_price: 299 });
  const [loading, setLoading] = useState(true);
  const [payingPlan, setPayingPlan] = useState(null);
  const [extraEmployees, setExtraEmployees] = useState(1);
  const [status, setStatus] = useState({ type: '', message: '' });

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const [subData, plansData, addonsData] = await Promise.all([
        billingApi.getSubscriptionStatus().catch(() => null),
        billingApi.getPlans(true).catch(() => []),
        billingApi.getPlanAddons().catch(() => null),
      ]);

      setSubStatus(subData);
      setPlans(plansData || []);
      if (addonsData) setPlanAddons(addonsData);
    } catch (err) {
      console.error('Failed to load subscription info:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBillingData();
  }, []);

  const handleSubscribePlan = async (plan) => {
    if (plan.is_custom) {
      window.location.href = 'mailto:contact@paperlessboss.com';
      return;
    }

    setStatus({ type: '', message: '' });
    setPayingPlan(plan.id || plan.name);

    try {
      const res = await billingApi.initiatePhonePe(plan.price, `plan_${plan.name}`);
      if (res && res.redirect_url) {
        window.location.href = res.redirect_url;
      } else {
        throw new Error('No redirect URL returned from payment gateway.');
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to initiate plan payment.' });
    } finally {
      setPayingPlan(null);
    }
  };

  const handleBuyDocxAddon = async () => {
    setStatus({ type: '', message: '' });
    setPayingPlan('addon_docx');

    try {
      const price = planAddons.docx_addon_price || 299;
      const res = await billingApi.initiatePhonePe(price, 'addon_docx');
      if (res && res.redirect_url) {
        window.location.href = res.redirect_url;
      } else {
        throw new Error('No redirect URL returned from payment gateway.');
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to initiate DOCX add-on payment.' });
    } finally {
      setPayingPlan(null);
    }
  };

  const handleBuyOverage = async () => {
    const quantity = Math.max(1, Number(extraEmployees) || 1);
    const amount = quantity * (planAddons.overage_rate || 15);

    setStatus({ type: '', message: '' });
    setPayingPlan('addon_overage');

    try {
      const res = await billingApi.initiatePhonePe(amount, `addon_overage_${quantity}`);
      if (res && res.redirect_url) {
        window.location.href = res.redirect_url;
      } else {
        throw new Error('No redirect URL returned from payment gateway.');
      }
    } catch (err) {
      setStatus({ type: 'error', message: err.message || 'Failed to initiate employee overage payment.' });
    } finally {
      setPayingPlan(null);
    }
  };

  const isPlanActive = subStatus?.is_active;
  const activePlanName = subStatus?.plan_name || 'No Active Plan';
  const isDocxActive = subStatus?.is_docx_active;
  const companyEmployees = subStatus?.company_employee_count || 0;
  const maxEmployees = subStatus?.max_employees || 0;
  const overageRate = planAddons.overage_rate || 15;
  const extraNeeded = Math.max(0, companyEmployees - maxEmployees);
  const overageAmount = Math.max(1, Number(extraEmployees) || 1) * overageRate;

  useEffect(() => {
    const nextValue = maxEmployees > 0 ? Math.max(1, companyEmployees - maxEmployees + 1) : 1;
    setExtraEmployees(nextValue);
  }, [companyEmployees, maxEmployees]);

  if (loading) {
    return (
      <div className={styles.card} style={{ display: 'flex', justifyContent: 'center', padding: '50px 0' }}>
        <Loader2 className={styles.loadingSpinner} style={{ width: 28, height: 28, borderTopColor: 'var(--color-primary)' }} />
      </div>
    );
  }

  const formatDate = (dtStr) => {
    if (!dtStr) return 'N/A';
    try {
      return new Date(dtStr).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch (e) {
      return dtStr;
    }
  };

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <h2 className={styles.title}>Subscription &amp; Billing</h2>
        <p className={styles.subtitle}>
          Subscribe to a monthly plan for unlimited PDF document generation and re-downloads up to your employee limit.
        </p>
      </div>

      {status.message && (
        <div className={`${styles.statusMessage} ${status.type === 'success' ? styles.statusSuccess : styles.statusError}`} style={{ marginBottom: '20px' }}>
          {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          <span>{status.message}</span>
        </div>
      )}

      {/* ── 1. ACTIVE SUBSCRIPTION STATUS CARD ── */}
      <div style={{
        background: isPlanActive 
          ? 'linear-gradient(135deg, rgba(46, 125, 50, 0.12) 0%, rgba(27, 94, 32, 0.04) 100%)'
          : 'linear-gradient(135deg, rgba(220, 53, 69, 0.1) 0%, rgba(108, 117, 125, 0.04) 100%)',
        border: isPlanActive ? '1px solid rgba(46, 125, 50, 0.3)' : '1px solid rgba(220, 53, 69, 0.3)',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '28px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: 44, height: 44, borderRadius: '10px',
              background: isPlanActive ? 'var(--color-primary)' : '#dc3545',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff'
            }}>
              <ShieldCheck size={24} />
            </div>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', opacity: 0.75, fontWeight: 600 }}>
                Current Subscription Status
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>{activePlanName}</span>
                <span style={{
                  fontSize: '11px', padding: '2px 10px', borderRadius: '100px', fontWeight: 700,
                  background: isPlanActive ? '#10b981' : '#dc3545', color: '#fff', textTransform: 'uppercase'
                }}>
                  {isPlanActive ? 'Active' : 'Inactive / Expired'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
            {/* Validity */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} style={{ opacity: 0.6 }} />
              <div>
                <div style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)' }}>Plan Expiry</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {isPlanActive ? `${formatDate(subStatus.end_date)} (${subStatus.days_remaining}d left)` : 'No Active Plan'}
                </div>
              </div>
            </div>

            {/* Employee Quota */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users size={18} style={{ opacity: 0.6 }} />
              <div>
                <div style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)' }}>Employee Usage</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                  {companyEmployees} / {maxEmployees > 0 ? maxEmployees : '∞'} Employees
                </div>
              </div>
            </div>

            {/* DOCX Addon */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={18} style={{ color: isDocxActive ? '#6f42c1' : 'inherit', opacity: isDocxActive ? 1 : 0.5 }} />
              <div>
                <div style={{ fontSize: '10.5px', color: 'var(--color-text-secondary)' }}>Editable DOCX Add-on</div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: isDocxActive ? '#6f42c1' : 'var(--color-text-primary)' }}>
                  {isDocxActive ? `Active (${subStatus.docx_addon_end_date ? formatDate(subStatus.docx_addon_end_date) : 'Active'})` : 'Not Active'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 2. SUBSCRIPTION PLANS ── */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
          <Zap size={18} color="var(--color-primary)" />
          <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Choose or Upgrade Subscription Plan</h3>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}>
          {plans.map((plan) => {
            const isCurrentPlan = isPlanActive && subStatus?.plan_name?.toLowerCase() === plan.name.toLowerCase();
            const isPopular = plan.name.toLowerCase() === 'professional' || plan.name.toLowerCase() === 'growth';
            const employeeLabel = plan.max_employees
              ? `Up to ${plan.max_employees.toLocaleString()} Employees`
              : `${plan.min_employees.toLocaleString()}+ Employees`;
            const featuresList = plan.features
              ? plan.features.split(',').map(f => f.trim()).filter(Boolean)
              : [];
            const isProcessingThis = payingPlan === plan.id || payingPlan === plan.name;

            return (
              <div key={plan.id} style={{
                position: 'relative',
                border: isCurrentPlan
                  ? '2px solid #10b981'
                  : isPopular
                  ? '2px solid var(--color-primary)'
                  : '1px solid var(--color-border)',
                borderRadius: '12px',
                padding: '20px 18px',
                background: isCurrentPlan
                  ? 'rgba(16,185,129,0.04)'
                  : isPopular
                  ? 'rgba(46,125,50,0.04)'
                  : 'var(--color-bg-surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'box-shadow 0.2s',
              }}>
                {isCurrentPlan ? (
                  <div style={{
                    position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                    background: '#10b981', color: '#fff',
                    fontSize: '9px', fontWeight: 700, padding: '2px 10px',
                    borderRadius: '100px', textTransform: 'uppercase', whiteSpace: 'nowrap', letterSpacing: '0.5px'
                  }}>Current Plan</div>
                ) : isPopular ? (
                  <div style={{
                    position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                    background: 'var(--color-primary)', color: '#fff',
                    fontSize: '9px', fontWeight: 700, padding: '2px 10px',
                    borderRadius: '100px', textTransform: 'uppercase', whiteSpace: 'nowrap', letterSpacing: '0.5px'
                  }}>Most Popular</div>
                ) : null}

                {/* Plan Header */}
                <div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--color-text-primary)' }}>{plan.name}</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{employeeLabel}</div>
                </div>

                {/* Price */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
                  {plan.is_custom ? (
                    <span style={{ fontSize: '22px', fontWeight: 800, color: 'var(--color-text-primary)' }}>Custom</span>
                  ) : (
                    <>
                      <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)' }}>₹</span>
                      <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--color-text-primary)', lineHeight: 1 }}>
                        {Math.round(plan.price).toLocaleString()}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginLeft: '2px' }}>/month</span>
                    </>
                  )}
                </div>

                {/* Features */}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  {featuresList.map((feat, fIdx) => (
                    <li key={fIdx} style={{ display: 'flex', alignItems: 'flex-start', gap: '6px', fontSize: '11.5px', color: 'var(--color-text-secondary)' }}>
                      <Check size={13} style={{ color: '#10b981', flexShrink: 0, marginTop: '2px' }} />
                      {feat}
                    </li>
                  ))}
                </ul>

                {/* Subscribe Action */}
                {isCurrentPlan ? (
                  <button
                    disabled
                    style={{
                      width: '100%', padding: '9px', borderRadius: '6px', border: '1px solid #10b981',
                      background: 'rgba(16,185,129,0.1)', color: '#10b981', fontWeight: 700, fontSize: '12px',
                      cursor: 'default', marginTop: 'auto'
                    }}
                  >
                    Active Plan
                  </button>
                ) : plan.is_custom ? (
                  <a
                    href="mailto:contact@paperlessboss.com"
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                      fontSize: '12px', fontWeight: 700, padding: '9px', borderRadius: '6px',
                      textDecoration: 'none', marginTop: 'auto', background: 'var(--color-primary)', color: '#fff'
                    }}
                  >
                    Contact Sales <ChevronRight size={14} />
                  </a>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubscribePlan(plan)}
                    disabled={payingPlan !== null}
                    style={{
                      width: '100%', padding: '9px', borderRadius: '6px', border: 'none',
                      background: isPopular ? 'var(--color-primary)' : 'var(--color-primary)',
                      color: '#fff', fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                      marginTop: 'auto', opacity: payingPlan !== null ? 0.7 : 1
                    }}
                  >
                    {isProcessingThis ? (
                      <><Loader2 className={styles.loadingSpinner} style={{ width: 14, height: 14 }} /> Redirecting…</>
                    ) : (
                      <>Subscribe for ₹{Math.round(plan.price).toLocaleString()} <ChevronRight size={14} /></>
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── 3. PLAN ADD-ONS SECTION ── */}
      <div style={{ border: '1px solid var(--color-border)', borderRadius: '12px', padding: '20px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={18} style={{ color: '#6f42c1' }} />
          <span>Plan Add-ons &amp; Overage Rules</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Overage Policy */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(13,110,253,0.06), rgba(13,110,253,0.02))',
            border: '1px solid rgba(13,110,253,0.2)',
            borderRadius: '10px', padding: '16px'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#1565c0', fontWeight: 700, marginBottom: '4px' }}>
              Flexible Overage Rate
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              ₹{overageRate} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--color-text-secondary)' }}>/employee/month</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', margin: '8px 0 12px', lineHeight: 1.5 }}>
              {extraNeeded > 0
                ? `You currently need ${extraNeeded} additional employee${extraNeeded === 1 ? '' : 's'} to stay within your current plan window.`
                : 'Need a few more employees than your plan covers? Pay ₹' + overageRate + '/employee for the next 30 days and keep the same plan active for your additional team size.'}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
              <label htmlFor="extra-employees" style={{ fontSize: '12px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
                Extra employees
              </label>
              <input
                id="extra-employees"
                type="number"
                min={1}
                step={1}
                value={extraEmployees}
                onChange={(e) => setExtraEmployees(Math.max(1, Number(e.target.value) || 1))}
                style={{
                  width: '82px', padding: '7px 8px', borderRadius: '6px', border: '1px solid var(--color-border)',
                  background: 'var(--color-bg-surface)', color: 'var(--color-text-primary)', fontWeight: 600, fontSize: '12px'
                }}
              />
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-text-primary)', fontWeight: 700, marginBottom: '10px' }}>
              Total: ₹{overageAmount.toLocaleString()} for 30 days
            </div>

            <button
              type="button"
              onClick={handleBuyOverage}
              disabled={payingPlan !== null}
              style={{
                width: '100%', padding: '9px', borderRadius: '6px', border: 'none',
                background: '#1565c0', color: '#fff', fontWeight: 700, fontSize: '12px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}
            >
              {payingPlan === 'addon_overage' ? (
                <><Loader2 className={styles.loadingSpinner} style={{ width: 14, height: 14 }} /> Redirecting…</>
              ) : (
                <>Continue for 30 days <ChevronRight size={14} /></>
              )}
            </button>
          </div>

          {/* DOCX Add-on */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(111,66,193,0.06), rgba(111,66,193,0.02))',
            border: '1px solid rgba(111,66,193,0.2)',
            borderRadius: '10px', padding: '16px',
            display: 'flex', flexDirection: 'column'
          }}>
            <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', color: '#6f42c1', fontWeight: 700, marginBottom: '4px' }}>
              Editable DOCX Appointment Letters
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
              ₹{planAddons.docx_addon_price} <span style={{ fontSize: '12px', fontWeight: 400, color: 'var(--color-text-secondary)' }}>/month</span>
            </div>
            <p style={{ fontSize: '11.5px', color: 'var(--color-text-secondary)', margin: '8px 0 12px', lineHeight: 1.5 }}>
              Upgrade any plan to download fully editable Word (.docx) appointment letters in addition to standard PDF format.
            </p>
            {isDocxActive ? (
              <div style={{
                marginTop: 'auto', padding: '8px 12px', borderRadius: '6px',
                background: 'rgba(111,66,193,0.15)', color: '#6f42c1', fontWeight: 700,
                fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px'
              }}>
                <CheckCircle size={14} /> DOCX Add-on Active
              </div>
            ) : (
              <button
                type="button"
                onClick={handleBuyDocxAddon}
                disabled={payingPlan !== null}
                style={{
                  marginTop: 'auto', width: '100%', padding: '9px', borderRadius: '6px',
                  border: 'none', background: '#6f42c1', color: '#fff', fontWeight: 700,
                  fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                }}
              >
                {payingPlan === 'addon_docx' ? (
                  <><Loader2 className={styles.loadingSpinner} style={{ width: 14, height: 14 }} /> Redirecting…</>
                ) : (
                  <>Activate DOCX Add-on (₹{planAddons.docx_addon_price}) <ChevronRight size={14} /></>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
