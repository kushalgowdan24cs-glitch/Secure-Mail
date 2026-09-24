/* ============================================================
   SecureMailScope — Application Logic
   Dashboard, Scan Engine, Results, Blockchain Audit,
   Compliance, AI Engine — all modules
   ============================================================ */

// ==================== MOCK DATA ====================
const mockScanResults = [
    {
        domain: "mail.gov.in",
        riskScore: 92,
        riskLevel: "critical",
        tls: "fail", dkim: "fail", spf: "warn", dmarc: "fail",
        cert: "Expired",
        scanDate: "2026-09-23",
        tlsVersion: "TLS 1.0",
        cipherSuite: "RC4-SHA",
        certExpiry: "2026-03-15",
        certIssuer: "DigiCert Global Root G2",
        keyLength: "1024-bit RSA",
        remediations: [
            "Immediately upgrade from TLS 1.0 to TLS 1.3 (RFC 8446)",
            "Replace RC4-SHA cipher with AES-256-GCM or ChaCha20-Poly1305",
            "Renew expired X.509 certificate — expired 6 months ago",
            "Implement DMARC policy with p=reject to prevent spoofing",
            "Generate new RSA-2048 or ECDSA-P256 key pair"
        ]
    },
    {
        domain: "smtp.defence.gov.in",
        riskScore: 78,
        riskLevel: "high",
        tls: "warn", dkim: "fail", spf: "pass", dmarc: "warn",
        cert: "Weak Key",
        scanDate: "2026-09-23",
        tlsVersion: "TLS 1.1",
        cipherSuite: "DES-CBC3-SHA",
        certExpiry: "2027-01-20",
        certIssuer: "GlobalSign RSA OV SSL CA",
        keyLength: "2048-bit RSA",
        remediations: [
            "Upgrade from TLS 1.1 to TLS 1.3 — TLS 1.1 is deprecated per RFC 8996",
            "Replace 3DES cipher suite with modern AEAD cipher",
            "Configure DKIM signing with 2048-bit RSA key",
            "Strengthen DMARC policy from p=none to p=quarantine"
        ]
    },
    {
        domain: "mail.rbi.org.in",
        riskScore: 45,
        riskLevel: "medium",
        tls: "pass", dkim: "pass", spf: "pass", dmarc: "warn",
        cert: "Valid",
        scanDate: "2026-09-22",
        tlsVersion: "TLS 1.2",
        cipherSuite: "ECDHE-RSA-AES128-GCM-SHA256",
        certExpiry: "2027-08-14",
        certIssuer: "Let's Encrypt Authority X3",
        keyLength: "2048-bit RSA",
        remediations: [
            "Consider upgrading to TLS 1.3 for improved performance and security",
            "Strengthen DMARC policy to p=reject for full spoofing protection",
            "Upgrade to AES-256-GCM for higher encryption strength"
        ]
    },
    {
        domain: "email.isro.gov.in",
        riskScore: 15,
        riskLevel: "secure",
        tls: "pass", dkim: "pass", spf: "pass", dmarc: "pass",
        cert: "Valid",
        scanDate: "2026-09-22",
        tlsVersion: "TLS 1.3",
        cipherSuite: "TLS_AES_256_GCM_SHA384",
        certExpiry: "2027-11-30",
        certIssuer: "DigiCert SHA2 Extended Validation",
        keyLength: "ECDSA P-384",
        remediations: [
            "All configurations meet NIST SP 800-52 Rev. 2 standards",
            "Continue monitoring for certificate expiry (valid until Nov 2027)"
        ]
    },
    {
        domain: "mx.sbi.co.in",
        riskScore: 62,
        riskLevel: "high",
        tls: "pass", dkim: "warn", spf: "pass", dmarc: "fail",
        cert: "Valid",
        scanDate: "2026-09-21",
        tlsVersion: "TLS 1.2",
        cipherSuite: "ECDHE-RSA-AES256-SHA384",
        certExpiry: "2027-04-10",
        certIssuer: "Comodo RSA Organization Validation",
        keyLength: "2048-bit RSA",
        remediations: [
            "Implement DMARC policy with at minimum p=quarantine",
            "Fix DKIM selector — record found but signature verification failing",
            "Migrate to TLS 1.3 and disable SHA-384 in favor of SHA-256 for compatibility"
        ]
    },
    {
        domain: "mail.iitb.ac.in",
        riskScore: 22,
        riskLevel: "secure",
        tls: "pass", dkim: "pass", spf: "pass", dmarc: "pass",
        cert: "Valid",
        scanDate: "2026-09-21",
        tlsVersion: "TLS 1.3",
        cipherSuite: "TLS_CHACHA20_POLY1305_SHA256",
        certExpiry: "2027-09-01",
        certIssuer: "InCommon RSA Server CA 2",
        keyLength: "ECDSA P-256",
        remediations: [
            "Configuration is compliant with all frameworks",
            "Consider implementing MTA-STS for strict transport security"
        ]
    },
    {
        domain: "smtp.nic.in",
        riskScore: 85,
        riskLevel: "critical",
        tls: "fail", dkim: "fail", spf: "fail", dmarc: "fail",
        cert: "Self-signed",
        scanDate: "2026-09-20",
        tlsVersion: "SSL 3.0",
        cipherSuite: "NULL-SHA256",
        certExpiry: "2025-12-01",
        certIssuer: "Self-signed",
        keyLength: "512-bit RSA",
        remediations: [
            "CRITICAL: SSL 3.0 is severely compromised (POODLE attack) — upgrade immediately",
            "Replace self-signed certificate with CA-issued certificate",
            "512-bit RSA key can be factored in hours — generate 2048-bit+ key",
            "Implement SPF, DKIM, and DMARC from scratch",
            "NULL cipher provides zero encryption — deploy AES-256-GCM"
        ]
    },
    {
        domain: "secure.wipro.com",
        riskScore: 18,
        riskLevel: "secure",
        tls: "pass", dkim: "pass", spf: "pass", dmarc: "pass",
        cert: "Valid",
        scanDate: "2026-09-20",
        tlsVersion: "TLS 1.3",
        cipherSuite: "TLS_AES_128_GCM_SHA256",
        certExpiry: "2027-06-15",
        certIssuer: "DigiCert Global Root G2",
        keyLength: "ECDSA P-256",
        remediations: [
            "Fully compliant — consider AES-256-GCM for higher security margin"
        ]
    }
];

