const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
const cwd = process.cwd();

// Load base64 images
const marketplaceImg = fs.readFileSync(path.join(cwd, 'assets/images/samrique_e- marketplace/buyer_01_home.png')).toString('base64');
const zipiImg = fs.readFileSync(path.join(cwd, 'assets/images/zipi_bike_taxi_app/08-rider-home.png')).toString('base64');
const moneyImg = fs.readFileSync(path.join(cwd, 'assets/images/samrique_money_manager/transactions.png')).toString('base64');
const mamaImg = fs.readFileSync(path.join(cwd, 'assets/images/samrique_mama_pregnancy_tracker/screen_live_now.png')).toString('base64');

let logoImg = '';
if (fs.existsSync(path.join(cwd, 'public/samrique-logo.png'))) {
  logoImg = fs.readFileSync(path.join(cwd, 'public/samrique-logo.png')).toString('base64');
}

// 1. Generate 16:9 Landscape Banner (1600x900)
function generateLandscape() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1600px;
      height: 900px;
      background: #090D16;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #FFFFFF;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 50px 70px 45px 70px;
    }
    
    /* Background Glows */
    .bg-glow-1 {
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.18) 0%, rgba(59, 130, 246, 0) 70%);
      top: -150px;
      left: 100px;
      pointer-events: none;
    }
    .bg-glow-2 {
      position: absolute;
      width: 700px;
      height: 700px;
      background: radial-gradient(circle, rgba(244, 63, 94, 0.14) 0%, rgba(244, 63, 94, 0) 70%);
      bottom: -150px;
      right: 150px;
      pointer-events: none;
    }
    .bg-glow-3 {
      position: absolute;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0) 70%);
      top: 200px;
      right: -100px;
      pointer-events: none;
    }

    /* Grid pattern */
    .grid-pattern {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
    }

    /* Header Section */
    .header {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-left {
      max-width: 950px;
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 9999px;
      padding: 6px 16px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #38BDF8;
      margin-bottom: 14px;
      backdrop-filter: blur(10px);
    }
    .badge-pill .dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: #38BDF8;
      box-shadow: 0 0 10px #38BDF8;
    }
    h1 {
      font-size: 42px;
      font-weight: 800;
      letter-spacing: -1px;
      line-height: 1.15;
      background: linear-gradient(135deg, #FFFFFF 30%, #94A3B8 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 10px;
    }
    h1 span {
      background: linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #F43F5E 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p.subtitle {
      font-size: 17px;
      color: #94A3B8;
      font-weight: 400;
      line-height: 1.4;
    }

    /* Brand in header right */
    .brand-box {
      display: flex;
      align-items: center;
      gap: 14px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 10px 20px;
      border-radius: 16px;
      backdrop-filter: blur(8px);
    }
    .brand-box img {
      height: 38px;
      object-fit: contain;
    }
    .brand-text-block {
      text-align: right;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #FFFFFF;
    }
    .brand-tagline {
      font-size: 11px;
      color: #64748B;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      font-weight: 600;
    }

    /* 4 Products Showcase Container */
    .showcase-grid {
      position: relative;
      z-index: 10;
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 24px;
      margin-top: 15px;
      margin-bottom: 10px;
      height: 480px;
    }

    /* Product Card */
    .app-card {
      background: rgba(15, 23, 42, 0.75);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 18px 16px 14px 16px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(12px);
      position: relative;
      overflow: hidden;
    }
    .app-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
    }
    .card-1::before { background: linear-gradient(90deg, #3B82F6, #06B6D4); }
    .card-2::before { background: linear-gradient(90deg, #F59E0B, #EF4444); }
    .card-3::before { background: linear-gradient(90deg, #10B981, #06B6D4); }
    .card-4::before { background: linear-gradient(90deg, #F43F5E, #EC4899); }

    .card-header {
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .app-meta {
      display: flex;
      flex-direction: column;
    }
    .app-type {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .card-1 .app-type { color: #38BDF8; }
    .card-2 .app-type { color: #FBBF24; }
    .card-3 .app-type { color: #34D399; }
    .card-4 .app-type { color: #FB7185; }

    .app-name {
      font-size: 15px;
      font-weight: 700;
      color: #F8FAFC;
    }
    .app-screens-count {
      font-size: 10px;
      font-weight: 700;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      padding: 3px 8px;
      border-radius: 12px;
      color: #CBD5E1;
    }

    /* Device Mockup Frame */
    .mockup-frame {
      width: 100%;
      flex: 1;
      border-radius: 18px;
      border: 2px solid rgba(255, 255, 255, 0.12);
      background: #020617;
      overflow: hidden;
      position: relative;
      box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.8), 0 10px 25px rgba(0, 0, 0, 0.4);
    }
    .mockup-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
      display: block;
    }
    .mockup-glare {
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, transparent 40%);
      pointer-events: none;
    }

    /* Card Footer Tag */
    .card-footer {
      width: 100%;
      margin-top: 10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #94A3B8;
    }
    .tech-pill {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 10px;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 3px 8px;
      border-radius: 6px;
      color: #E2E8F0;
    }

    /* Bottom Status Bar */
    .bottom-bar {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .bottom-left {
      display: flex;
      align-items: center;
      gap: 20px;
      font-size: 13px;
      color: #94A3B8;
    }
    .feature-point {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .feature-point i {
      color: #38BDF8;
      font-size: 14px;
    }
    .bottom-right {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      font-weight: 600;
      color: #F8FAFC;
      background: rgba(56, 189, 248, 0.1);
      border: 1px solid rgba(56, 189, 248, 0.25);
      padding: 6px 16px;
      border-radius: 9999px;
    }
  </style>
</head>
<body>
  <div class="bg-glow-1"></div>
  <div class="bg-glow-2"></div>
  <div class="bg-glow-3"></div>
  <div class="grid-pattern"></div>

  <!-- Header -->
  <div class="header">
    <div class="header-left">
      <div class="badge-pill">
        <span class="dot"></span>
        FLUTTER STUDIO LAUNCH • POST 01
      </div>
      <h1>Building <span>Samrique</span>: From Sketch to Launch</h1>
      <p class="subtitle">Over the past months, I engineered 4 full production apps in Flutter. Here’s the first look.</p>
    </div>
    
    <div class="brand-box">
      ${logoImg ? `<img src="data:image/png;base64,${logoImg}" alt="Samrique Logo" />` : ''}
      <div class="brand-text-block">
        <div class="brand-title">SAMRIQUE</div>
        <div class="brand-tagline">Flutter App Studio</div>
      </div>
    </div>
  </div>

  <!-- 4 App Cards Grid -->
  <div class="showcase-grid">
    <!-- App 1: Marketplace -->
    <div class="app-card card-1">
      <div class="card-header">
        <div class="app-meta">
          <span class="app-type">Marketplace</span>
          <span class="app-name">Samrique E-Market</span>
        </div>
        <span class="app-screens-count">18 Screens</span>
      </div>
      <div class="mockup-frame">
        <img src="data:image/png;base64,${marketplaceImg}" alt="E-Marketplace" />
        <div class="mockup-glare"></div>
      </div>
      <div class="card-footer">
        <span class="tech-pill">Flutter • Razorpay</span>
        <span>Buyer / Seller / Admin</span>
      </div>
    </div>

    <!-- App 2: Zipi Ride Booking -->
    <div class="app-card card-2">
      <div class="card-header">
        <div class="app-meta">
          <span class="app-type">Ride-Booking</span>
          <span class="app-name">Zipi Bike Taxi</span>
        </div>
        <span class="app-screens-count">22 Screens</span>
      </div>
      <div class="mockup-frame">
        <img src="data:image/png;base64,${zipiImg}" alt="Zipi Bike Taxi" />
        <div class="mockup-glare"></div>
      </div>
      <div class="card-footer">
        <span class="tech-pill">Live GPS Radar</span>
        <span>Driver KYC • Transit</span>
      </div>
    </div>

    <!-- App 3: Money Manager -->
    <div class="app-card card-3">
      <div class="card-header">
        <div class="app-meta">
          <span class="app-type">Personal Finance</span>
          <span class="app-name">Money Manager</span>
        </div>
        <span class="app-screens-count">8 Screens</span>
      </div>
      <div class="mockup-frame">
        <img src="data:image/png;base64,${moneyImg}" alt="Money Manager" />
        <div class="mockup-glare"></div>
      </div>
      <div class="card-footer">
        <span class="tech-pill">Offline First</span>
        <span>Stats • CSV Export</span>
      </div>
    </div>

    <!-- App 4: Samrique Mama -->
    <div class="app-card card-4">
      <div class="card-header">
        <div class="app-meta">
          <span class="app-type">Pregnancy Tracker</span>
          <span class="app-name">Samrique Mama</span>
        </div>
        <span class="app-screens-count">11 Screens</span>
      </div>
      <div class="mockup-frame">
        <img src="data:image/png;base64,${mamaImg}" alt="Samrique Mama" />
        <div class="mockup-glare"></div>
      </div>
      <div class="card-footer">
        <span class="tech-pill">Weekly Tracker</span>
        <span>Kick Counter • Vitals</span>
      </div>
    </div>
  </div>

  <!-- Bottom Bar -->
  <div class="bottom-bar">
    <div class="bottom-left">
      <div class="feature-point">
        <span>⚡ 100% Cross-Platform Flutter</span>
      </div>
      <div class="feature-point">
        <span>🛠️ Production Architecture</span>
      </div>
      <div class="feature-point">
        <span>🎯 Custom UI & Micro-interactions</span>
      </div>
    </div>
    <div class="bottom-right">
      <span>Series Starting This Week → Follow Along</span>
    </div>
  </div>
</body>
</html>`;

  const tempHtmlPath = path.join(cwd, `temp_linkedin_landscape_${Date.now()}.html`);
  const outputPath = path.join(cwd, 'showcase/samrique-linkedin-post-1.png');
  fs.writeFileSync(tempHtmlPath, html, 'utf8');

  try {
    const cmd = `"${edgePath}" --headless=new --screenshot="${outputPath}" --window-size=1600,900 --hide-scrollbars "${tempHtmlPath}"`;
    execSync(cmd, { stdio: 'pipe' });
    console.log(`Generated: ${outputPath}`);
  } finally {
    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }
  }
}

// 2. Generate 1:1 Square (1200x1200) - best for mobile LinkedIn engagement
function generateSquare() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      width: 1200px;
      height: 1200px;
      background: #090D16;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #FFFFFF;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 60px;
    }
    
    .bg-glow-1 {
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(59, 130, 246, 0.20) 0%, rgba(59, 130, 246, 0) 70%);
      top: -150px;
      left: 100px;
      pointer-events: none;
    }
    .bg-glow-2 {
      position: absolute;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(244, 63, 94, 0.16) 0%, rgba(244, 63, 94, 0) 70%);
      bottom: -150px;
      right: 100px;
      pointer-events: none;
    }
    .grid-pattern {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
      background-size: 50px 50px;
      pointer-events: none;
    }

    .header {
      position: relative;
      z-index: 10;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .badge-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 9999px;
      padding: 8px 20px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 1.5px;
      text-transform: uppercase;
      color: #38BDF8;
      margin-bottom: 18px;
      backdrop-filter: blur(10px);
    }
    .badge-pill .dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #38BDF8;
      box-shadow: 0 0 10px #38BDF8;
    }
    h1 {
      font-size: 46px;
      font-weight: 800;
      letter-spacing: -1px;
      line-height: 1.15;
      margin-bottom: 12px;
      background: linear-gradient(135deg, #FFFFFF 30%, #CBD5E1 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    h1 span {
      background: linear-gradient(135deg, #38BDF8 0%, #A855F7 50%, #F43F5E 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p.subtitle {
      font-size: 19px;
      color: #94A3B8;
      font-weight: 400;
      max-width: 800px;
    }

    /* 2x2 Showcase Grid for Square Format */
    .grid-2x2 {
      position: relative;
      z-index: 10;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      height: 720px;
      margin: 25px 0;
    }

    .card-square {
      background: rgba(15, 23, 42, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      padding: 16px 20px;
      display: flex;
      flex-direction: row;
      gap: 20px;
      align-items: center;
      position: relative;
      box-shadow: 0 20px 40px -15px rgba(0, 0, 0, 0.5);
    }
    .card-square::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;
      width: 4px;
      border-radius: 24px 0 0 24px;
    }
    .cs-1::before { background: linear-gradient(180deg, #3B82F6, #06B6D4); }
    .cs-2::before { background: linear-gradient(180deg, #F59E0B, #EF4444); }
    .cs-3::before { background: linear-gradient(180deg, #10B981, #06B6D4); }
    .cs-4::before { background: linear-gradient(180deg, #F43F5E, #EC4899); }

    .card-square-phone {
      width: 140px;
      height: 280px;
      border-radius: 20px;
      border: 3px solid rgba(255, 255, 255, 0.15);
      overflow: hidden;
      background: #000;
      box-shadow: 0 15px 30px rgba(0, 0, 0, 0.6);
      flex-shrink: 0;
    }
    .card-square-phone img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: top center;
    }

    .card-square-info {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .cs-tag {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .cs-1 .cs-tag { color: #38BDF8; }
    .cs-2 .cs-tag { color: #FBBF24; }
    .cs-3 .cs-tag { color: #34D399; }
    .cs-4 .cs-tag { color: #FB7185; }

    .cs-title {
      font-size: 22px;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.2;
    }
    .cs-desc {
      font-size: 13px;
      color: #94A3B8;
      line-height: 1.4;
    }
    .cs-pills {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 6px;
    }
    .pill {
      font-size: 11px;
      font-weight: 600;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.1);
      padding: 3px 8px;
      border-radius: 6px;
      color: #CBD5E1;
    }

    .footer {
      position: relative;
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      padding-top: 18px;
    }
    .footer-brand {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 15px;
      font-weight: 700;
      color: #F8FAFC;
    }
    .footer-brand img {
      height: 32px;
    }
    .footer-cta {
      font-size: 14px;
      font-weight: 600;
      color: #38BDF8;
    }
  </style>
</head>
<body>
  <div class="bg-glow-1"></div>
  <div class="bg-glow-2"></div>
  <div class="grid-pattern"></div>

  <div class="header">
    <div class="badge-pill">
      <span class="dot"></span>
      FLUTTER STUDIO LAUNCH • POST 01
    </div>
    <h1>Building <span>Samrique</span>: 4 Apps, 1 Studio</h1>
    <p class="subtitle">From sketch to production launch across e-commerce, mobility, finance & wellness.</p>
  </div>

  <div class="grid-2x2">
    <!-- Card 1 -->
    <div class="card-square cs-1">
      <div class="card-square-phone">
        <img src="data:image/png;base64,${marketplaceImg}" alt="Marketplace" />
      </div>
      <div class="card-square-info">
        <div class="cs-tag">01 • Digital Commerce</div>
        <div class="cs-title">Samrique E-Market</div>
        <div class="cs-desc">Full multi-vendor marketplace with buyer, seller & admin workflows.</div>
        <div class="cs-pills">
          <span class="pill">18 Screens</span>
          <span class="pill">Razorpay</span>
          <span class="pill">Seller KYC</span>
        </div>
      </div>
    </div>

    <!-- Card 2 -->
    <div class="card-square cs-2">
      <div class="card-square-phone">
        <img src="data:image/png;base64,${zipiImg}" alt="Zipi Bike Taxi" />
      </div>
      <div class="card-square-info">
        <div class="cs-tag">02 • On-Demand Mobility</div>
        <div class="cs-title">Zipi Bike Taxi</div>
        <div class="cs-desc">Ride-booking app with live radar, GPS tracking, and captain dispatch.</div>
        <div class="cs-pills">
          <span class="pill">22 Screens</span>
          <span class="pill">Live GPS</span>
          <span class="pill">Captain KYC</span>
        </div>
      </div>
    </div>

    <!-- Card 3 -->
    <div class="card-square cs-3">
      <div class="card-square-phone">
        <img src="data:image/png;base64,${moneyImg}" alt="Money Manager" />
      </div>
      <div class="card-square-info">
        <div class="cs-tag">03 • Personal Finance</div>
        <div class="cs-title">Money Manager</div>
        <div class="cs-desc">Clean everyday expense tracker with analytics and instant CSV exports.</div>
        <div class="cs-pills">
          <span class="pill">8 Screens</span>
          <span class="pill">Offline First</span>
          <span class="pill">Analytics</span>
        </div>
      </div>
    </div>

    <!-- Card 4 -->
    <div class="card-square cs-4">
      <div class="card-square-phone">
        <img src="data:image/png;base64,${mamaImg}" alt="Samrique Mama" />
      </div>
      <div class="card-square-info">
        <div class="cs-tag">04 • Pregnancy & Health</div>
        <div class="cs-title">Samrique Mama</div>
        <div class="cs-desc">Weekly milestones, kick counter, contraction timer, and symptoms log.</div>
        <div class="cs-pills">
          <span class="pill">11 Screens</span>
          <span class="pill">Kick Counter</span>
          <span class="pill">Health Logs</span>
        </div>
      </div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-brand">
      ${logoImg ? `<img src="data:image/png;base64,${logoImg}" alt="Samrique Logo" />` : ''}
      <span>Samrique — Flutter Mobile Studio</span>
    </div>
    <div class="footer-cta">
      Follow the 4-part case study series →
    </div>
  </div>
</body>
</html>`;

  const tempHtmlPath = path.join(cwd, `temp_linkedin_square_${Date.now()}.html`);
  const outputPath = path.join(cwd, 'showcase/samrique-linkedin-post-1-square.png');
  fs.writeFileSync(tempHtmlPath, html, 'utf8');

  try {
    const cmd = `"${edgePath}" --headless=new --screenshot="${outputPath}" --window-size=1200,1200 --hide-scrollbars "${tempHtmlPath}"`;
    execSync(cmd, { stdio: 'pipe' });
    console.log(`Generated: ${outputPath}`);
  } finally {
    if (fs.existsSync(tempHtmlPath)) {
      fs.unlinkSync(tempHtmlPath);
    }
  }
}

console.log('Generating LinkedIn Showcase Images...');
generateLandscape();
generateSquare();
console.log('Completed successfully!');

