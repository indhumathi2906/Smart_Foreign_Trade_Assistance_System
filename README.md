# 🌐 Smart Foreign Trade Assistance System (SFTAS) 

A frontend-only web application that simulates a real-world foreign trade intelligence platform — built entirely with HTML, CSS, and Vanilla JavaScript. No backend. No frameworks. Just open `index.html` and it runs.



## 🎯 What Is This Project?

SFTAS is a trade management dashboard designed for Indian exporters and importers. It helps users analyze international markets, find buyers and sellers, track shipments, calculate profits, generate export invoices, and understand country-wise compliance rules all from a single browser window.

The project was built to demonstrate how a fully functional, data-driven business tool can be built purely on the frontend without relying on any server or database.


 Features

 Dashboard
The landing page gives a quick snapshot of the trade environment active trades, risk alerts, recommendations, and trade volume. A live activity feed shows recent events like order confirmations, shipment clearances, and currency updates. Critical alerts are displayed at a glance alongside an embedded world map.

### ⚡ Dynamic Trade Intelligence System (DTIS)
The highlight of the project. A dedicated intelligence hub with four components working together:

- **Trade News Feed** — Five curated trade news items covering policy changes, market trends, logistics updates, and finance news relevant to Indian exporters.
- **Demand Trend Graph** — An interactive Chart.js line graph showing month-by-month demand index for Textiles, Electronics, Agriculture, and Pharmaceuticals. The chart updates instantly when you switch products.
- **Currency Converter** — Converts INR to seven major currencies (USD, AED, EUR, GBP, JPY, SGD, CNY) using static exchange rates. Displays a contextual impact message explaining what the rate means for export profitability.
- **Smart Recommendation Engine** — A rule-based logic system covering 32 product-country combinations. Select a product category and a target country, and the engine returns demand level, risk classification, profit potential, tariff rate, a scored demand bar, and an expert tip specific to that combination.

### ⚠️ Risk Alert System
Triggered by the Recommendation Engine. Displays color-coded risk banners (green / yellow / red) along with all compliance requirements for the selected country — pulled from the data layer. Each rule is shown as a clear, readable card.

### 📦 Product Input
A configuration form where the user selects a product category, enters price and quantity, picks a target country, and optionally adds an HS code. On submission, the app generates a product summary with total value, risk level, profit potential, and market notes. The embedded Google Map updates to show the target country location.

### 🤝 Buyers & Sellers
A filterable directory of international buyers and domestic sellers loaded from `data.json`. Users can filter by product category, country, and view mode (buyers vs sellers). Results are rendered in a clean table with company avatars, contact links, budget or minimum order values, and star ratings.

### 🚚 Shipment Tracking
Enter a tracking number (or click a sample shipment) to see a full shipment status view. A five-stage progress bar — Order → Processing → Shipped → Customs → Delivered — shows the current stage with animated indicators. Below it, a timestamped activity log lists every milestone the shipment has passed through.

### 📊 Cost & Profit Calculator
Seven input fields covering product price, quantity, shipping cost, customs duty percentage, packaging, insurance, and selling price. The app instantly calculates total cost, total revenue, net profit, profit margin percentage, and ROI. Results are shown in a breakdown table alongside a bar chart comparing each cost component to net profit.

### 📄 Documentation Generator
Fill in exporter and buyer details, product description, quantity, unit price, and shipping terms. A live invoice preview renders in real time. Clicking **Download PDF** generates a professionally formatted A4 export invoice using jsPDF — complete with header band, itemized table, tax calculation, shipping terms, and an authorized signature line.

### 🌍 Compliance Guide
Cards for eight countries (UAE, USA, Germany, UK, Japan, Singapore, China, Netherlands) show risk level, tariff rate, and key compliance rules at a glance. Clicking any country expands a detailed panel with all regulations, a market intelligence note, demand score, profit potential, and a Google Maps embed for that country.

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Page structure and layout |
| CSS3 + Bootstrap 5 | Responsive UI, grid, components |
| Vanilla JavaScript | All app logic, data processing, interactivity |
| Chart.js | Demand trend graph, profit bar chart, transit doughnut chart |
| jsPDF | Client-side PDF invoice generation |
| Google Maps Embed | Dynamic country map display |
| data.json | Centralized mock data layer |

---

## 📁 Project Structure

```
smart-trade/
├── index.html      # Full app structure — all 8 pages
├── style.css       # Custom dark dashboard theme + Bootstrap overrides
├── script.js       # All application logic (navigation, charts, PDF, engine)
└── data.json       # Buyers, sellers, countries, news, demand trends, recommendations
```

---

## 🚀 How to Run

```bash
# Clone the repository
git clone https://github.com/your-username/smart-foreign-trade-system.git

# Navigate into the folder
cd smart-foreign-trade-system

# Open in browser
open index.html   # macOS
# or just double-click index.html on Windows/Linux
```

No `npm install`. No build step. No server required.

---

## 📸 Pages at a Glance

| Page | What It Does |
|---|---|
| Dashboard | Overview cards, activity feed, alerts, map |
| Trade Intelligence | News, chart, currency converter, recommendation engine |
| Product Input | Configure export product and see instant analysis |
| Buyers & Sellers | Filterable directory of trade partners |
| Shipment Tracking | Progress bar + activity log for shipments |
| Cost Calculator | Profit, margin, and ROI calculator with chart |
| Documentation | Live invoice preview + one-click PDF export |
| Compliance Guide | Country rules, tariffs, risk, and map |

---

## 💡 Key Highlights

- **Zero dependencies to install** — everything loads from CDN or runs locally
- **32 recommendation combinations** — every product × country pair has unique rule-based output
- **Live PDF generation** — professionally formatted invoice downloads in one click
- **Responsive design** — works on desktop and mobile with a collapsible sidebar
- **Offline-capable fallback** — if `data.json` fails to load, the app switches to built-in inline data automatically

---

## 👨‍💻 Author

**[Your Name]**  
B.Tech / BCA / Your Degree — Your College Name  
[LinkedIn](https://linkedin.com/in/your-profile) · [Portfolio](https://your-portfolio.com) · [Email](mailto:your@email.com)

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
