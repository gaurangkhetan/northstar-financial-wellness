# Northstar — Complete Financial Wellness

A financial-planning website for **every life stage**. It walks a visitor through the same
process a Certified Financial Planner™ uses, scores their financial health, stress-tests them
against life's surprises, and recommends **2–3 vetted options in every product category**.

Ethos products (Term Life, Growth IUL, Accumulation IUL, Wills & Trusts, and the North American
fixed indexed annuity) are flagged as **partner products with an exclusive member discount**.

## What it does

1. **Educates up front** — shows the **CFP Board's 7-step planning process** and the domains it
   evaluates, so the visitor understands the method.
2. **Asks focused questions** across financial-health domains: household, income, cash flow,
   emergency fund, debt & credit, savings & retirement goals, existing coverage & estate, and
   health. Includes an **optional health & longevity check**.
3. **Scores & analyzes:**
   - A weighted **financial-health score (0–100, A–F)** across 7 domains.
   - **Preparedness check** against life's unexpected events (death, disability/illness, job loss,
     market downturn, outliving savings, long-term care).
   - A **retirement gap** projection (4% rule, net of estimated Social Security).
   - An **optional health-risk read** (BMI, risk factors, mortality/morbidity band) that can surface
     **GLP-1 / prescription / wellness** options and explain insurance-rate impact.
4. **Recommends a prioritized action plan** — every relevant category with **2–3 options each**,
   ordered Do now → Up next → Later, with a personalized "why now" and suggested dollar amounts.
5. **Captures a profile** ("we'll find you better deals over time") saved to `localStorage`, with a
   **welcome-back** experience on return visits.

### Product categories (2–3 options each)

| Category | Examples | Ethos partner |
|----------|----------|:---:|
| High-Yield Savings | Marcus, Ally, SoFi | |
| Credit Cards | Discover it Secured, Capital One, Chase Freedom | |
| Life Insurance | **Ethos Term**, Banner, Protective | ✦ |
| Indexed Universal Life | **Ethos Growth IUL**, **Ethos & North American Accumulation IUL**, Allianz | ✦ |
| Retirement (IRAs) | Roth, Traditional, SEP/Solo 401(k) | |
| Annuities | **Ethos/North American FIA**, MYGA, SPIA | ✦ |
| College Savings (529) | Vanguard, my529, NY 529 | |
| Equity Investments | Index funds/ETFs, Betterment, brokerage | |
| Wills & Trusts | **Ethos Wills & Trusts**, Trust & Will, LegalZoom | ✦ |
| Health & Wellness | GLP-1 program, Rx savings, preventive care | |

## Run it

Static site, no build step, no dependencies.

```bash
python3 serve.py            # → http://127.0.0.1:4173
# or
python3 -m http.server 8000 # → http://127.0.0.1:8000
```

Or just open `index.html` directly — everything runs client-side.

## Files

| File | Role |
|------|------|
| `index.html` | Shell: intro (hero, CFP process, what-we-evaluate), questionnaire, results |
| `css/styles.css` | All styling (dark hero + light cards, fully responsive) |
| `js/products.js` | **Category catalog** — 10 categories × 2–3 options, Ethos flagged `partner: true` |
| `js/engine.js` | **Engine** — financial-health score, scenario preparedness, retirement gap, optional health-risk model, prioritized category plan |
| `js/app.js` | Intro content, questionnaire flow (incl. conditional health step & multi-select), profile/localStorage, results rendering |

## ⚠️ Important

Educational **demonstration** only. All figures, premiums, scores, health-risk reads, and
projections are illustrative estimates — **not quotes, offers, or financial, tax, legal, or medical
advice**. Product names are examples for illustration, **not endorsements**; rates and availability
vary by state, provider, age, and health. Ethos details reflect publicly described offerings; the
"partner discount" is illustrative. Always consult licensed professionals before acting.