const mockAlerts = [
    { type: "critical", icon: "⚠️", title: "SSL 3.0 Detected on smtp.nic.in", desc: "Vulnerable to POODLE attack. Immediate upgrade required.", time: "2 min ago" },
    { type: "critical", icon: "🔓", title: "Expired Certificate — mail.gov.in", desc: "X.509 certificate expired on 2026-03-15. Connections are insecure.", time: "15 min ago" },
    { type: "critical", icon: "🛑", title: "NULL Cipher Active — smtp.nic.in", desc: "NULL-SHA256 provides zero encryption. All traffic is plaintext.", time: "22 min ago" },
    { type: "warning", icon: "⚡", title: "DMARC Misconfigured — mx.sbi.co.in", desc: "DMARC policy set to p=none — domain vulnerable to spoofing.", time: "1 hr ago" },
    { type: "info", icon: "ℹ️", title: "TLS 1.2 Deprecation Notice", desc: "3 servers still using TLS 1.2 — plan migration to TLS 1.3.", time: "3 hrs ago" }
];

const mockBlockchainRecords = [
    { domain: "mail.gov.in", hash: "0x7a3f...8b2c", time: "2 min ago", icon: "🔴" },
    { domain: "smtp.defence.gov.in", hash: "0x4e1d...9f7a", time: "18 min ago", icon: "🟠" },
    { domain: "mail.rbi.org.in", hash: "0xb82c...3d5e", time: "1 hr ago", icon: "🟡" },
    { domain: "email.isro.gov.in", hash: "0x1f9a...6c4b", time: "2 hrs ago", icon: "🟢" },
    { domain: "mx.sbi.co.in", hash: "0xd47e...2a8f", time: "3 hrs ago", icon: "🟠" },
    { domain: "mail.iitb.ac.in", hash: "0x93b1...7e6d", time: "5 hrs ago", icon: "🟢" }
];

const mockBlocks = [
    { num: 2847, hash: "0x7a3f8b2c", txns: 5, time: "2 min ago", prevHash: "0x4e1d9f7a", size: "2.4 KB" },
    { num: 2846, hash: "0x4e1d9f7a", txns: 3, time: "18 min ago", prevHash: "0xb82c3d5e", size: "1.8 KB" },
    { num: 2845, hash: "0xb82c3d5e", txns: 4, time: "1 hr ago", prevHash: "0x1f9a6c4b", size: "2.1 KB" },
    { num: 2844, hash: "0x1f9a6c4b", txns: 2, time: "2 hrs ago", prevHash: "0xd47e2a8f", size: "1.2 KB" },
    { num: 2843, hash: "0xd47e2a8f", txns: 6, time: "3 hrs ago", prevHash: "0x93b17e6d", size: "3.1 KB" }
];

const complianceChecklist = [
    { text: "TLS 1.3 support enabled", status: "pass", fw: "NIST SP 800-52" },
    { text: "Strong cipher suites (AEAD) configured", status: "pass", fw: "NIST SP 800-52" },
    { text: "No deprecated protocols (SSL 2.0/3.0, TLS 1.0/1.1)", status: "fail", fw: "RFC 8996" },
    { text: "X.509 certificates valid and not expired", status: "fail", fw: "NIST SP 800-52" },
    { text: "RSA key length ≥ 2048 bits", status: "fail", fw: "NIST SP 800-57" },
    { text: "ECDSA key with P-256 or P-384 curve", status: "pass", fw: "NIST FIPS 186-5" },
    { text: "Perfect Forward Secrecy (PFS) enabled", status: "pass", fw: "OWASP" },
    { text: "HSTS header configured", status: "pass", fw: "OWASP" },
    { text: "SPF record configured correctly", status: "warn", fw: "RFC 7208" },
    { text: "DKIM signing with ≥ 2048-bit key", status: "fail", fw: "RFC 6376" },
    { text: "DMARC policy set to quarantine or reject", status: "fail", fw: "RFC 7489" },
    { text: "Certificate chain complete and valid", status: "pass", fw: "NIST SP 800-52" },
    { text: "No self-signed certificates in production", status: "fail", fw: "CERT-In" },
    { text: "Certificate transparency (CT) logs available", status: "pass", fw: "RFC 6962" },
    { text: "OCSP stapling enabled", status: "pass", fw: "RFC 6960" },
    { text: "No known CVEs in TLS implementation", status: "pass", fw: "NVD/CVE" },
    { text: "STARTTLS supported on SMTP", status: "pass", fw: "RFC 3207" },
    { text: "MTA-STS policy published", status: "warn", fw: "RFC 8461" },
    { text: "DANE/TLSA records configured", status: "pass", fw: "RFC 6698" },
    { text: "No RC4, DES, or 3DES ciphers", status: "fail", fw: "OWASP" },
    { text: "Session ticket rotation < 24 hours", status: "pass", fw: "NIST SP 800-52" },
    { text: "TLS compression disabled (CRIME mitigation)", status: "pass", fw: "OWASP" },
    { text: "Renegotiation indication extension (RFC 5746)", status: "pass", fw: "RFC 5746" },
    { text: "SNI properly configured", status: "pass", fw: "RFC 6066" },
    { text: "Certificate key usage extensions correct", status: "pass", fw: "RFC 5280" },
    { text: "ARC (Authenticated Received Chain) support", status: "pass", fw: "RFC 8617" },
    { text: "BIMI record published", status: "warn", fw: "BIMI Working Group" },
    { text: "No wildcard certificates on critical systems", status: "pass", fw: "CERT-In" },
];

