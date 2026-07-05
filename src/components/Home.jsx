import React from 'react';
import { Link } from 'react-router-dom';
import { FileSpreadsheet, CheckCircle2, Zap, ShieldCheck, Printer, Check, Star, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSeo } from '../hooks/useSeo';
import styles from './Home.module.css';

export default function Home() {
  const { user } = useAuth();

  useSeo({
    title: 'Generate Appointment Letters Instantly',
    description: 'Transform employee onboarding. Upload an Excel list, validate compliance formats dynamically, and export legal-ready PDFs and DOCX files automatically.',
    keywords: ['appointment letter generator', 'onboard employees', 'HR automation', 'validate Excel list'],
  });

  return (
    <div className={styles.container}>
      {/* Background Glow */}
      <div style={{
        position: 'absolute', top: '-10%', left: '50%', transform: 'translateX(-50%)',
        width: '80%', height: '60%', background: 'radial-gradient(circle, rgba(232, 65, 154, 0.05) 0%, transparent 80%)',
        pointerEvents: 'none', zIndex: 1
      }} />

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.badge}>
            <span className={styles.badgeDot} />
            <span>Smart Automation for HR Teams</span>
          </div>
          <h1 className={styles.title}>
            Draft Compliance-First Offer Letters <span className={styles.titleHighlight}>Effortlessly</span>
          </h1>
          <p className={styles.subtitle}>
            Say goodbye to repetitive manual copy-pasting. Import employee spreadsheets, automatically validate central compliance metrics, and instantly generate production-ready PDFs and DOCX files.
          </p>
          <div className={styles.ctaGroup}>
            <Link to={user ? "/app" : "/signup"} className={styles.primaryCta}>
              {user ? "Go to Dashboard" : "Get Started Free"}
              <Zap size={16} />
            </Link>
            <Link to="/about" className={styles.secondaryCta}>
              Why PaperlessBoss?
            </Link>
          </div>
        </div>

        <div className={styles.heroImageSection}>
          <div className={styles.heroImageBg} />
          <img 
            src="/dashboard_mockup.png" 
            alt="PaperlessBoss Dashboard Showcase" 
            className={styles.mockupImage} 
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className={styles.stats}>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>10x</span>
          <span className={styles.statLabel}>Faster Employee Onboarding</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>100%</span>
          <span className={styles.statLabel}>Statutory Audit Compliant</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statNumber}>Zero</span>
          <span className={styles.statLabel}>Manual Template Verification</span>
        </div>
      </section>

      {/* Process Walkthrough Section */}
      <section className={styles.process}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>How PaperlessBoss Works</h2>
          <p className={styles.sectionSubtitle}>
            A unified pipeline built to optimize HR administration from upload to distribution.
          </p>
        </div>

        <div className={styles.processGrid}>
          <div className={styles.processStep}>
            <span className={styles.stepNumber}>01</span>
            <FileSpreadsheet size={24} style={{ color: 'var(--color-primary)' }} />
            <h3 className={styles.stepTitle}>Import Data</h3>
            <p className={styles.stepDesc}>Upload your spreadsheet or draft names instantly directly in our clean in-app grid editor.</p>
          </div>

          <div className={styles.processStep}>
            <span className={styles.stepNumber}>02</span>
            <ShieldCheck size={24} style={{ color: 'var(--color-primary)' }} />
            <h3 className={styles.stepTitle}>Validate Rules</h3>
            <p className={styles.stepDesc}>Automatic verification checking details, including Aadhaar formats, employee classifications, and statutory laws.</p>
          </div>

          <div className={styles.processStep}>
            <span className={styles.stepNumber}>03</span>
            <Printer size={24} style={{ color: 'var(--color-primary)' }} />
            <h3 className={styles.stepTitle}>Apply Letterhead</h3>
            <p className={styles.stepDesc}>Select your active letterhead PDF to bind it automatically to all generated appointment letters.</p>
          </div>

          <div className={styles.processStep}>
            <span className={styles.stepNumber}>04</span>
            <Zap size={24} style={{ color: 'var(--color-primary)' }} />
            <h3 className={styles.stepTitle}>Instant Download</h3>
            <p className={styles.stepDesc}>Export individual files as PDFs or DOCX, or grab everything packaged in a single ZIP archive.</p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.features}>
        <div className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Aesthetics Meet Compliance</h2>
          <p className={styles.sectionSubtitle}>
            Built specifically to accommodate complex regulatory policies while ensuring beautiful typographical formatting.
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <CheckCircle2 size={32} className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Central Regulatory Check</h3>
            <p className={styles.featureText}>
              Configured directly to follow central statutory requirements, including the Code on Wages 2019 and Code on Social Security 2020.
            </p>
          </div>

          <div className={styles.featureCard}>
            <Users size={32} className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Signatory Binding</h3>
            <p className={styles.featureText}>
              Pre-configure multiple company profiles and official signatories to dynamically sign generated offers automatically.
            </p>
          </div>

          <div className={styles.featureCard}>
            <Star size={32} className={styles.featureIcon} />
            <h3 className={styles.featureTitle}>Typography Settings</h3>
            <p className={styles.featureText}>
              Clean fonts, margins, and tables are compiled natively to look uniform on any screen or when printed onto physical paper.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
