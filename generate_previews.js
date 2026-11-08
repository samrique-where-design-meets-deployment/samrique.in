const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const cwd = process.cwd();

const mamaScreens = [
  {
    source: 'splash_screen_emulator.png',
    output: '01_splash_screen_preview.png',
    badge: 'APP SCREEN 01 / 11',
    title: 'Splash Screen',
    subtitle: 'Welcome to Samrique Mama — Caring companion for your pregnancy journey',
    tags: ['WELCOME EXPERIENCE', 'BRAND IDENTITY'],
  },
  {
    source: 'shot_login.png',
    output: '02_login_screen_preview.png',
    badge: 'APP SCREEN 02 / 11',
    title: 'Sign In',
    subtitle: 'Secure access to your personal pregnancy profile and synchronized records',
    tags: ['AUTHENTICATION', 'SESSION RESTORE'],
  },
  {
    source: 'shot_register.png',
    output: '03_register_screen_preview.png',
    badge: 'APP SCREEN 03 / 11',
    title: 'Registration',
    subtitle: 'Personalized onboarding with estimated due date and profile creation',
    tags: ['ACCOUNT ONBOARDING', 'DUE DATE CALCULATION'],
  },
  {
    source: 'screen_live_now.png',
    output: '04_pregnancy_overview_preview.png',
    badge: 'APP SCREEN 04 / 11',
    title: 'Pregnancy Overview',
    subtitle: 'Week-by-week progress, fruit size milestone, countdown & quick actions',
    tags: ['WEEKLY MILESTONES', 'PROGRESS TRACKER'],
  },
  {
    source: 'health_tab_screen.png',
    output: '05_health_tracking_preview.png',
    badge: 'APP SCREEN 05 / 11',
    title: 'Health Tracking',
    subtitle: 'Daily mood rating, sleep hours, symptoms checklist, and vital history',
    tags: ['DAILY HEALTH LOG', 'SYMPTOMS CHECKLIST'],
  },
  {
    source: 'kick_tab_screen.png',
    output: '06_kick_counter_preview.png',
    badge: 'APP SCREEN 06 / 11',
    title: 'Kick Counter',
    subtitle: 'Record baby kicks and movements with real-time interval monitoring',
    tags: ['FETAL MOVEMENTS', 'SESSION TIMER'],
  },
  {
    source: 'shot_contractions.png',
    output: '07_contractions_timer_preview.png',
    badge: 'APP SCREEN 07 / 11',
    title: 'Contractions Timer',
    subtitle: 'Precision contraction timing and duration intervals for labor preparation',
    tags: ['LABOR TRACKER', 'INTERVAL ANALYTICS'],
  },
  {
    source: 'shot_hydration.png',
    output: '08_hydration_nutrition_preview.png',
    badge: 'APP SCREEN 08 / 11',
    title: 'Hydration & Nutrition',
    subtitle: 'Daily water intake targets and balanced meal calorie tracking',
    tags: ['WATER INTAKE', 'NUTRITION LOG'],
  },
  {
    source: 'shot_wellness.png',
    output: '09_wellness_activity_preview.png',
    badge: 'APP SCREEN 09 / 11',
    title: 'Wellness & Habits',
    subtitle: 'Gentle maternal exercise routines and mindful wellness habits',
    tags: ['DAILY WELLNESS', 'SAFE EXERCISE'],
  },
  {
    source: 'shot_visits.png',
    output: '10_prenatal_visits_preview.png',
    badge: 'APP SCREEN 10 / 11',
    title: 'Prenatal Visits',
    subtitle: 'Doctor appointments schedule, clinic notes, and upcoming care calendar',
    tags: ['CLINIC VISITS', 'CARE CALENDAR'],
  },
  {
    source: 'shot_community.png',
    output: '11_community_discussions_preview.png',
    badge: 'APP SCREEN 11 / 11',
    title: 'Community & Advice',
    subtitle: 'Mother-to-mother insights, expert advice, and supportive discussions',
    tags: ['COMMUNITY SUPPORT', 'MATERNAL TIPS'],
  },
];