const cipherClassifications = [
    { cipher: "TLS_AES_256_GCM_SHA384", classification: "secure", confidence: "99.2%" },
    { cipher: "ECDHE-RSA-AES128-GCM-SHA256", classification: "secure", confidence: "97.8%" },
    { cipher: "TLS_CHACHA20_POLY1305_SHA256", classification: "secure", confidence: "98.5%" },
    { cipher: "RC4-SHA", classification: "deprecated", confidence: "99.9%" },
    { cipher: "DES-CBC3-SHA", classification: "weak", confidence: "96.3%" },
    { cipher: "NULL-SHA256", classification: "misconfigured", confidence: "99.9%" },
    { cipher: "ECDHE-RSA-AES256-SHA384", classification: "secure", confidence: "94.1%" },
    { cipher: "DHE-RSA-AES128-SHA", classification: "weak", confidence: "89.7%" },
    { cipher: "EXP-RC4-MD5", classification: "deprecated", confidence: "99.8%" },
    { cipher: "TLS_AES_128_GCM_SHA256", classification: "secure", confidence: "98.9%" },
    { cipher: "ECDHE-ECDSA-AES256-GCM-SHA384", classification: "secure", confidence: "99.4%" },
    { cipher: "RC4-MD5", classification: "deprecated", confidence: "99.7%" },
    { cipher: "ADH-AES256-SHA", classification: "misconfigured", confidence: "97.2%" },
];

// ==================== NAVIGATION ====================
function navigateTo(pageId) {
    // Update pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');

    // Update nav
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.querySelector(`[data-page="${pageId}"]`).classList.add('active');

    // Update topbar
    const titles = {
        dashboard: { title: "Security Dashboard", subtitle: "Real-time cryptographic health overview" },
        scan: { title: "New Security Scan", subtitle: "Scan mail server cryptographic configurations" },
        results: { title: "Scan Results", subtitle: "Detailed vulnerability assessment reports" },
        blockchain: { title: "Blockchain Audit Log", subtitle: "Immutable ledger of scan results & timestamps" },
        compliance: { title: "Compliance Dashboard", subtitle: "NIST, OWASP & CERT-In compliance tracking" },
        "ai-engine": { title: "AI Vulnerability Engine", subtitle: "ML-powered cryptographic classification" }
    };

    const t = titles[pageId];
    document.getElementById('topbarTitle').innerHTML = `<h1>${t.title}</h1><span class="topbar-subtitle">${t.subtitle}</span>`;

    // Close mobile sidebar
    document.getElementById('sidebar').classList.remove('open');
}

// Nav click handlers
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(item.dataset.page);
    });
});

// Mobile menu
document.getElementById('menuToggle').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
});

