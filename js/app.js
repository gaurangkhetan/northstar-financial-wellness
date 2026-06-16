/* ============================================================
   APP (v3) — intro, questionnaire, two-column report,
   email-code login, and dashboard portal.
   ============================================================ */
(function () {
  "use strict";

  // ---------- formatters & utils ----------
  window.fmt = (n) => isFinite(n) ? n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : "—";
  const fmtK = (n) => { if (!isFinite(n)) return "—"; if (Math.abs(n) >= 1e6) return "$" + (n / 1e6).toFixed(n >= 1e7 ? 1 : 2) + "M"; if (Math.abs(n) >= 1e3) return "$" + Math.round(n / 1e3) + "K"; return window.fmt(n); };
  const $ = (id) => document.getElementById(id);
  const escapeHtml = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- storage ----------
  const K = { profile: "northstar_profile", answers: "northstar_answers", session: "northstar_session", credit: "northstar_credit" };
  const loadJSON = (k) => { try { return JSON.parse(localStorage.getItem(k) || "null"); } catch (e) { return null; } };
  const saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

  // ---------- intro content ----------
  const CFP_STEPS = [
    ["Understand your situation", "We gather your income, expenses, assets, debts, and family details."],
    ["Identify your goals", "Retirement, college, a home, protecting your family — and how they trade off."],
    ["Analyze where you stand", "We map your strengths and the few things that move the needle most."],
    ["Develop recommendations", "Specific products and amounts, tailored to your numbers."],
    ["Walk through your plan", "A clear, encouraging roadmap in plain language."],
    ["Put it in motion", "Take action — open accounts and get covered, with partner discounts."],
    ["Check in & adjust", "We revisit as life changes and surface better deals over time."],
  ];
  const EVAL_DOMAINS = [
    ["💵", "Cash flow & savings", "Are you living within your means and saving comfortably?"],
    ["💧", "Emergency fund", "Could you handle a few months without income?"],
    ["💳", "Debt & credit", "Is debt manageable and credit working for you?"],
    ["🛡️", "Protection", "Is your family's income protected, just in case?"],
    ["🌱", "Retirement", "Are you on your way to the retirement you'd like?"],
    ["🎓", "Education", "Saving for the kids' education tax-efficiently?"],
    ["📈", "Investments", "Is your money growing for the long term?"],
    ["📜", "Estate & legacy", "Are your wishes documented for your family?"],
  ];

  // ---------- questionnaire ----------
  const STEPS = [
    { name: "About you", title: "Let's start with the basics", subtitle: "A few details so we can tailor your plan — there are no wrong answers here.",
      fields: [
        { key: "age", type: "number", label: "Your age", suffix: "years", min: 18, max: 90, placeholder: "35", required: true },
        { key: "gender", type: "chips", cols: 2, label: "Gender", hint: "Used only to estimate insurance pricing", required: true, options: [{ value: "female", title: "Female" }, { value: "male", title: "Male" }] },
        { key: "maritalStatus", type: "chips", cols: 2, label: "Marital status", required: true, options: [{ value: "single", title: "Single" }, { value: "married", title: "Married / partnered" }] },
        { key: "dependents", type: "number", label: "Number of dependents", hint: "Children or others who rely on your income", min: 0, max: 12, placeholder: "0", required: true },
      ] },
    { name: "Income & work", title: "Your income and employment", subtitle: "This helps size both your protection and your savings opportunities.",
      fields: [
        { key: "income", type: "number", prefix: "$", suffix: "/yr", label: "Annual gross household income", min: 0, max: 10000000, placeholder: "85,000", required: true },
        { key: "employment", type: "chips", cols: 3, label: "Employment type", required: true, options: [{ value: "w2", title: "Employee", desc: "W-2 income" }, { value: "self", title: "Self-employed", desc: "1099 / business" }, { value: "both", title: "Both", desc: "W-2 + side income" }] },
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
        { key: "creditScore", type: "chips", cols: 3, label: "Credit score range", hint: "You can also connect your credit later for a precise read", required: true,
          options: [{ value: "excellent", title: "Excellent", desc: "750+" }, { value: "good", title: "Good", desc: "700–749" }, { value: "fair", title: "Fair", desc: "640–699" }, { value: "poor", title: "Poor", desc: "Below 640" }, { value: "building", title: "Building", desc: "Thin / new" }, { value: "none", title: "Not sure", desc: "Don't know" }] },
        { key: "wantBuildCredit", type: "chips", cols: 2, label: "Want to actively build or improve your credit?", required: true, options: [{ value: "yes", title: "Yes" }, { value: "no", title: "No / already strong" }] },
      ] },
    { name: "Savings & retirement", title: "Savings and retirement goals", subtitle: "Where you stand and what you're aiming for.",
      fields: [
        { key: "savings", type: "number", prefix: "$", label: "Current retirement & investment savings", hint: "401(k), IRA, brokerage — total balance", min: 0, max: 100000000, placeholder: "60,000", required: true },
        { key: "retireAge", type: "number", suffix: "years", label: "Target retirement age", min: 40, max: 85, placeholder: "65", required: true },
        { key: "retireLifestyle", type: "chips", cols: 3, label: "Retirement lifestyle", hint: "Relative to your spending today", required: true, parse: parseFloat, options: [{ value: "0.8", title: "Downsize", desc: "~80% of today" }, { value: "1", title: "Maintain", desc: "~100% of today" }, { value: "1.2", title: "Upgrade", desc: "~120% of today" }] },
        { key: "risk", type: "chips", cols: 3, label: "Investment risk tolerance", required: true, options: [{ value: "conservative", title: "Conservative", desc: "Protect · ~4%" }, { value: "moderate", title: "Moderate", desc: "Balanced · ~6%" }, { value: "aggressive", title: "Aggressive", desc: "Growth · ~8%" }] },
      ] },
    { name: "Coverage & estate", title: "Existing coverage and estate", subtitle: "What protection and documents you already have in place.",
      fields: [
        { key: "existingLifeInsurance", type: "number", prefix: "$", label: "Life insurance you already have", hint: "Total death benefit in force — enter 0 if none", min: 0, max: 100000000, placeholder: "0", required: true },
        { key: "hasEstatePlan", type: "chips", cols: 2, label: "Do you have a will or trust?", required: true, options: [{ value: "yes", title: "Yes" }, { value: "no", title: "No / not sure" }] },
      ] },
    { name: "Health basics", title: "A couple of health questions", subtitle: "These affect life-insurance eligibility and pricing.",
      fields: [
        { key: "tobacco", type: "chips", cols: 2, label: "Tobacco or nicotine use in the last 12 months?", required: true, options: [{ value: "no", title: "No" }, { value: "yes", title: "Yes" }] },
        { key: "health", type: "chips", cols: 3, label: "Overall health", required: true, options: [{ value: "excellent", title: "Excellent", desc: "No major issues" }, { value: "good", title: "Good", desc: "Minor / managed" }, { value: "average", title: "Average", desc: "Some conditions" }] },
        { key: "healthOptIn", type: "chips", cols: 2, label: "Add an optional health & longevity check?", hint: "Estimates your risk and surfaces wellness options. Skip anytime.", required: true, options: [{ value: "yes", title: "Yes, include it" }, { value: "no", title: "No thanks" }] },
      ] },
    { name: "Health & longevity", title: "Optional health & longevity check", subtitle: "A quick read on your risk — and friendly ways to improve it. Not medical advice.",
      skipIf: (a) => a.healthOptIn !== "yes",
      fields: [
        { key: "heightFt", type: "number", suffix: "ft", label: "Height — feet", min: 3, max: 8, placeholder: "5", required: true, half: true },
        { key: "heightInch", type: "number", suffix: "in", label: "Height — inches", min: 0, max: 11, placeholder: "10", required: true, half: true },
        { key: "weightLb", type: "number", suffix: "lb", label: "Weight", min: 50, max: 800, placeholder: "170", required: true },
        { key: "activity", type: "chips", cols: 3, label: "Activity level", required: true, options: [{ value: "sedentary", title: "Sedentary", desc: "Little exercise" }, { value: "moderate", title: "Moderate", desc: "Some each week" }, { value: "active", title: "Active", desc: "Regular exercise" }] },
        { key: "conditions", type: "checks", cols: 2, label: "Any of these apply? (select all)", required: false, options: [{ value: "none", title: "None", exclusive: true }, { value: "hypertension", title: "High blood pressure" }, { value: "high cholesterol", title: "High cholesterol" }, { value: "diabetes", title: "Diabetes / pre-diabetes" }, { value: "heart condition", title: "Heart condition" }, { value: "cancer history", title: "Cancer history" }] },
        { key: "familyHistory", type: "chips", cols: 2, label: "Family history of heart disease, diabetes, or cancer?", required: true, options: [{ value: "yes", title: "Yes" }, { value: "no", title: "No / unsure" }] },
      ] },
    { name: "Your profile", title: "Save your profile", subtitle: "Optional — so we can find you better products and deals over time. Stored only in your browser for this demo.", isProfile: true,
      fields: [
        { key: "name", type: "text", label: "Name", placeholder: "Alex Rivera", required: false },
        { key: "email", type: "text", label: "Email", hint: "Used to log in to your portal and surface better rates over time", placeholder: "you@email.com", required: false, validateEmail: true },
      ] },
  ];

  const DEFAULTS = {
    age: "", gender: "", maritalStatus: "", dependents: 0, income: "", employment: "", monthlyExpenses: "",
    emergencyMonths: "", monthlySavings: "", mortgage: 0, otherDebt: 0, creditScore: "", wantBuildCredit: "",
    savings: "", retireAge: "", retireLifestyle: "", risk: "", existingLifeInsurance: 0, hasEstatePlan: "",
    tobacco: "", health: "", healthOptIn: "", heightFt: "", heightInch: "", weightLb: "", activity: "", conditions: [], familyHistory: "",
    name: "", email: "", creditConnected: false,
  };
  let answers = Object.assign({}, DEFAULTS, { conditions: [] });
  let current = 0;
  let lastAnalysis = null;

  const views = { intro: $("view-intro"), quiz: $("view-quiz"), results: $("view-results"), login: $("view-login"), dashboard: $("view-dashboard") };
  function showView(name) { Object.keys(views).forEach((k) => views[k].classList.toggle("hidden", k !== name)); window.scrollTo({ top: 0, behavior: "instant" }); updateLoginNav(); }
  function updateLoginNav() { const s = loadJSON(K.session); $("loginNav").textContent = s && s.loggedIn ? "My portal" : "Log in"; }

  // ---------- intro ----------
  function renderIntro() {
    $("steps7").innerHTML = CFP_STEPS.map((s, i) => `<li class="step7"><span class="step7-n">${i + 1}</span><div><strong>${s[0]}</strong><span>${s[1]}</span></div></li>`).join("");
    $("evalGrid").innerHTML = EVAL_DOMAINS.map((d) => `<div class="eval-card"><span class="eval-ico">${d[0]}</span><strong>${d[1]}</strong><span>${d[2]}</span></div>`).join("");
    const prof = loadJSON(K.profile);
    if (prof && (prof.name || prof.email)) {
      $("welcomeBack").classList.remove("hidden");
      $("welcomeBack").innerHTML = `👋 Welcome back${prof.name ? ", <strong>" + escapeHtml(prof.name) + "</strong>" : ""}. <a href="#" id="wbPortal">Open your portal</a> or start a fresh plan below.`;
      answers.name = prof.name || ""; answers.email = prof.email || "";
      const wb = $("wbPortal"); if (wb) wb.addEventListener("click", (e) => { e.preventDefault(); openPortal(); });
    }
    const cr = loadJSON(K.credit); if (cr && cr.connected) { answers.creditConnected = true; answers.creditScore = cr.band; }
  }

  // ---------- nav helpers ----------
  const isSkipped = (i) => typeof STEPS[i].skipIf === "function" && STEPS[i].skipIf(answers);
  const visibleIndices = () => STEPS.map((_, i) => i).filter((i) => !isSkipped(i));
  const nextVisible = (i) => { for (let j = i + 1; j < STEPS.length; j++) if (!isSkipped(j)) return j; return -1; };
  const prevVisible = (i) => { for (let j = i - 1; j >= 0; j--) if (!isSkipped(j)) return j; return -1; };

  // ---------- field rendering ----------
  function fieldHTML(f) {
    const hint = f.hint ? ` <span class="hint">${f.hint}</span>` : "";
    let control = "";
    if (f.type === "number") {
      let wrapCls = "input-wrap"; if (f.prefix) wrapCls += " has-prefix"; if (f.suffix) wrapCls += " has-suffix";
      const prefix = f.prefix ? `<span class="input-prefix">${f.prefix}</span>` : "";
      const suffix = f.suffix ? `<span class="input-suffix">${f.suffix}</span>` : "";
      const val = answers[f.key] !== "" && answers[f.key] != null ? answers[f.key] : "";
      control = `<div class="${wrapCls}">${prefix}<input id="f_${f.key}" type="number" inputmode="decimal" min="${f.min ?? ""}" max="${f.max ?? ""}" placeholder="${f.placeholder ?? ""}" value="${val}" autocomplete="off" />${suffix}</div>`;
    } else if (f.type === "text") {
      control = `<div class="input-wrap"><input id="f_${f.key}" type="text" placeholder="${f.placeholder ?? ""}" value="${escapeHtml(answers[f.key])}" autocomplete="off" /></div>`;
    } else if (f.type === "chips" || f.type === "checks") {
      const multi = f.type === "checks"; const cols = f.cols ? ` cols-${f.cols}` : "";
      const sel = (v) => multi ? (answers[f.key] || []).map(String).includes(String(v)) : String(answers[f.key]) === String(v);
      const opts = f.options.map((o) => { const desc = o.desc ? `<span class="chip-desc">${o.desc}</span>` : ""; return `<label class="chip${sel(o.value) ? " selected" : ""}" data-key="${f.key}" data-value="${o.value}" data-multi="${multi}" data-exclusive="${!!o.exclusive}"><span class="chip-check${multi ? " sq" : ""}"></span><span class="chip-title">${o.title}</span>${desc}</label>`; }).join("");
      control = `<div class="chips${cols}" data-group="${f.key}">${opts}</div>`;
    }
    return `<div class="field${f.half ? " half" : ""}" data-field="${f.key}"><label for="f_${f.key}">${f.label}${hint}</label>${control}<div class="field-error" id="e_${f.key}"></div></div>`;
  }

  function renderStep() {
    const step = STEPS[current];
    let fieldsHTML = "", i = 0;
    while (i < step.fields.length) {
      const f = step.fields[i];
      if (f.half && step.fields[i + 1] && step.fields[i + 1].half) { fieldsHTML += `<div class="grid-2">${fieldHTML(f)}${fieldHTML(step.fields[i + 1])}</div>`; i += 2; }
      else { fieldsHTML += fieldHTML(f); i++; }
    }
    const profileLead = step.isProfile ? `<div class="profile-lead">✦ <strong>Find better deals, automatically.</strong> Save your profile to log in to your portal later and get fresh suggestions as life changes. You can also continue without saving.</div>` : "";
    $("stepContainer").innerHTML = `<div class="step-head"><h2>${step.title}</h2><p>${step.subtitle}</p></div>${profileLead}<div class="step-fields">${fieldsHTML}</div>`;

    const vis = visibleIndices(); const pos = vis.indexOf(current);
    $("progressFill").style.width = `${((pos + 1) / vis.length) * 100}%`;
    $("stepLabel").textContent = `Step ${pos + 1} of ${vis.length}`;
    $("stepName").textContent = step.name;
    $("backBtn").textContent = pos === 0 ? "← Intro" : "← Back";
    $("nextBtn").textContent = nextVisible(current) === -1 ? "See my plan →" : (step.isProfile ? "Save & see my plan →" : "Continue →");

    $("stepContainer").querySelectorAll(".chip").forEach((chip) => chip.addEventListener("click", () => {
      const key = chip.dataset.key, multi = chip.dataset.multi === "true", group = chip.closest(".chips");
      if (multi) {
        const exclusive = chip.dataset.exclusive === "true"; let arr = answers[key] || []; const v = chip.dataset.value;
        if (exclusive) arr = arr.includes(v) ? [] : [v]; else { arr = arr.filter((x) => x !== "none"); arr = arr.includes(v) ? arr.filter((x) => x !== v) : arr.concat(v); }
        answers[key] = arr; group.querySelectorAll(".chip").forEach((c) => c.classList.toggle("selected", arr.map(String).includes(c.dataset.value)));
      } else { group.querySelectorAll(".chip").forEach((c) => c.classList.remove("selected")); chip.classList.add("selected"); answers[key] = chip.dataset.value; }
      clearError(key);
    }));
    step.fields.forEach((f) => { if (f.type === "number" || f.type === "text") { const el = $(`f_${f.key}`); el.addEventListener("input", () => clearError(f.key)); el.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); $("nextBtn").click(); } }); } });
    const fi = $("stepContainer").querySelector("input"); if (fi) fi.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function clearError(k) { const e = $(`e_${k}`); if (e) e.classList.remove("show"); const i = $(`f_${k}`); if (i) i.classList.remove("invalid"); }
  function showError(k, m) { const e = $(`e_${k}`); if (e) { e.textContent = m; e.classList.add("show"); } const i = $(`f_${k}`); if (i) i.classList.add("invalid"); }
  function validateAndSaveStep() {
    const step = STEPS[current]; let ok = true, firstBad = null;
    for (const f of step.fields) {
      if (f.type === "number") {
        const el = $(`f_${f.key}`), raw = el.value.trim();
        if (raw === "") { showError(f.key, "This field is required."); ok = false; firstBad = firstBad || el; continue; }
        const num = Number(raw);
        if (!isFinite(num)) { showError(f.key, "Please enter a number."); ok = false; firstBad = firstBad || el; continue; }
        if (f.min != null && num < f.min) { showError(f.key, `Must be at least ${f.min}.`); ok = false; firstBad = firstBad || el; continue; }
        if (f.max != null && num > f.max) { showError(f.key, `Must be ${f.max} or less.`); ok = false; firstBad = firstBad || el; continue; }
        answers[f.key] = num;
      } else if (f.type === "text") {
        const el = $(`f_${f.key}`), raw = el.value.trim();
        if (f.required && raw === "") { showError(f.key, "This field is required."); ok = false; firstBad = firstBad || el; continue; }
        if (f.validateEmail && raw !== "" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(raw)) { showError(f.key, "Please enter a valid email."); ok = false; firstBad = firstBad || el; continue; }
        answers[f.key] = raw;
      } else if (f.type === "chips") {
        if (answers[f.key] === "" || answers[f.key] == null) { showError(f.key, "Please choose an option."); ok = false; } else if (f.parse) answers[f.key] = f.parse(answers[f.key]);
      } else if (f.type === "checks") { if (f.required && (!answers[f.key] || answers[f.key].length === 0)) { showError(f.key, "Please select at least one."); ok = false; } }
    }
    if (!ok && firstBad) firstBad.focus();
    return ok;
  }

  // ---------- navigation ----------
  function goIntro() { current = 0; showView("intro"); }
  function goQuiz() { showView("quiz"); renderStep(); }
  function next() {
    if (!validateAndSaveStep()) return;
    const step = STEPS[current];
    if (step.isProfile && (answers.email || answers.name)) saveJSON(K.profile, { name: answers.name || "", email: answers.email || "", savedAt: Date.now() });
    const nxt = nextVisible(current);
    if (nxt === -1) showResults(); else { current = nxt; renderStep(); }
  }
  function back() { const p = prevVisible(current); if (p === -1) goIntro(); else { current = p; renderStep(); } }

  // ---------- credit connect (demo: fake score) ----------
  function connectCredit(rerender) {
    const cr = { connected: true, score: 712, band: "good" };
    saveJSON(K.credit, cr);
    answers.creditConnected = true; answers.creditScore = "good";
    saveJSON(K.answers, answers);
    if (rerender === "results") showResults(); else if (rerender === "dashboard") renderDashboard();
  }

  // ---------- analysis + persistence ----------
  function runAnalysis() {
    answers.heightIn = (Number(answers.heightFt) || 0) * 12 + (Number(answers.heightInch) || 0);
    lastAnalysis = window.ENGINE.analyze(answers);
    saveJSON(K.answers, answers);
    return lastAnalysis;
  }

  // ---------- shared render helpers ----------
  function scoreRing(total) {
    const r = 54, c = 2 * Math.PI * r, off = c * (1 - total / 100);
    const col = total >= 70 ? "var(--green)" : total >= 50 ? "var(--gold)" : "var(--brand)";
    return `<svg class="ring" viewBox="0 0 130 130" width="130" height="130"><circle cx="65" cy="65" r="${r}" fill="none" stroke="var(--line)" stroke-width="12"/><circle cx="65" cy="65" r="${r}" fill="none" stroke="${col}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${c}" stroke-dashoffset="${off}" transform="rotate(-90 65 65)"/><text x="65" y="62" text-anchor="middle" class="ring-num">${total}</text><text x="65" y="84" text-anchor="middle" class="ring-grade">of 100</text></svg>`;
  }
  const DOM_LABEL = { strong: "Strong", ok: "Coming along", focus: "Opportunity" };
  function domainRow(d) {
    return `<div class="dom-row"><div class="dom-top"><span class="dom-name">${d.name}</span><span class="dom-score dom-${d.status}">${DOM_LABEL[d.status]}</span></div><div class="dom-track"><div class="dom-fill dom-${d.status}" style="width:${Math.max(6, d.score)}%"></div></div><div class="dom-note">${d.note}</div></div>`;
  }
  const SCEN_LABEL = { strong: "Well protected", moderate: "Partly covered", focus: "Let's strengthen" };
  function scenarioRow(s) {
    return `<div class="scen"><span class="scen-ico">${s.icon}</span><div class="scen-body"><div class="scen-top"><span class="scen-name">${s.name}</span><span class="pill pill-${s.status === "focus" ? "risk" : s.status}">${SCEN_LABEL[s.status]}</span></div><p>${s.note}</p></div></div>`;
  }
  function optionCardHTML(opt) {
    const partner = opt.partner ? `<div class="partner">✦ Ethos partner — exclusive member discount</div>` : "";
    const bullets = (opt.bullets || []).map((b) => `<li>${b}</li>`).join("");
    return `<div class="opt${opt.partner ? " opt-partner" : ""}"><div class="opt-head"><div><div class="opt-name">${opt.name}</div><div class="opt-prov">${opt.provider}</div></div>${opt.figure ? `<span class="opt-fig">${opt.figure}</span>` : ""}</div>${partner}<ul class="opt-bullets">${bullets}</ul></div>`;
  }
  const PRI = { now: ["Do now", "p-now"], soon: ["Up next", "p-soon"], maintain: ["Maintain", "p-maint"], later: ["Later", "p-later"], optional: ["Optional", "p-opt"] };
  function categoryCardHTML(item) {
    const cat = window.CATEGORIES[item.categoryId]; if (!cat) return "";
    const pr = PRI[item.priority] || ["", ""];
    const figs = (item.figures || []).map((f) => `<div class="rec-fig"><div class="fig-label">${f.label}</div><div class="fig-value">${f.value}</div></div>`).join("");
    const hasPartner = cat.options.some((o) => o.partner);
    return `<article class="cat${item.isEmphasis ? " cat-emph" : ""}"><div class="cat-head"><div class="cat-ico">${cat.icon}</div><div class="cat-titles"><h3>${cat.name}${hasPartner ? ' <span class="ethos-tag">Ethos partner</span>' : ""}</h3><div class="cat-blurb">${cat.blurb}</div></div><span class="pri ${pr[1]}">${pr[0]}</span></div><div class="cat-why"><strong>Why this matters:</strong> ${item.reason}</div>${figs ? `<div class="rec-figures">${figs}</div>` : ""}<div class="opt-grid">${cat.options.map(optionCardHTML).join("")}</div></article>`;
  }
  function ethosOption(catId) { const c = window.CATEGORIES[catId]; if (!c) return null; return c.options.find((o) => o.partner) || c.options[0]; }
  function actionItemHTML(item, idx) {
    const cat = window.CATEGORIES[item.categoryId]; if (!cat) return "";
    const pr = PRI[item.priority] || ["", ""];
    const fig = (item.figures && item.figures[0]) ? `<span class="ai-fig">${item.figures[0].label}: <strong>${item.figures[0].value}</strong></span>` : "";
    return `<div class="ai"><div class="ai-rank">${idx + 1}</div><div class="ai-body"><div class="ai-top"><span class="ai-name">${cat.icon} ${cat.name}</span><span class="pri ${pr[1]}">${pr[0]}</span></div><p>${item.reason}</p>${fig}</div></div>`;
  }

  // ============================================================
  //  RESULTS (two-column report)
  // ============================================================
  function showResults() {
    const r = runAnalysis(), a = answers, ret = r.retirement, hs = r.healthScore;
    const ta = r.topAction; const taCat = ta ? window.CATEGORIES[ta.categoryId] : null; const taOpt = ta ? ethosOption(ta.categoryId) : null;

    // LEFT column — action items
    const topActionCard = ta ? `<div class="top-action">
      <div class="ta-kicker">🛡️ Top step to protect your family</div>
      <h3>${ta.label}</h3>
      <p>${ta.reason}</p>
      ${taOpt ? `<div class="ta-prod"><div class="ta-prod-head"><span class="ta-prod-name">${taOpt.name}</span>${taOpt.partner ? `<span class="ethos-tag">Ethos partner</span>` : ""}</div><div class="ta-prod-sub">${taOpt.provider}${taOpt.partner ? " · exclusive member discount" : ""}</div></div>` : ""}
      <button class="btn btn-primary btn-block" id="taPortal">Open my portal to get started →</button>
    </div>` : "";
    const top3HTML = r.top3.map((it, i) => actionItemHTML(it, i)).join("");
    const leftCol = `<aside class="report-left">
      ${topActionCard}
      <div class="ai-card"><h3 class="ai-h">Your top 3 moves right now</h3><div class="ai-list">${top3HTML}</div></div>
      <div class="report-cta">
        <button class="btn btn-primary btn-block" id="openPortalBtn">Open my full portal →</button>
        <button class="btn btn-light btn-block" id="refineBtn">✎ Share more details for a sharper plan</button>
        ${a.creditConnected ? `<div class="credit-note">🔗 Using your connected credit score: <strong>712 (Good)</strong></div>` : `<button class="btn btn-light btn-block" id="connectCreditBtn">🔗 Connect credit for a precise read (demo)</button>`}
      </div>
    </aside>`;

    // RIGHT column — assessment + CFP breakdown
    const projPct = ret.targetNestEgg > 0 ? Math.min(100, (ret.projectedNestEgg / ret.targetNestEgg) * 100) : 100;
    const onTrack = ret.projectedNestEgg >= ret.targetNestEgg;
    const assessment = `<div class="section-card score-card">
      <div class="score-left">${scoreRing(hs.total)}<p class="score-band">${hs.band}</p></div>
      <div class="score-right"><h2 style="margin-top:0">A quick read on where you stand</h2><p class="sub" style="margin-bottom:14px">${r.headline}</p>
        <div class="quick-stats">
          <div class="qs"><span>Protection</span><strong>${r.insurance.coverageGap > 0 ? "Add ~" + fmtK(r.insurance.coverageGap) : "Looks covered"}</strong></div>
          <div class="qs"><span>Retirement</span><strong>${Math.round(ret.readinessPct)}% of goal</strong></div>
          <div class="qs"><span>Emergency fund</span><strong>${r.emergency.months}/${r.emergency.targetMonths} months</strong></div>
        </div></div></div>`;

    const breakdown = `<div class="section-card"><h2>How a planner would read your picture</h2><p class="sub">Category by category — this is the same lens a CFP® uses, in plain language.</p><div class="dom-list">${hs.domains.map(domainRow).join("")}</div></div>`;
    const scenCard = `<div class="section-card"><h2>Peace-of-mind check</h2><p class="sub">A gentle look at the "what ifs" — none of us can predict life, but we can be ready.</p><div class="scen-grid">${r.scenarios.map(scenarioRow).join("")}</div></div>`;
    const retCard = `<div class="section-card"><h2>Retirement outlook</h2><p class="sub">Projecting ${ret.yearsToRetire} years at an assumed ${ret.expReturnPct}% return (${a.risk}), using the 4% rule.</p>
      <div class="bar-row"><div class="bar-top"><span class="bar-name">Projected nest egg</span><span class="bar-val">${window.fmt(ret.projectedNestEgg)}</span></div><div class="bar-track"><div class="bar-seg have" style="width:${projPct}%"></div></div></div>
      <div class="bar-row"><div class="bar-top"><span class="bar-name">Goal</span><span class="bar-val">${window.fmt(ret.targetNestEgg)}</span></div><div class="bar-track"><div class="bar-seg" style="width:100%;background:#cbd5e1"></div></div></div>
      <div class="note">${onTrack ? `🎉 You're on your way — projected to about ${Math.round(ret.readinessPct)}% of your goal, roughly ${window.fmt(Math.round(ret.projectedAnnualIncome))}/yr in retirement.` : `Saving about <strong>${window.fmt(ret.additionalMonthly)}/mo more</strong> would put your goal within reach — and the portal lays out exactly how.`}</div></div>`;

    let healthCard = "";
    if (r.healthRisk) {
      const hr = r.healthRisk; const bandCls = { Low: "pill-strong", Moderate: "pill-moderate", Elevated: "pill-risk", High: "pill-risk" }[hr.band] || "pill-moderate";
      const factors = hr.factors.map((f) => `<li class="hf hf-${f.impact}">${f.label}</li>`).join("");
      healthCard = `<div class="section-card"><h2>Health & longevity read <span class="pill ${bandCls}">${hr.band}</span></h2><p class="sub">An illustrative estimate — not a medical assessment. ${hr.insuranceImpact}</p><div class="health-grid"><div class="health-metric"><div class="hm-val">${hr.bmi}</div><div class="hm-lab">Body Mass Index</div></div><ul class="health-factors">${factors}</ul></div>${hr.suggestGlp1 ? `<div class="note">💡 A clinician-guided <strong>GLP-1 / weight-management program</strong> may be a good fit and can improve both your health and future insurance rates. Options are in your portal.</div>` : ""}</div>`;
    }

    $("resultsContainer").innerHTML = `<div class="results-head"><p class="eyebrow">Your personalized assessment</p><h1>${a.name ? escapeHtml(a.name) + ", here's" : "Here's"} your plan — and the one move that matters most.</h1><p>A warm, honest snapshot first, then your full portal with every recommendation and 2–3 vetted options per category.</p></div>
      <div class="report-grid">${leftCol}<div class="report-right">${assessment}${breakdown}${scenCard}${retCard}${healthCard}</div></div>
      <div class="results-actions"><button class="btn btn-light" id="restartBtn">↺ Start over</button><button class="btn btn-primary" id="printBtn">⤓ Save / print this report</button></div>
      <p class="reassure" style="margin-top:24px">Educational estimates only — not quotes, offers, or financial/medical advice. Review official illustrations and consult licensed professionals before acting.</p>`;

    showView("results");
    const bind = (id, fn) => { const el = $(id); if (el) el.addEventListener("click", fn); };
    bind("taPortal", openPortal); bind("openPortalBtn", openPortal);
    bind("refineBtn", () => { current = 0; goQuiz(); });
    bind("connectCreditBtn", () => connectCredit("results"));
    bind("restartBtn", () => { resetAnswers(); goIntro(); });
    bind("printBtn", () => window.print());
  }

  // ============================================================
  //  LOGIN (email → code; demo: any code works)
  // ============================================================
  function goLogin(prefillEmail) {
    const email = prefillEmail || answers.email || (loadJSON(K.profile) || {}).email || "";
    $("loginContainer").innerHTML = `<div class="auth-card card">
      <p class="eyebrow">Member portal</p>
      <h1 class="auth-title">Log in to your plan</h1>
      <p class="auth-sub">We'll email you a one-time code. <span class="demo-note">(Demo: we don't really send email — just enter any code.)</span></p>
      <div class="auth-step" id="authEmailStep">
        <label for="authEmail">Email</label>
        <div class="input-wrap"><input type="text" id="authEmail" placeholder="you@email.com" value="${escapeHtml(email)}" /></div>
        <div class="field-error" id="authErr"></div>
        <button class="btn btn-primary btn-block" id="sendCodeBtn">Send me a code →</button>
      </div>
      <div class="auth-step hidden" id="authCodeStep">
        <div class="code-sent">📧 Code sent to <strong id="codeEmail"></strong></div>
        <label for="authCode">Enter your 6-digit code <span class="demo-note">(any code works in this demo)</span></label>
        <div class="input-wrap"><input type="text" id="authCode" inputmode="numeric" placeholder="123456" maxlength="6" /></div>
        <div class="field-error" id="codeErr"></div>
        <button class="btn btn-primary btn-block" id="verifyBtn">Log in →</button>
        <button class="btn btn-link" id="changeEmailBtn">Use a different email</button>
      </div>
      <p class="auth-foot">No account yet? <a href="#" id="authStartQuiz">Build your free plan first →</a></p>
    </div>`;
    showView("login");
    const emailEl = $("authEmail"); if (emailEl) emailEl.focus();
    $("sendCodeBtn").addEventListener("click", () => {
      const em = $("authEmail").value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em)) { $("authErr").textContent = "Please enter a valid email."; $("authErr").classList.add("show"); return; }
      answers.email = em; $("codeEmail").textContent = em; $("authEmailStep").classList.add("hidden"); $("authCodeStep").classList.remove("hidden"); $("authCode").focus();
    });
    $("verifyBtn").addEventListener("click", () => {
      const code = $("authCode").value.trim();
      if (code.length < 1) { $("codeErr").textContent = "Enter the code (any digits work here)."; $("codeErr").classList.add("show"); return; }
      const em = answers.email; const prof = loadJSON(K.profile) || {};
      saveJSON(K.session, { email: em, loggedIn: true, ts: Date.now() });
      if (!prof.email) saveJSON(K.profile, { name: prof.name || "", email: em, savedAt: Date.now() });
      renderDashboard();
    });
    $("authCode") && $("authCode").addEventListener("keydown", (e) => { if (e.key === "Enter") $("verifyBtn").click(); });
    $("changeEmailBtn").addEventListener("click", () => { $("authCodeStep").classList.add("hidden"); $("authEmailStep").classList.remove("hidden"); });
    $("authStartQuiz").addEventListener("click", (e) => { e.preventDefault(); resetAnswers(); goQuiz(); });
  }

  // Open portal: if logged in → dashboard, else → login
  function openPortal() { const s = loadJSON(K.session); if (s && s.loggedIn) renderDashboard(); else goLogin(); }

  // ============================================================
  //  DASHBOARD / PORTAL
  // ============================================================
  function renderDashboard() {
    const prof = loadJSON(K.profile) || {}; const sess = loadJSON(K.session) || {};
    const savedAnswers = loadJSON(K.answers);
    if (savedAnswers) { answers = Object.assign({}, DEFAULTS, savedAnswers); if (!Array.isArray(answers.conditions)) answers.conditions = []; }
    const cr = loadJSON(K.credit); if (cr && cr.connected) { answers.creditConnected = true; answers.creditScore = cr.band; }

    const hasPlan = !!savedAnswers;
    const r = hasPlan ? window.ENGINE.analyze((answers.heightIn = (Number(answers.heightFt) || 0) * 12 + (Number(answers.heightInch) || 0), answers)) : null;

    // Always-on simulated credit event → mortgage protection
    const mp = window.CATEGORIES.mortgageProtection; const mpOpt = ethosOption("mortgageProtection");
    const creditEvent = `<div class="event-card">
      <div class="event-badge">📍 New credit activity detected</div>
      <h3>It looks like you recently purchased a home 🏡</h3>
      <p>Congratulations! A new mortgage is one of the most important times to make sure your family could keep the home if your income ever stopped. Based on this, we've surfaced a special suggestion:</p>
      <div class="event-prod"><div class="cat-ico">${mp.icon}</div><div><div class="opt-name">${mpOpt.name} <span class="ethos-tag">Ethos partner</span></div><div class="opt-prov">${mpOpt.provider} · coverage matched to your loan, exclusive member discount</div></div></div>
      <button class="btn btn-primary" id="mpBtn">Explore Mortgage Protection →</button>
    </div>`;

    // Surface Mortgage Protection at the top of the plan, driven by the credit event
    const mpItem = { categoryId: "mortgageProtection", priority: "now", isEmphasis: true,
      reason: "Triggered by your recent home purchase — size term coverage to your mortgage so your family can keep the home even if your income ever stops.",
      figures: [{ label: "Match to", value: "Loan balance" }, { label: "Type", value: "No-exam term" }] };
    const displayPlan = hasPlan ? [mpItem].concat(r.plan.filter((p) => p.categoryId !== "mortgageProtection")) : [];
    const planSection = hasPlan
      ? `<div class="section-card"><h2>🧭 Your full action plan</h2><p class="sub">Every relevant category with 2–3 vetted options, Ethos protection first. ✦ marks a partner product with a member discount.</p><div class="cat-grid">${displayPlan.map(categoryCardHTML).join("")}</div></div>`
      : `<div class="section-card"><h2>No plan yet</h2><p class="sub">Build your free plan to unlock personalized recommendations.</p><button class="btn btn-primary" id="buildPlanBtn">Build my plan →</button></div>`;

    const movers = hasPlan ? `<div class="section-card"><h2>✅ Your action items</h2><p class="sub">The few moves that make the biggest difference right now.</p><div class="ai-list">${r.top3.map((it, i) => actionItemHTML(it, i)).join("")}</div></div>` : "";

    const creditCta = (cr && cr.connected) ? `<div class="dash-chip">🔗 Credit connected — score 712 (Good)</div>` : `<button class="btn btn-light" id="dashConnectCredit">🔗 Connect credit history (demo)</button>`;

    $("dashboardContainer").innerHTML = `<div class="dash-head">
      <div><p class="eyebrow">Member portal</p><h1>Welcome back${prof.name ? ", " + escapeHtml(prof.name) : ""} 👋</h1><p class="dash-sub">${escapeHtml(sess.email || prof.email || "")}</p></div>
      <div class="dash-actions"><button class="btn btn-light" id="updateProfileBtn">✎ Update profile & refresh</button>${hasPlan ? `<button class="btn btn-light" id="viewReportBtn">View full report</button>` : ""}<button class="btn btn-ghost" id="logoutBtn">Log out</button></div>
    </div>
    ${creditEvent}
    <div class="dash-toolbar">${creditCta}</div>
    ${movers}
    ${planSection}
    <p class="reassure" style="margin-top:8px">Educational estimates only — not quotes, offers, or financial/medical advice.</p>`;

    showView("dashboard");
    const bind = (id, fn) => { const el = $(id); if (el) el.addEventListener("click", fn); };
    bind("mpBtn", () => { const el = [...document.querySelectorAll(".cat-titles h3")].find((h) => h.textContent.includes("Mortgage Protection")); if (el) el.scrollIntoView({ behavior: "smooth", block: "center" }); });
    bind("updateProfileBtn", () => { current = 0; goQuiz(); });
    bind("viewReportBtn", () => showResults());
    bind("logoutBtn", () => { localStorage.removeItem(K.session); updateLoginNav(); goIntro(); });
    bind("dashConnectCredit", () => connectCredit("dashboard"));
    bind("buildPlanBtn", () => { resetAnswers(); goQuiz(); });
  }

  function resetAnswers() { answers = Object.assign({}, DEFAULTS, { conditions: [] }); const p = loadJSON(K.profile); if (p) { answers.name = p.name || ""; answers.email = p.email || ""; } const cr = loadJSON(K.credit); if (cr && cr.connected) { answers.creditConnected = true; answers.creditScore = cr.band; } current = 0; }

  // ---------- wire up ----------
  renderIntro();
  $("startBtn").addEventListener("click", goQuiz);
  $("startBtn2").addEventListener("click", goQuiz);
  $("nextBtn").addEventListener("click", next);
  $("backBtn").addEventListener("click", back);
  $("loginNav").addEventListener("click", openPortal);
  $("brandHome").addEventListener("click", (e) => { e.preventDefault(); goIntro(); });
  updateLoginNav();
})();
