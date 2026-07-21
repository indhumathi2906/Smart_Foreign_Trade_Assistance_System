/* ============================================================
   SMART FOREIGN TRADE ASSISTANCE SYSTEM — script.js
   Full frontend logic — no backend required
   ============================================================ */

'use strict';

// ── Global State ─────────────────────────────────────────────
let APP_DATA = null;
let demandChartInstance = null;
let profitChartInstance = null;
let transitChartInstance = null;

// ── Boot ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  initNavigation();
  initClock();
  initDashboard();
  initDTIS();
  initBuyerSeller();
  initShipment();
  initCalculator();
  initDocuments();
  initCompliance();
  showToast('✅ SFTAS loaded successfully', 'info');
});

// ── Load JSON Data ────────────────────────────────────────────
async function loadData() {
  try {
    const res = await fetch('data.json');
    APP_DATA = await res.json();
  } catch (e) {
    // Fallback: minimal inline data if fetch fails (file:// protocol)
    APP_DATA = getInlineFallbackData();
    showToast('⚠️ Running with cached data', 'warning');
  }
}

// ── Navigation ────────────────────────────────────────────────
function initNavigation() {
  const pageTitles = {
    dashboard: ['Dashboard', 'Overview'],
    dtis: ['Trade', 'Intelligence'],
    product: ['Product', 'Input'],
    buyers: ['Buyers &', 'Sellers'],
    shipment: ['Shipment', 'Tracking'],
    calculator: ['Cost &', 'Calculator'],
    documents: ['Documentation', 'Generator'],
    compliance: ['Compliance', 'Guide'],
  };

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const page = item.dataset.page;
      switchPage(page);
      // Close mobile sidebar
      document.getElementById('sidebar').classList.remove('open');
    });
  });
}

function switchPage(page) {
  document.querySelectorAll('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.page === page));
  document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === `page-${page}`));

  const titles = {
    dashboard: '<span>Dashboard</span> Overview',
    dtis: '<span>Trade</span> Intelligence · DTIS',
    product: '<span>Product</span> Input',
    buyers: '<span>Buyers &</span> Sellers',
    shipment: '<span>Shipment</span> Tracking',
    calculator: '<span>Cost &</span> Profit Calculator',
    documents: '<span>Documentation</span> Generator',
    compliance: '<span>Compliance</span> Guide',
  };
  document.getElementById('page-title').innerHTML = titles[page] || page;

  if (page === 'calculator') setTimeout(calculateProfit, 100);
  if (page === 'documents') setTimeout(previewInvoice, 100);
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ── Clock ─────────────────────────────────────────────────────
function initClock() {
  const el = document.getElementById('live-time');
  const tick = () => {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-IN', { hour12: false });
  };
  tick();
  setInterval(tick, 1000);
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  const container = document.getElementById('toast-container');
  const icons = { info: '🔵', success: '✅', warning: '⚠️', error: '❌' };
  const el = document.createElement('div');
  el.className = 'toast-item';
  el.innerHTML = `<span>${icons[type] || '🔵'}</span><span>${msg}</span>`;
  container.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

// ── DASHBOARD ─────────────────────────────────────────────────
function initDashboard() {
  renderActivityFeed();
  renderDashboardAlerts();
}

function renderActivityFeed() {
  const activities = [
    { icon: '📦', text: 'New order from Al Fardan Trading LLC (UAE)', time: '2m ago', color: 'var(--accent)' },
    { icon: '✅', text: 'Shipment SFTAS-2024-001836 cleared customs', time: '18m ago', color: 'var(--success)' },
    { icon: '⚠️', text: 'High tariff alert for China — Electronics', time: '45m ago', color: 'var(--warning)' },
    { icon: '💱', text: 'USD/INR rate updated — 83.42', time: '1h ago', color: 'var(--gold)' },
    { icon: '📊', text: 'Textile demand surge detected in UAE (+14%)', time: '2h ago', color: 'var(--accent2)' },
    { icon: '📄', text: 'Invoice INV-2024-0891 generated & sent', time: '3h ago', color: 'var(--accent3)' },
  ];
  const feed = document.getElementById('activity-feed');
  feed.innerHTML = activities.map(a => `
    <div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="width:32px;height:32px;border-radius:8px;background:rgba(255,255,255,0.04);display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0">${a.icon}</div>
      <div style="flex:1">
        <div style="font-size:0.82rem;color:var(--text-primary)">${a.text}</div>
        <div style="font-size:0.68rem;color:var(--text-muted);font-family:var(--font-mono);margin-top:2px">${a.time}</div>
      </div>
    </div>
  `).join('');
}

function renderDashboardAlerts() {
  const alerts = [
    { type: 'danger', icon: '🔴', title: 'High Risk', msg: 'China imposes new 12% textile tariff' },
    { type: 'warning', icon: '🟡', title: 'Caution', msg: 'USD weakening — monitor export rates' },
    { type: 'success', icon: '🟢', title: 'Opportunity', msg: 'UAE demand spike — Textiles +34%' },
  ];
  document.getElementById('dashboard-alerts').innerHTML = alerts.map(a => `
    <div class="alert-trade alert-${a.type}" style="margin-bottom:8px">
      <span class="alert-icon">${a.icon}</span>
      <div class="alert-body">
        <div class="alert-title">${a.title}</div>
        <div style="font-size:0.78rem">${a.msg}</div>
      </div>
    </div>
  `).join('');
}

// ── DTIS ──────────────────────────────────────────────────────
function initDTIS() {
  renderNews();
  initDemandChart();
  convertCurrency();

  document.getElementById('trend-product-select').addEventListener('change', function () {
    updateDemandChart(this.value);
  });
}

function renderNews() {
  if (!APP_DATA?.news) return;
  const feed = document.getElementById('news-feed');
  feed.innerHTML = APP_DATA.news.map(n => `
    <div class="news-item">
      <div class="news-emoji">${n.icon}</div>
      <div class="news-content">
        <div class="news-category">${n.category}</div>
        <div class="news-title">${n.title}</div>
        <div class="news-summary">${n.summary}</div>
        <div class="news-date">${formatDate(n.date)}</div>
      </div>
    </div>
  `).join('');
}

function initDemandChart() {
  const ctx = document.getElementById('demandChart').getContext('2d');
  const data = APP_DATA?.demandTrends || {};
  const labels = data.labels || [];
  const product = 'Textiles';
  const values = data.datasets?.[product] || [];

  demandChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: `${product} Demand Index`,
        data: values,
        borderColor: '#00d4ff',
        backgroundColor: 'rgba(0,212,255,0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#00d4ff',
        pointRadius: 4,
        pointHoverRadius: 7,
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { labels: { color: '#8892a4', font: { family: 'DM Mono', size: 11 } } },
        tooltip: {
          backgroundColor: '#161b2a', borderColor: 'rgba(0,212,255,0.3)', borderWidth: 1,
          titleColor: '#e8edf5', bodyColor: '#8892a4',
          callbacks: { label: ctx => ` Demand Index: ${ctx.parsed.y}` }
        }
      },
      scales: {
        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#4a5568', font: { family: 'DM Mono', size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#4a5568', font: { family: 'DM Mono', size: 10 } } }
      }
    }
  });
}

