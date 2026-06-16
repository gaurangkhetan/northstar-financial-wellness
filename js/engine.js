/* ============================================================
   RECOMMENDATION ENGINE (comprehensive, v3)
   • Softer, encouraging language about where someone stands
   • Ethos protection products (Term, IUL, Final Expense, Annuity,
     LTC, Mortgage Protection) always float to the top
   • Segmentation: well-insured → longevity (annuity/LTC);
     65+ lower-means/credit → final expense; 65+ higher-means →
     lifetime income (annuity)
   • A single "top step to protect your family" + top-3 movers
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
  // softened, non-judgmental band names
  const bandFor = (s) => (s >= 85 ? "Excellent" : s >= 70 ? "Strong" : s >= 55 ? "Solid foundation" : s >= 40 ? "Building momentum" : "Just getting started");

  // Ethos protection categories — always prioritized to the top
  const ETHOS_CATS = ["lifeInsurance", "finalExpense", "iul", "annuity", "ltc", "mortgageProtection"];

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
    const wellInsured = existingLife > 0 && (recommendedCoverage === 0 || existingLife >= recommendedCoverage);

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
    //  FINANCIAL HEALTH SCORE (softened, encouraging notes)
    // ============================================================
    const domains = [];
    const ef = clamp(efMonths / efTargetMonths, 0, 1) * 100;
    domains.push({ name: "Emergency fund", score: ef, weight: 1.2,
      note: efMonths >= efTargetMonths ? `Nicely done — ${efMonths} months set aside gives you a real cushion.` : `You've got ${efMonths} month${efMonths === 1 ? "" : "s"} saved; building toward ${efTargetMonths} adds peace of mind.` });

    const sr = clamp(savingsRate / 0.15, 0, 1) * 100;
    domains.push({ name: "Savings rate", score: sr, weight: 1.1,
      note: `You're putting away ~${Math.round(savingsRate * 100)}% of income — every bit compounds, and 15% is a great goal to grow toward.` });

    const dtiNonMort = a.income > 0 ? (a.otherDebt || 0) / a.income : 0;
    const debtScore = clamp(1 - dtiNonMort / 0.4, 0, 1) * 100;
    domains.push({ name: "Debt load", score: debtScore, weight: 1.0,
      note: (a.otherDebt || 0) === 0 ? "No non-mortgage debt — that's a wonderful position to be in." : `About ${fmt(a.otherDebt)} in non-mortgage debt to keep chipping away at.` });

    const protScore = recommendedCoverage > 0 ? clamp(existingLife / recommendedCoverage, 0, 1) * 100 : 100;
    domains.push({ name: "Protection", score: protScore, weight: 1.2,
      note: recommendedCoverage > 0 ? (coverageGap > 0 ? `There's room to add about ${fmt(coverageGap)} of coverage so loved ones are fully protected.` : "Your loved ones look well-covered — great work.") : "No major coverage gap based on what you shared." });

    const retScore = clamp(readinessPct, 0, 100);
    domains.push({ name: "Retirement", score: retScore, weight: 1.3,
      note: `You're on your way — projected to reach about ${Math.round(readinessPct)}% of your retirement goal.` });

    const credScore = creditScoreVal(a.creditScore);
    domains.push({ name: "Credit", score: credScore, weight: 0.8,
      note: `Credit profile: ${a.creditScore || "—"}${a.creditConnected ? " (connected)" : ""} — a strong lever for lower rates everywhere.` });

    const estScore = a.hasEstatePlan === "yes" ? 100 : (a.dependents > 0 || a.age >= 45 ? 25 : 55);
    domains.push({ name: "Estate plan", score: estScore, weight: 0.8,
      note: a.hasEstatePlan === "yes" ? "Your documents are in place — a real gift to your family." : "Adding a simple will is a kind, easy gift to the people you love." });

    const totW = domains.reduce((s, d) => s + d.weight, 0);
    const total = Math.round(domains.reduce((s, d) => s + d.score * d.weight, 0) / totW);
    domains.forEach((d) => { d.score = Math.round(d.score); d.status = d.score >= 75 ? "strong" : d.score >= 50 ? "ok" : "focus"; });

    // ============================================================
    //  PREPAREDNESS — gentle but honest (fear-of-the-unexpected)
    // ============================================================
    const scenarios = [];
    const sStat = (ok, mid) => (ok ? "strong" : mid ? "moderate" : "focus");
    {
      const ratio = recommendedCoverage > 0 ? existingLife / recommendedCoverage : 1;
      scenarios.push({ name: "If an earner passed away", icon: "🕊️",
        status: recommendedCoverage === 0 ? "strong" : sStat(ratio >= 1, ratio >= 0.5),
        note: recommendedCoverage === 0 ? "Limited income-protection need based on what you shared." :
          coverageGap > 0 ? `None of us can predict tomorrow. About ${fmt(coverageGap)} more coverage would keep your family's home and lifestyle intact.` : "Your family's income looks well-protected." });
    }
    scenarios.push({ name: "If you couldn't work (illness/injury)", icon: "🩺",
      status: sStat(efMonths >= 6, efMonths >= 3),
      note: efMonths >= 3 ? "Your cash cushion helps; disability coverage can extend that protection." : "A bigger cash cushion (and disability coverage) would soften the blow if you couldn't earn for a while." });
    scenarios.push({ name: "If income paused (job change)", icon: "💼",
      status: sStat(efMonths >= efTargetMonths, efMonths >= 3),
      note: `${efMonths} month${efMonths === 1 ? "" : "s"} of expenses saved toward a ${efTargetMonths}-month comfort zone.` });
    {
      const nearRet = yearsToRetire <= 8;
      const status = nearRet ? (a.risk === "aggressive" ? "focus" : a.risk === "moderate" ? "moderate" : "strong") : "strong";
      scenarios.push({ name: "If markets dropped", icon: "📉", status,
        note: nearRet ? "Close to retirement, shifting a slice into protected/guaranteed options eases the risk of a bad-timing downturn." : "With time on your side, downturns are recoverable — staying invested wins." });
    }
    scenarios.push({ name: "Outliving your savings", icon: "⏳",
      status: sStat(readinessPct >= 100, readinessPct >= 60),
      note: readinessPct >= 100 ? "On track for your goal — guaranteed income can lock it in for life." : `Projected to about ${Math.round(readinessPct)}% of goal — lifetime-income options help close the gap.` });
    if (a.age >= 45) {
      scenarios.push({ name: "If you needed long-term care", icon: "🧓",
        status: (a.savings || 0) >= 500000 ? "moderate" : "focus",
        note: "Long-term care is a major late-life cost — a hybrid life/LTC policy or rider can cover it gracefully." });
    }

    // ============================================================
    //  OPTIONAL HEALTH / LONGEVITY READ
    // ============================================================
    let healthRisk = null;
    if (a.healthOptIn && a.heightIn > 0 && a.weightLb > 0) {
      const bmi = (a.weightLb / (a.heightIn * a.heightIn)) * 703;
      const conditions = Array.isArray(a.conditions) ? a.conditions : [];
      let pts = 0; const factors = [];
      if (a.age >= 60) pts += 2; else if (a.age >= 45) pts += 1;
      if (a.tobacco === "yes") { pts += 3; factors.push({ label: "Tobacco / nicotine use", impact: "high" }); }
      if (bmi >= 30) { pts += 2; factors.push({ label: `BMI ${bmi.toFixed(1)} (obese range)`, impact: "high" }); }
      else if (bmi >= 25) { pts += 1; factors.push({ label: `BMI ${bmi.toFixed(1)} (overweight)`, impact: "moderate" }); }
      else if (bmi >= 18.5) factors.push({ label: `BMI ${bmi.toFixed(1)} (healthy)`, impact: "good" });
      else { pts += 1; factors.push({ label: `BMI ${bmi.toFixed(1)} (underweight)`, impact: "moderate" }); }
      const serious = conditions.filter((c) => c !== "none");
      pts += serious.length * 2; serious.forEach((c) => factors.push({ label: `Condition: ${c}`, impact: "high" }));
      if (a.activity === "active") { pts -= 1; factors.push({ label: "Physically active", impact: "good" }); }
      else if (a.activity === "sedentary") { pts += 1; factors.push({ label: "Sedentary lifestyle", impact: "moderate" }); }
      if (a.familyHistory === "yes") { pts += 1; factors.push({ label: "Family history of chronic disease", impact: "moderate" }); }
      const band = pts <= 1 ? "Low" : pts <= 3 ? "Moderate" : pts <= 6 ? "Elevated" : "High";
      const insuranceImpact = pts <= 1 ? "Likely best/preferred insurance rates." : pts <= 3 ? "Standard-to-good rates likely." : pts <= 6 ? "Improvements could meaningfully lower premiums." : "Health improvements could meaningfully reduce premiums.";
      const suggestGlp1 = bmi >= 30 || (bmi >= 27 && serious.length > 0);
      healthRisk = { bmi: +bmi.toFixed(1), band, points: pts, factors, insuranceImpact, suggestGlp1 };
    }

    // ============================================================
    //  SEGMENTATION
    // ============================================================
    const senior = a.age >= 65;
    const goodCredit = ["excellent", "good"].includes(a.creditScore);
    const weakCredit = ["poor", "fair", "building", "none"].includes(a.creditScore);
    const lowerMeans = a.income < 45000 || weakCredit;
    const higherMeans = a.income >= 75000 || goodCredit;

    let emphasis, emphasisLabel;
    if (senior && lowerMeans) { emphasis = "finalExpense"; emphasisLabel = "Protect your family from final expenses"; }
    else if (senior && higherMeans) { emphasis = "annuity"; emphasisLabel = "Turn savings into lifetime income"; }
    else if (wellInsured) { emphasis = "annuity"; emphasisLabel = "Protect against outliving your money"; }
    else if (coverageGap > 0) { emphasis = "lifeInsurance"; emphasisLabel = "Protect your family's income"; }
    else if (highIncome && hasSurplus) { emphasis = "iul"; emphasisLabel = "Grow protected, tax-advantaged wealth"; }
    else { emphasis = "lifeInsurance"; emphasisLabel = "Lock in protection while it's affordable"; }

    // ============================================================
    //  CATEGORY-BY-CATEGORY PLAN (Ethos protection floats to top)
    // ============================================================
    const plan = [];
    const add = (categoryId, priority, score, reason, figures) =>
      plan.push({ categoryId, priority, score, reason, figures: figures || [] });

    // --- Ethos protection products (prioritized) ---
    if (coverageGap > 0 && a.age < 70 && !(senior && lowerMeans)) {
      add("lifeInsurance", "now", 100,
        `Life rarely gives warning. For about ${fmt(monthlyTermPremium)}/mo, term life replaces your income and keeps your family in their home — the highest-impact way to protect them today. (Estimated ${fmt(coverageGap)} gap.)`,
        [{ label: "Coverage to add", value: fmt(coverageGap) }, { label: "Est. premium", value: `${fmt(monthlyTermPremium)}/mo` }]);
    }
    if (senior || lowerMeans || (a.age >= 55 && coverageGap === 0)) {
      add("finalExpense", senior && lowerMeans ? "now" : "soon", senior && lowerMeans ? 99 : 70,
        senior && lowerMeans
          ? "A small whole-life policy means funeral costs and final bills never land on the people you love — guaranteed coverage, fixed premiums, designed for your age."
          : "A modest final-expense policy ensures end-of-life costs are handled, sparing your family a stressful bill at a hard time.",
        [{ label: "Typical benefit", value: "$10k–$40k" }, { label: "Premiums", value: "Locked for life" }]);
    }
    if (a.age < 60 && (highIncome ? hasSurplus : (a.dependents > 0 || a.maritalStatus === "married")) ) {
      const surplusMonthly = Math.max(0, Math.round((a.monthlySavings || 0) - iraMonthly));
      add("iul", highIncome && hasSurplus ? "soon" : "later", highIncome && hasSurplus ? 85 : 60,
        highIncome && hasSurplus
          ? `With surplus beyond your IRA limit, a max-funded IUL adds permanent protection plus tax-advantaged growth you can tap later — market-linked upside with a 0% floor.`
          : `An IUL gives lifelong protection plus index-linked growth with a 0% floor — a way to protect your family and build cash value at once.`,
        highIncome && hasSurplus ? [{ label: "Possible funding", value: `${fmt(surplusMonthly)}/mo` }, { label: "Death benefit", value: "Up to $2M" }] : [{ label: "Coverage", value: "Lifelong" }, { label: "Floor", value: "0%" }]);
    }
    if (yearsToRetire <= 15 || a.risk === "conservative" || wellInsured || (senior && higherMeans)) {
      const allocation = Math.round((projectedNestEgg * 0.25) / 5000) * 5000;
      add("annuity", (senior && higherMeans) || wellInsured || yearsToRetire <= 8 ? "now" : "soon",
        (senior && higherMeans) || wellInsured ? 96 : 72,
        wellInsured ? "You've done the hard part on life insurance — now protect the income itself. An annuity turns part of your savings into a paycheck you can't outlive."
          : (senior && higherMeans) ? "Convert part of your savings into guaranteed lifetime income, so a long life never means a tight one."
          : "Converting a slice of savings into guaranteed lifetime income protects against market drops and the risk of outliving your money.",
        [{ label: "Consider allocating", value: allocation > 0 ? `~${fmt(allocation)}` : "~25% of savings" }, { label: "Income", value: "Guaranteed for life" }]);
    }
    if (a.age >= 45 || wellInsured) {
      add("ltc", wellInsured ? "soon" : "later", wellInsured ? 80 : 55,
        wellInsured ? "With life coverage handled, long-term care is the next big 'what if.' A hybrid life/LTC policy covers care costs and still leaves a benefit for heirs."
          : "Long-term care is one of retirement's biggest costs — a hybrid policy or rider covers it without the old 'use it or lose it' tradeoff.",
        [{ label: "Covers", value: "Care costs" }, { label: "Structure", value: "Hybrid life/LTC" }]);
    }

    // --- Foundation & growth (non-Ethos) ---
    if (efMonths < efTargetMonths) {
      add("emergencyFund", "now", 90,
        `Building toward ${efTargetMonths} months of expenses (about ${fmt(efTargetDollars)}) — you're roughly ${fmt(efGapDollars)} away. A high-yield account keeps it growing while staying instantly available.`,
        [{ label: "Target fund", value: fmt(efTargetDollars) }, { label: "To go", value: fmt(efGapDollars) }]);
    } else {
      add("emergencyFund", "maintain", 50, `You've got a healthy ${efMonths}-month cushion — keep it in a high-yield account so inflation doesn't nibble at it.`, [{ label: "Your cushion", value: `${efMonths} months` }]);
    }
    if (weakCredit || a.wantBuildCredit === "yes") {
      add("credit", "soon", 78, `Strengthening your credit gently lowers what you pay on mortgages, auto loans, and even insurance. On-time payments on the right card build history fast.`, [{ label: "Current", value: a.creditScore || "—" }, { label: "Goal", value: "700+" }]);
    } else {
      add("credit", "optional", 40, `Your credit looks healthy — a rewards card on everyday spending puts a little back in your pocket.`, [{ label: "Current", value: a.creditScore || "good+" }]);
    }
    if ((a.monthlySavings || 0) > 0) {
      const iraSuggest = Math.min(iraMonthly, a.monthlySavings || 0);
      add("retirement", "now", 88, `Grab any employer 401(k) match first (it's free money), then fund an IRA — ${rothEligible ? "a Roth is ideal at your income for tax-free growth" : "a Traditional IRA or backdoor Roth fits your income"}${isSelfEmployed ? "; as self-employed, a SEP/Solo 401(k) lets you save much more" : ""}.`, [{ label: "Suggested", value: `${fmt(iraSuggest)}/mo` }, { label: "2026 limit", value: `${fmt(iraAnnualLimit)}/yr` }]);
    }
    if (a.dependents > 0) {
      add("education", a.age < 50 ? "soon" : "later", 68, `With ${a.dependents} dependent${a.dependents > 1 ? "s" : ""}, a 529 grows tax-free for school — even $150–300/mo per child compounds beautifully over the years ahead.`, [{ label: "Per child", value: "~$150–300/mo" }, { label: "Growth", value: "Tax-free for school" }]);
    }
    if ((a.monthlySavings || 0) > iraMonthly) {
      add("investing", "soon", 60, `Once your IRA is funded, a low-cost brokerage keeps additional savings compounding for goals beyond retirement.`, [{ label: "Risk profile", value: a.risk }, { label: "Assumed return", value: `~${Math.round(expReturn * 100)}%/yr` }]);
    } else {
      add("investing", "later", 35, `After your emergency fund and IRA, a simple index portfolio is the easiest way to grow long-term wealth.`, [{ label: "Start with", value: "Index funds" }]);
    }
    if (a.hasEstatePlan !== "yes" && (a.dependents > 0 || a.age >= 40 || (a.savings || 0) > 250000)) {
      add("estate", a.dependents > 0 ? "soon" : "later", a.dependents > 0 ? 66 : 48, `${a.dependents > 0 ? "With kids, a will naming guardians is especially meaningful — " : ""}an estate plan keeps your wishes in control and spares your family extra stress. Often bundled affordably online.`, [{ label: "You have", value: "No plan yet" }, { label: "Need", value: "Will + directives" }]);
    }
    if (a.healthOptIn && healthRisk && (healthRisk.points >= 3 || healthRisk.suggestGlp1)) {
      add("wellness", "optional", 45, `Small health improvements${healthRisk.suggestGlp1 ? " (a clinician-guided GLP-1 / weight program may fit)" : ""} can add good years — and often improve your insurance rates over time.`, [{ label: "Risk band", value: healthRisk.band }, { label: "BMI", value: String(healthRisk.bmi) }]);
    }

    // ---------- ORDER: Ethos-first, emphasis at very top ----------
    const prRank = { now: 0, soon: 1, maintain: 2, later: 3, optional: 4 };
    plan.forEach((p) => {
      p.ethos = ETHOS_CATS.includes(p.categoryId);
      p.isEmphasis = p.categoryId === emphasis;
    });
    plan.sort((x, y) =>
      (y.isEmphasis - x.isEmphasis) ||      // emphasis first
      (y.ethos - x.ethos) ||                // then Ethos products
      (prRank[x.priority] - prRank[y.priority]) ||
      (y.score - x.score));

    // ---------- TOP ACTION + TOP 3 MOVERS ----------
    const emphasisItem = plan.find((p) => p.categoryId === emphasis) || plan[0];
    const topAction = emphasisItem ? {
      categoryId: emphasisItem.categoryId, label: emphasisLabel,
      reason: emphasisItem.reason, figures: emphasisItem.figures,
    } : null;
    // top 3 = the emphasis Ethos action + the next two highest-impact "now/soon" items
    const movers = [];
    if (emphasisItem) movers.push(emphasisItem);
    plan.forEach((p) => {
      if (movers.length >= 3) return;
      if (p === emphasisItem) return;
      if (p.priority === "now" || p.priority === "soon") movers.push(p);
    });
    let mi = 0;
    while (movers.length < 3 && mi < plan.length) { if (!movers.includes(plan[mi])) movers.push(plan[mi]); mi++; }
    const top3 = movers.slice(0, 3);

    // ---------- WARM HEADLINE ----------
    const strengths = domains.filter((d) => d.status === "strong").length;
    const headline = total >= 70
      ? "You've built a strong foundation — here are a few thoughtful ways to make it even more resilient."
      : total >= 55
      ? "You're in a solid spot with clear, encouraging next steps to protect what matters most."
      : "You're taking a great first step today — here's a gentle, prioritized path forward.";

    return {
      inputs: a,
      derived: { yearsToRetire, expReturnPct: Math.round(expReturn * 100), isSelfEmployed, savingsRate, senior, wellInsured, lowerMeans, higherMeans },
      headline,
      scoreBand: bandFor(total),
      segment: { emphasis, emphasisLabel, senior, wellInsured, lowerMeans, higherMeans },
      topAction,
      top3,
      healthScore: { total, band: bandFor(total), domains, strengths },
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