// ==================== DASHBOARD - CHARTS ====================
function drawVulnTrendChart() {
    const canvas = document.getElementById('vulnTrendChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.parentElement.clientWidth - 40;
    const h = 240;
    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    // Data
    const critData = [12, 14, 11, 15, 13, 10, 12, 9, 8, 11, 10, 7, 9, 8, 6, 8, 7, 5, 6, 7, 5, 4, 6, 5, 4, 3, 5, 4, 3, 3];
    const highData = [18, 20, 22, 19, 21, 18, 16, 19, 17, 15, 18, 16, 14, 17, 15, 13, 14, 12, 15, 13, 11, 13, 12, 10, 12, 11, 9, 10, 9, 8];
    const medData =  [25, 23, 28, 26, 24, 27, 25, 22, 26, 24, 22, 25, 23, 21, 24, 22, 20, 23, 21, 19, 22, 20, 18, 21, 19, 17, 20, 18, 16, 15];

    const maxVal = 35;
    const padLeft = 40, padRight = 10, padTop = 10, padBottom = 30;
    const chartW = w - padLeft - padRight;
    const chartH = h - padTop - padBottom;

    ctx.clearRect(0, 0, w, h);

    // Grid
    ctx.strokeStyle = 'rgba(99,102,241,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padTop + (chartH / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(w - padRight, y);
        ctx.stroke();

        ctx.fillStyle = '#5a6478';
        ctx.font = '10px Inter';
        ctx.textAlign = 'right';
        ctx.fillText(Math.round(maxVal - (maxVal / 5) * i), padLeft - 8, y + 3);
    }

    // X labels
    ctx.fillStyle = '#5a6478';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    for (let i = 0; i < 30; i += 5) {
        const x = padLeft + (chartW / 29) * i;
        ctx.fillText(`Day ${i + 1}`, x, h - 8);
    }

    function drawLine(data, color, fillColor) {
        ctx.beginPath();
        data.forEach((val, i) => {
            const x = padLeft + (chartW / (data.length - 1)) * i;
            const y = padTop + chartH - (val / maxVal) * chartH;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.5;
        ctx.lineJoin = 'round';
        ctx.stroke();

        // Fill
        const lastX = padLeft + chartW;
        const lastY = padTop + chartH - (data[data.length - 1] / maxVal) * chartH;
        ctx.lineTo(lastX, padTop + chartH);
        ctx.lineTo(padLeft, padTop + chartH);
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
    }

    drawLine(medData, '#f59e0b', 'rgba(245,158,11,0.06)');
    drawLine(highData, '#f97316', 'rgba(249,115,22,0.06)');
    drawLine(critData, '#ef4444', 'rgba(239,68,68,0.08)');

    // Dots on last points
    const datasets = [
        { data: critData, color: '#ef4444' },
        { data: highData, color: '#f97316' },
        { data: medData, color: '#f59e0b' }
    ];
    datasets.forEach(ds => {
        const val = ds.data[ds.data.length - 1];
        const x = padLeft + chartW;
        const y = padTop + chartH - (val / maxVal) * chartH;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fillStyle = ds.color;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x, y, 7, 0, Math.PI * 2);
        ctx.strokeStyle = ds.color;
        ctx.lineWidth = 1.5;
        ctx.globalAlpha = 0.4;
        ctx.stroke();
        ctx.globalAlpha = 1;
    });
}

function drawRiskDistChart() {
    const canvas = document.getElementById('riskDistChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 220;
    canvas.width = size * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const data = [
        { label: 'Critical', value: 15, color: '#ef4444' },
        { label: 'High', value: 22, color: '#f97316' },
        { label: 'Medium', value: 28, color: '#f59e0b' },
        { label: 'Low', value: 12, color: '#3b82f6' },
        { label: 'Secure', value: 23, color: '#10b981' }
    ];

    const total = data.reduce((s, d) => s + d.value, 0);
    const cx = size / 2, cy = size / 2, r = 80, inner = 52;
    let startAngle = -Math.PI / 2;

    data.forEach(d => {
        const angle = (d.value / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.arc(cx, cy, r, startAngle, startAngle + angle);
        ctx.arc(cx, cy, inner, startAngle + angle, startAngle, true);
        ctx.closePath();
        ctx.fillStyle = d.color;
        ctx.fill();
        startAngle += angle;
    });

    // Center text
    ctx.fillStyle = '#e8ecf4';
    ctx.font = 'bold 22px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(total.toString(), cx, cy - 2);
    ctx.fillStyle = '#5a6478';
    ctx.font = '10px Inter';
    ctx.fillText('Total', cx, cy + 14);

    // Legend
    const legend = document.getElementById('riskLegend');
    legend.innerHTML = data.map(d =>
        `<div class="legend-item"><div class="legend-dot" style="background:${d.color}"></div>${d.label}: ${d.value}</div>`
    ).join('');
}

// ==================== DASHBOARD - LISTS ====================
function renderRecentScans() {
    const container = document.getElementById('recentScansList');
    const colors = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', secure: '#10b981' };

    container.innerHTML = mockScanResults.slice(0, 5).map(s => `
        <div class="scan-item" onclick="navigateTo('results')">
            <div class="scan-item-icon" style="background:${colors[s.riskLevel]}20;color:${colors[s.riskLevel]}">
                ${s.domain.substring(0, 2).toUpperCase()}
            </div>
            <div class="scan-item-info">
                <div class="scan-item-domain">${s.domain}</div>
                <div class="scan-item-time">${s.scanDate} • Risk Score: ${s.riskScore}</div>
            </div>
            <span class="badge ${s.riskLevel}">${s.riskLevel}</span>
        </div>
    `).join('');
}

function renderAlerts() {
    const container = document.getElementById('alertsList');
    container.innerHTML = mockAlerts.map(a => `
        <div class="alert-item ${a.type}">
            <div class="alert-icon">${a.icon}</div>
            <div class="alert-content">
                <div class="alert-title">${a.title}</div>
                <div class="alert-desc">${a.desc}</div>
                <div class="alert-time">${a.time}</div>
            </div>
        </div>
    `).join('');
}

// ==================== SCAN ENGINE ====================
document.getElementById('scanForm').addEventListener('submit', function(e) {
    e.preventDefault();
    const domain = document.getElementById('domainInput').value.trim();
    if (!domain) return;

    // Show progress
    document.getElementById('scanProgressContainer').classList.remove('hidden');
    document.getElementById('scanTargetDomain').textContent = domain;
    document.getElementById('scanStatusBadge').textContent = 'In Progress';
    document.getElementById('scanStatusBadge').classList.remove('complete');

    // Reset stages
    document.querySelectorAll('.scan-stage').forEach(s => {
        s.classList.remove('active', 'completed');
        s.querySelector('.stage-icon').className = 'stage-icon pending';
        s.querySelector('.stage-status').textContent = 'Pending';
    });

    document.getElementById('scanLogContent').innerHTML = '';

    // Scroll to progress
    document.getElementById('scanProgressContainer').scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Simulate scan
    const stages = ['dns', 'tls', 'cert', 'cipher', 'auth', 'ai', 'report'];
    const stageNames = [
        'DNS Resolution & MX Lookup',
        'SMTP/TLS Handshake Analysis',
        'X.509 Certificate Extraction',
        'Cipher Suite Evaluation',
        'DKIM/SPF/DMARC Verification',
        'AI Vulnerability Classification',
        'Generating Risk Report'
    ];
    const stageMessages = [
        [`Resolving MX records for ${domain}...`, `MX record found: 10 ${domain}`, `Reverse DNS lookup successful`, `IPv4: 103.25.x.x resolved`],
        [`Initiating SMTP connection on port 25...`, `STARTTLS negotiation initiated`, `TLS handshake completed — TLS 1.2 detected`, `Cipher negotiated: ECDHE-RSA-AES128-GCM-SHA256`],
        [`Extracting server certificate...`, `Certificate Subject: CN=${domain}`, `Issuer: DigiCert Global Root G2`, `Validity: 2025-09-01 to 2027-09-01`, `Key: 2048-bit RSA`],
        [`Enumerating supported cipher suites...`, `23 cipher suites supported`, `3 weak ciphers detected: RC4-SHA, DES-CBC3-SHA, NULL-SHA256`, `Preferred: TLS_AES_256_GCM_SHA384`],
        [`Querying SPF record... v=spf1 found`, `Verifying DKIM selector... selector1._domainkey`, `DKIM signature: PASS (2048-bit RSA)`, `DMARC policy: p=quarantine`],
        [`Loading Transformer+RF ensemble model...`, `Extracting 47 cryptographic features...`, `Running inference... batch size 1`, `Classification: 2 WEAK, 1 DEPRECATED, 20 SECURE`, `Confidence: 97.3% average`],
        [`Calculating NIST SP 800-52 compliance score...`, `Generating OWASP crypto baseline report...`, `Risk Score: 38/100 (Medium)`, `Report generated — 4 remediations suggested`]
    ];

    let currentStage = 0;
    let progress = 0;

    function runStage() {
        if (currentStage >= stages.length) {
            // Complete
            document.getElementById('scanProgressBar').style.width = '100%';
            document.getElementById('scanProgressPercent').textContent = '100%';
            document.getElementById('scanStatusBadge').textContent = 'Complete';
            document.getElementById('scanStatusBadge').classList.add('complete');
            addLog('✅ Scan complete! Navigate to Results to view the full report.', 'success');
            return;
        }

        const stageEl = document.querySelector(`[data-stage="${stages[currentStage]}"]`);
        stageEl.classList.add('active');
        stageEl.querySelector('.stage-icon').className = 'stage-icon active';
        stageEl.querySelector('.stage-status').textContent = 'Running...';

        const messages = stageMessages[currentStage];
        let msgIndex = 0;

        function showMessage() {
            if (msgIndex >= messages.length) {
                // Stage complete
                stageEl.classList.remove('active');
                stageEl.classList.add('completed');
                stageEl.querySelector('.stage-icon').className = 'stage-icon completed';
                stageEl.querySelector('.stage-icon').innerHTML = '<svg viewBox="0 0 20 20" fill="currentColor"><path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"/></svg>';
                stageEl.querySelector('.stage-status').textContent = 'Complete';

                currentStage++;
                progress = Math.round((currentStage / stages.length) * 100);
                document.getElementById('scanProgressBar').style.width = progress + '%';
                document.getElementById('scanProgressPercent').textContent = progress + '%';

                setTimeout(runStage, 400);
                return;
            }

            const msg = messages[msgIndex];
            const type = msg.includes('found') || msg.includes('PASS') || msg.includes('complete') || msg.includes('successful') || msg.includes('SECURE')
                ? 'success'
                : msg.includes('weak') || msg.includes('WEAK') || msg.includes('DEPRECATED')
                    ? 'warning'
                    : 'info';
            addLog(msg, type);
            msgIndex++;

            // Update intermediate progress
            const stageProgress = (currentStage / stages.length) + (msgIndex / messages.length / stages.length);
            const pct = Math.round(stageProgress * 100);
            document.getElementById('scanProgressBar').style.width = pct + '%';
            document.getElementById('scanProgressPercent').textContent = pct + '%';

            setTimeout(showMessage, 600 + Math.random() * 400);
        }

        setTimeout(showMessage, 300);
    }

    addLog(`Starting security scan for ${domain}...`, 'info');
    setTimeout(runStage, 500);
});

function addLog(msg, type = '') {
    const logContent = document.getElementById('scanLogContent');
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour12: false });
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `<span class="log-time">[${time}]</span><span class="log-msg ${type}">${msg}</span>`;
    logContent.appendChild(entry);
    logContent.scrollTop = logContent.scrollHeight;
}

// ==================== RESULTS TABLE ====================
function renderResults(filter = 'all') {
    const tbody = document.getElementById('resultsBody');
    const colors = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#3b82f6', secure: '#10b981' };
    const statusText = { pass: 'Pass', fail: 'Fail', warn: 'Warn', na: 'N/A' };

    let data = mockScanResults;
    if (filter !== 'all') {
        data = data.filter(r => r.riskLevel === filter);
    }

    tbody.innerHTML = data.map((r, idx) => `
        <tr>
            <td>
                <div class="domain-cell">
                    <div class="domain-icon" style="background:${colors[r.riskLevel]}20;color:${colors[r.riskLevel]}">
                        ${r.domain.substring(0, 2).toUpperCase()}
                    </div>
                    <span class="domain-name">${r.domain}</span>
                </div>
            </td>
            <td><span class="risk-score ${r.riskLevel}">${r.riskScore}</span></td>
            <td><span class="status-dot ${r.tls}">${statusText[r.tls]}</span></td>
            <td><span class="status-dot ${r.dkim}">${statusText[r.dkim]}</span></td>
            <td><span class="status-dot ${r.spf}">${statusText[r.spf]}</span></td>
            <td><span class="status-dot ${r.dmarc}">${statusText[r.dmarc]}</span></td>
            <td><span class="badge ${r.cert === 'Valid' ? 'success' : r.cert === 'Expired' || r.cert === 'Self-signed' ? 'critical' : 'medium'}">${r.cert}</span></td>
            <td style="font-size:0.78rem;color:var(--text-muted)">${r.scanDate}</td>
            <td><button class="btn-sm" onclick="showDetail(${idx})">View Details</button></td>
        </tr>
    `).join('');
}

// Filter chips
document.querySelectorAll('.filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        renderResults(chip.dataset.filter);
    });
});

