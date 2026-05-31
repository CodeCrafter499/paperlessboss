import { useEffect } from 'react';

const BASE_URL  = 'https://paperlessboss.com';
const SITE_NAME = 'PaperlessBoss';
const DEFAULT_IMAGE = `${BASE_URL}/og-image.png`;

/**
 * Dynamically updates document <head> meta tags for SEO.
 * Call this in any page/screen component.
 *
 * @param {Object} opts
 * @param {string} opts.title         - Page title (without site name suffix)
 * @param {string} opts.description   - Meta description (max ~160 chars)
 * @param {string} [opts.canonical]   - Canonical URL (defaults to BASE_URL)
 * @param {string} [opts.image]       - OG image URL
 * @param {string} [opts.type]        - OG type ('website' | 'article')
 * @param {string[]} [opts.keywords]  - Extra keywords to append
 * @param {boolean} [opts.noIndex]    - Set true for auth/private pages
 */
export function useSeo({
  title,
  description,
  canonical = BASE_URL + '/',
  image = DEFAULT_IMAGE,
  type = 'website',
  keywords = [],
  noIndex = false,
} = {}) {
  useEffect(() => {
    const fullTitle = title
      ? `${title} | ${SITE_NAME}`
      : `${SITE_NAME} – Appointment Letter Generator | CodeCrafters Inc`;

    // ── document.title ─────────────────────────────────────────────────
    document.title = fullTitle;

    // ── Helper ─────────────────────────────────────────────────────────
    function setMeta(selector, attr, value) {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        const [attrName, attrValue] = selector.match(/\[(.+?)="(.+?)"\]/).slice(1);
        el.setAttribute(attrName, attrValue);
        document.head.appendChild(el);
      }
      el.setAttribute(attr, value);
    }

    // ── Standard meta ──────────────────────────────────────────────────
    setMeta('meta[name="description"]',        'content', description || '');
    setMeta('meta[name="robots"]',             'content', noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large');

    if (keywords.length) {
      const base = 'appointment letter generator, HR document automation, CodeCrafters Inc, PaperlessBoss';
      setMeta('meta[name="keywords"]', 'content', `${keywords.join(', ')}, ${base}`);
    }

    // ── Canonical ──────────────────────────────────────────────────────
    let canonEl = document.querySelector('link[rel="canonical"]');
    if (!canonEl) {
      canonEl = document.createElement('link');
      canonEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonEl);
    }
    canonEl.setAttribute('href', canonical);

    // ── Open Graph ─────────────────────────────────────────────────────
    setMeta('meta[property="og:title"]',       'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', description || '');
    setMeta('meta[property="og:url"]',         'content', canonical);
    setMeta('meta[property="og:type"]',        'content', type);
    setMeta('meta[property="og:image"]',       'content', image);

    // ── Twitter Card ───────────────────────────────────────────────────
    setMeta('meta[name="twitter:title"]',       'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', description || '');
    setMeta('meta[name="twitter:image"]',       'content', image);

  }, [title, description, canonical, image, type, keywords, noIndex]);
}
