import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, 
  Calendar, 
  Check, 
  CheckCircle2, 
  Shield, 
  ShieldCheck,
  Search, 
  Download, 
  User, 
  UserPlus,
  Users, 
  FileText, 
  Database, 
  Building2, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Briefcase, 
  Settings, 
  Globe, 
  FileSpreadsheet, 
  LayoutDashboard,
  HardDrive,
  Activity,
  FileCheck,
  AlertTriangle,
  Zap,
  Factory,
  Wallet,
  Truck,
  Wrench,
  Mail,
  Phone,
  MapPin,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSeo } from '../hooks/useSeo';
import { authApi } from '../utils/authApi';
import styles from './Home.module.css';

export default function Home() {
  const { user } = useAuth();

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState('');
  const [contactError, setContactError] = useState('');

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactSuccess('');
    setContactError('');
    try {
      const res = await authApi.contact(contactName, contactEmail, contactSubject, contactMessage);
      setContactSuccess(res.message || 'Message sent successfully!');
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    } catch (err) {
      setContactError(err.message || 'Failed to send message.');
    } finally {
      setContactLoading(false);
    }
  };
  
  // Interactive Showcase Tab State
  const [activeShowcase, setActiveShowcase] = useState('dashboard');
  
  // Interactive FAQ Accordion State
  const [openFaq, setOpenFaq] = useState(null);

  // Interactive Resources Modal State
  const [activeModal, setActiveModal] = useState(null); // null, 'knowledge', 'templates', 'updates', 'faqs'

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#knowledge-center') {
        setActiveModal('knowledge');
        window.history.replaceState(null, null, ' ');
      } else if (hash === '#templates') {
        setActiveModal('templates');
        window.history.replaceState(null, null, ' ');
      } else if (hash === '#updates') {
        setActiveModal('updates');
        window.history.replaceState(null, null, ' ');
      } else if (hash === '#faqs') {
        setActiveModal('faqs');
        window.history.replaceState(null, null, ' ');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  useSeo({
    title: 'PaperlessBoss - Labour Compliance Platform for Contractors',
    description: 'Generate compliance-ready appointment letters, wage slips, and manage employee records. The leading compliance platform for Indian contractors.',
    keywords: ['labour compliance', 'appointment letter generator', 'wage slips', 'indian contractors', 'employee master', 'EPF ESIC compliance'],
  });

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: "Is my employee data secure?",
      a: "Yes, absolutely. We use industry-grade bank-level encryption (SSL/TLS) for data transfer and AES-256 encryption at rest. Your data is isolated and safely hosted on cloud servers located in secure Indian data centres."
    },
    {
      q: "Can I generate unlimited appointment letters and wage slips?",
      a: "Our plans come with a generous quota of copies per month. Enterprise plan users can enjoy unlimited generation, whereas Starter and Professional plans can easily top up credits dynamically from the billing dashboard as needed."
    },
    {
      q: "Can multiple users access the account?",
      a: "Yes, our Professional and Enterprise plans support multi-user and role-based access control, allowing your operations team, HR officers, and site supervisors to collaborate simultaneously."
    },
    {
      q: "Can I access PaperlessBoss from mobile?",
      a: "Yes. PaperlessBoss is fully responsive and optimized for mobile browsers, enabling contractors and site admins to register workers and download wage slips directly from the field."
    },
    {
      q: "Can I download documents as PDF?",
      a: "Yes. All compliance documents, wage slips, and appointment letters are generated in both professional PDF formats and editable DOCX templates."
    },
    {
      q: "Is training or support provided?",
      a: "We offer complete onboarding support, documentation, and video tutorials. Enterprise plan customers receive a dedicated relationship manager and priority SLA-based phone support."
    }
  ];

  return (
    <div className={styles.homeContainer}>
      
      {/* 1. HERO SECTION */}
      <section className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.indianBadge}>
            <svg width="18" height="12" viewBox="0 0 900 600" style={{ marginRight: '6px', borderRadius: '2px', display: 'inline-block', verticalAlign: 'middle' }}>
              <rect width="900" height="200" fill="#FF9933"/>
              <rect y="200" width="900" height="200" fill="#FFFFFF"/>
              <rect y="400" width="900" height="200" fill="#128807"/>
              <circle cx="450" cy="300" r="92" fill="none" stroke="#000080" strokeWidth="8"/>
              <circle cx="450" cy="300" r="16" fill="#000080"/>
              <path d="M450,208 L450,392 M358,300 L542,300 M385,235 L515,365 M385,365 L515,235" stroke="#000080" strokeWidth="4"/>
              <path d="M415,215 L485,385 M485,215 L415,385 M358,265 L542,335 M358,335 L542,265" stroke="#000080" strokeWidth="4"/>
            </svg>
            <span style={{ verticalAlign: 'middle' }}>Make in India • For Indian businesses</span>
          </div>
          <h1 className={styles.heroTitle}>
            Labour Compliance <br />
            <span className={styles.heroTitleHighlight}>Made Simple.</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Generate Appointment Letters, Wage Slips & Employee Records in Minutes. 
            PaperlessBoss helps contractors digitise employee records, generate compliance documents 
            and stay organised with labour documentation – all in one secure platform.
          </p>
          
          <div className={styles.heroCtaGroup}>
            <Link to={user ? "/app" : "/signup"} className={styles.heroPrimaryBtn}>
              <span>Start Free Trial</span>
              <ArrowRight size={16} />
            </Link>
            <a href="mailto:contact@peperlessboss.com" className={styles.heroSecondaryBtn}>
              <Calendar size={16} />
              <span>Book Live Demo</span>
            </a>
          </div>

          <div className={styles.heroCheckmarks}>
            <div className={styles.checkmarkItem}>
              <CheckCircle2 size={16} className={styles.checkIcon} />
              <span>No Credit Card Required</span>
            </div>
            <div className={styles.checkmarkItem}>
              <CheckCircle2 size={16} className={styles.checkIcon} />
              <span>Setup in 2 Minutes</span>
            </div>
            <div className={styles.checkmarkItem}>
              <CheckCircle2 size={16} className={styles.checkIcon} />
              <span>Cancel Anytime</span>
            </div>
          </div>
        </div>

        {/* Hero Interactive CSS Mock Dashboard */}
        <div className={styles.heroDashboardMock}>
          <div className={styles.mockWindow}>
            <div className={styles.mockHeader}>
              <div className={styles.mockHeaderLeft}>
                <div className={styles.mockLogoDot}>PB</div>
                <span className={styles.mockBrand}>PaperlessBoss</span>
              </div>
              <div className={styles.mockHeaderRight}>
                <span className={styles.mockUser}><User size={12} /> Admin Contractor</span>
                <span className={styles.mockAddBtn}>+ Add Employee</span>
              </div>
            </div>
            <div className={styles.mockBody}>
              <div className={styles.mockSidebar}>
                <div className={`${styles.mockSidebarItem} ${styles.active}`}><LayoutDashboard size={12} /> Dashboard</div>
                <div className={styles.mockSidebarItem}><Users size={12} /> Employees</div>
                <div className={styles.mockSidebarItem}><FileText size={12} /> Appt. Letters</div>
                <div className={styles.mockSidebarItem}><FileSpreadsheet size={12} /> Wage Slips</div>
                <div className={styles.mockSidebarItem}><Activity size={12} /> Reports</div>
                <div className={styles.mockSidebarItem}><HardDrive size={12} /> Documents</div>
                <div className={styles.mockSidebarItem}><Settings size={12} /> Settings</div>
              </div>
              <div className={styles.mockContent}>
                <div className={styles.mockStatsRow}>
                  <div className={styles.mockStatCard}>
                    <span className={styles.mockStatLabel}>Total Employees</span>
                    <span className={styles.mockStatValue}>248</span>
                    <span className={styles.mockStatSubGreen}>+12% this month</span>
                  </div>
                  <div className={styles.mockStatCard}>
                    <span className={styles.mockStatLabel}>Appt. Letters</span>
                    <span className={styles.mockStatValue}>248</span>
                    <span className={styles.mockStatSub}>Generated</span>
                  </div>
                  <div className={styles.mockStatCard}>
                    <span className={styles.mockStatLabel}>Wage Slips</span>
                    <span className={styles.mockStatValue}>1,248</span>
                    <span className={styles.mockStatSub}>Generated</span>
                  </div>
                </div>
                
                <div className={styles.mockTableSection}>
                  <span className={styles.mockTableTitle}>Recent Employees</span>
                  <div className={styles.mockTableContainer}>
                    <table className={styles.mockTable}>
                      <thead>
                        <tr>
                          <th>Employee Name</th>
                          <th>ID</th>
                          <th>Department</th>
                          <th>Joining Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td>Ravi Kumar</td><td>EMP001</td><td>Electrical</td><td>10 Apr 2024</td></tr>
                        <tr><td>Suresh Yadav</td><td>EMP002</td><td>Civil</td><td>15 Apr 2024</td></tr>
                        <tr><td>Mohammed Ali</td><td>EMP003</td><td>Security</td><td>18 Apr 2024</td></tr>
                        <tr><td>Pooja Sharma</td><td>EMP004</td><td>Housekeeping</td><td>20 Apr 2024</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. COMPLIANCE HORIZONTAL BAR */}
      <section className={styles.tickerSection}>
        <div className={styles.tickerGrid}>
          <div className={styles.tickerItem}>
            <FileCheck size={18} className={styles.tickerIcon} />
            <div>
              <div className={styles.tickerTitle}>Labour Code Ready</div>
              <div className={styles.tickerDesc}>Stay fully compliant</div>
            </div>
          </div>
          <div className={styles.tickerItem}>
            <Globe size={18} className={styles.tickerIcon} />
            <div>
              <div className={styles.tickerTitle}>Cloud Based</div>
              <div className={styles.tickerDesc}>Access anywhere</div>
            </div>
          </div>
          <div className={styles.tickerItem}>
            <Shield size={18} className={styles.tickerIcon} />
            <div>
              <div className={styles.tickerTitle}>Secure & Reliable</div>
              <div className={styles.tickerDesc}>Your data is safe</div>
            </div>
          </div>
          <div className={styles.tickerItem}>
            <Download size={18} className={styles.tickerIcon} />
            <div>
              <div className={styles.tickerTitle}>Instant PDF Generation</div>
              <div className={styles.tickerDesc}>Professional documents</div>
            </div>
          </div>
          <div className={styles.tickerItem}>
            <Briefcase size={18} className={styles.tickerIcon} />
            <div>
              <div className={styles.tickerTitle}>Multi-Project Support</div>
              <div className={styles.tickerDesc}>Manage multiple sites</div>
            </div>
          </div>
          <div className={styles.tickerItem}>
            <svg width="24" height="16" viewBox="0 0 900 600" style={{ borderRadius: '2px', flexShrink: 0, marginRight: '10px' }}>
              <rect width="900" height="200" fill="#FF9933"/>
              <rect y="200" width="900" height="200" fill="#FFFFFF"/>
              <rect y="400" width="900" height="200" fill="#128807"/>
              <circle cx="450" cy="300" r="92" fill="none" stroke="#000080" strokeWidth="8"/>
              <circle cx="450" cy="300" r="16" fill="#000080"/>
              <path d="M450,208 L450,392 M358,300 L542,300 M385,235 L515,365 M385,365 L515,235" stroke="#000080" strokeWidth="4"/>
              <path d="M415,215 L485,385 M485,215 L415,385 M358,265 L542,335 M358,335 L542,265" stroke="#000080" strokeWidth="4"/>
            </svg>
            <div>
              <div className={styles.tickerTitle}>Make in India</div>
              <div className={styles.tickerDesc}>For Indian businesses</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PAIN POINTS SECTION */}
      <section className={styles.painPointsSection}>
        <div className={styles.painPointsContainer}>
          <div className={styles.painPointsLeft}>
            <h2 className={styles.painPointsSectionTitle}>Still Preparing Employee Documents Manually?</h2>
            <p className={styles.painPointsSectionDesc}>
              Contractors spend hours every week on repetitive paperwork which can be easily automated.
            </p>
          </div>
          
          <div className={styles.painPointsRight}>
            <div className={styles.painPointsGrid}>
              <div className={styles.painPointCard}>
                <div className={styles.painPointBadge}><FileText size={16} /></div>
                <h3 className={styles.painPointTitle}>Preparing Appointment Letters</h3>
                <p className={styles.painPointText}>Manually drafting and formatting letters for every employee.</p>
              </div>
              <div className={styles.painPointCard}>
                <div className={styles.painPointBadge}><FileSpreadsheet size={16} /></div>
                <h3 className={styles.painPointTitle}>Generating Wage Slips</h3>
                <p className={styles.painPointText}>Creating monthly wage slips is time consuming.</p>
              </div>
              <div className={styles.painPointCard}>
                <div className={styles.painPointBadge}><Database size={16} /></div>
                <h3 className={styles.painPointTitle}>Maintaining Records</h3>
                <p className={styles.painPointText}>Keeping employee records organised is a challenge.</p>
              </div>
              <div className={styles.painPointCard}>
                <div className={styles.painPointBadge}><Search size={16} /></div>
                <h3 className={styles.painPointTitle}>Searching Old Documents</h3>
                <p className={styles.painPointText}>Finding old records during inspections takes time.</p>
              </div>
              <div className={styles.painPointCard}>
                <div className={styles.painPointBadge}><AlertTriangle size={16} /></div>
                <h3 className={styles.painPointTitle}>Risk During Inspections</h3>
                <p className={styles.painPointText}>Missing documents can lead to penalties and delays.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. EVERYTHING YOU NEED */}
      <section id="features" className={styles.capabilitiesSection}>
        <div className={styles.capabilitiesHeader}>
          <div className={styles.sectionTag}>FEATURES</div>
          <h2 className={styles.sectionTitle}>Everything You Need in One Platform</h2>
        </div>

        <div className={styles.capabilitiesGrid}>
          <div className={styles.capabilityCard}>
            <FileText size={24} className={styles.capabilityIcon} style={{ color: '#0d6efd' }} />
            <h3 className={styles.capabilityTitle}>Appointment Letters</h3>
            <p className={styles.capabilityText}>Generate professional, compliant appointment letters in seconds using customizable dynamic templates.</p>
          </div>
          <div className={styles.capabilityCard}>
            <FileSpreadsheet size={24} className={styles.capabilityIcon} style={{ color: '#198754' }} />
            <h3 className={styles.capabilityTitle}>Wage Slips</h3>
            <p className={styles.capabilityText}>Create accurate monthly wage slips with automated breakdowns and download instantly as PDF.</p>
          </div>
          <div className={styles.capabilityCard}>
            <Users size={24} className={styles.capabilityIcon} style={{ color: '#820ad1' }} />
            <h3 className={styles.capabilityTitle}>Employee Master</h3>
            <p className={styles.capabilityText}>Maintain all employee details, credentials, IDs, and joining logs in one secure, searchable central directory.</p>
          </div>
          <div className={styles.capabilityCard}>
            <HardDrive size={24} className={styles.capabilityIcon} style={{ color: '#fd7e14' }} />
            <h3 className={styles.capabilityTitle}>Document Storage</h3>
            <p className={styles.capabilityText}>Store signed contracts, Aadhaar copies, and compliance forms in our protected cloud vault. Never lose files.</p>
          </div>
          <div className={styles.capabilityCard}>
            <Search size={24} className={styles.capabilityIcon} style={{ color: '#0dcaf0' }} />
            <h3 className={styles.capabilityTitle}>Search Employees</h3>
            <p className={styles.capabilityText}>Find any current or former employee profile instantly using our intelligent multi-criteria filter system.</p>
          </div>
          <div className={styles.capabilityCard}>
            <Download size={24} className={styles.capabilityIcon} style={{ color: '#20c997' }} />
            <h3 className={styles.capabilityTitle}>Download PDF</h3>
            <p className={styles.capabilityText}>Export individual files, statutory formats, or download all employee assets as grouped ZIP archives.</p>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS */}
      <section className={styles.howItWorksSection}>
        <div className={styles.howItWorksHeader}>
          <h2 className={styles.sectionTitle}>How It Works</h2>
        </div>

        <div className={styles.stepsContainer}>
          <div className={styles.stepItem}>
            <div className={styles.stepCircle}>
              <UserPlus size={22} />
            </div>
            <h3 className={styles.stepTitle}>Register</h3>
            <p className={styles.stepText}>Create your company compliance account in less than 2 minutes.</p>
          </div>
          <div className={styles.stepLine} />
          <div className={styles.stepItem}>
            <div className={styles.stepCircle}>
              <FileSpreadsheet size={22} />
            </div>
            <h3 className={styles.stepTitle}>Add / Bulk upload employees</h3>
            <p className={styles.stepText}>Add employee details manually or upload in bulk using standard Excel sheets.</p>
          </div>
          <div className={styles.stepLine} />
          <div className={styles.stepItem}>
            <div className={styles.stepCircle}>
              <FileText size={22} />
            </div>
            <h3 className={styles.stepTitle}>Generate Letter</h3>
            <p className={styles.stepText}>Select template guidelines and generate professional compliance-ready letters.</p>
          </div>
          <div className={styles.stepLine} />
          <div className={styles.stepItem}>
            <div className={styles.stepCircle}>
              <Wallet size={22} />
            </div>
            <h3 className={styles.stepTitle}>Generate Wage Slip</h3>
            <p className={styles.stepText}>Add monthly attendance/wages and calculate statutory slips with one click.</p>
          </div>
          <div className={styles.stepLine} />
          <div className={styles.stepItem}>
            <div className={styles.stepCircleSuccess}>
              <Download size={22} />
            </div>
            <h3 className={styles.stepTitle}>Download & Share</h3>
            <p className={styles.stepText}>Download generated PDFs to share, email, or print whenever required.</p>
          </div>
        </div>
      </section>

      {/* 6. CONTRACTOR TYPES */}
      <section className={styles.contractorSection}>
        <div className={styles.contractorContainer}>
          <div className={styles.contractorLeft}>
            <h2 className={styles.contractorSectionTitle}>Built for Every Type of Contractor</h2>
          </div>
          
          <div className={styles.contractorRight}>
            <div className={styles.contractorGrid}>
              <div className={styles.contractorCard}>
                <Building2 size={28} className={styles.contractorIcon} />
                <span>Civil Contractors</span>
              </div>
              <div className={styles.contractorCard}>
                <Shield size={28} className={styles.contractorIcon} />
                <span>Security Agencies</span>
              </div>
              <div className={styles.contractorCard}>
                <Sparkles size={28} className={styles.contractorIcon} />
                <span>Housekeeping Services</span>
              </div>
              <div className={styles.contractorCard}>
                <Zap size={28} className={styles.contractorIcon} />
                <span>Electrical Contractors</span>
              </div>
              <div className={styles.contractorCard}>
                <Factory size={28} className={styles.contractorIcon} />
                <span>Manufacturing Units</span>
              </div>
              <div className={styles.contractorCard}>
                <Truck size={28} className={styles.contractorIcon} />
                <span>Transport Contractors</span>
              </div>
              <div className={styles.contractorCard}>
                <Wrench size={28} className={styles.contractorIcon} />
                <span>Facility Management</span>
              </div>
              <div className={styles.contractorCard}>
                <Users size={28} className={styles.contractorIcon} />
                <span>Labour Supply Contractors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. WHY CHOOSE / COMPARISON */}
      <section className={styles.whyChooseSection}>
        <div className={styles.whyChooseHeader}>
          <h2 className={styles.sectionTitle}>Why Contractors Choose PaperlessBoss</h2>
        </div>

        <div className={styles.whyChooseContainer}>
          {/* Left: Comparison Table */}
          <div className={styles.comparisonTableBox}>
            <table className={styles.comparisonTable}>
              <thead>
                <tr>
                  <th>Traditional Process</th>
                  <th>PaperlessBoss</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Word Templates (Error-Prone)</td>
                  <td className={styles.highlightCol}>Automated Compliant Generation</td>
                </tr>
                <tr>
                  <td>Excel Sheets scattered on PCs</td>
                  <td className={styles.highlightCol}>Centralised Secure Cloud Database</td>
                </tr>
                <tr>
                  <td>Paper Files in boxes/almirahs</td>
                  <td className={styles.highlightCol}>Encrypted Digital Storage</td>
                </tr>
                <tr>
                  <td>Manual Margin & Table Formatting</td>
                  <td className={styles.highlightCol}>Consistent Standard Templates</td>
                </tr>
                <tr>
                  <td>Time Consuming drafting processes</td>
                  <td className={styles.highlightCol}>One-Click Batch Documents</td>
                </tr>
                <tr>
                  <td>Difficult search through historical paper</td>
                  <td className={styles.highlightCol}>Instant Smart Search & Filters</td>
                </tr>
                <tr>
                  <td>High Risk of missing audit compliance</td>
                  <td className={styles.highlightCol}>Organised & Inspection Ready</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Right: Key features list & alert */}
          <div className={styles.whyChooseRight}>
            <h3 className={styles.whyChooseRightTitle}>Stay Organised & Inspection Ready</h3>
            <div className={styles.whyChooseCard}>
              <div className={styles.whyChooseIconWrap} style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                <ShieldCheck size={20} />
              </div>
              <div>
                <h4 className={styles.whyChooseCardTitle}>Digital Employee Records</h4>
                <p className={styles.whyChooseCardText}>Store, index, and manage all employee profile details and statutory filings securely in a unified space.</p>
              </div>
            </div>
            <div className={styles.whyChooseCard}>
              <div className={styles.whyChooseIconWrap} style={{ background: '#f3e5f5', color: '#8e24aa' }}>
                <FileText size={20} />
              </div>
              <div>
                <h4 className={styles.whyChooseCardTitle}>Standardised Documents</h4>
                <p className={styles.whyChooseCardText}>Ensure high-fidelity compliance formatting across appointment documents, salary sheets, and wage slips.</p>
              </div>
            </div>
            <div className={styles.whyChooseCard}>
              <div className={styles.whyChooseIconWrap} style={{ background: '#e3f2fd', color: '#1565c0' }}>
                <Search size={20} />
              </div>
              <div>
                <h4 className={styles.whyChooseCardTitle}>Quick Access</h4>
                <p className={styles.whyChooseCardText}>Instantly query and present clean records during government audits, client reviews, or third-party inspections.</p>
              </div>
            </div>

            <div className={styles.complianceAlert}>
              <Sparkles size={16} className={styles.alertIcon} />
              <span>Well organised records build trust with clients and help you manage your workforce better.</span>
            </div>
          </div>
        </div>
      </section>

      {/* 8. SCREEN SHOWCASE TABS */}
      <section className={styles.showcaseSection}>
        <div className={styles.showcaseHeader}>
          <h2 className={styles.sectionTitle}>See PaperlessBoss in Action</h2>
        </div>

        <div className={styles.showcaseTabs}>
          <button 
            className={`${styles.showcaseTabBtn} ${activeShowcase === 'dashboard' ? styles.activeTab : ''}`}
            onClick={() => setActiveShowcase('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={`${styles.showcaseTabBtn} ${activeShowcase === 'appt_letter' ? styles.activeTab : ''}`}
            onClick={() => setActiveShowcase('appt_letter')}
          >
            Appointment Letter
          </button>
          <button 
            className={`${styles.showcaseTabBtn} ${activeShowcase === 'employee_list' ? styles.activeTab : ''}`}
            onClick={() => setActiveShowcase('employee_list')}
          >
            Employee List
          </button>
          <button 
            className={`${styles.showcaseTabBtn} ${activeShowcase === 'wage_slip' ? styles.activeTab : ''}`}
            onClick={() => setActiveShowcase('wage_slip')}
          >
            Wage Slip
          </button>
          <button 
            className={`${styles.showcaseTabBtn} ${activeShowcase === 'reports' ? styles.activeTab : ''}`}
            onClick={() => setActiveShowcase('reports')}
          >
            Reports
          </button>
        </div>

        {/* Tab display area */}
        <div className={styles.showcaseDisplayBox}>
          {activeShowcase === 'dashboard' && (
            <div className={styles.displayCard}>
              <h3 className={styles.displayCardTitle}>Interactive Compliance Dashboard</h3>
              <p className={styles.displayCardDesc}>Get an overview of active contractors, monthly wage slips, letters pending download, and worker demographics.</p>
              <div className={styles.showcaseMockWrapper}>
                {/* Stats */}
                <div className={styles.mockStatsRow}>
                  <div className={styles.mockStatCard}>
                    <span>Total Employees</span>
                    <strong>248</strong>
                    <small style={{ color: '#198754' }}>+12% vs last month</small>
                  </div>
                  <div className={styles.mockStatCard}>
                    <span>Appointment Letters</span>
                    <strong>248</strong>
                    <small>Generated</small>
                  </div>
                  <div className={styles.mockStatCard}>
                    <span>Wage Slips</span>
                    <strong>1,248</strong>
                    <small>Processed</small>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeShowcase === 'appt_letter' && (
            <div className={styles.displayCard}>
              <h3 className={styles.displayCardTitle}>Automated Compliance Letter Generator</h3>
              <p className={styles.displayCardDesc}>Standardized template formatting with customizable parameters, including dearness allowance, social security benefits, and custom company letterhead.</p>
              <div className={styles.letterPreviewMock}>
                <div className={styles.letterMockHeader}>
                  <h4>PAPERLESSBOSS PRIVATE LIMITED</h4>
                  <p>CodeCrafters Tower, Visakhapatnam, AP, India</p>
                </div>
                <hr />
                <div className={styles.letterMockBody}>
                  <h5>FORM I (See Rule 14) - APPOINTMENT LETTER</h5>
                  <p><strong>To:</strong> Ravi Kumar, Employee ID: EMP001</p>
                  <p>We are pleased to appoint you as <strong>Electrical Supervisor</strong> effective <strong>10 April 2024</strong>. Your employment terms comply with the Code on Wages, 2019 and your basic rate is set at ₹18,500.00 per month.</p>
                  <p>Authorized Signatory: <strong>K. Srinivasan</strong></p>
                </div>
              </div>
            </div>
          )}

          {activeShowcase === 'employee_list' && (
            <div className={styles.displayCard}>
              <h3 className={styles.displayCardTitle}>Structured Employee Master Directory</h3>
              <p className={styles.displayCardDesc}>Manage active worker profiles, search instantly by department, or verify UAN and Aadhaar numbers easily.</p>
              <div className={styles.listMock}>
                <div className={styles.listSearchRow}>
                  <input type="text" placeholder="Search by name, ID, or Aadhaar..." disabled className={styles.mockSearchInput} />
                  <button className={styles.mockSearchBtn}>Filter</button>
                </div>
                <div className={styles.mockTableContainer}>
                  <table className={styles.mockTable}>
                    <thead>
                      <tr><th>Name</th><th>Department</th><th>UAN / ESIC</th><th>Status</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>Ravi Kumar</td><td>Electrical</td><td>100984758392</td><td><span className={styles.statusActive}>Active</span></td></tr>
                      <tr><td>Suresh Yadav</td><td>Civil</td><td>100984758504</td><td><span className={styles.statusActive}>Active</span></td></tr>
                      <tr><td>Mohammed Ali</td><td>Security</td><td>100984758622</td><td><span className={styles.statusActive}>Active</span></td></tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeShowcase === 'wage_slip' && (
            <div className={styles.displayCard}>
              <h3 className={styles.displayCardTitle}>Dynamic Wage Slip Calculations</h3>
              <p className={styles.displayCardDesc}>Monthly wages are computed based on attendance sheets. Auto-calculates deductions, overtime allowances, and statutory benefits.</p>
              <div className={styles.payslipMock}>
                <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                  <h4>PAY SLIP FOR APRIL 2024</h4>
                  <small>PaperlessBoss Compliance Portal</small>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', fontSize: '12px' }}>
                  <div>
                    <p><strong>Name:</strong> Ravi Kumar</p>
                    <p><strong>Days Present:</strong> 26</p>
                  </div>
                  <div>
                    <p><strong>Basic Wage:</strong> ₹18,500.00</p>
                    <p><strong>Dearness Allowance:</strong> ₹2,100.00</p>
                  </div>
                </div>
                <hr />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '13px' }}>
                  <span>Gross Pay:</span>
                  <span>₹20,600.00</span>
                </div>
              </div>
            </div>
          )}

          {activeShowcase === 'reports' && (
            <div className={styles.displayCard}>
              <h3 className={styles.displayCardTitle}>Compliance Reports & Auditing Stats</h3>
              <p className={styles.displayCardDesc}>Visually monitor onboarding trends, credit balance consumption, and export state-wise statutory reports with ease.</p>
              <div className={styles.reportsMock}>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', height: '120px', alignItems: 'flex-end', paddingBottom: '10px' }}>
                  <div style={{ width: '40px', height: '40px', background: 'var(--color-primary)', borderRadius: '4px 4px 0 0' }}><span style={{ display: 'block', textAlign: 'center', color: '#fff', fontSize: '10px', marginTop: '-15px' }}>Jan</span></div>
                  <div style={{ width: '40px', height: '60px', background: 'var(--color-primary)', borderRadius: '4px 4px 0 0' }}><span style={{ display: 'block', textAlign: 'center', color: '#fff', fontSize: '10px', marginTop: '-15px' }}>Feb</span></div>
                  <div style={{ width: '40px', height: '80px', background: 'var(--color-primary)', borderRadius: '4px 4px 0 0' }}><span style={{ display: 'block', textAlign: 'center', color: '#fff', fontSize: '10px', marginTop: '-15px' }}>Mar</span></div>
                  <div style={{ width: '40px', height: '110px', background: 'var(--color-primary)', borderRadius: '4px 4px 0 0' }}><span style={{ display: 'block', textAlign: 'center', color: '#fff', fontSize: '10px', marginTop: '-15px' }}>Apr</span></div>
                </div>
                <div style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-secondary)' }}>Onboarded Employees Count (Q1 - Q2)</div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 9. PRICING & FAQ */}
      <section id="pricing" className={styles.pricingSection}>
        <div className={styles.pricingHeader}>
          <div className={styles.sectionTag}>PRICING & SUPPORT</div>
          <h2 className={styles.sectionTitle}>Simple, Transparent Pricing</h2>
          <p className={styles.sectionDesc}>Annual plans available with up to 20% discount.</p>
        </div>

        <div className={styles.pricingFaqLayout}>
          {/* Pricing cards */}
          <div className={styles.pricingCardsGrid}>
            
            {/* Starter */}
            <div className={styles.priceCard}>
              <span className={styles.priceTierName}>Starter</span>
              <p className={styles.priceSub}>Perfect for small contractors</p>
              <div className={styles.priceValue}>
                <span className={styles.rupee}>₹</span>
                <span className={styles.amt}>499</span>
                <span className={styles.per}>/month</span>
              </div>
              <ul className={styles.priceFeatures}>
                <li><Check size={14} className={styles.greenCheck} /> Up to 50 Employees</li>
                <li><Check size={14} className={styles.greenCheck} /> Appointment Letters</li>
                <li><Check size={14} className={styles.greenCheck} /> Wage Slips</li>
                <li><Check size={14} className={styles.greenCheck} /> Document Storage</li>
                <li><Check size={14} className={styles.greenCheck} /> Email Support</li>
              </ul>
              <Link to={user ? "/app" : "/signup"} className={styles.priceCardBtn}>Start Free Trial</Link>
            </div>

            {/* Professional */}
            <div className={`${styles.priceCard} ${styles.popularCard}`}>
              <div className={styles.popularBadge}>Most Popular</div>
              <span className={styles.priceTierName}>Professional</span>
              <p className={styles.priceSub}>Ideal for growing businesses</p>
              <div className={styles.priceValue}>
                <span className={styles.rupee}>₹</span>
                <span className={styles.amt}>999</span>
                <span className={styles.per}>/month</span>
              </div>
              <ul className={styles.priceFeatures}>
                <li><Check size={14} className={styles.greenCheck} /> Up to 200 Employees</li>
                <li><Check size={14} className={styles.greenCheck} /> All Starter Features</li>
                <li><Check size={14} className={styles.greenCheck} /> Bulk Upload</li>
                <li><Check size={14} className={styles.greenCheck} /> Advanced Reports</li>
                <li><Check size={14} className={styles.greenCheck} /> Priority Support</li>
              </ul>
              <Link to={user ? "/app" : "/signup"} className={`${styles.priceCardBtn} ${styles.priceBtnPrimary}`}>Start Free Trial</Link>
            </div>

            {/* Enterprise */}
            <div className={styles.priceCard}>
              <span className={styles.priceTierName}>Enterprise</span>
              <p className={styles.priceSub}>For large organisations</p>
              <div className={styles.priceValue}>
                <span className={styles.rupee}>₹</span>
                <span className={styles.amt}>1,999</span>
                <span className={styles.per}>/month</span>
              </div>
              <ul className={styles.priceFeatures}>
                <li><Check size={14} className={styles.greenCheck} /> Unlimited Employees</li>
                <li><Check size={14} className={styles.greenCheck} /> All Professional Features</li>
                <li><Check size={14} className={styles.greenCheck} /> Multi-Project Management</li>
                <li><Check size={14} className={styles.greenCheck} /> Advanced User Roles</li>
                <li><Check size={14} className={styles.greenCheck} /> Dedicated Support</li>
              </ul>
              <a href="#contact" className={styles.priceCardBtn}>Contact Sales</a>
            </div>
          </div>

          {/* FAQ Accordion Accordion */}
          <div className={styles.faqContainer}>
            <h3 className={styles.faqMainTitle}>Frequently Asked Questions</h3>
            <div className={styles.faqList}>
              {faqs.map((faq, i) => (
                <div key={i} className={styles.faqItem} onClick={() => toggleFaq(i)}>
                  <div className={styles.faqQuestion}>
                    <span>{faq.q}</span>
                    {openFaq === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </div>
                  {openFaq === i && (
                    <div className={styles.faqAnswer}>
                      <p>{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 10. PRE-FOOTER CTA BANNER */}
      <section className={styles.preFooterCtaSection}>
        <div className={styles.ctaBannerCard}>
          <div className={styles.ctaBannerLeft}>
            <h2 className={styles.ctaBannerTitle}>Ready to Go Paperless?</h2>
            <p className={styles.ctaBannerDesc}>
              Join hundreds of contractors who are simplifying employee documentation 
              and saving valuable time with PaperlessBoss.
            </p>
            
            <div className={styles.ctaBannerChecks}>
              <div className={styles.ctaBannerCheckItem}>
                <Check size={14} />
                <span>No Setup Fee</span>
              </div>
              <div className={styles.ctaBannerCheckItem}>
                <Check size={14} />
                <span>Cancel Anytime</span>
              </div>
              <div className={styles.ctaBannerCheckItem}>
                <Check size={14} />
                <span>Trusted by Contractors</span>
              </div>
            </div>

            <div className={styles.ctaBannerButtons}>
              <Link to={user ? "/app" : "/signup"} className={styles.ctaBannerBtnPrimary}>
                <span>Start Free Trial</span>
              </Link>
              <a href="mailto:contact@peperlessboss.com" className={styles.ctaBannerBtnSecondary}>
                <span>Book Live Demo</span>
              </a>
            </div>
          </div>
          <div className={styles.ctaBannerRight}>
            {/* Elegant Vector/CSS graphic of a professional with a laptop */}
            <div className={styles.mockLaptopUserCard}>
              <div className={styles.userHead}>
                <div className={styles.avatarMock}><User size={24} /></div>
                <div>
                  <strong>A. K. Sharma</strong>
                  <small>HR Lead, Civil Build Corp</small>
                </div>
              </div>
              <p className={styles.userQuote}>"PaperlessBoss cut down our worker registration and appointment letter drafting time from hours to a few minutes. Audit compliance is now 100% stress-free."</p>
              <div className={styles.quoteStars}>
                {"★★★★★"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 11. RESOURCES HUB SECTION */}
      <section id="resources" className={styles.resourcesSection}>
        <div className={styles.resourcesHeader}>
          <div className={styles.sectionTag}>RESOURCES</div>
          <h2 className={styles.sectionTitle}>Resources & Knowledge Centre</h2>
          <p className={styles.sectionDesc}>Everything you need to master contractor compliance and statutory audits.</p>
        </div>

        <div className={styles.resourcesGrid}>
          <div className={styles.resourceCard}>
            <span className={styles.resourceEmoji}>📘</span>
            <h3>Knowledge Centre</h3>
            <p>Access detailed guides on labour compliance guidelines, state minimum wages, and statutory notifications across India.</p>
            <button onClick={() => setActiveModal('knowledge')} className={styles.resourceLink}>Explore Guides →</button>
          </div>
          <div className={styles.resourceCard}>
            <span className={styles.resourceEmoji}>📄</span>
            <h3>Free Templates</h3>
            <p>Download standard contractor employee sheets, appointment letter drafts, and monthly wage calculator sheets.</p>
            <button onClick={() => setActiveModal('templates')} className={styles.resourceLink}>Browse Templates →</button>
          </div>
          <div className={styles.resourceCard}>
            <span className={styles.resourceEmoji}>❓</span>
            <h3>FAQs</h3>
            <p>Find quick answers to common queries regarding account configurations, credits validity, and print margins setups.</p>
            <button onClick={() => setActiveModal('faqs')} className={styles.resourceLink}>Read FAQs →</button>
          </div>
          <div className={styles.resourceCard}>
            <span className={styles.resourceEmoji}>📢</span>
            <h3>Updates</h3>
            <p>Stay up to date with the latest labour codes, statutory updates, and brand-new PaperlessBoss platform additions.</p>
            <button onClick={() => setActiveModal('updates')} className={styles.resourceLink}>See What's New →</button>
          </div>
        </div>
      </section>

      {/* 12. CONTACT US SECTION */}
      <section id="contact" className={styles.contactSection}>
        <div className={styles.contactContainer}>
          <div className={styles.contactInfoSide}>
            <div className={styles.sectionTag}>CONTACT US</div>
            <h2 className={styles.contactTitle}>Get in Touch</h2>
            <p className={styles.contactText}>
              Have questions about pricing, bulk licenses, or custom letter formats? 
              Our compliance team is here to help you get started.
            </p>

            <div className={styles.contactDetails}>
              <div className={styles.contactDetailItem}>
                <div className={styles.contactIconCircle}>
                  <Mail size={18} />
                </div>
                <div>
                  <strong>Email Support</strong>
                  <p><a href="mailto:support@peperlessboss.com">support@peperlessboss.com</a></p>
                </div>
              </div>

              <div className={styles.contactDetailItem}>
                <div className={styles.contactIconCircle}>
                  <Phone size={18} />
                </div>
                <div>
                  <strong>Call Us</strong>
                  <p>+91 98765 43210</p>
                </div>
              </div>

              <div className={styles.contactDetailItem}>
                <div className={styles.contactIconCircle}>
                  <MapPin size={18} />
                </div>
                <div>
                  <strong>Office</strong>
                  <p>CodeCrafters Tower, Visakhapatnam, AP, India</p>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.contactFormSide}>
            <form className={styles.contactForm} onSubmit={handleContactSubmit}>
              {contactSuccess && (
                <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: '#10b981', marginBottom: '16px', fontSize: '14px' }}>
                  {contactSuccess}
                </div>
              )}
              {contactError && (
                <div style={{ padding: '12px', borderRadius: '6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>
                  {contactError}
                </div>
              )}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="name">Full Name</label>
                  <input type="text" id="name" placeholder="e.g. A. K. Sharma" value={contactName} onChange={(e) => setContactName(e.target.value)} disabled={contactLoading} required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="contactEmail">Email Address</label>
                  <input type="email" id="contactEmail" placeholder="e.g. sharma@company.com" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} disabled={contactLoading} required />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="subject">Subject</label>
                <input type="text" id="subject" placeholder="How can we help you?" value={contactSubject} onChange={(e) => setContactSubject(e.target.value)} disabled={contactLoading} required />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="message">Message</label>
                <textarea id="message" rows="5" placeholder="Write your query here..." value={contactMessage} onChange={(e) => setContactMessage(e.target.value)} disabled={contactLoading} required></textarea>
              </div>

              <button type="submit" className={styles.contactSubmitBtn} disabled={contactLoading}>
                {contactLoading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 13. FOOTER SECTION */}
      <footer className={styles.footerSection}>
        <div className={styles.footerLinksGrid}>
          <div className={styles.footerBrandCol}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <div className={styles.footerLogoDot}>PB</div>
              <span className={styles.footerBrandName}>PaperlessBoss</span>
            </div>
            <p className={styles.footerBrandSub}>Simplifying labour compliance documentation for contractors across India.</p>
          </div>
          
          <div className={styles.footerLinkCol}>
            <h4>Product</h4>
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#security">Security</a>
            <a href="#integrations">Integrations</a>
          </div>

          <div className={styles.footerLinkCol}>
            <h4>Company</h4>
            <a href="#about">About Us</a>
            <a href="#contact">Contact Us</a>
            <a href="#privacy">Privacy Policy</a>
            <a href="#terms">Terms & Conditions</a>
          </div>

          <div className={styles.footerLinkCol}>
            <h4>Resources</h4>
            <a href="#knowledge-center">📘 Knowledge Centre</a>
            <a href="#templates">📄 Free Templates</a>
            <a href="#faqs">❓ FAQs</a>
            <a href="#updates">📢 Updates</a>
          </div>

          <div className={styles.footerLinkCol}>
            <h4>Support</h4>
            <a href="#help">Help Center</a>
            <a href="#contact">Contact Support</a>
            <a href="mailto:contact@peperlessboss.com">Request Demo</a>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>🇮🇳 Made in India • For Indian businesses</span>
          <span>© 2026 PaperlessBoss. All rights reserved.</span>
        </div>
      </footer>

      {/* Interactive Resources Modal Overlay */}
      {activeModal && (
        <div className={styles.modalOverlay} onClick={() => setActiveModal(null)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.modalCloseBtn} onClick={() => setActiveModal(null)} title="Close Modal">
              <X size={18} />
            </button>

            {activeModal === 'knowledge' && (
              <div>
                <h3 className={styles.modalHeaderTitle}>📘 Knowledge Centre</h3>
                <p className={styles.modalSubtitle}>Read and download official compliance guidelines for contractors.</p>
                <div className={styles.modalItemsList}>
                  <div className={styles.modalListItem}>
                    <div style={{ flex: 1 }}>
                      <strong>Labour Codes Reform Guide (2026)</strong>
                      <p className={styles.modalItemText}>A comprehensive walkthrough of the upcoming unified labour codes, wage definitions, and EPF implications.</p>
                    </div>
                    <button className={styles.modalItemActionBtn} onClick={() => alert("Downloading Guide...")}>Download Guide</button>
                  </div>
                  <div className={styles.modalListItem}>
                    <div style={{ flex: 1 }}>
                      <strong>Indian Minimum Wages Handbook</strong>
                      <p className={styles.modalItemText}>State-wise minimum wage rates checklist for skilled, semi-skilled, and unskilled workers updated for 2026.</p>
                    </div>
                    <button className={styles.modalItemActionBtn} onClick={() => alert("Downloading Handbook...")}>Download Handbook</button>
                  </div>
                  <div className={styles.modalListItem}>
                    <div style={{ flex: 1 }}>
                      <strong>Contractor Compliance Handbook</strong>
                      <p className={styles.modalItemText}>Key checkpoints for statutory logs (Form I, Form IX, Form XV) required during state inspections.</p>
                    </div>
                    <button className={styles.modalItemActionBtn} onClick={() => alert("Downloading Handbook...")}>Download Handbook</button>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'templates' && (
              <div>
                <h3 className={styles.modalHeaderTitle}>📄 Free Compliance Templates</h3>
                <p className={styles.modalSubtitle}>Ready-to-use documents and spreadsheet configurations.</p>
                <div className={styles.modalItemsList}>
                  <div className={styles.modalListItem}>
                    <div style={{ flex: 1 }}>
                      <strong>Standard Contractor Employee Format</strong>
                      <p className={styles.modalItemText}>Excel template pre-configured for instant bulk uploading into the PaperlessBoss letter generator.</p>
                    </div>
                    <a href="/sample_sheets/sample_employee_list.xlsx" download className={styles.modalItemActionBtn}>Download (.xlsx)</a>
                  </div>
                  <div className={styles.modalListItem}>
                    <div style={{ flex: 1 }}>
                      <strong>Statutory Model Appointment Letter</strong>
                      <p className={styles.modalItemText}>General draft compliance-ready appointment letter matching key regulations under Noida/Delhi Labour Department.</p>
                    </div>
                    <button className={styles.modalItemActionBtn} onClick={() => alert("Downloading Template...")}>Download (.docx)</button>
                  </div>
                  <div className={styles.modalListItem}>
                    <div style={{ flex: 1 }}>
                      <strong>Contractor Billing Invoice Template</strong>
                      <p className={styles.modalItemText}>An easy Excel calculator template for billing client companies based on attendance sheets.</p>
                    </div>
                    <button className={styles.modalItemActionBtn} onClick={() => alert("Downloading Template...")}>Download (.xlsx)</button>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'updates' && (
              <div>
                <h3 className={styles.modalHeaderTitle}>📢 Platform Updates</h3>
                <p className={styles.modalSubtitle}>Latest updates and feature releases on PaperlessBoss.</p>
                <div className={styles.modalItemsList}>
                  <div className={styles.modalListItem}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong>Server-Side PDF Letterhead Customization</strong>
                        <span className={styles.modalUpdateBadge} style={{ background: '#e0f2fe', color: '#0369a1' }}>New</span>
                      </div>
                      <p className={styles.modalItemText}>You can now upload your company letterhead version as PNG/JPEG and generate letters stamped with your branding.</p>
                    </div>
                  </div>
                  <div className={styles.modalListItem}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong>Improved Linter Validation</strong>
                        <span className={styles.modalUpdateBadge} style={{ background: '#fef3c7', color: '#b45309' }}>Optimized</span>
                      </div>
                      <p className={styles.modalItemText}>Added dynamic cell checks for Aadhaar lengths, LIN numbers, and basic salary wage checks before compiling.</p>
                    </div>
                  </div>
                  <div className={styles.modalListItem}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong>Upcoming: Automated Form 16 Generation</strong>
                        <span className={styles.modalUpdateBadge} style={{ background: '#f3e8ff', color: '#7e22ce' }}>In Development</span>
                      </div>
                      <p className={styles.modalItemText}>Generate bulk Form 16 TDS certificates for compliance reporting from the admin setting tab next month.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeModal === 'faqs' && (
              <div>
                <h3 className={styles.modalHeaderTitle}>❓ Frequently Asked Questions</h3>
                <p className={styles.modalSubtitle}>Quick answers to questions about the PaperlessBoss compliance manager.</p>
                <div className={styles.modalItemsList}>
                  <div className={styles.modalListItem}>
                    <div style={{ flex: 1 }}>
                      <strong>Is my employee data secure?</strong>
                      <p className={styles.modalItemText}>Yes, absolutely. We use SSL/TLS for transfers and AES-256 encryption at rest. Your data is isolated and safely hosted on servers located in secure Indian data centres.</p>
                    </div>
                  </div>
                  <div className={styles.modalListItem}>
                    <div style={{ flex: 1 }}>
                      <strong>Can I generate unlimited letters and slips?</strong>
                      <p className={styles.modalItemText}>Plans come with a monthly copies quota. Enterprise plan has unlimited generation, whereas other plans can top up credits dynamically from the billing dashboard.</p>
                    </div>
                  </div>
                  <div className={styles.modalListItem}>
                    <div style={{ flex: 1 }}>
                      <strong>Can multiple users access the account?</strong>
                      <p className={styles.modalItemText}>Yes, our Professional and Enterprise plans support multi-user role-based access control, allowing your team to collaborate simultaneously.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