// Search
document.getElementById('resultsSearch').addEventListener('input', (e) => {
    const q = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#resultsBody tr');
    rows.forEach(row => {
        const domain = row.querySelector('.domain-name')?.textContent.toLowerCase() || '';
        row.style.display = domain.includes(q) ? '' : 'none';
    });
});

// Detail modal
function showDetail(idx) {
    const r = mockScanResults[idx];
    const colors = { critical: '#ef4444', high: '#f97316', medium: '#f59e0b', low: '#3b82f6', secure: '#10b981' };
    const modal = document.getElementById('resultDetailModal');
    const body = document.getElementById('modalBody');

    body.innerHTML = `
        <div class="modal-domain-header">
            <div class="modal-domain-icon" style="background:${colors[r.riskLevel]}20;color:${colors[r.riskLevel]}">
                ${r.domain.substring(0, 2).toUpperCase()}
            </div>
            <div class="modal-domain-info">
                <h2>${r.domain}</h2>
                <p>Scanned on ${r.scanDate} • Risk Score: <strong style="color:${colors[r.riskLevel]}">${r.riskScore}/100</strong></p>
            </div>
            <span class="badge ${r.riskLevel}" style="font-size:0.82rem;padding:6px 14px">${r.riskLevel.toUpperCase()}</span>
        </div>

        <div class="detail-section">
            <h4>TLS / Certificate Details</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="item-label">TLS Version</div>
                    <div class="item-value mono">${r.tlsVersion}</div>
                </div>
                <div class="detail-item">
                    <div class="item-label">Cipher Suite</div>
                    <div class="item-value mono">${r.cipherSuite}</div>
                </div>
                <div class="detail-item">
                    <div class="item-label">Certificate Expiry</div>
                    <div class="item-value mono">${r.certExpiry}</div>
                </div>
                <div class="detail-item">
                    <div class="item-label">Certificate Issuer</div>
                    <div class="item-value mono">${r.certIssuer}</div>
                </div>
                <div class="detail-item">
                    <div class="item-label">Key Length / Type</div>
                    <div class="item-value mono">${r.keyLength}</div>
                </div>
                <div class="detail-item">
                    <div class="item-label">Certificate Status</div>
                    <div class="item-value"><span class="badge ${r.cert === 'Valid' ? 'success' : 'critical'}">${r.cert}</span></div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h4>Email Authentication</h4>
            <div class="detail-grid">
                <div class="detail-item">
                    <div class="item-label">DKIM</div>
                    <div class="item-value"><span class="status-dot ${r.dkim}">${r.dkim === 'pass' ? 'Verified' : r.dkim === 'fail' ? 'Failed' : 'Warning'}</span></div>
                </div>
                <div class="detail-item">
                    <div class="item-label">SPF</div>
                    <div class="item-value"><span class="status-dot ${r.spf}">${r.spf === 'pass' ? 'Verified' : r.spf === 'fail' ? 'Failed' : 'Warning'}</span></div>
                </div>
                <div class="detail-item">
                    <div class="item-label">DMARC</div>
                    <div class="item-value"><span class="status-dot ${r.dmarc}">${r.dmarc === 'pass' ? 'Verified' : r.dmarc === 'fail' ? 'Failed' : 'Warning'}</span></div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h4>AI-Powered Remediation Suggestions</h4>
            <ul class="remediation-list">
                ${r.remediations.map(rem => `<li>${rem}</li>`).join('')}
            </ul>
        </div>
    `;

    modal.classList.remove('hidden');
}

