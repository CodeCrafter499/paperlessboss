import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { billingApi } from '../utils/authApi';
import { useSeo } from '../hooks/useSeo';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import styles from './LegalPage.module.css';

export default function PaymentStatus() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const merchantTransactionId = searchParams.get('transactionId') || searchParams.get('merchantTransactionId');

  const [status, setStatus] = useState('checking'); // 'checking', 'success', 'failed'
  const [details, setDetails] = useState(null);

  useSeo({
    title: 'Payment Status - PaperlessBoss',
    description: 'Check the status of your payment transaction.',
    noIndex: true,
  });

  useEffect(() => {
    if (!merchantTransactionId) {
      setStatus('failed');
      return;
    }

    let attempts = 0;
    const maxAttempts = 10;
    const intervalTime = 3000;

    const checkPayment = async () => {
      try {
        const res = await billingApi.getPhonePeStatus(merchantTransactionId);
        if (res.status === 'SUCCESS') {
          setStatus('success');
          setDetails(res);
          return true; // Stop polling
        } else if (res.status === 'FAILED') {
          setStatus('failed');
          setDetails(res);
          return true; // Stop polling
        }
        setDetails(res);
      } catch (err) {
        console.error('Error fetching transaction status:', err);
      }
      return false;
    };

    // Initial check
    checkPayment().then((stop) => {
      if (stop) return;

      // Start polling if still pending
      const interval = setInterval(async () => {
        attempts += 1;
        const stopPolling = await checkPayment();
        if (stopPolling || attempts >= maxAttempts) {
          clearInterval(interval);
          if (attempts >= maxAttempts && status === 'checking') {
            setStatus('failed');
          }
        }
      }, intervalTime);

      return () => clearInterval(interval);
    });
  }, [merchantTransactionId]);

  return (
    <div className={styles.container} style={{ maxWidth: '600px', paddingTop: '120px' }}>
      <div className={styles.card} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        
        {status === 'checking' && (
          <>
            <Loader2 style={{ width: 48, height: 48, color: 'var(--color-primary)', animation: 'spin 1s linear infinite' }} />
            <h1 className={styles.title} style={{ fontSize: '28px' }}>Verifying Payment</h1>
            <p style={{ color: 'var(--color-gray-500)' }}>Please do not close this window or click go back. We are checking the transaction status with PhonePe...</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle2 style={{ width: 64, height: 64, color: '#10B981' }} />
            <h1 className={styles.title} style={{ fontSize: '28px', color: '#10B981' }}>Payment Successful!</h1>
            <p style={{ color: 'var(--color-gray-600)', fontSize: '15px' }}>
              Your payment has been successfully completed. 
              {details && (
                <span style={{ display: 'block', marginTop: '10px', fontWeight: '500' }}>
                  Added {details.copies_added} copies to your balance.
                </span>
              )}
            </p>
            <div style={{ background: 'var(--color-gray-100)', padding: '12px 20px', borderRadius: '12px', fontSize: '13px', color: 'var(--color-gray-600)', width: '100%' }}>
              <strong>Transaction ID:</strong> {merchantTransactionId}
            </div>
            <button 
              onClick={() => navigate('/app')} 
              style={{
                marginTop: '10px',
                padding: '12px 24px',
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.9}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              Go to Workspace Dashboard
            </button>
          </>
        )}

        {status === 'failed' && (
          <>
            <AlertTriangle style={{ width: 64, height: 64, color: '#EF4444' }} />
            <h1 className={styles.title} style={{ fontSize: '28px', color: '#EF4444' }}>Payment Failed</h1>
            <p style={{ color: 'var(--color-gray-600)', fontSize: '15px' }}>
              We could not verify your payment transaction. If money was deducted, it will be refunded, or you can contact support.
            </p>
            {merchantTransactionId && (
              <div style={{ background: 'var(--color-gray-100)', padding: '12px 20px', borderRadius: '12px', fontSize: '13px', color: 'var(--color-gray-600)', width: '100%' }}>
                <strong>Transaction ID:</strong> {merchantTransactionId}
              </div>
            )}
            <button 
              onClick={() => navigate('/app')} 
              style={{
                marginTop: '10px',
                padding: '12px 24px',
                background: 'var(--color-primary)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                width: '100%',
                transition: 'opacity 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.opacity = 0.9}
              onMouseOut={(e) => e.currentTarget.style.opacity = 1}
            >
              Return to Billing Tab
            </button>
          </>
        )}

      </div>
    </div>
  );
}
