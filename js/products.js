/* ============================================================
   PRODUCT CATALOG — organized by category, 2–3 options each.
   Ethos products are flagged as `partner: true` (exclusive
   discount). All names/rates are ILLUSTRATIVE examples for a
   demo — not endorsements, offers, or current pricing.
   ============================================================ */
window.CATEGORIES = {
  // 1) Emergency fund -------------------------------------------------
  emergencyFund: {
    id: "emergencyFund",
    name: "High-Yield Savings",
    icon: "💧",
    blurb: "A liquid emergency fund is the foundation of every plan — 3–6 months of expenses in an FDIC-insured account earning real interest.",
    options: [
      { name: "Marcus by Goldman Sachs", provider: "Online Savings", figure: "~4.2% APY", bullets: ["No fees, no minimum", "FDIC insured", "Same-day transfers to linked banks"] },
      { name: "Ally Online Savings", provider: "Ally Bank", figure: "~4.2% APY", bullets: ["Savings 'buckets' to organize goals", "No minimums or monthly fees", "Highly rated mobile app"] },
      { name: "SoFi Checking & Savings", provider: "SoFi", figure: "~4.0% APY", bullets: ["Combined checking + savings", "Early direct deposit", "Sign-up bonus with direct deposit"] },
    ],
  },

  // 2) Credit building ------------------------------------------------
  credit: {
    id: "credit",
    name: "Credit Cards",
    icon: "💳",
    blurb: "The right card builds a strong credit history (which lowers your rates on everything later) or earns rewards on spending you already do.",
    options: [
      { name: "Discover it® Secured", provider: "Discover", figure: "Build credit", bullets: ["Refundable deposit becomes your limit", "Reports to all 3 bureaus", "Cash back + automatic graduation review"] },
      { name: "Capital One Platinum Secured", provider: "Capital One", figure: "Build credit", bullets: ["Low deposit for a starting line", "No annual fee", "Credit-line increase reviews"] },
      { name: "Chase Freedom Unlimited®", provider: "Chase", figure: "Rewards", bullets: ["1.5%+ cash back on everything", "For established credit (700+)", "0% intro APR period"] },
    ],
  },

  // 3) Life insurance (term & basic) ----------------------------------
  lifeInsurance: {
    id: "lifeInsurance",
    name: "Life Insurance",
    icon: "🛡️",
    blurb: "Income protection for the people who depend on you. Term is the lowest-cost way to cover your working years.",
    options: [
      { name: "Ethos Term Life", provider: "Ethos", partner: true, figure: "No-exam term", bullets: ["100% online, no medical exam for many", "Same-day decision, coverage up to $1M+", "Built-in living benefit riders"] },
      { name: "Banner Life (OPTerm)", provider: "Legal & General", figure: "Low-cost term", bullets: ["Among the lowest term rates for healthy applicants", "Terms up to 40 years", "Strong financial ratings"] },
      { name: "Protective Classic Choice", provider: "Protective", figure: "Flexible term", bullets: ["Competitive rates across ages", "Convertible to permanent later", "High coverage limits"] },
    ],
  },

  // 4) Indexed Universal Life -----------------------------------------
  iul: {
    id: "iul",
    name: "Indexed Universal Life (IUL)",
    icon: "📊",
    blurb: "Permanent coverage that also builds cash value linked to a market index — with a 0% floor so down years don't reduce your value.",
    options: [
      { name: "Ethos Growth IUL", provider: "Ethos", partner: true, figure: "Protection + growth", bullets: ["Lifelong death benefit with index-linked growth", "0% floor protects against market losses", "Living benefit riders included"] },
      { name: "Accumulation IUL", provider: "Ethos & North American", partner: true, figure: "Up to $2M", bullets: ["Instant decision, no medical exam", "Net-zero cost loans + 9 index options", "Built for tax-advantaged cash accumulation"] },
      { name: "Allianz Life Pro+ Advantage", provider: "Allianz", figure: "Index strategies", bullets: ["Multiple index allocation options", "Optional income and care riders", "Established IUL carrier"] },
    ],
  },

  // 5) Retirement accounts --------------------------------------------
  retirement: {
    id: "retirement",
    name: "Retirement Accounts (IRAs)",
    icon: "🌱",
    blurb: "Tax-advantaged accounts are the engine of retirement. Capture any employer 401(k) match first, then fund an IRA.",
    options: [
      { name: "Roth IRA", provider: "Fidelity · Schwab · Vanguard", figure: "Tax-free later", bullets: ["Qualified withdrawals 100% tax-free", "No required minimum distributions", "Contributions withdrawable anytime"] },
      { name: "Traditional IRA", provider: "Fidelity · Schwab · Vanguard", figure: "Deduct now", bullets: ["Potential up-front tax deduction", "Tax-deferred growth", "Convertible to Roth later"] },
      { name: "SEP IRA / Solo 401(k)", provider: "Fidelity · Schwab · Vanguard", figure: "Self-employed", bullets: ["Contribute far more than a standard IRA", "Deductible to your business", "Great for 1099 / business income"] },
    ],
  },

  // 6) Annuities ------------------------------------------------------
  annuity: {
    id: "annuity",
    name: "Annuities (Guaranteed Income)",
    icon: "🏦",
    blurb: "Convert a portion of savings into income you can't outlive — protecting against market crashes and longevity risk.",
    options: [
      { name: "Fixed Indexed Annuity", provider: "via North American (Ethos)", partner: true, figure: "0% floor", bullets: ["Principal protection with index-linked upside", "Optional lifetime income rider", "Tax-deferred growth"] },
      { name: "MYGA (Multi-Year Guaranteed)", provider: "Athene · MassMutual", figure: "Fixed rate", bullets: ["Locked guaranteed rate for a set term", "CD-like simplicity, tax-deferred", "Principal protected"] },
      { name: "Income Annuity (SPIA)", provider: "New York Life · Pacific Life", figure: "Pension-like", bullets: ["Turn a lump sum into a paycheck for life", "Simple, predictable income", "Optional spousal continuation"] },
    ],
  },

  // 6b) Final expense -------------------------------------------------
  finalExpense: {
    id: "finalExpense",
    name: "Final Expense Insurance",
    icon: "🕊️",
    blurb: "A small, guaranteed whole-life policy so funeral costs and final bills are never a burden on the people you love.",
    options: [
      { name: "Ethos Final Expense", provider: "Ethos", partner: true, figure: "Simple issue", bullets: ["Whole life designed for ages 55–85", "Coverage never expires; premiums never rise", "Quick application built for seniors"] },
      { name: "Mutual of Omaha Living Promise", provider: "Mutual of Omaha", figure: "Final expense", bullets: ["Coverage up to ~$40k", "Builds guaranteed cash value", "Trusted senior brand"] },
      { name: "Aflac Final Expense", provider: "Aflac", figure: "Whole life", bullets: ["Level benefit options", "Fixed lifelong premiums", "Fast, simple underwriting"] },
    ],
  },

  // 6c) Long-term care ------------------------------------------------
  ltc: {
    id: "ltc",
    name: "Long-Term Care Protection",
    icon: "🧓",
    blurb: "Long-term care is one of retirement's biggest costs. Hybrid policies and riders cover care without the old 'use it or lose it' problem.",
    options: [
      { name: "Ethos IUL + LTC rider", provider: "Ethos", partner: true, figure: "Hybrid", bullets: ["Permanent coverage with a long-term-care rider", "Accelerate the death benefit to pay for care", "Cash value plus protection"] },
      { name: "Nationwide CareMatters", provider: "Nationwide", figure: "Hybrid life/LTC", bullets: ["Tax-advantaged care benefits", "Any unused benefit passes to heirs", "Flexible care choices"] },
      { name: "Mutual of Omaha LTC", provider: "Mutual of Omaha", figure: "Standalone LTC", bullets: ["Dedicated long-term-care coverage", "Inflation-protection options", "Covers home & facility care"] },
    ],
  },

  // 6d) Mortgage protection (surfaced by credit events) ---------------
  mortgageProtection: {
    id: "mortgageProtection",
    name: "Mortgage Protection",
    icon: "🏠",
    blurb: "Term coverage sized to your mortgage, so your family can keep the home even if your income suddenly stops.",
    options: [
      { name: "Ethos Mortgage Protection", provider: "Ethos", partner: true, figure: "No-exam term", bullets: ["Coverage matched to your loan balance", "100% online, no-exam options", "Living benefit riders included"] },
      { name: "Banner Mortgage Term", provider: "Legal & General", figure: "Level term", bullets: ["Low rates for healthy applicants", "Terms that match your loan length", "Convertible later"] },
      { name: "Protective Mortgage Term", provider: "Protective", figure: "Flexible term", bullets: ["Competitive pricing", "High coverage limits", "Strong financial ratings"] },
    ],
  },

  // 7) Education (529) ------------------------------------------------
  education: {
    id: "education",
    name: "College Savings (529 Plans)",
    icon: "🎓",
    blurb: "529 plans grow tax-free for education, and many states give you a tax deduction for contributing.",
    options: [
      { name: "Vanguard 529 Plan", provider: "Vanguard (Nevada)", figure: "Low cost", bullets: ["Rock-bottom expense ratios", "Age-based portfolios that auto-adjust", "Open to residents of any state"] },
      { name: "my529", provider: "Utah", figure: "Top rated", bullets: ["Consistently top-rated nationally", "Flexible, customizable portfolios", "No residency requirement"] },
      { name: "NY 529 Direct Plan", provider: "New York", figure: "State deduction", bullets: ["State tax deduction for NY residents", "Vanguard-managed investments", "Low fees"] },
    ],
  },

  // 8) Investing ------------------------------------------------------
  investing: {
    id: "investing",
    name: "Equity Investments",
    icon: "📈",
    blurb: "Once tax-advantaged accounts are funded, a taxable brokerage lets your money compound in the market for long-term goals.",
    options: [
      { name: "Index Funds & ETFs", provider: "Vanguard · Fidelity", figure: "DIY, low cost", bullets: ["Diversified total-market / S&P 500 funds", "Expense ratios near 0%", "Best long-term, hands-off core holding"] },
      { name: "Betterment", provider: "Robo-advisor", figure: "Automated", bullets: ["Auto-built, auto-rebalanced portfolio", "Tax-loss harvesting", "Set risk by goal & timeline"] },
      { name: "Fidelity / Schwab Brokerage", provider: "Self-directed", figure: "Full control", bullets: ["Stocks, ETFs, mutual funds, fractional shares", "$0 commissions on US stocks/ETFs", "Strong research tools"] },
    ],
  },

  // 9) Estate planning ------------------------------------------------
  estate: {
    id: "estate",
    name: "Wills & Trusts",
    icon: "📜",
    blurb: "An estate plan makes sure your wishes are followed, guardians are named for your kids, and your family avoids probate headaches.",
    options: [
      { name: "Ethos Wills & Trusts", provider: "Ethos", partner: true, figure: "Bundled", bullets: ["Will, trust, power of attorney & healthcare directive", "Guided online process", "Pairs with your Ethos coverage"] },
      { name: "Trust & Will", provider: "Trust & Will", figure: "Attorney-approved", bullets: ["State-specific wills & living trusts", "Easy guided questionnaire", "Membership for updates"] },
      { name: "LegalZoom Estate Plans", provider: "LegalZoom", figure: "Established", bullets: ["Wills, trusts, and add-on attorney advice", "Long-standing provider", "Range of bundles"] },
    ],
  },

  // 10) Health & wellness (optional) ----------------------------------
  wellness: {
    id: "wellness",
    name: "Health & Wellness",
    icon: "❤️",
    blurb: "Improving your health can lower insurance costs AND extend the years you get to enjoy your plan. These partners can help.",
    options: [
      { name: "GLP-1 / Weight Management", provider: "Telehealth program", figure: "Metabolic health", bullets: ["Clinician-guided GLP-1 eligibility review", "Coaching + labs + ongoing support", "Can improve life-insurance risk class over time"] },
      { name: "Prescription Savings", provider: "GoodRx-style", figure: "Save on meds", bullets: ["Compare pharmacy prices instantly", "Discount coupons on common prescriptions", "No insurance required"] },
      { name: "Preventive Care & Wellness", provider: "Wellness partnership", figure: "Stay healthy", bullets: ["Annual screenings & biometric tracking", "Fitness & nutrition programs", "Early detection lowers long-term risk"] },
    ],
  },
};