function updateDemandChart(product) {
  if (!demandChartInstance || !APP_DATA) return;
  const values = APP_DATA.demandTrends.datasets[product] || [];
  const colors = {
    Textiles: '#00d4ff', Electronics: '#7c5cfc',
    Agriculture: '#00f5a0', Pharmaceuticals: '#fbbf24'
  };
  const color = colors[product] || '#00d4ff';
  demandChartInstance.data.datasets[0].data = values;
  demandChartInstance.data.datasets[0].label = `${product} Demand Index`;
  demandChartInstance.data.datasets[0].borderColor = color;
  demandChartInstance.data.datasets[0].backgroundColor = color.replace(')', ',0.08)').replace('rgb', 'rgba');
  demandChartInstance.data.datasets[0].pointBackgroundColor = color;
  demandChartInstance.update('active');
}

// ── Currency Converter ─────────────────────────────────────────
function convertCurrency() {
  const inr = parseFloat(document.getElementById('inr-input').value) || 0;
  const sel = document.getElementById('currency-select');
  const opt = sel.options[sel.selectedIndex];
  const rate = parseFloat(opt.dataset.rate);
  const currency = opt.value;
  const result = inr * rate;

  document.getElementById('converted-result').textContent =
    `${formatNumber(result, 2)} ${currency}`;
  document.getElementById('rate-info').textContent =
    `Rate: 1 INR = ${rate.toFixed(4)} ${currency}`;

  const msgs = {
    USD: '💡 Higher USD = Better export profit for Indian exporters!',
    AED: '💡 UAE Dirham is pegged to USD — stable & predictable.',
    EUR: '💡 EU market offers premium pricing for quality goods.',
    GBP: '💡 GBP remains strong — excellent for UK exports.',
    JPY: '💡 Weak yen boosts competitiveness of Indian exports to Japan.',
    SGD: '💡 Singapore dollar is stable — ideal re-export hub.',
    CNY: '💡 Monitor trade tensions before committing to China exports.',
  };
  document.getElementById('currency-impact').textContent =
    msgs[currency] || '💡 Monitor exchange rates before finalizing export price.';
}

document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('inr-input');
  const sel = document.getElementById('currency-select');
  if (input) input.addEventListener('input', convertCurrency);
  if (sel) sel.addEventListener('change', convertCurrency);
});