document.getElementById('modalClose').addEventListener('click', () => {
    document.getElementById('resultDetailModal').classList.add('hidden');
});

document.getElementById('resultDetailModal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        e.currentTarget.classList.add('hidden');
    }
});

// ==================== BLOCKCHAIN ====================
function renderBlockchain() {
    // Chain visual
    const chainVisual = document.getElementById('chainVisual');
    chainVisual.innerHTML = mockBlocks.slice(0, 5).map((b, i) => {
        const block = `
            <div class="chain-block">
                <div class="block-num">Block #${b.num}</div>
                <div class="block-hash">${b.hash}</div>
                <div class="block-txns">${b.txns} txns</div>
            </div>
        `;
        return i < 4 ? block + '<div class="chain-connector"></div>' : block;
    }).join('');

    // Audit records
    const auditContainer = document.getElementById('auditRecords');
    auditContainer.innerHTML = mockBlockchainRecords.map(r => `
        <div class="audit-record">
            <div class="audit-record-icon">${r.icon}</div>
            <div class="audit-record-info">
                <div class="audit-record-domain">${r.domain}</div>
                <div class="audit-record-hash">TX: ${r.hash}</div>
            </div>
            <span class="audit-record-time">${r.time}</span>
        </div>
    `).join('');

    // Block explorer
    const explorerContainer = document.getElementById('blockExplorer');
    explorerContainer.innerHTML = mockBlocks.map(b => `
        <div class="block-item">
            <div class="block-item-header">
                <span class="block-number">Block #${b.num}</span>
                <span class="block-timestamp">${b.time}</span>
            </div>
            <div class="block-details">
                <div class="block-detail-item">
                    <span class="bd-label">Hash: </span>
                    <span class="bd-value">${b.hash}</span>
                </div>
                <div class="block-detail-item">
                    <span class="bd-label">Prev: </span>
                    <span class="bd-value">${b.prevHash}</span>
                </div>
                <div class="block-detail-item">
                    <span class="bd-label">Txns: </span>
                    <span class="bd-value">${b.txns}</span>
                </div>
                <div class="block-detail-item">
                    <span class="bd-label">Size: </span>
                    <span class="bd-value">${b.size}</span>
                </div>
            </div>
        </div>
    `).join('');
}

