import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Sun, Moon, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import styles from './Navbar.module.css';

const BrandLogo = () => (
  <svg width="34" height="34" viewBox="0 0 100 100" style={{ flexShrink: 0, marginRight: '2px' }}>
    <defs>
      <linearGradient id="brandLogoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#c084fc" />
        <stop offset="100%" stopColor="#9333ea" />
      </linearGradient>
    </defs>
    <rect width="100" height="100" rx="26" fill="url(#brandLogoGrad)" />
    <path d="M34 26h30L78 40v35c0 3.3-2.7 6-6 6H34c-3.3 0-6-2.7-6-6V32c0-3.3 2.7-6 6-6z" fill="#ffffff" />
    <path d="M62 26v14h14" fill="none" stroke="#e9d5ff" strokeWidth="4" strokeLinejoin="round" />
    <path d="M40 56l6 6 16-16" fill="none" stroke="#9333ea" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function Navbar({ theme, setTheme }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <nav className={styles.navbar}>
      <Link to="/" className={styles.brand}>
        <BrandLogo />
        <div className={styles.brandInfo}>
          <span className={styles.brandName}>PaperlessBoss</span>
          <span className={styles.brandSub}>Labour Compliance Platform</span>
        </div>
      </Link>

      <div className={styles.links}>
        <NavLink to="/" className={({ isActive }) => `${styles.link} ${isActive ? styles.activeLink : ''}`}>
          Home
        </NavLink>
        <a href="/#features" className={styles.link}>
          Features
        </a>
        <a href="/#pricing" className={styles.link}>
          Pricing
        </a>
        <div className={styles.dropdown}>
          <span className={styles.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            Resources <ChevronDown size={14} />
          </span>
          <div className={styles.dropdownMenu}>
            <a href="/#knowledge-center" className={styles.dropdownItem}>
              <span>📘</span> Knowledge Centre
            </a>
            <a href="/#templates" className={styles.dropdownItem}>
              <span>📄</span> Free Templates
            </a>
            <a href="/#faqs" className={styles.dropdownItem}>
              <span>❓</span> FAQs
            </a>
            <a href="/#updates" className={styles.dropdownItem}>
              <span>📢</span> Updates
            </a>
          </div>
        </div>
        <a href="/#contact" className={styles.link}>
          Contact
        </a>
        {user && (
          <NavLink to="/app" className={({ isActive }) => `${styles.link} ${isActive ? styles.activeLink : ''}`}>
            Dashboard
          </NavLink>
        )}
      </div>

      <div className={styles.actions}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-primary-pale)', border: '1px solid var(--color-primary-light)', padding: '4px 8px', borderRadius: '20px', fontSize: '10px', fontWeight: '700', color: 'var(--color-primary)', marginRight: '6px' }}>
          <svg width="14" height="9" viewBox="0 0 900 600" style={{ borderRadius: '1px' }}>
            <rect width="900" height="200" fill="#FF9933"/>
            <rect y="200" width="900" height="200" fill="#FFFFFF"/>
            <rect y="400" width="900" height="200" fill="#128807"/>
            <circle cx="450" cy="300" r="92" fill="none" stroke="#000080" strokeWidth="8"/>
            <circle cx="450" cy="300" r="16" fill="#000080"/>
            <path d="M450,208 L450,392 M358,300 L542,300 M385,235 L515,365 M385,365 L515,235" stroke="#000080" strokeWidth="4"/>
            <path d="M415,215 L485,385 M485,215 L415,385 M358,265 L542,335 M358,335 L542,265" stroke="#000080" strokeWidth="4"/>
          </svg>
          <span>Make in India</span>
        </div>

        <button onClick={toggleTheme} className={styles.themeBtn} title="Toggle Theme">
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
        </button>

        {user ? (
          <button onClick={handleLogout} className={styles.logoutBtn}>
            <LogOut size={16} style={{ marginRight: 6, display: 'inline-block', verticalAlign: 'middle' }} />
            <span style={{ verticalAlign: 'middle' }}>Sign out</span>
          </button>
        ) : (
          <>
            <Link to="/login" className={styles.loginBtn}>
              Login
            </Link>
            <Link to="/signup" className={styles.signupBtn}>
              Start Free Trial
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
