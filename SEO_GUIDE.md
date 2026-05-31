# PaperlessBoss — SEO Implementation Guide

## What Was Done

### 1. `public/index.html` — Full SEO Head
| Tag | Purpose |
|-----|---------|
| `<title>` | Primary ranking signal — includes brand + category + company |
| `meta description` | Controls snippet in search results (≤160 chars) |
| `meta keywords` | Secondary signal; includes HR, India, Code on Wages keywords |
| `meta robots` | Tells Googlebot to index and follow links |
| `link rel="canonical"` | Prevents duplicate content penalties |
| `meta geo.region` | Targets Indian search audience |
| Open Graph tags | Controls how links look on LinkedIn, WhatsApp, Facebook |
| Twitter Card tags | Controls how links look on Twitter/X |
| `application/ld+json` | Structured data — Organization, WebApplication, BreadcrumbList |
| `<noscript>` | Descriptive fallback for crawlers that don't run JS |

### 2. `public/robots.txt`
- Allows all crawlers
- Blocks `/api/` and `/auth/` paths
- References sitemap location

### 3. `public/sitemap.xml`
- Lists the canonical URL with `lastmod`, `changefreq`, `priority`
- Submit to Google Search Console: https://search.google.com/search-console

### 4. `public/site.webmanifest`
- Full PWA manifest with app name, description, icons, categories
- Improves mobile SEO signals

### 5. `public/og-image.png` (1200×630)
- Social sharing preview image for LinkedIn, WhatsApp, Twitter
- Shows brand, features, and URL

### 6. `src/hooks/useSeo.js`
- React hook — dynamically updates all meta tags when screens change
- Auth screens marked `noIndex: true` so Google doesn't index login pages

### 7. `nginx-seo.conf`
- www → non-www canonical redirect (prevents duplicate content)
- HTTP → HTTPS redirect
- `Strict-Transport-Security` header (HTTPS trust signal)
- Gzip compression (faster = better Core Web Vitals)
- `Cache-Control: immutable` on static assets (better LCP score)
- Security headers (trust signals for Google)

---

## Deploy to EC2

### Step 1 — Deploy the build
```bash
# On your local machine
npm run build
scp -i "paperlessboss.pem" -r ./build/ ubuntu@13.62.50.7:/home/ubuntu/
scp -i "paperlessboss.pem" nginx-seo.conf ubuntu@13.62.50.7:/home/ubuntu/

# On EC2
sudo rm -rf /var/www/html/*
sudo cp -r /home/ubuntu/build/* /var/www/html/
sudo chmod -R 755 /var/www/html/
```

### Step 2 — Apply Nginx SEO config
```bash
sudo cp /home/ubuntu/nginx-seo.conf /etc/nginx/sites-available/paperlessboss
sudo ln -sf /etc/nginx/sites-available/paperlessboss /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

### Step 3 — Submit sitemap to Google Search Console
1. Go to https://search.google.com/search-console
2. Add property: `https://paperlessboss.com`
3. Verify via HTML tag (add to index.html) or DNS TXT record
4. Go to Sitemaps → Submit: `https://paperlessboss.com/sitemap.xml`

### Step 4 — Test everything
| Tool | URL | What to check |
|------|-----|---------------|
| Google Rich Results | https://search.google.com/test/rich-results | Structured data valid |
| Open Graph Debugger | https://developers.facebook.com/tools/debug/ | OG image/title correct |
| Twitter Card Validator | https://cards-dev.twitter.com/validator | Card preview correct |
| PageSpeed Insights | https://pagespeed.web.dev | Core Web Vitals score |
| Mobile-Friendly Test | https://search.google.com/test/mobile-friendly | Mobile rendering |
| Lighthouse | Chrome DevTools → Lighthouse | Full SEO audit |

---

## Ongoing SEO Tips
- Update `sitemap.xml` `<lastmod>` date after each deploy
- Keep meta descriptions unique and action-oriented
- Add Google Analytics or Plausible for traffic data
- Consider adding a public landing page (no login required) for organic traffic