// ==================== COMPLIANCE ====================
function drawComplianceGauge() {
    const canvas = document.getElementById('complianceGauge');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const size = 280;
    canvas.width = size * window.devicePixelRatio;
    canvas.height = size * window.devicePixelRatio;
    canvas.style.width = size + 'px';
    canvas.style.height = size + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const cx = size / 2, cy = size / 2, r = 115;
    const startAngle = Math.PI * 0.75;
    const endAngle = Math.PI * 2.25;
    const totalAngle = endAngle - startAngle;

    // Background arc
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, endAngle);
    ctx.strokeStyle = 'rgba(99,102,241,0.1)';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Value arc
    const value = 0.942;
    const valueAngle = startAngle + totalAngle * value;

    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#6366f1');
    gradient.addColorStop(1, '#06b6d4');

    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, valueAngle);
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Glow
    ctx.beginPath();
    ctx.arc(cx, cy, r, startAngle, valueAngle);
    ctx.strokeStyle = 'rgba(99,102,241,0.15)';
    ctx.lineWidth = 24;
    ctx.lineCap = 'round';
    ctx.stroke();
}

function renderComplianceChecklist() {
    const container = document.getElementById('complianceChecklist');
    const icons = { pass: '✓', fail: '✗', warn: '!' };

    container.innerHTML = complianceChecklist.map(item => `
        <div class="checklist-item">
            <div class="check-icon ${item.status}">${icons[item.status]}</div>
            <span class="check-text">${item.text}</span>
            <span class="check-framework">${item.fw}</span>
        </div>
    `).join('');
}

// ==================== AI ENGINE ====================
function drawNeuralNet() {
    const canvas = document.getElementById('neuralNetCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = 600, h = 350;
    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    canvas.style.width = Math.min(w, window.innerWidth - 100) + 'px';
    canvas.style.height = 'auto';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    ctx.clearRect(0, 0, w, h);

    // Network layers
    const layers = [
        { count: 6, label: 'Input' },
        { count: 8, label: 'Hidden 1' },
        { count: 10, label: 'Attention' },
        { count: 8, label: 'Hidden 2' },
        { count: 6, label: 'Ensemble' },
        { count: 4, label: 'Output' }
    ];

    const layerSpacing = w / (layers.length + 1);
    const nodePositions = [];

    // Calculate positions
    layers.forEach((layer, li) => {
        const x = layerSpacing * (li + 1);
        const positions = [];
        const spacing = Math.min(36, (h - 60) / (layer.count + 1));
        const startY = (h - spacing * (layer.count - 1)) / 2;

        for (let i = 0; i < layer.count; i++) {
            positions.push({ x, y: startY + spacing * i });
        }
        nodePositions.push(positions);
    });

    // Draw connections
    for (let l = 0; l < nodePositions.length - 1; l++) {
        const curr = nodePositions[l];
        const next = nodePositions[l + 1];
        curr.forEach(n1 => {
            next.forEach(n2 => {
                const opacity = 0.03 + Math.random() * 0.08;
                ctx.beginPath();
                ctx.moveTo(n1.x, n1.y);
                ctx.lineTo(n2.x, n2.y);
                ctx.strokeStyle = `rgba(99,102,241,${opacity})`;
                ctx.lineWidth = 0.5;
                ctx.stroke();
            });
        });
    }

    // Animate a few highlighted connections
    const highlightPaths = [];
    for (let i = 0; i < 8; i++) {
        const path = [];
        for (let l = 0; l < nodePositions.length; l++) {
            const randomNode = nodePositions[l][Math.floor(Math.random() * nodePositions[l].length)];
            path.push(randomNode);
        }
        highlightPaths.push(path);
    }

    highlightPaths.forEach(path => {
        for (let i = 0; i < path.length - 1; i++) {
            const gradient = ctx.createLinearGradient(path[i].x, path[i].y, path[i + 1].x, path[i + 1].y);
            gradient.addColorStop(0, 'rgba(99,102,241,0.4)');
            gradient.addColorStop(1, 'rgba(6,182,212,0.4)');
            ctx.beginPath();
            ctx.moveTo(path[i].x, path[i].y);
            ctx.lineTo(path[i + 1].x, path[i + 1].y);
            ctx.strokeStyle = gradient;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }
    });

    // Draw nodes
    nodePositions.forEach((layer, li) => {
        layer.forEach((node, ni) => {
            const isHighlight = highlightPaths.some(p => p[li] === node);

            // Glow
            if (isHighlight) {
                ctx.beginPath();
                ctx.arc(node.x, node.y, 10, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(99,102,241,0.1)';
                ctx.fill();
            }

            ctx.beginPath();
            ctx.arc(node.x, node.y, 5, 0, Math.PI * 2);
            const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, 5);
            gradient.addColorStop(0, isHighlight ? '#818cf8' : '#4f5670');
            gradient.addColorStop(1, isHighlight ? '#6366f1' : '#2a3150');
            ctx.fillStyle = gradient;
            ctx.fill();
        });
    });

    // Layer labels
    ctx.fillStyle = '#5a6478';
    ctx.font = '10px Inter';
    ctx.textAlign = 'center';
    layers.forEach((layer, li) => {
        const x = layerSpacing * (li + 1);
        ctx.fillText(layer.label, x, h - 8);
    });
}

function drawModelMetrics() {
    const canvas = document.getElementById('modelMetricsChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.parentElement.clientWidth - 40;
    const h = 260;
    canvas.width = w * window.devicePixelRatio;
    canvas.height = h * window.devicePixelRatio;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const metrics = [
        { label: 'Accuracy', value: 0.973, color: '#6366f1' },
        { label: 'Precision', value: 0.961, color: '#06b6d4' },
        { label: 'Recall', value: 0.955, color: '#10b981' },
        { label: 'F1 Score', value: 0.958, color: '#f59e0b' },
        { label: 'AUC-ROC', value: 0.992, color: '#a855f7' }
    ];

    const barWidth = Math.min(50, (w - 80) / metrics.length - 20);
    const padLeft = 50, padBottom = 40, padTop = 20;
    const chartH = h - padBottom - padTop;

    // Grid
    ctx.strokeStyle = 'rgba(99,102,241,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padTop + (chartH / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padLeft, y);
        ctx.lineTo(w - 10, y);
        ctx.stroke();

        ctx.fillStyle = '#5a6478';
        ctx.font = '10px Inter';
        ctx.textAlign = 'right';
        ctx.fillText((100 - i * 20) + '%', padLeft - 8, y + 3);
    }

    // Bars
    const totalBarArea = w - padLeft - 30;
    const spacing = totalBarArea / metrics.length;

    metrics.forEach((m, i) => {
        const x = padLeft + spacing * i + (spacing - barWidth) / 2;
        const barH = m.value * chartH;
        const y = padTop + chartH - barH;

        // Bar
        const gradient = ctx.createLinearGradient(x, y, x, padTop + chartH);
        gradient.addColorStop(0, m.color);
        gradient.addColorStop(1, m.color + '40');
        ctx.fillStyle = gradient;

        // Rounded top
        const radius = 4;
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + barWidth - radius, y);
        ctx.quadraticCurveTo(x + barWidth, y, x + barWidth, y + radius);
        ctx.lineTo(x + barWidth, padTop + chartH);
        ctx.lineTo(x, padTop + chartH);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.fill();

        // Value label
        ctx.fillStyle = '#e8ecf4';
        ctx.font = 'bold 11px Inter';
        ctx.textAlign = 'center';
        ctx.fillText((m.value * 100).toFixed(1) + '%', x + barWidth / 2, y - 8);

        // X label
        ctx.fillStyle = '#5a6478';
        ctx.font = '10px Inter';
        ctx.fillText(m.label, x + barWidth / 2, h - 12);
    });
}