// ── Smart Recommendation Engine ────────────────────────────────
function getRecommendation() {
  const product = document.getElementById('rec-product').value;
  const country = document.getElementById('rec-country').value;

  if (!product || !country) {
    showToast('⚠️ Please select both product and country', 'warning');
    return;
  }

  const recs = APP_DATA?.recommendations?.[product]?.[country];
  const countryData = APP_DATA?.countries?.find(c => c.name === country);

  if (!recs || !countryData) {
    document.getElementById('rec-output').innerHTML = `
      <div class="alert-trade alert-warning">
        <span class="alert-icon">⚠️</span>
        <div class="alert-body"><div class="alert-title">No Data</div>Recommendation data not available for this combination.</div>
      </div>`;
    return;
  }

  const riskClass = { Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high' };
  const demandColor = { 'Very High': 'var(--success)', High: 'var(--accent)', Medium: 'var(--gold)', Low: 'var(--danger)' };
  const profitColor = { 'Very High': 'var(--success)', High: 'var(--accent)', Medium: 'var(--gold)', Low: 'var(--danger)' };

  document.getElementById('rec-output').innerHTML = `
    <div class="rec-result">
      <div class="rec-row">
        <span class="label">Product</span>
        <strong style="color:var(--text-primary)">${product}</strong>
      </div>
      <div class="rec-row">
        <span class="label">Target Market</span>
        <strong style="color:var(--text-primary)">${countryData.flag} ${country}</strong>
      </div>
      <div class="rec-row">
        <span class="label">Demand Level</span>
        <strong style="color:${demandColor[recs.demand] || 'var(--accent)'}">${recs.demand}</strong>
      </div>
      <div class="rec-row">
        <span class="label">Risk Level</span>
        <span class="badge-custom ${riskClass[recs.risk] || 'badge-medium'}">${recs.risk}</span>
      </div>
      <div class="rec-row">
        <span class="label">Profit Potential</span>
        <strong style="color:${profitColor[recs.profit] || 'var(--gold)'}">${recs.profit}</strong>
      </div>
      <div class="rec-row">
        <span class="label">Tariff Rate</span>
        <span class="mono" style="color:var(--gold)">${countryData.tariff}</span>
      </div>
      <div class="rec-row">
        <span class="label">Demand Score</span>
        <div style="display:flex;align-items:center;gap:8px;flex:1;justify-content:flex-end">
          <div style="width:80px;height:6px;background:var(--bg-base);border-radius:99px;overflow:hidden">
            <div style="width:${countryData.demandScore}%;height:100%;background:var(--accent);border-radius:99px"></div>
          </div>
          <span class="mono" style="font-size:0.72rem;color:var(--accent)">${countryData.demandScore}/100</span>
        </div>
      </div>
      <div class="rec-tip">
        <strong>💡 Expert Tip:</strong> ${recs.tip}
      </div>
    </div>
  `;

  // Update risk alerts
  updateRiskAlerts(country, recs.risk, countryData);
  // Update map
  updateMap('product-map', countryData.mapQuery);
  showToast(`✅ Analysis complete for ${product} → ${country}`, 'success');
}

// ── Risk Alert System ──────────────────────────────────────────
function updateRiskAlerts(country, risk, countryData) {
  const container = document.getElementById('risk-alerts-output');
  const badge = document.getElementById('risk-count-badge');
  const rules = countryData.rules || [];

  let alertsHTML = '';
  if (risk === 'High') {
    alertsHTML += `<div class="alert-trade alert-danger"><span class="alert-icon">🔴</span>
      <div class="alert-body"><div class="alert-title">High Risk Market</div>
      ${country} is classified as HIGH RISK. Extensive due diligence required. Consider trade finance protection.</div></div>`;
    badge.className = 'badge-custom badge-high';
    badge.textContent = 'High Risk';
  } else if (risk === 'Medium') {
    alertsHTML += `<div class="alert-trade alert-warning"><span class="alert-icon">🟡</span>
      <div class="alert-body"><div class="alert-title">Medium Risk Market</div>
      ${country} has moderate risk. Ensure full compliance documentation and consider credit insurance.</div></div>`;
    badge.className = 'badge-custom badge-medium';
    badge.textContent = 'Medium Risk';
  } else {
    alertsHTML += `<div class="alert-trade alert-success"><span class="alert-icon">🟢</span>
      <div class="alert-body"><div class="alert-title">Low Risk Market</div>
      ${country} is a LOW RISK trading partner. Stable regulations and favorable trade environment.</div></div>`;
    badge.className = 'badge-custom badge-low';
    badge.textContent = 'Low Risk';
  }

  alertsHTML += `<div style="margin-top:12px">
    <div style="font-size:0.72rem;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted);margin-bottom:10px">Compliance Requirements for ${country}</div>
    ${rules.map(r => `<div class="alert-trade alert-info" style="padding:10px 14px;margin-bottom:8px">
      <span class="alert-icon">📋</span>
      <div class="alert-body">${r}</div>
    </div>`).join('')}
  </div>`;

  alertsHTML += `<div class="mt-3 p-3" style="background:var(--bg-elevated);border-radius:10px;border:1px solid var(--border)">
    <div style="font-size:0.72rem;font-family:var(--font-mono);text-transform:uppercase;color:var(--text-muted);margin-bottom:6px">Market Notes</div>
    <div style="font-size:0.82rem;color:var(--text-secondary);line-height:1.6">${countryData.notes}</div>
  </div>`;

  container.innerHTML = alertsHTML;
}

// ── Buyer/Seller ───────────────────────────────────────────────
function initBuyerSeller() {
  filterEntities();
}

function filterEntities() {
  const product = document.getElementById('filter-product').value;
  const country = document.getElementById('filter-country').value;
  const type = document.getElementById('filter-type').value;

  let data = type === 'buyers' ? (APP_DATA?.buyers || []) : (APP_DATA?.sellers || []);

  if (product !== 'all') data = data.filter(e => e.product === product);
  if (country !== 'all') data = data.filter(e => e.country === country);

  document.getElementById('entity-count').textContent = `${data.length} records`;

  const thead = document.getElementById('entity-thead');
  const tbody = document.getElementById('entity-tbody');

  if (type === 'buyers') {
    thead.innerHTML = `<tr>
      <th>#</th><th>Company</th><th>Country</th><th>Product</th>
      <th>Budget</th><th>Contact</th><th>Rating</th>
    </tr>`;
    tbody.innerHTML = data.map((b, i) => `
      <tr>
        <td><span class="entity-avatar">${b.name[0]}</span></td>
        <td><strong style="color:var(--text-primary)">${b.name}</strong></td>
        <td><span class="badge-custom badge-accent">${b.country}</span></td>
        <td style="color:var(--text-secondary)">${b.product}</td>
        <td><span class="mono" style="color:var(--gold)">$${formatNumber(b.budget)}</span></td>
        <td><a href="mailto:${b.contact}" style="color:var(--accent);font-size:0.78rem">${b.contact}</a></td>
        <td><span class="star-rating">${'★'.repeat(Math.floor(b.rating))}${b.rating % 1 ? '½' : ''}</span> <span class="mono" style="font-size:0.7rem">${b.rating}</span></td>
      </tr>
    `).join('');
  } else {
    thead.innerHTML = `<tr>
      <th>#</th><th>Company</th><th>Country</th><th>Product</th>
      <th>Min Order</th><th>Contact</th><th>Rating</th>
    </tr>`;
    tbody.innerHTML = data.map((s, i) => `
      <tr>
        <td><span class="entity-avatar" style="background:linear-gradient(135deg,var(--accent2),var(--accent))">${s.name[0]}</span></td>
        <td><strong style="color:var(--text-primary)">${s.name}</strong></td>
        <td><span class="badge-custom badge-accent">${s.country}</span></td>
        <td style="color:var(--text-secondary)">${s.product}</td>
        <td><span class="mono" style="color:var(--gold)">₹${formatNumber(s.minOrder)}</span></td>
        <td><a href="mailto:${s.contact}" style="color:var(--accent);font-size:0.78rem">${s.contact}</a></td>
        <td><span class="star-rating">${'★'.repeat(Math.floor(s.rating))}</span> <span class="mono" style="font-size:0.7rem">${s.rating}</span></td>
      </tr>
    `).join('');
  }

  if (data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px;font-size:0.83rem">No records found for selected filters</td></tr>`;
  }
}

// ── Shipment Tracking ──────────────────────────────────────────
const SHIPMENTS = [
  { id: 'SFTAS-2024-001842', product: 'Cotton Fabrics', buyer: 'Al Fardan Trading', from: 'Mumbai', to: 'Dubai', status: 2, date: '2024-03-10', weight: '2,400 kg', value: '₹12.5L' },
  { id: 'SFTAS-2024-001836', product: 'LED Modules', buyer: 'Tech Galaxy GmbH', from: 'Chennai', to: 'Hamburg', status: 4, date: '2024-03-02', weight: '850 kg', value: '₹8.2L' },
  { id: 'SFTAS-2024-001829', product: 'Organic Spices', buyer: 'Nature\'s Best LLC', from: 'Kochi', to: 'New York', status: 3, date: '2024-02-28', weight: '1,200 kg', value: '₹5.6L' },
  { id: 'SFTAS-2024-001818', product: 'Pharma Generics', buyer: 'Medi-Supply UK', from: 'Hyderabad', to: 'London', status: 4, date: '2024-02-20', weight: '480 kg', value: '₹22.1L' },
];
const STEPS = ['Order Placed', 'Processing', 'Shipped', 'Customs', 'Delivered'];
const STEP_ICONS = ['📋', '⚙️', '🚢', '🛃', '✅'];

function initShipment() {
  const container = document.getElementById('sample-shipments');
  container.innerHTML = SHIPMENTS.map(s => `
    <div onclick="loadShipment('${s.id}')"
      style="background:var(--bg-elevated);border:1px solid var(--border);border-radius:8px;padding:12px;margin-bottom:8px;cursor:pointer;transition:var(--transition)"
      onmouseover="this.style.borderColor='var(--border-accent)'" onmouseout="this.style.borderColor='var(--border)'">
      <div style="font-family:var(--font-mono);font-size:0.72rem;color:var(--accent)">${s.id}</div>
      <div style="font-size:0.82rem;color:var(--text-primary);margin:3px 0">${s.product}</div>
      <div style="font-size:0.7rem;color:var(--text-muted)">${s.from} → ${s.to} · ${STEPS[s.status]}</div>
    </div>
  `).join('');

  initTransitChart();
}

function loadShipment(id) {
  document.getElementById('track-id').value = id;
  trackShipment();
}

function trackShipment() {
  const id = document.getElementById('track-id').value.trim().toUpperCase();
  const ship = SHIPMENTS.find(s => s.id === id || id === '');
  const result = ship || SHIPMENTS[0];

  document.getElementById('track-awb').textContent = result.id;
  const statusBadge = document.getElementById('track-status-badge');
  statusBadge.textContent = STEPS[result.status];
  statusBadge.className = `badge-custom ${result.status === 4 ? 'badge-low' : result.status >= 2 ? 'badge-accent' : 'badge-medium'}`;

  document.getElementById('track-meta').innerHTML = `
    <div class="col-6 col-md-3">
      <div style="font-size:0.65rem;font-family:var(--font-mono);text-transform:uppercase;color:var(--text-muted)">Product</div>
      <div style="font-size:0.83rem;color:var(--text-primary);margin-top:3px">${result.product}</div>
    </div>
    <div class="col-6 col-md-3">
      <div style="font-size:0.65rem;font-family:var(--font-mono);text-transform:uppercase;color:var(--text-muted)">Buyer</div>
      <div style="font-size:0.83rem;color:var(--text-primary);margin-top:3px">${result.buyer}</div>
    </div>
    <div class="col-6 col-md-3">
      <div style="font-size:0.65rem;font-family:var(--font-mono);text-transform:uppercase;color:var(--text-muted)">Route</div>
      <div style="font-size:0.83rem;color:var(--text-primary);margin-top:3px">${result.from} → ${result.to}</div>
    </div>
    <div class="col-6 col-md-3">
      <div style="font-size:0.65rem;font-family:var(--font-mono);text-transform:uppercase;color:var(--text-muted)">Value</div>
      <div style="font-size:0.83rem;color:var(--gold);margin-top:3px;font-family:var(--font-mono)">${result.value}</div>
    </div>
  `;

  const track = document.getElementById('progress-track');
  track.innerHTML = STEPS.map((step, i) => {
    let cls = 'progress-step';
    if (i < result.status) cls += ' done';
    else if (i === result.status) cls += ' active';
    return `<div class="${cls}">
      <div class="step-circle">${i < result.status ? '✓' : STEP_ICONS[i]}</div>
      <div class="step-label">${step}</div>
    </div>`;
  }).join('');

  const logs = generateActivityLog(result);
  document.getElementById('activity-log').innerHTML = logs.map(l => `
    <div style="display:flex;gap:12px;padding:8px 0;border-bottom:1px solid var(--border);align-items:flex-start">
      <div style="width:8px;height:8px;border-radius:50%;background:${l.done ? 'var(--success)' : l.active ? 'var(--accent)' : 'var(--border)'};margin-top:5px;flex-shrink:0"></div>
      <div>
        <div style="font-size:0.82rem;color:${l.active ? 'var(--text-primary)' : l.done ? 'var(--text-secondary)' : 'var(--text-muted)'}">${l.text}</div>
        <div style="font-size:0.68rem;color:var(--text-muted);font-family:var(--font-mono);margin-top:2px">${l.time}</div>
      </div>
    </div>
  `).join('');

  document.getElementById('track-result').style.display = 'block';
}

function generateActivityLog(ship) {
  const baseDays = new Date(ship.date);
  return STEPS.map((step, i) => {
    const d = new Date(baseDays);
    d.setDate(d.getDate() + i * 2);
    const msgs = [
      `Order ${ship.id} created and confirmed by SFTAS system`,
      `Shipment packed and quality checked at ${ship.from} warehouse`,
      `Cargo loaded on vessel — departed ${ship.from} Port`,
      `Shipment arrived at ${ship.to} customs — inspection in progress`,
      `Delivered to ${ship.buyer} — Delivery confirmed ✓`
    ];
    return {
      text: msgs[i],
      time: i <= ship.status ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Pending',
      done: i < ship.status,
      active: i === ship.status
    };
  });
}

function initTransitChart() {
  const ctx = document.getElementById('transitChart').getContext('2d');
  transitChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['In Transit', 'Delivered', 'At Customs', 'Processing'],
      datasets: [{
        data: [18, 22, 5, 3],
        backgroundColor: ['#00d4ff', '#00f5a0', '#fbbf24', '#7c5cfc'],
        borderWidth: 0,
        hoverBorderWidth: 2,
        hoverBorderColor: '#fff'
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: 'bottom', labels: { color: '#8892a4', font: { family: 'DM Mono', size: 10 }, padding: 10 } }
      },
      cutout: '65%'
    }
  });
}