const marketplaceScreens = [
  {
    source: '01_splash_screen.png',
    output: '01_splash_screen_preview.png',
    badge: 'APP SCREEN 01 / 18',
    title: 'Splash Screen',
    subtitle: 'Welcome to Samrique E-Marketplace — Curated digital products and assets',
    tags: ['WELCOME EXPERIENCE', 'BRAND IDENTITY'],
  },
  {
    source: '02_login_screen.png',
    output: '02_login_screen_preview.png',
    badge: 'APP SCREEN 02 / 18',
    title: 'User Login',
    subtitle: 'Quick authentication for buyers, sellers, and administrators',
    tags: ['AUTHENTICATION', 'ROLE DETECTION'],
  },
  {
    source: '03_register_screen.png',
    output: '03_register_screen_preview.png',
    badge: 'APP SCREEN 03 / 18',
    title: 'Account Sign Up',
    subtitle: 'Seamless onboarding for prospective buyers and creators',
    tags: ['REGISTRATION', 'ACCOUNT SETUP'],
  },
  {
    source: '04_forgot_password.png',
    output: '04_forgot_password_preview.png',
    badge: 'APP SCREEN 04 / 18',
    title: 'Password Recovery',
    subtitle: 'Secure email OTP verification to reset and restore access',
    tags: ['SECURITY', 'OTP RESET'],
  },
  {
    source: 'buyer_01_home.png',
    output: '05_buyer_home_preview.png',
    badge: 'APP SCREEN 05 / 18',
    title: 'Buyer Marketplace',
    subtitle: 'Featured templates, top categories, curated listings, and promotional deals',
    tags: ['DIGITAL DISCOVERY', 'FEATURED ITEMS'],
  },
  {
    source: 'buyer_02_product_detail.png',
    output: '06_buyer_product_detail_preview.png',
    badge: 'APP SCREEN 06 / 18',
    title: 'Product Details',
    subtitle: 'Rich gallery, live previews, specifications, ratings, and instant purchase',
    tags: ['GALLERY & SPECS', 'REVIEWS & RATINGS'],
  },
  {
    source: 'buyer_03_categories.png',
    output: '07_buyer_categories_preview.png',
    badge: 'APP SCREEN 07 / 18',
    title: 'Categories Directory',
    subtitle: 'Browse UI kits, Flutter apps, backend services, and cloud resources',
    tags: ['CATEGORY TAXONOMY', 'DIGITAL ASSETS'],
  },
  {
    source: 'buyer_04_search.png',
    output: '08_buyer_search_preview.png',
    badge: 'APP SCREEN 08 / 18',
    title: 'Search & Filters',
    subtitle: 'Instant keyword search with filters by price, ratings, and technology',
    tags: ['INSTANT SEARCH', 'FACETED FILTERS'],
  },
  {
    source: 'buyer_05_cart.png',
    output: '09_buyer_cart_preview.png',
    badge: 'APP SCREEN 09 / 18',
    title: 'Shopping Cart',
    subtitle: 'Review selected digital licenses, apply promo codes, and proceed to checkout',
    tags: ['CART MANAGEMENT', 'DISCOUNT CODES'],
  },
  {
    source: 'buyer_06_wishlist.png',
    output: '10_buyer_wishlist_preview.png',
    badge: 'APP SCREEN 10 / 18',
    title: 'Wishlist & Favorites',
    subtitle: 'Save favorite codebases and design assets for later consideration',
    tags: ['WISHLIST', 'SAVED ASSETS'],
  },
  {
    source: 'buyer_07_profile.png',
    output: '11_buyer_profile_preview.png',
    badge: 'APP SCREEN 11 / 18',
    title: 'Buyer Account & Orders',
    subtitle: 'Purchase history, invoice downloads, account settings, and support',
    tags: ['ORDER HISTORY', 'LICENSE DOWNLOADS'],
  },
  {
    source: 'seller_01_dashboard.png',
    output: '12_seller_dashboard_preview.png',
    badge: 'APP SCREEN 12 / 18',
    title: 'Seller Dashboard',
    subtitle: 'Revenue overview, sales metrics, live product stats, and store performance',
    tags: ['SELLER PORTAL', 'SALES OVERVIEW'],
  },
  {
    source: 'seller_02_products.png',
    output: '13_seller_products_preview.png',
    badge: 'APP SCREEN 13 / 18',
    title: 'Product Catalog',
    subtitle: 'Manage published items, track review statuses, and update pricing',
    tags: ['CATALOG MANAGEMENT', 'PRICE UPDATES'],
  },
  {
    source: 'seller_03_upload_product.png',
    output: '14_seller_upload_preview.png',
    badge: 'APP SCREEN 14 / 18',
    title: 'Publish Product',
    subtitle: 'Upload product screenshots, ZIP assets, changelog notes, and metadata',
    tags: ['CREATOR UPLOAD', 'ASSET PUBLISHING'],
  },
  {
    source: 'seller_04_analytics.png',
    output: '15_seller_analytics_preview.png',
    badge: 'APP SCREEN 15 / 18',
    title: 'Revenue Analytics',
    subtitle: 'In-depth sales growth graphs, conversion metrics, and payout summaries',
    tags: ['REVENUE METRICS', 'CONVERSION DATA'],
  },
  {
    source: 'seller_05_wallet.png',
    output: '16_seller_wallet_preview.png',
    badge: 'APP SCREEN 16 / 18',
    title: 'Seller Wallet',
    subtitle: 'Available earnings balance, bank payouts, and withdrawal requests',
    tags: ['PAYOUTS', 'WALLET BALANCE'],
  },
  {
    source: 'admin_01_dashboard.png',
    output: '17_admin_dashboard_preview.png',
    badge: 'APP SCREEN 17 / 18',
    title: 'Admin Control Center',
    subtitle: 'Platform-wide oversight for total gross sales, active users, and platform health',
    tags: ['ADMINISTRATION', 'PLATFORM METRICS'],
  },
  {
    source: 'admin_03_kyc_verification.png',
    output: '18_admin_kyc_preview.png',
    badge: 'APP SCREEN 18 / 18',
    title: 'KYC & Moderation',
    subtitle: 'Review government ID proofs, verify seller credentials, and enforce safety',
    tags: ['KYC VERIFICATION', 'TRUST & SAFETY'],
  },
];

