/* ============================================================
   RECOMMENDATION ENGINE (comprehensive)
   Turns the questionnaire answers into:
     • a financial-health score across CFP domains
     • preparedness for life's unexpected scenarios
     • an optional health / mortality-risk read
     • a prioritized, category-by-category product plan
   All figures are illustrative estimates (disclaimed in the UI).
   ============================================================ */
(function () {
  const IRA_LIMIT = 7000, IRA_CATCHUP = 8000;
  const ROTH_SINGLE = { start: 150000, end: 165000 };
  const ROTH_MARRIED = { start: 236000, end: 246000 };
  const WITHDRAWAL_RATE = 0.04;
  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

  const fvLump = (pv, r, y) => pv * Math.pow(1 + r, y);
  function fvMonthly(pmt, r, y) { const i = r / 12, m = y * 12; return i === 0 ? pmt * m : pmt * ((Math.pow(1 + i, m) - 1) / i); }
  function pmtForFv(fv, r, y) { const i = r / 12, m = y * 12; if (m <= 0) return 0; return i === 0 ? fv / m : (fv * i) / (Math.pow(1 + i, m) - 1); }
  const expectedReturn = (risk) => ({ conservative: 0.04, moderate: 0.06, aggressive: 0.08 }[risk] ?? 0.06);

  function termRatePer1000(age) {
    if (age < 30) return 0.55; if (age < 35) return 0.65; if (age < 40) return 0.85;
    if (age < 45) return 1.25; if (age < 50) return 2.0; if (age < 55) return 3.3;
    if (age < 60) return 5.5; if (age < 65) return 9.0; return 14.0;
  }
  const creditScoreVal = (band) => ({ excellent: 100, good: 80, fair: 55, poor: 30, building: 40, none: 40 }[band] ?? 60);
  const gradeFor = (s) => (s >= 85 ? "A" : s >= 70 ? "B" : s >= 55 ? "C" : s >= 40 ? "D" : "F");

  function analyze(a) {
    const fmt = window.fmt;
    const yearsToRetire = Math.max(0, a.retireAge - a.age);
    const expReturn = expectedReturn(a.risk);
    const annualSavings = (a.monthlySavings || 0) * 12;
    const savingsRate = a.income > 0 ? annualSavings / a.income : 0;
    const isSelfEmployed = a.employment === "self" || a.employment === "both";

    // ---------- LIFE INSURANCE NEED ----------
    const debt = (a.mortgage || 0) + (a.otherDebt || 0);
    const incomeMultiple = a.dependents >= 1 ? 10 : a.maritalStatus === "married" ? 5 : 1;
    const incomeReplacement = a.income * incomeMultiple;
    const education = a.dependents * 100000;
    const finalExpenses = 15000;
    const grossNeed = debt + incomeReplacement + education + finalExpenses;
    let recommendedCoverage = Math.max(0, grossNeed - (a.savings || 0));
    recommendedCoverage = Math.round(recommendedCoverage / 50000) * 50000;
    if (grossNeed - (a.savings || 0) > 25000 && recommendedCoverage < 100000) recommendedCoverage = 100000;
    const existingLife = a.existingLifeInsurance || 0;
    const coverageGap = Math.max(0, recommendedCoverage - existingLife);

    const genderMult = a.gender === "female" ? 0.85 : 1.0;
    const tobaccoMult = a.tobacco === "yes" ? 2.6 : 1.0;
    const healthMult = { excellent: 0.9, good: 1.0, average: 1.45 }[a.health] ?? 1.0;
    const monthlyTermPremium = Math.round(((coverageGap || recommendedCoverage) / 1000) * termRatePer1000(a.age) * genderMult * tobaccoMult * healthMult / 12);

    // ---------- RETIREMENT GAP ----------
    const lifestyle = a.retireLifestyle || 1.0;
    const baseAnnualSpend = a.monthlyExpenses > 0 ? a.monthlyExpenses * 12 : a.income * 0.8;
    const targetAnnualIncome = baseAnnualSpend * lifestyle;
    const estSocialSecurity = a.retireAge >= 62 ? Math.min(a.income * 0.35, 40000) : 0;
    const targetNestEgg = Math.max(0, targetAnnualIncome - estSocialSecurity) / WITHDRAWAL_RATE;
    const projectedNestEgg = fvLump(a.savings || 0, expReturn, yearsToRetire) + fvMonthly(a.monthlySavings || 0, expReturn, yearsToRetire);
    const gap = Math.max(0, targetNestEgg - projectedNestEgg);
    const additionalMonthly = Math.round(pmtForFv(gap, expReturn, yearsToRetire));
    const readinessPct = targetNestEgg > 0 ? clamp((projectedNestEgg / targetNestEgg) * 100, 0, 999) : 100;
    const projectedAnnualIncome = projectedNestEgg * WITHDRAWAL_RATE + estSocialSecurity;

    // ---------- EMERGENCY FUND ----------
    const efTargetMonths = a.dependents > 0 || a.maritalStatus !== "married" ? 6 : 3;
    const efMonths = a.emergencyMonths || 0;
    const efTargetDollars = (a.monthlyExpenses || 0) * efTargetMonths;
    const efGapDollars = Math.max(0, efTargetDollars - (a.monthlyExpenses || 0) * efMonths);

    // ---------- IRA / ROTH ELIGIBILITY ----------
    const iraAnnualLimit = a.age >= 50 ? IRA_CATCHUP : IRA_LIMIT;
    const iraMonthly = Math.round(iraAnnualLimit / 12);
    const roth = a.maritalStatus === "married" ? ROTH_MARRIED : ROTH_SINGLE;
    const rothEligible = a.income < roth.end;
    const highIncome = a.income >= 120000;
    const hasSurplus = (a.monthlySavings || 0) > iraMonthly + 100;

    // ============================================================
    //  FINANCIAL HEALTH SCORE (CFP domains)
    // ============================================================
    const domains = [];
    const ef = clamp(efMonths / efTargetMonths, 0, 1) * 100;
    domains.push({ name: "Emergency fund", score: ef, weight: 1.2,
      note: efMonths >= efTargetMonths ? `${efMonths} months saved — solid cushion.` : `${efMonths} of ${efTargetMonths} target months saved.` });

    const sr = clamp(savingsRate / 0.15, 0, 1) * 100;
    domains.push({ name: "Savings rate", score: sr, weight: 1.1,
      note: `You're saving ~${Math.round(savingsRate * 100)}% of income (15%+ is strong).` });

    const dtiNonMort = a.income > 0 ? (a.otherDebt || 0) / a.income : 0;
    const debtScore = clamp(1 - dtiNonMort / 0.4, 0, 1) * 100;
    domains.push({ name: "Debt load", score: debtScore, weight: 1.0,
      note: (a.otherDebt || 0) === 0 ? "No non-mortgage debt — excellent." : `${fmt(a.otherDebt)} non-mortgage debt vs income.` });

    const protScore = recommendedCoverage > 0 ? clamp(existingLife / recommendedCoverage, 0, 1) * 100 : 100;
    domains.push({ name: "Protection", score: protScore, weight: 1.2,
      note: recommendedCoverage > 0 ? (coverageGap > 0 ? `${fmt(coverageGap)} coverage gap vs your need.` : "Coverage need appears met.") : "No major coverage gap." });

    const retScore = clamp(readinessPct, 0, 100);
    domains.push({ name: "Retirement", score: retScore, weight: 1.3,
      note: `Projected to reach ${Math.round(readinessPct)}% of your target nest egg.` });

    const credScore = creditScoreVal(a.creditScore);
    domains.push({ name: "Credit", score: credScore, weight: 0.8,
      note: `Credit profile: ${a.creditScore || "unknown"}.` });

    const estScore = a.hasEstatePlan === "yes" ? 100 : (a.dependents > 0 || a.age >= 45 ? 25 : 55);
    domains.push({ name: "Estate plan", score: estScore, weight: 0.8,
      note: a.hasEstatePlan === "yes" ? "Estate documents in place." : "No will/trust on record yet." });

    const totW = domains.reduce((s, d) => s + d.weight, 0);
    const total = Math.round(domains.reduce((s, d) => s + d.score * d.weight, 0) / totW);
    domains.forEach((d) => { d.score = Math.round(d.score); d.status = d.score >= 75 ? "strong" : d.score >= 50 ? "ok" : "weak"; });

    // ============================================================
    //  PREPAREDNESS FOR LIFE'S UNEXPECTED SCENARIOS
    // ============================================================
    const scenarios = [];
    const sStat = (ok, mid) => (ok ? "strong" : mid ? "moderate" : "risk");
    // Premature death
    {
      const ratio = recommendedCoverage > 0 ? existingLife / recommendedCoverage : 1;
      scenarios.push({ name: "Premature death of an earner", icon: "🕊️",
        status: recommendedCoverage === 0 ? "strong" : sStat(ratio >= 1, ratio >= 0.5),
        note: recommendedCoverage === 0 ? "Limited income-protection need based on your situation." :
          coverageGap > 0 ? `You'd want about ${fmt(coverageGap)} more life coverage to fully protect your household.` : "Your life coverage appears sufficient." });
    }
    // Disability / serious illness
    scenarios.push({ name: "Disability or serious illness", icon: "🩺",
      status: sStat(efMonths >= 6, efMonths >= 3),
      note: efMonths >= 3 ? "Your cash cushion helps; consider disability insurance to replace income longer-term." :
        "A short cash cushion is risky if you couldn't work — build savings and consider disability cover." });
    // Job loss
    scenarios.push({ name: "Job loss / income interruption", icon: "💼",
      status: sStat(efMonths >= efTargetMonths, efMonths >= 3),
      note: `${efMonths} months of expenses saved vs a ${efTargetMonths}-month target.` });
    // Market downturn
    {
      const nearRet = yearsToRetire <= 8;
      const status = nearRet ? (a.risk === "aggressive" ? "risk" : a.risk === "moderate" ? "moderate" : "strong")
        : (a.risk === "aggressive" ? "strong" : "strong");
      scenarios.push({ name: "Market downturn", icon: "📉", status,
        note: nearRet ? "You're close to retirement — shifting some assets to protected/guaranteed options reduces sequence-of-returns risk." :
          "With time on your side, downturns are recoverable — stay invested and keep contributing." });
    }
    // Outliving savings
    scenarios.push({ name: "Outliving your savings", icon: "⏳",
      status: sStat(readinessPct >= 100, readinessPct >= 60),
      note: readinessPct >= 100 ? "On track for your target — guaranteed income can lock it in." :
        `Projected to ${Math.round(readinessPct)}% of target — increase savings and consider lifetime-income products.` });
    // Long-term care (age-relevant)
    if (a.age >= 45) {
      scenarios.push({ name: "Long-term care needs", icon: "🧓",
        status: a.savings >= 500000 ? "moderate" : "risk",
        note: "LTC is a major late-life cost — explore LTC riders or hybrid life/LTC policies." });
    }

    // ============================================================
    //  OPTIONAL HEALTH / MORTALITY-RISK READ
    // ============================================================
    let healthRisk = null;
    if (a.healthOptIn && a.heightIn > 0 && a.weightLb > 0) {
      const bmi = (a.weightLb / (a.heightIn * a.heightIn)) * 703;
      const conditions = Array.isArray(a.conditions) ? a.conditions : [];
      let pts = 0;
      const factors = [];
      if (a.age >= 60) { pts += 2; } else if (a.age >= 45) { pts += 1; }
      if (a.tobacco === "yes") { pts += 3; factors.push({ label: "Tobacco / nicotine use", impact: "high" }); }
      if (bmi >= 30) { pts += 2; factors.push({ label: `BMI ${bmi.toFixed(1)} (obese range)`, impact: "high" }); }
      else if (bmi >= 25) { pts += 1; factors.push({ label: `BMI ${bmi.toFixed(1)} (overweight)`, impact: "moderate" }); }
      else if (bmi >= 18.5) { factors.push({ label: `BMI ${bmi.toFixed(1)} (healthy)`, impact: "good" }); }
      else { pts += 1; factors.push({ label: `BMI ${bmi.toFixed(1)} (underweight)`, impact: "moderate" }); }
      const seriousConds = conditions.filter((c) => c !== "none");
      pts += seriousConds.length * 2;
      seriousConds.forEach((c) => factors.push({ label: `Condition: ${c}`, impact: "high" }));
      if (a.activity === "active") { pts -= 1; factors.push({ label: "Physically active", impact: "good" }); }
      else if (a.activity === "sedentary") { pts += 1; factors.push({ label: "Sedentary lifestyle", impact: "moderate" }); }
      if (a.familyHistory === "yes") { pts += 1; factors.push({ label: "Family history of chronic disease", impact: "moderate" }); }

      const band = pts <= 1 ? "Low" : pts <= 3 ? "Moderate" : pts <= 6 ? "Elevated" : "High";
      const insuranceImpact = pts <= 1 ? "Likely best/preferred insurance rates."
        : pts <= 3 ? "Standard-to-good rates likely."
        : pts <= 6 ? "Higher premiums likely — improvements could lower them."
        : "Significantly higher premiums likely — health improvements could meaningfully reduce cost.";
      const suggestGlp1 = bmi >= 30 || (bmi >= 27 && seriousConds.length > 0);
      healthRisk = { bmi: +bmi.toFixed(1), band, points: pts, factors, insuranceImpact, suggestGlp1, seriousConds };
    }

    // ============================================================
    //  PRIORITIZED, CATEGORY-BY-CATEGORY PRODUCT PLAN
    // ============================================================
    const plan = [];
    const add = (categoryId, priority, score, reason, figures) =>
      plan.push({ categoryId, priority, score, reason, figures: figures || [] });

    // Emergency fund
    if (efMonths < efTargetMonths) {
      add("emergencyFund", "now", 100,
        `Build toward ${efTargetMonths} months of expenses (about ${fmt(efTargetDollars)}). You're roughly ${fmt(efGapDollars)} short — park it in a high-yield account so it earns while staying liquid.`,
        [{ label: "Target fund", value: fmt(efTargetDollars) }, { label: "Still to save", value: fmt(efGapDollars) }]);
    } else {
      add("emergencyFund", "maintain", 55,
        `You already have ${efMonths} months saved — make sure it's in a high-yield account (not a 0.01% checking) so inflation doesn't erode it.`,
        [{ label: "Your cushion", value: `${efMonths} months` }]);
    }

    // Credit
    if (["poor", "building", "none", "fair"].includes(a.creditScore) || a.wantBuildCredit === "yes") {
      add("credit", "now", 92,
        `Strengthening your credit lowers the rate you'll pay on mortgages, auto loans, and insurance. A secured or starter card with on-time payments is the fastest way to build history.`,
        [{ label: "Current", value: a.creditScore || "—" }, { label: "Goal", value: "700+" }]);
    } else {
      add("credit", "optional", 45,
        `Your credit looks healthy — focus a rewards card on spending you already do, and keep utilization low.`,
        [{ label: "Current", value: a.creditScore || "good+" }]);
    }

    // Life insurance
    if (coverageGap > 0 && a.age < 70) {
      add("lifeInsurance", "now", 96,
        `You have an estimated ${fmt(coverageGap)} life-insurance gap. Level term is the cheapest way to close it — about ${fmt(monthlyTermPremium)}/mo at your age and health.`,
        [{ label: "Coverage gap", value: fmt(coverageGap) }, { label: "Est. premium", value: `${fmt(monthlyTermPremium)}/mo` }]);
    } else if (recommendedCoverage > 0 && existingLife >= recommendedCoverage) {
      add("lifeInsurance", "maintain", 50,
        `Your existing ${fmt(existingLife)} appears to cover your need — revisit it after major life changes (new child, home, income jump).`,
        [{ label: "In force", value: fmt(existingLife) }]);
    }

    // IUL
    if (highIncome && hasSurplus && a.age < 60) {
      const surplusMonthly = Math.max(0, Math.round((a.monthlySavings || 0) - iraMonthly));
      add("iul", a.income >= 150000 ? "soon" : "later", a.income >= 150000 ? 78 : 62,
        `With surplus cash flow beyond your IRA limit and ${yearsToRetire} years to grow, a max-funded IUL adds tax-deferred growth and potential tax-free income later — plus permanent coverage.`,
        [{ label: "Possible funding", value: `${fmt(surplusMonthly)}/mo` }, { label: "Death benefit", value: "Up to $2M" }]);
    } else if (a.age < 55 && (a.dependents > 0 || a.maritalStatus === "married") && a.risk !== "conservative") {
      add("iul", "later", 48,
        `If you want lifelong (not just term) protection plus index-linked growth with a 0% floor, an IUL can complement your term coverage for legacy goals.`,
        [{ label: "Coverage", value: "Lifelong" }, { label: "Floor", value: "0%" }]);
    }

    // Retirement accounts
    if ((a.monthlySavings || 0) > 0) {
      const iraSuggest = Math.min(iraMonthly, a.monthlySavings || 0);
      add("retirement", "now", 95,
        `Capture any employer 401(k) match first (free money), then fund an IRA — ${rothEligible ? "a Roth is ideal at your income for tax-free growth" : "you're above the direct Roth limit, so a Traditional IRA or backdoor Roth fits"}${isSelfEmployed ? "; as self-employed, a SEP/Solo 401(k) lets you shelter far more" : ""}.`,
        [{ label: "Suggested", value: `${fmt(iraSuggest)}/mo` }, { label: "2026 limit", value: `${fmt(iraAnnualLimit)}/yr` }]);
    }

    // Education / 529
    if (a.dependents > 0) {
      add("education", a.age < 50 ? "soon" : "later", 80,
        `With ${a.dependents} dependent${a.dependents > 1 ? "s" : ""}, a 529 lets college savings grow tax-free — even ${fmt(150)}–${fmt(300)}/mo per child compounds meaningfully over the years before college.`,
        [{ label: "Per child", value: "~$150–300/mo" }, { label: "Growth", value: "Tax-free for school" }]);
    }

    // Investing
    if ((a.monthlySavings || 0) > iraMonthly) {
      add("investing", "soon", 70,
        `Once your IRA is funded, route additional savings into a low-cost brokerage so your money keeps compounding for goals beyond retirement.`,
        [{ label: "Risk profile", value: a.risk }, { label: "Assumed return", value: `~${Math.round(expReturn * 100)}%/yr` }]);
    } else {
      add("investing", "later", 40,
        `After your emergency fund and IRA are on track, a low-cost index portfolio is the simplest way to grow long-term wealth.`,
        [{ label: "Start with", value: "Index funds" }]);
    }

    // Annuity
    if (yearsToRetire <= 12 || a.risk === "conservative") {
      const allocation = Math.round((projectedNestEgg * 0.25) / 5000) * 5000;
      add("annuity", yearsToRetire <= 8 ? "soon" : "later", yearsToRetire <= 8 ? 75 : 55,
        `${yearsToRetire <= 12 ? `About ${yearsToRetire} years from retirement, ` : "Given your conservative profile, "}converting a slice of savings into guaranteed lifetime income protects against crashes and longevity.`,
        [{ label: "Consider allocating", value: allocation > 0 ? `~${fmt(allocation)}` : "~25% of savings" }]);
    }

    // Estate
    if (a.hasEstatePlan !== "yes" && (a.dependents > 0 || a.age >= 40 || (a.savings || 0) > 250000)) {
      add("estate", a.dependents > 0 ? "now" : "soon", a.dependents > 0 ? 85 : 65,
        `${a.dependents > 0 ? "With kids, a will naming guardians is essential — " : ""}an estate plan keeps your wishes in control and spares your family probate. Often bundled affordably online.`,
        [{ label: "You have", value: "No plan yet" }, { label: "Need", value: "Will + directives" }]);
    }

    // Wellness (optional)
    if (a.healthOptIn && healthRisk && (healthRisk.points >= 3 || healthRisk.suggestGlp1)) {
      add("wellness", "optional", 60,
        `Your health inputs suggest room to lower long-term risk${healthRisk.suggestGlp1 ? " (a GLP-1 / weight program may be appropriate)" : ""}. Better health can also improve your insurance rate class over time.`,
        [{ label: "Risk band", value: healthRisk.band }, { label: "BMI", value: String(healthRisk.bmi) }]);
    }

    // order: now > soon > maintain/later/optional, then by score
    const rank = { now: 0, soon: 1, maintain: 2, later: 3, optional: 4 };
    plan.sort((x, y) => (rank[x.priority] - rank[y.priority]) || (y.score - x.score));

    return {
      inputs: a,
      derived: { yearsToRetire, expReturnPct: Math.round(expReturn * 100), isSelfEmployed, savingsRate },
      healthScore: { total, grade: gradeFor(total), domains },
      insurance: { recommendedCoverage, existingLife, coverageGap, monthlyTermPremium,
        breakdown: { debt, incomeReplacement, education, finalExpenses, grossNeed, liquidOffset: a.savings || 0 } },
      retirement: { yearsToRetire, targetAnnualIncome, estSocialSecurity, targetNestEgg, projectedNestEgg, gap, additionalMonthly, readinessPct, projectedAnnualIncome, expReturnPct: Math.round(expReturn * 100) },
      emergency: { targetMonths: efTargetMonths, months: efMonths, targetDollars: efTargetDollars, gapDollars: efGapDollars },
      scenarios,
      healthRisk,
      plan,
    };
  }

  window.ENGINE = { analyze };
})();