// ── Cost Calculator ────────────────────────────────────────────
function initCalculator() {
  setTimeout(calculateProfit, 300);
}

function calculateProfit() {
  const price = parseFloat(document.getElementById('calc-price').value) || 0;
  const qty = parseFloat(document.getElementById('calc-qty').value) || 0;
  const ship = parseFloat(document.getElementById('calc-ship').value) || 0;
  const dutyPct = parseFloat(document.getElementById('calc-duty').value) || 0;
  const pack = parseFloat(document.getElementById('calc-pack').value) || 0;
  const insurePct = parseFloat(document.getElementById('calc-insure').value) || 0;
  const sell = parseFloat(document.getElementById('calc-sell').value) || 0;

  const productionCost = price * qty;
  const dutyCost = (productionCost * dutyPct) / 100;
  const insuranceCost = (productionCost * insurePct) / 100;
  const totalCost = productionCost + ship + dutyCost + pack + insuranceCost;
  const totalRevenue = sell * qty;
  const profit = totalRevenue - totalCost;
  const margin = totalRevenue > 0 ? ((profit / totalRevenue) * 100) : 0;
  const roi = totalCost > 0 ? ((profit / totalCost) * 100) : 0;

  const rows = [
    { label: 'Production Cost', value: productionCost, color: 'var(--text-secondary)' },
    { label: 'Shipping Cost', value: ship, color: 'var(--text-secondary)' },
    { label: `Customs Duty (${dutyPct}%)`, value: dutyCost, color: 'var(--warning)' },
    { label: 'Packaging', value: pack, color: 'var(--text-secondary)' },
    { label: `Insurance (${insurePct}%)`, value: insuranceCost, color: 'var(--text-secondary)' },
    { label: 'TOTAL COST', value: totalCost, color: 'var(--danger)', bold: true },
    { label: 'Total Revenue', value: totalRevenue, color: 'var(--accent3)', bold: true },
    { label: 'NET PROFIT', value: profit, color: profit >= 0 ? 'var(--success)' : 'var(--danger)', bold: true, large: true },
  ];

  document.getElementById('cost-breakdown').innerHTML = `
    <div style="margin-bottom:16px">
      ${rows.map(r => `
        <div style="display:flex;justify-content:space-between;padding:9px 0;border-bottom:1px solid var(--border);align-items:center">
          <span style="font-size:0.8rem;color:${r.bold ? 'var(--text-primary)' : 'var(--text-secondary)'};${r.bold ? 'font-weight:700' : ''}">${r.label}</span>
          <span style="font-family:var(--font-mono);font-size:${r.large ? '1rem' : '0.83rem'};color:${r.color};${r.bold ? 'font-weight:700' : ''}">
            ₹${formatNumber(r.value)}
          </span>
        </div>
      `).join('')}
    </div>
    <div class="row g-2 mt-2">
      <div class="col-6">
        <div class="profit-box">
          <div class="profit-label">Profit Margin</div>
          <div class="profit-value" style="font-size:1.6rem;color:${margin>=20?'var(--success)':margin>=10?'var(--gold)':'var(--danger)'}">${margin.toFixed(1)}%</div>
        </div>
      </div>
      <div class="col-6">
        <div class="profit-box">
          <div class="profit-label">Return on Investment</div>
          <div class="profit-value" style="font-size:1.6rem;color:${roi>=20?'var(--success)':roi>=10?'var(--gold)':'var(--danger)'}">${roi.toFixed(1)}%</div>
        </div>
      </div>
    </div>
  `;

  updateProfitChart(productionCost, ship, dutyCost + pack + insuranceCost, profit);
}

