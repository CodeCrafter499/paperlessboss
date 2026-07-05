import React from 'react';
import { useSeo } from '../hooks/useSeo';
import styles from './About.module.css';

export default function About() {
  useSeo({
    title: 'Our Mission & Vision',
    description: 'Learn about PaperlessBoss by CodeCrafters Inc. Our mission is to automate legal, regulatory, and formatting validations for corporate documentation.',
    keywords: ['about PaperlessBoss', 'CodeCrafters Inc', 'HR software solutions', 'automated compliance'],
  });

  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.title}>
            Simplifying HR Operations with <span className={styles.titleHighlight}>Automation</span>
          </h1>
          <p className={styles.subtitle}>
            We build state-of-the-art administrative frameworks that streamline legal verification and offer distribution.
          </p>
        </div>

        <div className={styles.heroImageSection}>
          <img 
            src="/about_team.png" 
            alt="About PaperlessBoss Team Vision" 
            className={styles.aboutImage} 
          />
        </div>
      </section>

      {/* Mission Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Our Mission</h2>
        <p className={styles.text}>
          PaperlessBoss was created to eliminate the friction from standard HR documentation workflows. By leveraging advanced data extraction and automated validation, we empower companies to draft compliant, professional offer letters in minutes rather than hours.
        </p>
        <p className={styles.text}>
          We prioritize data privacy, compliance, and user experience, enabling human resource teams to focus on what matters most: talent acquisition and team development.
        </p>
      </section>

      {/* Pillars Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Core Pillars</h2>
        <p className={styles.text}>
          Our product decisions are guided by three fundamental parameters:
        </p>
        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <h3 className={styles.valueTitle}>Security First</h3>
            <p className={styles.valueText}>
              All calculations and parser validations are processed with end-to-end security layers, keeping sensitive employee details safe from leakage.
            </p>
          </div>
          <div className={styles.valueCard}>
            <h3 className={styles.valueTitle}>Flawless Typography</h3>
            <p className={styles.valueText}>
              Your offer letter represents your company brand. We align all tables, text parameters, and signature assets to create clean, standard document results.
            </p>
          </div>
          <div className={styles.valueCard}>
            <h3 className={styles.valueTitle}>Active Compliance</h3>
            <p className={styles.valueText}>
              Statutory formats automatically track active changes in labor regulations, making sure generated outcomes align with administrative standards.
            </p>
          </div>
        </div>
      </section>

      {/* Author Section */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Created by CodeCrafters</h2>
        <p className={styles.text}>
          PaperlessBoss is designed and maintained by CodeCrafters Inc. We build software solutions that solve practical operational bottlenecks, allowing businesses to operate faster and cleaner.
        </p>
      </section>
    </div>
  );
}
