/* ============================================================
   APP — intro content, questionnaire flow, profile capture,
   and results rendering.
   ============================================================ */
(function () {
  "use strict";

  // ---------- formatters ----------
  window.fmt = (n) =>
    isFinite(n) ? n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : "—";
  const fmtK = (n) => {
    if (!isFinite(n)) return "—";
    if (Math.abs(n) >= 1e6) return "$" + (n / 1e6).toFixed(n >= 1e7 ? 1 : 2) + "M";
    if (Math.abs(n) >= 1e3) return "$" + Math.round(n / 1e3) + "K";
    return window.fmt(n);
  };
  const $ = (id) => document.getElementById(id);
  const PROFILE_KEY = "northstar_profile";

  // ---------- intro content ----------
  const CFP_STEPS = [
    ["Understand your situation", "We gather your income, expenses, assets, debts, and family details."],
    ["Identify your goals", "Retirement, college, a home, protecting your family — and how they trade off."],
    ["Analyze your current path", "We score where you stand today and pinpoint the gaps to close."],
    ["Develop recommendations", "Specific products and amounts, tailored to your numbers."],
    ["Present your plan", "A personalized roadmap, explained in plain language."],
    ["Implement", "Take action — open accounts and get covered, with partner discounts."],
    ["Monitor & update", "Revisit as life changes; we surface better deals over time."],
  ];
  const EVAL_DOMAINS = [
    ["💵", "Cash flow & savings", "Are you living within your means and saving enough?"],
    ["💧", "Emergency fund", "Could you weather 3–6 months without income?"],
    ["💳", "Debt & credit", "Is debt under control and credit working for you?"],
    ["🛡️", "Protection", "Is your family's income protected if something happens?"],
    ["🌱", "Retirement", "Are you on track to fund the retirement you want?"],
    ["🎓", "Education", "Are you saving for your kids' education tax-efficiently?"],
    ["📈", "Investments", "Is your money growing for long-term goals?"],
    ["📜", "Estate & legacy", "Are your wishes documented and your family protected?"],
  ];

  // ---------- questionnaire definition ----------
  const STEPS = [
    { name: "About you", title: "Let's start with the basics", subtitle: "A few details so we can size your protection and savings needs.",
      fields: [
        { key: "age", type: "number", label: "Your age", suffix: "years", min: 18, max: 90, placeholder: "35", required: true },
        { key: "gender", type: "chips", cols: 2, label: "Gender", hint: "Used only to estimate insurance pricing", required: true,
          options: [{ value: "female", title: "Female" }, { value: "male", title: "Male" }] },
        { key: "maritalStatus", type: "chips", cols: 2, label: "Marital status", required: true,
          options: [{ value: "single", title: "Single" }, { value: "married", title: "Married / partnered" }] },
        { key: "dependents", type: "number", label: "Number of dependents", hint: "Children or others who rely on your income", min: 0, max: 12, placeholder: "0", required: true },
      ] },

    { name: "Income & work", title: "Your income and employment", subtitle: "This drives both your insurance need and your savings capacity.",
      fields: [
        { key: "income", type: "number", prefix: "$", suffix: "/yr", label: "Annual gross household income", min: 0, max: 10000000, placeholder: "85,000", required: true },
        { key: "employment", type: "chips", cols: 3, label: "Employment type", required: true,
          options: [{ value: "w2", title: "Employee", desc: "W-2 income" }, { value: "self", title: "Self-employed", desc: "1099 / business" }, { value: "both", title: "Both", desc: "W-2 + side income" }] },
        { key: "monthlyExpenses", type: "number", prefix: "$", suffix: "/mo", label: "Total monthly living expenses", hint: "Housing, food, transport, everything", min: 0, max: 200000, placeholder: "4,500", required: true },
      ] },

    { name: "Safety net", title: "Your savings safety net", subtitle: "Cash on hand and how much you can set aside each month.",
      fields: [
        { key: "emergencyMonths", type: "number", suffix: "months", label: "Emergency fund", hint: "Months of expenses you have saved in cash/savings", min: 0, max: 60, placeholder: "3", required: true },
        { key: "monthlySavings", type: "number", prefix: "$", suffix: "/mo", label: "Amount you can save / invest each month", min: 0, max: 200000, placeholder: "750", required: true },
      ] },

    { name: "Debt & credit", title: "Debts and credit", subtitle: "We'll factor obligations and help you strengthen your credit.",
      fields: [
        { key: "mortgage", type: "number", prefix: "$", label: "Remaining mortgage balance", hint: "Enter 0 if none", min: 0, max: 100000000, placeholder: "0", required: true },
        { key: "otherDebt", type: "number", prefix: "$", label: "Other debt (cards, auto, student loans)", hint: "Enter 0 if none", min: 0, max: 100000000, placeholder: "0", required: true },
        { key: "creditScore", type: "chips", cols: 3, label: "Credit score range", required: true,
          options: [
            { value: "excellent", title: "Excellent", desc: "750+" }, { value: "good", title: "Good", desc: "700–749" }, { value: "fair", title: "Fair", desc: "640–699" },
            { value: "poor", title: "Poor", desc: "Below 640" }, { value: "building", title: "Building", desc: "Thin / new" }, { value: "none", title: "Not sure", desc: "Don't know" },
          ] },
        { key: "wantBuildCredit", type: "chips", cols: 2, label: "Do you want to actively build or improve your credit?", required: true,
          options: [{ value: "yes", title: "Yes" }, { value: "no", title: "No / already strong" }] },
      ] },

    { name: "Savings & retirement", title: "Savings and retirement goals", subtitle: "Where you stand and what you're aiming for.",
      fields: [
        { key: "savings", type: "number", prefix: "$", label: "Current retirement & investment savings", hint: "401(k), IRA, brokerage — total balance", min: 0, max: 100000000, placeholder: "60,000", required: true },
        { key: "retireAge", type: "number", suffix: "years", label: "Target retirement age", min: 40, max: 85, placeholder: "65", required: true },
        { key: "retireLifestyle", type: "chips", cols: 3, label: "Retirement lifestyle", hint: "Relative to your spending today", required: true, parse: parseFloat,
          options: [{ value: "0.8", title: "Downsize", desc: "~80% of today" }, { value: "1", title: "Maintain", desc: "~100% of today" }, { value: "1.2", title: "Upgrade", desc: "~120% of today" }] },
        { key: "risk", type: "chips", cols: 3, label: "Investment risk tolerance", required: true,
          options: [{ value: "conservative", title: "Conservative", desc: "Protect · ~4%" }, { value: "moderate", title: "Moderate", desc: "Balanced · ~6%" }, { value: "aggressive", title: "Aggressive", desc: "Growth · ~8%" }] },
      ] },

    { name: "Coverage & estate", title: "Existing coverage and estate", subtitle: "What protection and documents you already have in place.",
      fields: [
        { key: "existingLifeInsurance", type: "number", prefix: "$", label: "Life insurance you already have", hint: "Total death benefit in force — enter 0 if none", min: 0, max: 100000000, placeholder: "0", required: true },
        { key: "hasEstatePlan", type: "chips", cols: 2, label: "Do you have a will or trust?", required: true,
          options: [{ value: "yes", title: "Yes" }, { value: "no", title: "No / not sure" }] },
      ] },

    { name: "Health basics", title: "A couple of health questions", subtitle: "These affect life-insurance eligibility and pricing.",
      fields: [
        { key: "tobacco", type: "chips", cols: 2, label: "Tobacco or nicotine use in the last 12 months?", required: true,
          options: [{ value: "no", title: "No" }, { value: "yes", title: "Yes" }] },
        { key: "health", type: "chips", cols: 3, label: "Overall health", required: true,
          options: [{ value: "excellent", title: "Excellent", desc: "No major issues" }, { value: "good", title: "Good", desc: "Minor / managed" }, { value: "average", title: "Average", desc: "Some conditions" }] },
        { key: "healthOptIn", type: "chips", cols: 2, label: "Add an optional health & longevity check?", hint: "Estimates your risk and surfaces wellness options. Skip anytime.", required: true,
          options: [{ value: "yes", title: "Yes, include it" }, { value: "no", title: "No thanks" }] },
      ] },

    { name: "Health & longevity", title: "Optional health & longevity check", subtitle: "A quick read on your risk — and ways to improve it. Not medical advice.",
      skipIf: (a) => a.healthOptIn !== "yes",
      fields: [
        { key: "heightFt", type: "number", suffix: "ft", label: "Height — feet", min: 3, max: 8, placeholder: "5", required: true, half: true },
        { key: "heightInch", type: "number", suffix: "in", label: "Height — inches", min: 0, max: 11, placeholder: "10", required: true, half: true },
        { key: "weightLb", type: "number", suffix: "lb", label: "Weight", min: 50, max: 800, placeholder: "170", required: true },
        { key: "activity", type: "chips", cols: 3, label: "Activity level", required: true,
          options: [{ value: "sedentary", title: "Sedentary", desc: "Little exercise" }, { value: "moderate", title: "Moderate", desc: "Some each week" }, { value: "active", title: "Active", desc: "Regular exercise" }] },
        { key: "conditions", type: "checks", cols: 2, label: "Any of these apply? (select all)", required: false,
          options: [
            { value: "none", title: "None", exclusive: true }, { value: "hypertension", title: "High blood pressure" }, { value: "high cholesterol", title: "High cholesterol" },
            { value: "diabetes", title: "Diabetes / pre-diabetes" }, { value: "heart condition", title: "Heart condition" }, { value: "cancer history", title: "Cancer history" },
          ] },
        { key: "familyHistory", type: "chips", cols: 2, label: "Family history of heart disease, diabetes, or cancer?", required: true,
          options: [{ value: "yes", title: "Yes" }, { value: "no", title: "No / unsure" }] },
      ] },

    { name: "Your profile", title: "Save your profile", subtitle: "Optional — so we can find you better products and deals over time. Stored only in your browser for this demo.",
      isProfile: true,
      fields: [
        { key: "name", type: "text", label: "Name", placeholder: "Alex Rivera", required: false },
        { key: "email", type: "text", label: "Email", hint: "We'll use this to surface better rates as your situation changes", placeholder: "you@email.com", required: false, validateEmail: true },
      ] },
  ];

  // ---------- state ----------
  const DEFAULTS = {
    age: "", gender: "", maritalStatus: "", dependents: 0,
    income: "", employment: "", monthlyExpenses: "",
    emergencyMonths: "", monthlySavings: "",
    mortgage: 0, otherDebt: 0, creditScore: "", wantBuildCredit: "",
    savings: "", retireAge: "", retireLifestyle: "", risk: "",
    existingLifeInsurance: 0, hasEstatePlan: "",
    tobacco: "", health: "", healthOptIn: "",
    heightFt: "", heightInch: "", weightLb: "", activity: "", conditions: [], familyHistory: "",
    name: "", email: "",
  };
  const answers = Object.assign({}, DEFAULTS, { conditions: [] });
  let current = 0;

  const views = { intro: $("view-intro"), quiz: $("view-quiz"), results: $("view-results") };

  // ---------- intro rendering ----------
  function renderIntro() {
    $("steps7").innerHTML = CFP_STEPS.map((s, i) =>
      `<li class="step7"><span class="step7-n">${i + 1}</span><div><strong>${s[0]}</strong><span>${s[1]}</span></div></li>`).join("");
    $("evalGrid").innerHTML = EVAL_DOMAINS.map((d) =>
      `<div class="eval-card"><span class="eval-ico">${d[0]}</span><strong>${d[1]}</strong><span>${d[2]}</span></div>`).join("");
    const prof = loadProfile();
    if (prof && prof.name) {
      $("welcomeBack").classList.remove("hidden");
      $("welcomeBack").innerHTML = `👋 Welcome back, <strong>${escapeHtml(prof.name)}</strong>. Pick up where you left off — your details stay in this browser.`;
      answers.name = prof.name; answers.email = prof.email || "";
    }
  }

  // ---------- step navigation helpers ----------
  const isSkipped = (i) => typeof STEPS[i].skipIf === "function" && STEPS[i].skipIf(answers);
  function visibleIndices() { return STEPS.map((_, i) => i).filter((i) => !isSkipped(i)); }
  function nextVisible(i) { for (let j = i + 1; j < STEPS.length; j++) if (!isSkipped(j)) return j; return -1; }
  function prevVisible(i) { for (let j = i - 1; j >= 0; j--) if (!isSkipped(j)) return j; return -1; }

  // ---------- field rendering ----------
  function fieldHTML(f) {
    const hint = f.hint ? ` <span class="hint">${f.hint}</span>` : "";
    let control = "";

    if (f.type === "number") {
      let wrapCls = "input-wrap";
      if (f.prefix) wrapCls += " has-prefix";
      if (f.suffix) wrapCls += " has-suffix";
      const prefix = f.prefix ? `<span class="input-prefix">${f.prefix}</span>` : "";
      const suffix = f.suffix ? `<span class="input-suffix">${f.suffix}</span>` : "";
      const val = answers[f.key] !== "" && answers[f.key] != null ? answers[f.key] : "";
      control = `<div class="${wrapCls}">${prefix}<input id="f_${f.key}" type="number" inputmode="decimal" min="${f.min ?? ""}" max="${f.max ?? ""}" placeholder="${f.placeholder ?? ""}" value="${val}" autocomplete="off" />${suffix}</div>`;
    } else if (f.type === "text") {
      const val = answers[f.key] != null ? String(answers[f.key]).replace(/"/g, "&quot;") : "";
      control = `<div class="input-wrap"><input id="f_${f.key}" type="text" placeholder="${f.placeholder ?? ""}" value="${val}" autocomplete="off" /></div>`;
    } else if (f.type === "chips" || f.type === "checks") {
      const multi = f.type === "checks";
      const cols = f.cols ? ` cols-${f.cols}` : "";
      const sel = (v) => multi ? (answers[f.key] || []).map(String).includes(String(v)) : String(answers[f.key]) === String(v);
      const opts = f.options.map((o) => {
        const desc = o.desc ? `<span class="chip-desc">${o.desc}</span>` : "";
        return `<label class="chip${sel(o.value) ? " selected" : ""}" data-key="${f.key}" data-value="${o.value}" data-multi="${multi}" data-exclusive="${!!o.exclusive}"><span class="chip-check${multi ? " sq" : ""}"></span><span class="chip-title">${o.title}</span>${desc}</label>`;
      }).join("");
      control = `<div class="chips${cols}" data-group="${f.key}">${opts}</div>`;
    }
    return `<div class="field${f.half ? " half" : ""}" data-field="${f.key}"><label for="f_${f.key}">${f.label}${hint}</label>${control}<div class="field-error" id="e_${f.key}"></div></div>`;
  }

  function renderStep() {
    const step = STEPS[current];
    // group consecutive .half fields into rows
    let fieldsHTML = "", i = 0;
    while (i < step.fields.length) {
      const f = step.fields[i];
      if (f.half && step.fields[i + 1] && step.fields[i + 1].half) {
        fieldsHTML += `<div class="grid-2">${fieldHTML(f)}${fieldHTML(step.fields[i + 1])}</div>`;
        i += 2;
      } else { fieldsHTML += fieldHTML(f); i++; }
    }

    const profileLead = step.isProfile
      ? `<div class="profile-lead">✦ <strong>Find better deals, automatically.</strong> Save your profile and we'll keep matching you to higher-yield accounts, lower premiums, and partner discounts as your situation changes. You can also just continue without saving.</div>`
      : "";

    $("stepContainer").innerHTML = `<div class="step-head"><h2>${step.title}</h2><p>${step.subtitle}</p></div>${profileLead}<div class="step-fields">${fieldsHTML}</div>`;

    const vis = visibleIndices();
    const pos = vis.indexOf(current);
    $("progressFill").style.width = `${((pos + 1) / vis.length) * 100}%`;
    $("stepLabel").textContent = `Step ${pos + 1} of ${vis.length}`;
    $("stepName").textContent = step.name;
    $("backBtn").textContent = pos === 0 ? "← Intro" : "← Back";
    $("nextBtn").textContent = nextVisible(current) === -1 ? "See my plan →" : (step.isProfile ? "Save & see my plan →" : "Continue →");

    // chip / check handlers
    $("stepContainer").querySelectorAll(".chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        const key = chip.dataset.key;
        const multi = chip.dataset.multi === "true";
        const group = chip.closest(".chips");
        if (multi) {
          const exclusive = chip.dataset.exclusive === "true";
          let arr = answers[key] || [];
          const v = chip.dataset.value;
          if (exclusive) { arr = arr.includes(v) ? [] : [v]; }
          else { arr = arr.filter((x) => x !== "none"); arr = arr.includes(v) ? arr.filter((x) => x !== v) : arr.concat(v); }
          answers[key] = arr;
          group.querySelectorAll(".chip").forEach((c) => c.classList.toggle("selected", arr.map(String).includes(c.dataset.value)));
        } else {
          group.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected"));
          chip.classList.add("selected");
          answers[key] = chip.dataset.value;
        }
        clearError(key);
      });
    });
    step.fields.forEach((f) => {
      if (f.type === "number" || f.type === "text") {
        const el = $(`f_${f.key}`);
        el.addEventListener("input", () => clearError(f.key));
        el.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("nextBtn").click(); } });
      }
    });

    const firstInput = $("stepContainer").querySelector("input");
    if (firstInput) firstInput.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearError(key) { const e = $(`e_${key}`); if (e) e.classList.remove("show"); const i = $(`f_${key}`); if (i) i.classList.remove("invalid"); }
  function showError(key, msg) { const e = $(`e_${key}`); if (e) { e.textContent = msg; e.classList.add("show"); } const i = $(`f_${key}`); if (i) i.classList.add("invalid"); }

  function validateAndSaveStep() {
    const step = STEPS[current];
    let ok = true, firstBad = null;
    for (const f of step.fields) {
      if (f.type === "number") {
        const el = $(`f_${f.key}`); const raw = el.value.trim();
        if (raw === "") { showError(f.key, "This field is required."); ok = false; firstBad = firstBad || el; continue; }
        const num = Number(raw);
        if (!isFinite(num)) { showError(f.key, "Please enter a number."); ok = false; firstBad = firstBad || el; continue; }
        if (f.min != null && num < f.min) { showError(f.key, `Must be at least ${f.min}.`); ok = false; firstBad = firstBad || el; continue; }
        if (f.max != null && num > f.max) { showError(f.key, `Must be ${f.max} or less.`); ok = false; firstBad = firstBad || el; continue; }
        answers[f.key] = num;
      } else if (f.type === "text") {
        const el = $(`f_${f.key}`); const raw = el.value.trim();
        if (f.required && raw === "") { showError(f.key, "This field is required."); ok = false; firstBad = firstBad || el; continue; }
        if (f.validateEmail && raw !== "" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(raw)) { showError(f.key, "Please enter a valid email."); ok = false; firstBad = firstBad || el; continue; }
        answers[f.key] = raw;
      } else if (f.type === "chips") {
        if (answers[f.key] === "" || answers[f.key] == null) { showError(f.key, "Please choose an option."); ok = false; }
        else if (f.parse) answers[f.key] = f.parse(answers[f.key]);
      } else if (f.type === "checks") {
        if (f.required && (!answers[f.key] || answers[f.key].length === 0)) { showError(f.key, "Please select at least one."); ok = false; }
      }
    }
    if (!ok && firstBad) firstBad.focus();
    return ok;
  }

  // ---------- navigation ----------
  function goIntro() { current = 0; views.intro.classList.remove("hidden"); views.quiz.classList.add("hidden"); views.results.classList.add("hidden"); window.scrollTo({ top: 0 }); }
  function goQuiz() { views.intro.classList.add("hidden"); views.results.classList.add("hidden"); views.quiz.classList.remove("hidden"); renderStep(); }
  function next() {
    if (!validateAndSaveStep()) return;
    const step = STEPS[current];
    if (step.isProfile && (answers.email || answers.name)) saveProfile();
    const nxt = nextVisible(current);
    if (nxt === -1) showResults(); else { current = nxt; renderStep(); }
  }
  function back() { const prv = prevVisible(current); if (prv === -1) goIntro(); else { current = prv; renderStep(); } }

  // ---------- profile / localStorage ----------
  function saveProfile() {
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify({ name: answers.name || "", email: answers.email || "", savedAt: Date.now() })); } catch (e) {}
  }
  function loadProfile() { try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || "null"); } catch (e) { return null; } }
  function escapeHtml(s) { return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])); }

  // ============================================================
  //  RESULTS
  // ============================================================
  function scoreRing(total, grade) {
    const r = 54, c = 2 * Math.PI * r, off = c * (1 - total / 100);
    const col = total >= 70 ? "var(--green)" : total >= 55 ? "var(--gold)" : "#e0734f";
    return `<svg class="ring" viewBox="0 0 130 130" width="130" height="130">
      <circle cx="65" cy="65" r="${r}" fill="none" stroke="var(--line)" stroke-width="12"/>
      <circle cx="65" cy="65" r="${r}" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 65 65)"/>
      <text x="65" y="60" text-anchor="middle" class="ring-num">${total}</text>
      <text x="65" y="82" text-anchor="middle" class="ring-grade">Grade ${grade}</text>
    </svg>`;
  }
  function domainRow(d) {
    return `<div class="dom-row"><div class="dom-top"><span class="dom-name">${d.name}</span><span class="dom-score dom-${d.status}">${d.score}</span></div>
      <div class="dom-track"><div class="dom-fill dom-${d.status}" style="width:${d.score}%"></div></div>
      <div class="dom-note">${d.note}</div></div>`;
  }
  function scenarioRow(s) {
    const label = { strong: "Well prepared", moderate: "Partly prepared", risk: "Needs attention" }[s.status];
    return `<div class="scen"><span class="scen-ico">${s.icon}</span><div class="scen-body"><div class="scen-top"><span class="scen-name">${s.name}</span><span class="pill pill-${s.status}">${label}</span></div><p>${s.note}</p></div></div>`;
  }
  function optionCardHTML(opt) {
    const partner = opt.partner
      ? `<div class="partner">✦ Ethos partner — exclusive member discount</div>` : "";
    const bullets = (opt.bullets || []).map((b) => `<li>${b}</li>`).join("");
    return `<div class="opt${opt.partner ? " opt-partner" : ""}">
      <div class="opt-head"><div><div class="opt-name">${opt.name}</div><div class="opt-prov">${opt.provider}</div></div>${opt.figure ? `<span class="opt-fig">${opt.figure}</span>` : ""}</div>
      ${partner}<ul class="opt-bullets">${bullets}</ul></div>`;
  }
  function categoryCardHTML(item) {
    const cat = window.CATEGORIES[item.categoryId];
    if (!cat) return "";
    const pr = { now: ["Do now", "p-now"], soon: ["Up next", "p-soon"], maintain: ["Maintain", "p-maint"], later: ["Later", "p-later"], optional: ["Optional", "p-opt"] }[item.priority] || ["", ""];
    const figs = (item.figures || []).map((f) => `<div class="rec-fig"><div class="fig-label">${f.label}</div><div class="fig-value">${f.value}</div></div>`).join("");
    const hasPartner = cat.options.some((o) => o.partner);
    return `<article class="cat">
      <div class="cat-head"><div class="cat-ico">${cat.icon}</div><div class="cat-titles"><h3>${cat.name}${hasPartner ? ' <span class="ethos-tag">Ethos partner</span>' : ""}</h3><div class="cat-blurb">${cat.blurb}</div></div><span class="pri ${pr[1]}">${pr[0]}</span></div>
      <div class="cat-why"><strong>Why now:</strong> ${item.reason}</div>
      ${figs ? `<div class="rec-figures">${figs}</div>` : ""}
      <div class="opt-grid">${cat.options.map(optionCardHTML).join("")}</div>
    </article>`;
  }

  function showResults() {
    // derive composite health inputs
    answers.heightIn = (Number(answers.heightFt) || 0) * 12 + (Number(answers.heightInch) || 0);
    const r = window.ENGINE.analyze(answers);
    const a = answers, ret = r.retirement, ins = r.insurance, hs = r.healthScore, em = r.emergency;
    const onTrack = ret.projectedNestEgg >= ret.targetNestEgg;

    const stats = [
      { label: "Financial health", value: `${hs.total}`, sub: `Grade ${hs.grade}`, cls: hs.total >= 70 ? "good" : hs.total >= 55 ? "" : "warn" },
      { label: "Suggested life cover", value: ins.coverageGap > 0 ? fmtK(ins.coverageGap) : (ins.recommendedCoverage > 0 ? "Covered" : "—"), sub: ins.coverageGap > 0 ? `gap · ~${window.fmt(ins.monthlyTermPremium)}/mo` : "no gap", cls: ins.coverageGap > 0 ? "warn" : "good" },
      { label: "Retirement readiness", value: `${Math.round(ret.readinessPct)}%`, sub: `of target by ${a.retireAge}`, cls: onTrack ? "good" : "warn" },
      { label: "Emergency fund", value: `${em.months}/${em.targetMonths} mo`, sub: em.months >= em.targetMonths ? "fully funded" : `~${fmtK(em.gapDollars)} to go`, cls: em.months >= em.targetMonths ? "good" : "warn" },
    ];
    const statsHTML = stats.map((s) => `<div class="stat ${s.cls}"><div class="stat-label">${s.label}</div><div class="stat-value">${s.value}</div><div class="stat-sub">${s.sub}</div></div>`).join("");

    // score panel
    const scorePanel = `<div class="section-card score-card">
      <div class="score-left">${scoreRing(hs.total, hs.grade)}<p class="score-cap">Your financial health score, weighted across the areas a planner reviews.</p></div>
      <div class="score-right">${hs.domains.map(domainRow).join("")}</div></div>`;

    // scenarios
    const scenCard = `<div class="section-card"><h2>How prepared are you for the unexpected?</h2>
      <p class="sub">Stress-testing your plan against the events that derail families' finances.</p>
      <div class="scen-grid">${r.scenarios.map(scenarioRow).join("")}</div></div>`;

    // retirement
    const projPct = ret.targetNestEgg > 0 ? Math.min(100, (ret.projectedNestEgg / ret.targetNestEgg) * 100) : 100;
    const retCard = `<div class="section-card"><h2>Retirement outlook</h2>
      <p class="sub">Projecting ${ret.yearsToRetire} years at an assumed ${ret.expReturnPct}% return (${a.risk}), using the 4% rule.</p>
      <div class="bar-row"><div class="bar-top"><span class="bar-name">Projected nest egg</span><span class="bar-val">${window.fmt(ret.projectedNestEgg)}</span></div><div class="bar-track"><div class="bar-seg have" style="width:${projPct}%"></div></div></div>
      <div class="bar-row"><div class="bar-top"><span class="bar-name">Target nest egg</span><span class="bar-val">${window.fmt(ret.targetNestEgg)}</span></div><div class="bar-track"><div class="bar-seg" style="width:100%;background:#cbd5e1"></div></div></div>
      <div class="note">${onTrack
        ? `🎉 <strong>On track</strong> — projected to ~${Math.round(ret.readinessPct)}% of target, roughly ${window.fmt(Math.round(ret.projectedAnnualIncome))}/yr of income (incl. ~${window.fmt(Math.round(ret.estSocialSecurity))} Social Security).`
        : `Save about <strong>${window.fmt(ret.additionalMonthly)}/mo more</strong> to hit your target. The plan below is prioritized to help close that gap.`}</div></div>`;

    // optional health read
    let healthCard = "";
    if (r.healthRisk) {
      const hr = r.healthRisk;
      const bandCls = { Low: "pill-strong", Moderate: "pill-moderate", Elevated: "pill-risk", High: "pill-risk" }[hr.band] || "pill-moderate";
      const factors = hr.factors.map((f) => `<li class="hf hf-${f.impact}">${f.label}</li>`).join("");
      healthCard = `<div class="section-card"><h2>Health & longevity read <span class="pill ${bandCls}">${hr.band} risk</span></h2>
        <p class="sub">An illustrative estimate — not a medical assessment. ${hr.insuranceImpact}</p>
        <div class="health-grid"><div class="health-metric"><div class="hm-val">${hr.bmi}</div><div class="hm-lab">Body Mass Index</div></div>
        <ul class="health-factors">${factors}</ul></div>
        ${hr.suggestGlp1 ? `<div class="note">💡 Based on your inputs, a clinician-guided <strong>GLP-1 / weight-management program</strong> may be appropriate and could improve both your health and your future insurance rates. See options in Health &amp; Wellness below.</div>` : ""}</div>`;
    }

    // action plan (categories)
    const planHTML = r.plan.map(categoryCardHTML).join("");
    const planCard = `<div class="section-card"><h2>🧭 Your action plan</h2>
      <p class="sub">Every relevant category with 2–3 vetted options, in the order that does the most good. ✦ marks an Ethos partner product with a member discount.</p>
      <div class="cat-grid">${planHTML}</div></div>`;

    // profile CTA
    const prof = loadProfile();
    const profileCard = prof && prof.email
      ? `<div class="section-card profile-saved"><h2>✓ Profile saved</h2><p class="sub">We'll keep matching <strong>${escapeHtml(prof.name || prof.email)}</strong> to better rates, higher yields, and new partner discounts as things change. (Demo: stored only in your browser.)</p></div>`
      : `<div class="section-card profile-cta"><h2>✦ Get better deals over time</h2><p class="sub">Save your profile and we'll keep finding you higher-yield accounts, lower premiums, and exclusive partner discounts as your situation evolves.</p>
        <div class="profile-form"><input type="text" id="cta_name" placeholder="Name" value="${escapeHtml(a.name || "")}"/><input type="text" id="cta_email" placeholder="you@email.com" value="${escapeHtml(a.email || "")}"/><button class="btn btn-primary" id="cta_save">Save my profile</button></div>
        <div class="field-error" id="cta_err"></div></div>`;

    $("resultsContainer").innerHTML =
      `<div class="results-head"><p class="eyebrow">Your personalized plan</p>
        <h1>${a.name ? escapeHtml(a.name) + ", here's" : "Here's"} your financial wellness plan.</h1>
        <p>Based on a ${window.fmt(a.income)}/yr income, ${a.dependents} dependent${a.dependents === 1 ? "" : "s"}, and a goal to retire at ${a.retireAge}. Here's where you stand and exactly what to do next.</p></div>
      <div class="summary-grid">${statsHTML}</div>
      ${scorePanel}${scenCard}${retCard}${healthCard}${planCard}${profileCard}
      <div class="results-actions"><button class="btn btn-light" id="restartBtn">↺ Start over</button><button class="btn btn-primary" id="printBtn">⤓ Save / print my plan</button></div>
      <p class="reassure" style="margin-top:24px">Educational estimates only — not quotes, offers, or financial/medical advice. Review official illustrations and consult licensed professionals before acting.</p>`;

    views.intro.classList.add("hidden"); views.quiz.classList.add("hidden"); views.results.classList.remove("hidden");
    window.scrollTo({ top: 0, behavior: "smooth" });

    $("restartBtn").addEventListener("click", () => { resetAnswers(); goIntro(); });
    $("printBtn").addEventListener("click", () => window.print());
    const saveBtn = $("cta_save");
    if (saveBtn) saveBtn.addEventListener("click", () => {
      const name = $("cta_name").value.trim(), email = $("cta_email").value.trim();
      if (email !== "" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { $("cta_err").textContent = "Please enter a valid email."; $("cta_err").classList.add("show"); return; }
      answers.name = name; answers.email = email; saveProfile();
      $("cta_save").closest(".profile-cta").innerHTML = `<h2>✓ Thanks${name ? ", " + escapeHtml(name) : ""}!</h2><p class="sub">Your profile is saved. We'll surface better deals as your situation changes. (Demo: stored only in your browser.)</p>`;
    });
  }

  function resetAnswers() { Object.assign(answers, DEFAULTS, { conditions: [] }); const p = loadProfile(); if (p) { answers.name = p.name || ""; answers.email = p.email || ""; } current = 0; }

  // ---------- wire up ----------
  renderIntro();
  $("startBtn").addEventListener("click", goQuiz);
  $("startBtn2").addEventListener("click", goQuiz);
  $("nextBtn").addEventListener("click", next);
  $("backBtn").addEventListener("click", back);
  $("brandHome").addEventListener("click", (e) => { e.preventDefault(); resetAnswers(); goIntro(); });
})();