function updateProfitChart(production, shipping, other, profit) {
  const ctx = document.getElementById('profitChart');
  if (!ctx) return;

  if (profitChartInstance) profitChartInstance.destroy();

  profitChartInstance = new Chart(ctx.getContext('2d'), {
    type: 'bar',
    data: {
      labels: ['Production', 'Shipping', 'Other Costs', 'Net Profit'],
      datasets: [{
        data: [production, shipping, other, Math.abs(profit)],
        backgroundColor: ['rgba(0,212,255,0.6)', 'rgba(124,92,252,0.6)', 'rgba(251,191,36,0.6)',
          profit >= 0 ? 'rgba(0,245,160,0.7)' : 'rgba(255,75,110,0.7)'],
        borderColor: ['#00d4ff', '#7c5cfc', '#fbbf24', profit >= 0 ? '#00f5a0' : '#ff4b6e'],
        borderWidth: 1.5, borderRadius: 6,
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#161b2a', borderColor: 'rgba(0,212,255,0.3)', borderWidth: 1,
          titleColor: '#e8edf5', bodyColor: '#8892a4',
          callbacks: { label: ctx => ` ₹${formatNumber(ctx.parsed.y)}` }
        }
      },
      scales: {
        x: { grid: { display: false }, ticks: { color: '#4a5568', font: { family: 'DM Mono', size: 10 } } },
        y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#4a5568', font: { family: 'DM Mono', size: 10 }, callback: v => '₹' + formatNumber(v) } }
      }
    }
  });
}

// ── Documents / Invoice ────────────────────────────────────────
function initDocuments() {
  setTimeout(previewInvoice, 200);
}

function previewInvoice() {
  const exporter = document.getElementById('inv-exporter').value || 'Exporter Name';
  const expAddr = document.getElementById('inv-exp-addr').value || 'Exporter Address';
  const buyer = document.getElementById('inv-buyer').value || 'Buyer Name';
  const buyCountry = document.getElementById('inv-buy-country').value || 'Buyer Country';
  const product = document.getElementById('inv-product').value || 'Product Description';
  const qty = parseInt(document.getElementById('inv-qty').value) || 0;
  const uprice = parseFloat(document.getElementById('inv-uprice').value) || 0;
  const terms = document.getElementById('inv-terms').value || 'FOB';

  const subtotal = qty * uprice;
  const tax = subtotal * 0.05;
  const total = subtotal + tax;
  const invNo = 'INV-2024-' + String(Math.floor(Math.random() * 9000) + 1000).padStart(4, '0');
  const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  document.getElementById('invoice-preview').innerHTML = `
    <div id="inv-content" style="background:#fff;color:#1a1a2e;padding:30px;font-family:'Nunito',sans-serif;border-radius:10px">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #0a0d14;padding-bottom:16px;margin-bottom:20px">
        <div>
          <div style="font-family:'Syne',sans-serif;font-size:1.4rem;font-weight:800;color:#0a0d14">SFTAS</div>
          <div style="font-size:0.65rem;color:#666;letter-spacing:0.12em;text-transform:uppercase">Smart Foreign Trade Assistance System</div>
          <div style="margin-top:10px;font-size:0.8rem">
            <strong>${exporter}</strong><br>
            <span style="color:#555">${expAddr}</span>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:1.1rem;font-weight:800;color:#0a0d14">EXPORT INVOICE</div>
          <div style="font-family:monospace;font-size:0.8rem;color:#444;margin-top:4px">${invNo}</div>
          <div style="font-size:0.75rem;color:#666;margin-top:2px">Date: ${today}</div>
          <div style="margin-top:10px;font-size:0.8rem;text-align:left">
            <strong>Bill To:</strong><br>
            ${buyer}<br>
            <span style="color:#555">${buyCountry}</span>
          </div>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead>
          <tr style="background:#0a0d14">
            <th style="color:#fff;padding:10px 14px;font-size:0.75rem;text-align:left">Description</th>
            <th style="color:#fff;padding:10px 14px;font-size:0.75rem;text-align:center">Qty</th>
            <th style="color:#fff;padding:10px 14px;font-size:0.75rem;text-align:right">Unit Price (USD)</th>
            <th style="color:#fff;padding:10px 14px;font-size:0.75rem;text-align:right">Total (USD)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom:1px solid #eee">
            <td style="padding:12px 14px;font-size:0.82rem">${product}</td>
            <td style="padding:12px 14px;font-size:0.82rem;text-align:center">${qty}</td>
            <td style="padding:12px 14px;font-size:0.82rem;text-align:right;font-family:monospace">$${uprice.toFixed(2)}</td>
            <td style="padding:12px 14px;font-size:0.82rem;text-align:right;font-family:monospace">$${subtotal.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      <div style="display:flex;justify-content:flex-end">
        <div style="width:220px">
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.8rem;border-bottom:1px solid #eee">
            <span style="color:#555">Subtotal</span>
            <span style="font-family:monospace">$${subtotal.toFixed(2)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:6px 0;font-size:0.8rem;border-bottom:1px solid #eee">
            <span style="color:#555">GST / Tax (5%)</span>
            <span style="font-family:monospace">$${tax.toFixed(2)}</span>
          </div>
          <div style="display:flex;justify-content:space-between;padding:10px 0;font-weight:800;font-family:'Syne',sans-serif;border-top:2px solid #0a0d14;margin-top:4px">
            <span>TOTAL</span>
            <span style="color:#0a0d14">$${total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #eee;display:flex;justify-content:space-between;align-items:flex-end">
        <div style="font-size:0.75rem;color:#666">
          <strong>Shipping Terms:</strong> ${terms}<br>
          <strong>Payment Terms:</strong> 30 days net<br>
          <strong>Bank:</strong> State Bank of India, Mumbai
        </div>
        <div style="text-align:center">
          <div style="border-top:1px solid #333;width:160px;padding-top:6px;font-size:0.72rem;color:#555">Authorized Signature</div>
        </div>
      </div>
    </div>
  `;
}

function downloadInvoicePDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });

  const exporter = document.getElementById('inv-exporter').value || 'Exporter Name';
  const expAddr = document.getElementById('inv-exp-addr').value || '';
  const buyer = document.getElementById('inv-buyer').value || 'Buyer Name';
  const buyCountry = document.getElementById('inv-buy-country').value || '';
  const product = document.getElementById('inv-product').value || 'Product';
  const qty = parseInt(document.getElementById('inv-qty').value) || 0;
  const uprice = parseFloat(document.getElementById('inv-uprice').value) || 0;
  const terms = document.getElementById('inv-terms').value || 'FOB';

  const subtotal = qty * uprice;
  const tax = subtotal * 0.05;
  const total = subtotal + tax;
  const invNo = 'INV-2024-' + Date.now().toString().slice(-4);
  const today = new Date().toLocaleDateString('en-IN');

  // Header band
  doc.setFillColor(10, 13, 20);
  doc.rect(0, 0, 210, 35, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20); doc.setFont('helvetica', 'bold');
  doc.text('SFTAS', 14, 16);
  doc.setFontSize(7); doc.setFont('helvetica', 'normal');
  doc.text('SMART FOREIGN TRADE ASSISTANCE SYSTEM', 14, 22);

  doc.setFontSize(14); doc.setFont('helvetica', 'bold');
  doc.text('EXPORT INVOICE', 196, 14, { align: 'right' });
  doc.setFontSize(9); doc.setFont('helvetica', 'normal');
  doc.text(invNo, 196, 21, { align: 'right' });
  doc.text(`Date: ${today}`, 196, 27, { align: 'right' });

  // Exporter info
  doc.setTextColor(30, 30, 50);
  doc.setFontSize(9); doc.setFont('helvetica', 'bold');
  doc.text('FROM (EXPORTER)', 14, 46);
  doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
  doc.text(exporter, 14, 52);
  doc.text(expAddr, 14, 57);

  // Buyer info
  doc.setFont('helvetica', 'bold'); doc.setFontSize(9);
  doc.text('TO (BUYER)', 110, 46);
  doc.setFont('helvetica', 'normal');
  doc.text(buyer, 110, 52);
  doc.text(buyCountry, 110, 57);

  // Table header
  doc.setFillColor(10, 13, 20);
  doc.rect(14, 68, 182, 8, 'F');
  doc.setTextColor(255, 255, 255); doc.setFontSize(8); doc.setFont('helvetica', 'bold');
  doc.text('DESCRIPTION', 17, 73.5);
  doc.text('QTY', 130, 73.5, { align: 'center' });
  doc.text('UNIT PRICE', 160, 73.5, { align: 'right' });
  doc.text('TOTAL', 196, 73.5, { align: 'right' });

  // Table row
  doc.setTextColor(30, 30, 50); doc.setFont('helvetica', 'normal');
  doc.text(product.substring(0, 60), 17, 82);
  doc.text(String(qty), 130, 82, { align: 'center' });
  doc.text(`$${uprice.toFixed(2)}`, 160, 82, { align: 'right' });
  doc.text(`$${subtotal.toFixed(2)}`, 196, 82, { align: 'right' });
  doc.setDrawColor(220, 220, 230);
  doc.line(14, 85, 196, 85);

  // Totals
  const ty = 95;
  doc.setFontSize(9);
  doc.text('Subtotal:', 140, ty); doc.text(`$${subtotal.toFixed(2)}`, 196, ty, { align: 'right' });
  doc.text('Tax / GST (5%):', 140, ty + 7); doc.text(`$${tax.toFixed(2)}`, 196, ty + 7, { align: 'right' });
  doc.setDrawColor(10, 13, 20); doc.line(130, ty + 11, 196, ty + 11);
  doc.setFont('helvetica', 'bold'); doc.setFontSize(11);
  doc.text('TOTAL:', 140, ty + 18);
  doc.setTextColor(0, 120, 200); doc.text(`$${total.toFixed(2)}`, 196, ty + 18, { align: 'right' });

  // Footer
  doc.setTextColor(120, 120, 140); doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
  doc.text(`Shipping Terms: ${terms}  |  Payment Terms: 30 Days Net  |  Generated by SFTAS`, 14, 270);
  doc.setTextColor(0, 180, 220);
  doc.text('www.sftas.trade', 196, 270, { align: 'right' });

  doc.save(`${invNo}_Export_Invoice.pdf`);
  showToast('📄 Invoice PDF downloaded successfully!', 'success');
}

// ── Compliance ────────────────────────────────────────────────
function initCompliance() {
  if (!APP_DATA?.countries) return;
  const container = document.getElementById('compliance-cards');
  container.innerHTML = APP_DATA.countries.map(c => `
    <div class="col-sm-6 col-xl-3">
      <div class="compliance-card" onclick="showComplianceDetail('${c.name}')">
        <div class="cc-header">
          <span class="cc-flag">${c.flag}</span>
          <div>
            <div class="cc-name">${c.name}</div>
            <div class="cc-tariff">Tariff: ${c.tariff}</div>
          </div>
          <span class="badge-custom ${c.risk === 'Low' ? 'badge-low' : c.risk === 'Medium' ? 'badge-medium' : 'badge-high'}" style="margin-left:auto">${c.risk}</span>
        </div>
        <ul class="cc-rules">
          ${c.rules.slice(0, 2).map(r => `<li>${r}</li>`).join('')}
          ${c.rules.length > 2 ? `<li style="color:var(--accent);font-size:0.72rem">+${c.rules.length - 2} more rules...</li>` : ''}
        </ul>
      </div>
    </div>
  `).join('');
}