function renderClassificationFeed() {
    const container = document.getElementById('classificationFeed');
    container.innerHTML = cipherClassifications.slice(0, 8).map(c => `
        <div class="feed-item">
            <span class="feed-cipher">${c.cipher}</span>
            <span class="feed-classification ${c.classification}">${c.classification}</span>
            <span class="feed-confidence">${c.confidence}</span>
        </div>
    `).join('');

    // Live feed simulation
    let feedIdx = 8;
    setInterval(() => {
        const c = cipherClassifications[feedIdx % cipherClassifications.length];
        const item = document.createElement('div');
        item.className = 'feed-item';
        item.innerHTML = `
            <span class="feed-cipher">${c.cipher}</span>
            <span class="feed-classification ${c.classification}">${c.classification}</span>
            <span class="feed-confidence">${c.confidence}</span>
        `;
        container.insertBefore(item, container.firstChild);
        if (container.children.length > 10) {
            container.removeChild(container.lastChild);
        }
        feedIdx++;
    }, 3000);
}

function renderConfusionMatrix() {
    const container = document.getElementById('confusionMatrix');
    const labels = ['Secure', 'Weak', 'Depr.', 'Misconf.'];
    const matrix = [
        [1247, 12, 3, 2],
        [8, 389, 15, 5],
        [2, 18, 276, 4],
        [1, 7, 6, 198]
    ];

    let html = '<table class="cm-table"><thead><tr><th></th>';
    labels.forEach(l => html += `<th>${l}</th>`);
    html += '</tr></thead><tbody>';

    matrix.forEach((row, ri) => {
        html += `<tr><th>${labels[ri]}</th>`;
        row.forEach((val, ci) => {
            const cls = ri === ci ? 'high-val' : 'low-val';
            html += `<td class="${cls}">${val}</td>`;
        });
        html += '</tr>';
    });

    html += '</tbody></table>';
    html += '<div class="cm-labels"><span>← Predicted Labels →</span><span>↑ True Labels ↓</span></div>';
    container.innerHTML = html;
}

// ==================== ANIMATED COUNTERS ====================
function animateCounter(elementId, target, duration = 1500) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const start = 0;
    const isPercent = target.toString().includes('%');
    const isComma = target.toString().includes(',');
    const numTarget = parseFloat(target.toString().replace(/[,%]/g, ''));
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = start + (numTarget - start) * eased;

        if (isPercent) {
            el.textContent = current.toFixed(1) + '%';
        } else if (isComma) {
            el.textContent = Math.round(current).toLocaleString();
        } else {
            el.textContent = Math.round(current).toLocaleString();
        }

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ==================== INIT ====================
function init() {
    // Dashboard
    drawVulnTrendChart();
    drawRiskDistChart();
    renderRecentScans();
    renderAlerts();

    // Results
    renderResults();

    // Blockchain
    renderBlockchain();

    // Compliance
    drawComplianceGauge();
    renderComplianceChecklist();

    // AI Engine
    drawNeuralNet();
    drawModelMetrics();
    renderClassificationFeed();
    renderConfusionMatrix();

    // Animate counters
    animateCounter('totalScans', '1,247');
    animateCounter('totalVulns', '89');
    animateCounter('secureServers', '943');
    animateCounter('complianceRate', '94.2%');

    // Resize handler
    window.addEventListener('resize', () => {
        drawVulnTrendChart();
        drawRiskDistChart();
        drawComplianceGauge();
        drawNeuralNet();
        drawModelMetrics();
    });
}

// Start
document.addEventListener('DOMContentLoaded', init);