function generatePreview(config, theme) {
  const sourcePath = path.join(theme.dir, config.source);
  const outputPath = path.join(theme.dir, config.output);

  // Convert source image to base64 so headless Edge has 0 file loading/cross-origin issues
  const imageBuffer = fs.readFileSync(sourcePath);
  const base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1600px;
      height: 900px;
      overflow: hidden;
      background: ${theme.bgColor};
      background-image: 
        radial-gradient(circle at 75% 50%, ${theme.glow1} 0%, transparent 55%),
        radial-gradient(circle at 20% 30%, ${theme.glow2} 0%, transparent 45%),
        radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px);
      background-size: 100% 100%, 100% 100%, 36px 36px;
      font-family: -apple-system, BlinkMacSystemFont, "Plus Jakarta Sans", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #ffffff;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 100px;
      position: relative;
    }
    .left {
      max-width: 650px;
      z-index: 2;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 8px 18px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.12);
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #cbd5e1;
      margin-bottom: 32px;
    }
    h1 {
      font-size: 58px;
      font-weight: 800;
      line-height: 1.12;
      margin-bottom: 20px;
      letter-spacing: -0.03em;
      color: #ffffff;
    }
    p {
      font-size: 21px;
      color: #94a3b8;
      line-height: 1.55;
      margin-bottom: 28px;
    }
    .line {
      width: 50px;
      height: 4px;
      background: ${theme.accentColor};
      border-radius: 2px;
      margin-bottom: 28px;
    }
    .tags {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      margin-bottom: 48px;
    }
    .tag {
      padding: 7px 18px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      color: #cbd5e1;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .brand-icon {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: ${theme.brandGradient};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      box-shadow: 0 8px 20px ${theme.brandShadow};
    }
    .brand-text b {
      display: block;
      font-size: 19px;
      font-weight: 700;
      color: #fff;
    }
    .brand-text span {
      display: block;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.8px;
      text-transform: uppercase;
      color: #94a3b8;
    }
    .right {
      position: relative;
      z-index: 2;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .phone-mockup {
      width: 375px;
      height: 800px;
      background: #0d131f;
      border-radius: 48px;
      padding: 10px;
      box-shadow: 
        0 40px 90px -15px rgba(0, 0, 0, 0.85),
        0 0 0 1px rgba(255, 255, 255, 0.18),
        0 0 60px ${theme.phoneGlow};
      position: relative;
    }
    .phone-screen {
      width: 100%;
      height: 100%;
      border-radius: 40px;
      overflow: hidden;
      background: #000;
      position: relative;
    }
    .phone-screen img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
  </style>
</head>
<body>
  <div class="left">
    <div class="badge">${config.badge}</div>
    <h1>${config.title}</h1>
    <p>${config.subtitle}</p>
    <div class="line"></div>
    <div class="tags">
      ${config.tags.map((t) => `<div class="tag">${t}</div>`).join('')}
    </div>
    <div class="brand">
      <div class="brand-icon">${theme.icon}</div>
      <div class="brand-text">
        <b>Samrique</b>
        <span>${theme.brandTitle}</span>
      </div>
    </div>
  </div>
  <div class="right">
    <div class="phone-mockup">
      <div class="phone-screen">
        <img src="${base64Image}" />
      </div>
    </div>
  </div>
</body>
</html>`;

  const tempHtmlPath = path.join(cwd, `temp_render_${Date.now()}_${Math.random().toString(36).substring(7)}.html`);
  fs.writeFileSync(tempHtmlPath, html, 'utf8');

  try {
    const cmd = `"${edgePath}" --headless=new --screenshot="${outputPath}" --window-size=1600,900 --hide-scrollbars "${tempHtmlPath}"`;
    execSync(cmd, { stdio: 'pipe' });
    console.log(`Generated: ${config.output}`);
  } finally {
    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }
  }
}

// 1. Generate for Samrique Mama
console.log('--- Generating Samrique Mama Preview Images ---');
const mamaTheme = {
  dir: path.join(cwd, 'assets/images/samrique_mama_pregnancy_tracker'),
  bgColor: '#090b14',
  glow1: 'rgba(244, 63, 94, 0.18)',
  glow2: 'rgba(217, 70, 239, 0.10)',
  accentColor: '#f43f5e',
  brandGradient: 'linear-gradient(135deg, #f43f5e, #fb7185)',
  brandShadow: 'rgba(244, 63, 94, 0.35)',
  phoneGlow: 'rgba(244, 63, 94, 0.22)',
  icon: '🌸',
  brandTitle: 'MAMA PREGNANCY TRACKER',
};

for (const screen of mamaScreens) {
  generatePreview(screen, mamaTheme);
}

// 2. Generate for Samrique E-Marketplace
console.log('--- Generating Samrique E-Marketplace Preview Images ---');
const marketplaceTheme = {
  dir: path.join(cwd, 'assets/images/samrique_e- marketplace'),
  bgColor: '#070c14',
  glow1: 'rgba(59, 130, 246, 0.16)',
  glow2: 'rgba(16, 185, 129, 0.12)',
  accentColor: '#3b82f6',
  brandGradient: 'linear-gradient(135deg, #3b82f6, #06b6d4)',
  brandShadow: 'rgba(59, 130, 246, 0.35)',
  phoneGlow: 'rgba(59, 130, 246, 0.22)',
  icon: '🛍️',
  brandTitle: 'E-MARKETPLACE FLUTTER APP',
};

for (const screen of marketplaceScreens) {
  generatePreview(screen, marketplaceTheme);
}

console.log('All preview images successfully generated!');