function showComplianceDetail(name) {
  const c = APP_DATA.countries.find(x => x.name === name);
  if (!c) return;

  document.querySelectorAll('.compliance-card').forEach(el => el.classList.remove('selected'));

  const detail = document.getElementById('compliance-detail');
  const riskClass = { Low: 'badge-low', Medium: 'badge-medium', High: 'badge-high' };

  document.getElementById('compliance-detail-title').innerHTML = `
    <span class="icon" style="font-size:1.3rem">${c.flag}</span> ${c.name} — Full Compliance Details
  `;

  document.getElementById('compliance-detail-body').innerHTML = `
    <div class="row g-3 mb-3">
      <div class="col-sm-3">
        <div style="background:var(--bg-elevated);border-radius:8px;padding:14px;text-align:center">
          <div style="font-size:0.65rem;font-family:var(--font-mono);text-transform:uppercase;color:var(--text-muted)">Tariff Rate</div>
          <div style="font-size:1.4rem;font-weight:800;font-family:var(--font-display);color:var(--gold);margin-top:4px">${c.tariff}</div>
        </div>
      </div>
      <div class="col-sm-3">
        <div style="background:var(--bg-elevated);border-radius:8px;padding:14px;text-align:center">
          <div style="font-size:0.65rem;font-family:var(--font-mono);text-transform:uppercase;color:var(--text-muted)">Risk Level</div>
          <div class="badge-custom ${riskClass[c.risk]}" style="margin-top:8px;display:inline-block;font-size:0.82rem">${c.risk}</div>
        </div>
      </div>
      <div class="col-sm-3">
        <div style="background:var(--bg-elevated);border-radius:8px;padding:14px;text-align:center">
          <div style="font-size:0.65rem;font-family:var(--font-mono);text-transform:uppercase;color:var(--text-muted)">Profit Potential</div>
          <div style="font-size:1rem;font-weight:700;color:var(--accent3);margin-top:6px">${c.profitPotential}</div>
        </div>
      </div>
      <div class="col-sm-3">
        <div style="background:var(--bg-elevated);border-radius:8px;padding:14px;text-align:center">
          <div style="font-size:0.65rem;font-family:var(--font-mono);text-transform:uppercase;color:var(--text-muted)">Demand Score</div>
          <div style="font-size:1.4rem;font-weight:800;font-family:var(--font-display);color:var(--accent);margin-top:4px">${c.demandScore}</div>
        </div>
      </div>
    </div>
    <div class="row g-3">
      <div class="col-md-6">
        <div style="font-size:0.72rem;font-family:var(--font-mono);text-transform:uppercase;color:var(--text-muted);margin-bottom:10px">Compliance Requirements</div>
        ${c.rules.map(r => `<div class="alert-trade alert-info" style="margin-bottom:8px;padding:10px 14px">
          <span class="alert-icon">📋</span>
          <div>${r}</div>
        </div>`).join('')}
      </div>
      <div class="col-md-6">
        <div style="font-size:0.72rem;font-family:var(--font-mono);text-transform:uppercase;color:var(--text-muted);margin-bottom:10px">Market Intelligence</div>
        <div style="background:var(--bg-elevated);border-radius:10px;padding:16px;font-size:0.83rem;color:var(--text-secondary);line-height:1.7;margin-bottom:12px">${c.notes}</div>
        <div style="border-radius:10px;overflow:hidden;border:1px solid var(--border-accent);height:200px">
          <iframe src="https://www.google.com/maps/embed/v1/place?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&q=${c.mapQuery}&zoom=4" allowfullscreen loading="lazy" style="width:100%;height:100%;border:none"></iframe>
        </div>
      </div>
    </div>
  `;

  detail.style.display = 'block';
  detail.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeComplianceDetail() {
  document.getElementById('compliance-detail').style.display = 'none';
}

// ── Product Page ───────────────────────────────────────────────
function updateProductDetails() {
  const cat = document.getElementById('pi-category').value;
  // Pre-fill HS code suggestions
  const hsCodes = {
    Textiles: '6205.20.00', Electronics: '8471.30.00',
    Agriculture: '0901.21.00', Pharmaceuticals: '3004.90.00'
  };
  if (cat && hsCodes[cat]) {
    document.getElementById('pi-hs').value = hsCodes[cat];
  }
}

function saveProduct() {
  const cat = document.getElementById('pi-category').value;
  const name = document.getElementById('pi-name').value;
  const price = document.getElementById('pi-price').value;
  const qty = document.getElementById('pi-qty').value;
  const country = document.getElementById('pi-country').value;
  const hs = document.getElementById('pi-hs').value;

  if (!cat || !price || !country) {
    showToast('⚠️ Please fill in required fields (Category, Price, Country)', 'warning');
    return;
  }

  const countryData = APP_DATA?.countries?.find(c => c.name === country);
  const recs = APP_DATA?.recommendations?.[cat]?.[country];

  document.getElementById('product-summary').innerHTML = `
    <div class="rec-row"><span class="label">Category</span><strong style="color:var(--accent)">${cat}</strong></div>
    <div class="rec-row"><span class="label">Product Name</span><span>${name || '—'}</span></div>
    <div class="rec-row"><span class="label">Unit Price</span><span class="mono" style="color:var(--gold)">₹${formatNumber(parseFloat(price))}</span></div>
    <div class="rec-row"><span class="label">Quantity</span><span class="mono">${formatNumber(parseInt(qty))} units</span></div>
    <div class="rec-row"><span class="label">Total Value</span><span class="mono" style="color:var(--accent3)">₹${formatNumber(parseFloat(price) * parseInt(qty))}</span></div>
    <div class="rec-row"><span class="label">Target Country</span><span>${countryData?.flag || ''} ${country}</span></div>
    <div class="rec-row"><span class="label">HS Code</span><span class="mono">${hs || '—'}</span></div>
    ${recs ? `<div class="rec-row"><span class="label">Risk</span><span class="badge-custom ${recs.risk === 'Low' ? 'badge-low' : recs.risk === 'High' ? 'badge-high' : 'badge-medium'}">${recs.risk}</span></div>
    <div class="rec-row"><span class="label">Profit Potential</span><strong style="color:var(--success)">${recs.profit}</strong></div>` : ''}
    ${countryData ? `<div class="rec-tip" style="margin-top:12px"><strong>💡</strong> ${countryData.notes}</div>` : ''}
  `;

  if (countryData) {
    updateMap('product-map', countryData.mapQuery);
  }

  showToast(`✅ Product saved — ${cat} → ${country}`, 'success');
}

// ── Helpers ───────────────────────────────────────────────────
function updateMap(iframeId, query) {
  const iframe = document.getElementById(iframeId);
  if (iframe) {
    iframe.src = `https://www.google.com/maps/embed/v1/place?key=AIzaSyD-9tSrke72PouQMnMX-a7eZSW0jkFMBWY&q=${query}&zoom=4`;
  }
}

function formatNumber(n, decimals = 0) {
  if (isNaN(n)) return '0';
  return n.toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ── Inline Fallback Data (if fetch fails) ─────────────────────
function getInlineFallbackData() {
  return {
    buyers: [
      { id:1, name:"Al Fardan Trading LLC", country:"UAE", product:"Textiles", budget:50000, contact:"alfardan@trade.ae", rating:4.8 },
      { id:2, name:"Tech Galaxy GmbH", country:"Germany", product:"Electronics", budget:120000, contact:"buy@techgalaxy.de", rating:4.9 },
      { id:3, name:"US Agri Imports Inc.", country:"USA", product:"Agriculture", budget:60000, contact:"imports@usagri.com", rating:4.3 },
    ],
    sellers: [
      { id:1, name:"Rajasthan Fabrics Pvt Ltd", country:"India", product:"Textiles", minOrder:5000, contact:"rajfab@india.com", rating:4.7 },
      { id:2, name:"Mumbai Pharma Exports", country:"India", product:"Pharmaceuticals", minOrder:50000, contact:"mumbai.pharma@india.com", rating:4.8 },
    ],
    countries: [
      { name:"UAE", flag:"🇦🇪", risk:"Low", tariff:"5%", currency:"AED", rules:["GST certificate required","Halal certification for food","Arabic labeling mandatory"], profitPotential:"High", demandScore:92, mapQuery:"United+Arab+Emirates", notes:"UAE is one of India's top trading partners." },
      { name:"USA", flag:"🇺🇸", risk:"Medium", tariff:"7.5%", currency:"USD", rules:["FDA approval required","FCC certification for electronics"], profitPotential:"High", demandScore:88, mapQuery:"United+States", notes:"Large market with strict regulations." },
    ],
    news: [
      { title:"India-UAE CEPA Boosts Textile Exports by 34%", summary:"Bilateral trade crosses $85 billion in FY2024.", date:"2024-03-15", category:"Policy", icon:"📜" },
      { title:"Global Electronics Demand to Hit $4.2 Trillion", summary:"India emerging as key exporter of semiconductor components.", date:"2024-03-10", category:"Market", icon:"📈" },
    ],
    demandTrends: {
      labels:["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
      datasets: {
        Textiles:[65,70,68,80,85,90,88,92,87,95,98,100],
        Electronics:[80,82,85,88,90,87,92,95,98,100,102,108],
        Agriculture:[50,55,70,75,65,60,58,62,70,72,68,65],
        Pharmaceuticals:[90,92,95,93,96,98,100,102,105,108,110,115]
      }
    },
    recommendations: {
      Textiles: {
        UAE:{ demand:"Very High", risk:"Low", profit:"High", tip:"Focus on premium cotton. Ramadan season sees 40% spike." },
        USA:{ demand:"High", risk:"Medium", profit:"High", tip:"Sustainable textiles command 30% premium." },
        Germany:{ demand:"High", risk:"Low", profit:"High", tip:"Technical textiles have growing demand." },
        China:{ demand:"Low", risk:"High", profit:"Low", tip:"Local production dominates. High risk market." },
        Japan:{ demand:"High", risk:"Low", profit:"High", tip:"Traditional Indian weaves fetch premium." },
        Singapore:{ demand:"High", risk:"Low", profit:"High", tip:"Zero tariff under CECA." },
        UK:{ demand:"Medium", risk:"Low", profit:"Medium", tip:"Good for ethnic fashion segment." },
        Netherlands:{ demand:"Medium", risk:"Low", profit:"Medium", tip:"Rotterdam hub for EU distribution." }
      },
      Electronics: {
        UAE:{ demand:"High", risk:"Low", profit:"High", tip:"Dubai re-exports to MENA region." },
        USA:{ demand:"Very High", risk:"Medium", profit:"High", tip:"FCC certification required." },
        Germany:{ demand:"High", risk:"Low", profit:"High", tip:"Industrial electronics in strong demand." },
        China:{ demand:"Low", risk:"High", profit:"Low", tip:"Highly competitive. Not recommended." },
        Japan:{ demand:"High", risk:"Low", profit:"High", tip:"Partner with Japanese firms." },
        Singapore:{ demand:"High", risk:"Low", profit:"High", tip:"Tech hub — B2B electronics trade." },
        UK:{ demand:"High", risk:"Low", profit:"Medium", tip:"Strong smart home device demand." },
        Netherlands:{ demand:"Medium", risk:"Low", profit:"Medium", tip:"EU electronics distribution gateway." }
      },
      Agriculture: {
        UAE:{ demand:"High", risk:"Low", profit:"High", tip:"UAE imports 90% of food." },
        USA:{ demand:"High", risk:"Medium", profit:"High", tip:"FDA approval mandatory for processed foods." },
        Germany:{ demand:"Medium", risk:"Low", profit:"Medium", tip:"Organic products popular." },
        China:{ demand:"Medium", risk:"High", profit:"Low", tip:"Political tensions affect agri-trade." },
        Japan:{ demand:"Medium", risk:"Low", profit:"Medium", tip:"Basmati rice popular." },
        Singapore:{ demand:"High", risk:"Low", profit:"High", tip:"Strong Indian diaspora demand." },
        UK:{ demand:"Medium", risk:"Low", profit:"Medium", tip:"Large ethnic food market." },
        Netherlands:{ demand:"Medium", risk:"Low", profit:"Medium", tip:"Major agri-trading hub." }
      },
      Pharmaceuticals: {
        UAE:{ demand:"High", risk:"Low", profit:"High", tip:"MOH registration required." },
        USA:{ demand:"Very High", risk:"Medium", profit:"Very High", tip:"FDA ANDA approval is worth the investment." },
        Germany:{ demand:"High", risk:"Low", profit:"High", tip:"EU GMP certification opens 27-country market." },
        China:{ demand:"Medium", risk:"High", profit:"Low", tip:"NMPA regulations are complex." },
        Japan:{ demand:"Medium", risk:"Low", profit:"High", tip:"PMDA approval required." },
        Singapore:{ demand:"High", risk:"Low", profit:"High", tip:"HSA approval enables ASEAN distribution." },
        UK:{ demand:"High", risk:"Low", profit:"High", tip:"MHRA approval pathway available." },
        Netherlands:{ demand:"Medium", risk:"Low", profit:"Medium", tip:"EMA headquarters in Amsterdam." }
      }
    }
  };
}
