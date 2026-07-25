import React, { useState, useEffect } from 'react';
import { useSeo } from '../hooks/useSeo';
import styles from './LegalPage.module.css';

export default function PrivacyPage() {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useSeo({
    title: 'Privacy Policy - PaperlessBoss',
    description: 'Read the privacy policy for PaperlessBoss Labour Compliance Platform.',
    noIndex: true,
  });

  useEffect(() => {
    fetch('/privacy.txt')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load privacy policy');
        return res.text();
      })
      .then((text) => {
        setContent(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setContent('Privacy Policy document is currently unavailable. Please contact support.');
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Privacy Policy</h1>
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
