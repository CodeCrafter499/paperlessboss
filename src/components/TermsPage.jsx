import React, { useState, useEffect } from 'react';
import { useSeo } from '../hooks/useSeo';
import styles from './LegalPage.module.css';

export default function TermsPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useSeo({
    title: 'Terms and Conditions - PaperlessBoss',
    description: 'Read the terms and conditions for using the PaperlessBoss Labour Compliance Platform.',
    noIndex: true,
  });

  useEffect(() => {
    fetch('/terms.txt')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load terms');
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setContent('Terms & Conditions document is currently unavailable. Please contact support.');
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Terms & Conditions</h1>
        <p className={styles.subtitle}>Last updated: July 2026</p>
        {loading ? (
          <div className={styles.loading}>Loading document...</div>
        ) : (
          <div className={styles.content}>{content}</div>
        )}
      </div>
    </div>
  );
}
