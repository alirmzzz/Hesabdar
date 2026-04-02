(()=>{
  const STORAGE = 'hambodje.v12';
  const DEFAULT_ACCOUNTS = [
    {id:uid(), name:'بانک اصلی', type:'bank', openingBalance:0},
    {id:uid(), name:'نقد', type:'cash', openingBalance:0}
  ];
  const COLORS = ['#2dd4bf','#4ade80','#f59e0b','#8b5cf6','#38bdf8','#fb7185'];
  const KEYWORDS = {
    'نان':'خوراک','سوپر':'خوراک','سوپرمارکت':'خوراک','رستوران':'خوراک','قهوه':'خوراک','غذا':'خوراک',
    'بنزین':'حمل‌ونقل','اسنپ':'حمل‌ونقل','تاکسی':'حمل‌ونقل','مترو':'حمل‌ونقل',
    'اجاره':'مسکن','قبض':'مسکن','شارژ':'مسکن',
    'دارو':'درمان','دکتر':'درمان','آزمایش':'درمان',
    'اینترنت':'ارتباطات','موبایل':'ارتباطات',
    'قسط':'بدهی','وام':'بدهی',
    'پس‌انداز':'پس‌انداز','صندوق':'پس‌انداز',
    'حقوق':'درآمد','درآمد':'درآمد','فروش':'درآمد'
  };
  const state = load();
  const tabs = [
    ['dashboard','داشبورد','⌂'],
    ['transactions','تراکنش‌ها','⇄'],
    ['budgets','بودجه','▥'],
    ['funds','صندوق‌ها','◎'],
    ['reports','گزارش','◔'],
    ['settings','تنظیمات','⚙']
  ];
  const helpText = {
    dashboard:'داشبورد فقط موارد مهم را نشان می‌دهد: مانده ماه، مصرف بودجه و دو تراکنش آخر. جزئیات اضافه عمداً پنهان شده تا شلوغ نشود.',
    transactions:'ثبت تراکنش باید با کمترین لمس انجام شود. ورودی سریع، میانبرهای پرتکرار و ویرایش یک‌مرحله‌ای اینجا قرار گرفته‌اند.',
    budgets:'بودجه‌ها به‌صورت کشویی آمده‌اند تا فقط دسته‌های مهم دیده شوند. می‌توانی بودجه جدید بسازی، مبلغ را کم‌وزیاد کنی و نام دسته را تغییر بدهی.',
    funds:'صندوق‌های هدف‌دار و اقساط هر دو کشویی‌اند تا فضای اضافه حذف شود. هر مورد را می‌توانی ویرایش یا حذف کنی.',
    reports:'گزارش‌ها خلاصه و تصمیم‌محورند: نرخ مصرف بودجه، پیش‌بینی ۳۰ روزه و پرتکرارترین تراکنش‌ها.',
    quick:'در ثبت سریع فقط مبلغ و یک کلمه کافی است. اپ دسته را با کلیدواژه‌ها و سابقه کاربر حدس می‌زند و بعداً هم قابل اصلاح است.',
    budgetRing:'عدد وسط نمودار نرخ مصرف بودجه همین ماه است. حلقه بیرونی سهم دسته‌های خرج‌شده را نشان می‌دهد.',
    settings:'تنظیمات برای کنترل ظاهر اپ است: قالب، داده نمونه و اندازه فونت. با تغییر فونت، دکمه‌ها و اجزای اصلی هم متناسب می‌شوند.'
  };

  const $ = (s,p=document) => p.querySelector(s);
  const $$ = (s,p=document) => [...p.querySelectorAll(s)];
  const el = {
    themeToggle: $('#themeToggle'), seedDemo: $('#seedDemo'), smartInput: $('#smartInput'), smartSave: $('#smartSave'),
    smartSuggestions: $('#smartSuggestions'), topStats: $('#topStats'), nextActions: $('#nextActions'), dashboard: $('#dashboardPanel'),
    transactions: $('#transactionsPanel'), budgets: $('#budgetsPanel'), funds: $('#fundsPanel'), reports: $('#reportsPanel'), settings: $('#settingsPanel'),
    tabs: $('#tabs'), fab: $('#fabMain'), backdrop: $('#sheetBackdrop'), sheetBody: $('#sheetBody'), sheetTitle: $('#sheetTitle'),
    sheetSub: $('#sheetSub'), closeSheet: $('#closeSheet'), infoDialog: $('#infoDialog'), infoTitle: $('#infoTitle'), infoBody: $('#infoBody'), closeInfo: $('#closeInfo')
  };

  bind();
  render();

  function bind(){
    el.seedDemo.addEventListener('click', seedDemo);
    el.themeToggle.addEventListener('click', toggleTheme);
    el.smartSave.addEventListener('click', saveSmartInput);
    el.smartInput.addEventListener('keydown', e => { if(e.key==='Enter') saveSmartInput(); });
    $('#quickTypeSeg').addEventListener('click', e => {
      const btn = e.target.closest('button[data-type]'); if(!btn) return;
      $$('#quickTypeSeg button').forEach(b => b.classList.toggle('active', b===btn));
    });
    el.fab.addEventListener('click', () => openTransactionSheet());
    el.closeSheet.addEventListener('click', closeSheet);
    el.backdrop.addEventListener('click', e => { if(e.target === el.backdrop) closeSheet(); });
    el.closeInfo.addEventListener('click', closeInfoDialog);
  }

  function load(){
    try {
      const raw = localStorage.getItem(STORAGE);
      if(raw){
        const parsed = JSON.parse(raw);
        return normalize(parsed);
      }
    } catch(_){}
    return normalize({
      theme:'dark',
      activeTab:'dashboard',
      quickType:'expense',
      accounts: DEFAULT_ACCOUNTS,
      transactions: [],
      budgets: [],
      funds: [],
      installments: [],
      ui:{ showAllTx:false, fontScale:1 }
    });
  }
  function normalize(data){
    data.accounts = Array.isArray(data.accounts)&&data.accounts.length ? data.accounts : JSON.parse(JSON.stringify(DEFAULT_ACCOUNTS));
    data.transactions = Array.isArray(data.transactions)?data.transactions:[];
    data.budgets = Array.isArray(data.budgets)?data.budgets:[];
    data.funds = Array.isArray(data.funds)?data.funds:[];
    data.installments = Array.isArray(data.installments)?data.installments:[];
    data.ui = data.ui || { showAllTx:false, fontScale:1 };
    if(!data.ui.fontScale) data.ui.fontScale = 1;
    data.theme = data.theme || 'dark';
    data.activeTab = data.activeTab || 'dashboard';
    return data;
  }
  function save(){ localStorage.setItem(STORAGE, JSON.stringify(state)); render(false); }
  function uid(){ return Math.random().toString(36).slice(2,10)+Date.now().toString(36).slice(-4); }
  function toLatinDigits(str){
    return String(str ?? '').replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٬,]/g,'');
  }
  function toNum(v){ return Number(toLatinDigits(v).replace(/[^\d.-]/g,'')) || 0; }
  function fmt(n){ return new Intl.NumberFormat('fa-IR').format(Math.round(n || 0)); }
  function today(){
    const s = new Intl.DateTimeFormat('fa-IR-u-ca-persian',{year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    const parts = (s.match(/[۰-۹0-9]+/g)||[]).map(x=> String(toNum(x)).padStart(2,'0'));
    return `${parts[0]}/${parts[1]}/${parts[2]}`;
  }
  function monthNow(){ return today().slice(0,7); }
  function monthOf(date){ return String(date||'').slice(0,7); }
  function findAccount(id){ return state.accounts.find(a=>a.id===id); }
  function txSigned(t){ return t.type==='income' ? t.amount : t.type==='transfer' ? 0 : -t.amount; }
  function balance(){ return state.accounts.reduce((s,a)=>s+toNum(a.openingBalance),0) + state.transactions.reduce((s,t)=>s+txSigned(t),0); }
  function monthTx(month=monthNow()){ return state.transactions.filter(t=>monthOf(t.date)===month); }
  function monthIncome(month=monthNow()){ return monthTx(month).filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0); }
  function monthExpense(month=monthNow()){ return monthTx(month).filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0); }
  function expenseByCategory(month=monthNow()){
    const map = {};
    monthTx(month).filter(t=>t.type==='expense').forEach(t=> map[t.category]=(map[t.category]||0)+t.amount);
    return Object.entries(map).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
  }
  function budgetItems(month=monthNow()){
    return state.budgets.filter(b=>b.month===month).sort((a,b)=> (b.planned||0)-(a.planned||0));
  }
  function budgetSpent(name, month=monthNow()){
    return monthTx(month).filter(t=>t.type==='expense' && t.category===name).reduce((s,t)=>s+t.amount,0);
  }
  function budgetUsage(month=monthNow()){
    const totalPlan = budgetItems(month).reduce((s,b)=>s+toNum(b.planned),0);
    const spent = monthExpense(month);
    return { totalPlan, spent, percent: totalPlan ? Math.min(100, Math.round(spent/totalPlan*100)) : 0 };
  }
  function avgExpenseLast(n=3){
    const months = previousMonths(n);
    return months.length ? months.reduce((s,m)=>s+monthExpense(m),0) / months.length : 0;
  }
  function avgIncomeLast(n=3){
    const months = previousMonths(n);
    return months.length ? months.reduce((s,m)=>s+monthIncome(m),0) / months.length : 0;
  }
  function previousMonths(n){
    let [y,m] = monthNow().split('/').map(toNum); const out=[];
    for(let i=0;i<n;i++){ out.push(`${String(y).padStart(4,'0')}/${String(m).padStart(2,'0')}`); m--; if(m===0){m=12;y--;}}
    return out;
  }
  function forecast30(){
    const dueInst = state.installments.filter(x=>x.active!==false).reduce((s,x)=>s+toNum(x.monthlyAmount),0);
    const funds = state.funds.filter(x=>x.active!==false).reduce((s,x)=>s+Math.max(0,toNum(x.monthlyTarget||0)),0);
    return Math.round(balance() + avgIncomeLast(3) - avgExpenseLast(3) - dueInst - funds);
  }
  function frequentTemplates(){
    const map = {};
    state.transactions.forEach(t=>{
      const key = `${t.type}|${t.category}|${t.note||t.category}`;
      map[key] = map[key] || { type:t.type, category:t.category, note:t.note||t.category, accountId:t.accountId, count:0, amount:t.amount };
      map[key].count++;
      map[key].amount = t.amount;
    });
    return Object.values(map).sort((a,b)=>b.count-a.count).slice(0,6);
  }
  function smartKeywordsCategory(text, fallbackType='expense'){
    for(const [k,v] of Object.entries(KEYWORDS)) if(text.includes(k)) return v;
    if(fallbackType==='income') return 'درآمد';
    const top = frequentTemplates().find(t=>t.type===fallbackType);
    return top?.category || (fallbackType==='expense'?'خوراک':'درآمد');
  }
  function inferAccount(){
    return state.transactions[state.transactions.length-1]?.accountId || state.accounts[0]?.id;
  }
  function parseSmart(text, forceType){
    const clean = String(text||'').trim();
    const amountMatch = toLatinDigits(clean).match(/-?\d+(?:\.\d+)?/);
    const amount = amountMatch ? Math.round(Number(amountMatch[0])) : 0;
    const note = clean.replace(amountMatch?.[0] || '', '').trim() || (forceType==='income' ? 'درآمد' : 'هزینه');
    let type = forceType;
    if(clean.includes('حقوق') || clean.includes('درآمد')) type = 'income';
    if(clean.includes('انتقال')) type = 'transfer';
    const category = type==='transfer' ? 'انتقال بین حساب' : smartKeywordsCategory(note, type);
    return { amount, note, category, type, accountId: inferAccount(), date: today() };
  }

  function render(preserveTab=true){
    document.body.dataset.theme = state.theme;
    document.documentElement.style.setProperty('--fontScale', String(state.ui?.fontScale || 1)); document.body && document.body.style.setProperty('--fontScale', String(state.ui?.fontScale || 1));
    if(!preserveTab && !tabs.some(([k])=>k===state.activeTab)) state.activeTab='dashboard';
    renderTabs(); renderTop(); renderDashboard(); renderTransactions(); renderBudgets(); renderFunds(); renderReports(); renderSettings(); renderSuggestions();
    updatePanelVisibility();
    el.themeToggle.textContent = state.theme==='dark' ? '☀️ روشن' : '🌙 تیره';
  }

  function renderTabs(){
    el.tabs.innerHTML = tabs.map(([key,label,icon]) => `<button class="tab ${state.activeTab===key?'active':''}" data-tab="${key}"><i>${icon}</i><span>${label}</span></button>`).join('');
    $$('.tab', el.tabs).forEach(btn => btn.addEventListener('click', ()=>{ if(state.activeTab===btn.dataset.tab) return; state.activeTab = btn.dataset.tab; save(); window.scrollTo({top:0,behavior:'smooth'}); }));
  }
  function updatePanelVisibility(){
    const active = state.activeTab;
    el.dashboard.classList.toggle('hidden', active!=='dashboard');
    el.transactions.classList.toggle('hidden', active!=='transactions');
    el.budgets.classList.toggle('hidden', active!=='budgets');
    el.funds.classList.toggle('hidden', active!=='funds');
    el.reports.classList.toggle('hidden', active!=='reports');
    el.settings.classList.toggle('hidden', active!=='settings');
    el.tabs.parentElement.querySelector('.tabs-grid').style.gridTemplateColumns = `repeat(${tabs.length},1fr)`;
  }
  function renderTop(){
    const month = monthNow();
    const income = monthIncome(month), expense = monthExpense(month), net = income-expense;
    const cards = [
      ['ورود ماه', income, 'income'],
      ['خروج ماه', expense, 'expense'],
      ['خالص', net, 'net']
    ];
    el.topStats.innerHTML = cards.map(([t,v,c])=>`<div class="mini-stat"><div class="k">${t}</div><div class="v ${Math.abs(v)>99999999?'small':''}" style="color:${c==='income'?'var(--income)':c==='expense'?'#ffd2da':'var(--primary)'}">${fmt(v)}</div></div>`).join('');
    const dueInst = state.installments.filter(i=>i.active!==false).sort((a,b)=>(a.dueDate||'').localeCompare(b.dueDate||'')).slice(0,1);
    const actions = [];
    if(dueInst[0]) actions.push({title:'قسط نزدیک سررسید', sub:`${dueInst[0].title} • ${dueInst[0].dueDate} • ${fmt(dueInst[0].monthlyAmount)} تومان`, btn:'ثبت', act:()=>openInstallmentQuick(dueInst[0])});
    const budget = budgetUsage();
    if(budget.totalPlan && budget.percent >= 85) actions.push({title:'بودجه در آستانه سقف', sub:`مصرف بودجه به ${budget.percent}٪ رسیده است.`, btn:'بودجه', act:()=>{state.activeTab='budgets'; save();}});
    const template = frequentTemplates()[0];
    if(template) actions.push({title:'ثبت یک‌لمسی پرتکرار', sub:`${template.note} • ${fmt(template.amount)} تومان`, btn:'انجام', act:()=>quickTemplate(template)});
    if(!actions.length) actions.push({title:'شروع کن', sub:'اولین تراکنش را ثبت کن تا اپ الگوی تو را یاد بگیرد.', btn:'ثبت', act:()=>openTransactionSheet()});
    el.nextActions.innerHTML = actions.slice(0,1).map((a,i)=>`<div class="next-card" data-action="${i}"><div class="h"><strong>${a.title}</strong><button class="tag-btn">${a.btn}</button></div><div class="sub">${a.sub}</div></div>`).join('');
    $$('.next-card', el.nextActions).forEach((node,i)=> node.addEventListener('click', actions[i].act));
  }
  function renderSuggestions(){
    const templates = frequentTemplates();
    const quick = [
      ...templates.map((t,i)=>({label:t.note, sub:fmt(t.amount), fn:()=>quickTemplate(t)})),
      {label:'قسط', sub:'ثبت فوری', fn:()=>openInstallmentQuick(state.installments[0])},
      {label:'صندوق', sub:'واریز', fn:()=>openFundQuick(state.funds[0])}
    ].filter(x=>x.fn).slice(0,4);
    el.smartSuggestions.innerHTML = quick.length ? quick.map((q,i)=>`<button class="quick-chip" data-i="${i}">${q.label} <small>${q.sub}</small></button>`).join('') : `<span class="small">بعد از چند ثبت، میانبرهای هوشمند اینجا ظاهر می‌شوند.</span>`;
    $$('.quick-chip', el.smartSuggestions).forEach((b,i)=> b.addEventListener('click', quick[i].fn));
  }

  function renderDashboard(){
    const month = monthNow();
    const income = monthIncome(month), expense = monthExpense(month), net = income-expense;
    const usage = budgetUsage(month);
    const breakdown = expenseByCategory(month).slice(0,5);
    const monthTitle = month.replace('/','/ماه ');
    el.dashboard.innerHTML = `
      <div class="panel-header">
        <div>
          <div class="hgroup"><button class="info" data-help="dashboard">i</button><div class="section-title">نمای کلی ${month}</div></div>
          <div class="section-sub">سه شاخص اصلی این ماه</div>
        </div>
        <button class="ghost-btn" id="dashQuickAdd">ثبت جدید</button>
      </div>
      <div class="overview-grid">
        <div class="overview-card income"><div class="t">درآمد ماه</div><div class="n">${fmt(income)}</div></div>
        <div class="overview-card expense"><div class="t">هزینه ماه</div><div class="n">${fmt(expense)}</div></div>
        <div class="overview-card net"><div class="t">خالص</div><div class="n">${fmt(net)}</div></div>
      </div>
      <div class="divider"></div>
      <div class="budget-wrap">
        <div class="ring-wrap">
          <canvas id="budgetRing" width="240" height="240"></canvas>
          <div class="ring-label"><strong>${usage.percent}</strong><span>درصد</span></div>
        </div>
        <div>
          <div class="hgroup" style="margin-bottom:8px"><button class="info" data-help="budgetRing">i</button><div>
            <div class="section-title">مصرف بودجه</div>
            <div class="section-sub">نرخ مصرف کل بودجه و سهم دسته‌ها</div>
          </div></div>
          <div class="legend">
            <div class="legend-row"><span class="dot" style="background:var(--primary)"></span><div><div class="name">بودجه کل</div><div class="meta">${fmt(usage.totalPlan)} تومان</div></div><div class="name">${fmt(usage.totalPlan)}</div></div>
            <div class="legend-row"><span class="dot" style="background:#38bdf8"></span><div><div class="name">هزینه ثبت‌شده</div><div class="meta">${fmt(usage.spent)} تومان</div></div><div class="name">${usage.percent}٪</div></div>
            ${breakdown.map((b,i)=>`<div class="legend-row"><span class="dot" style="background:${COLORS[i%COLORS.length]}"></span><div><div class="name">${b.name}</div><div class="meta">${fmt(b.value)} تومان</div></div><div class="name">${usage.spent?Math.round(b.value/usage.spent*100):0}٪</div></div>`).join('') || `<div class="empty">هزینه‌ای برای ترسیم نمودار ثبت نشده است.</div>`}
          </div>
        </div>
      </div>`;
    $('#dashQuickAdd')?.addEventListener('click', ()=>openTransactionSheet());
    $$('[data-help]', el.dashboard).forEach(b=> b.addEventListener('click', ()=>showHelp(b.dataset.help)));
    drawRing($('#budgetRing'), usage, breakdown);
  }

  function renderTransactions(){
    const rows = [...state.transactions].sort((a,b)=> (b.date||'').localeCompare(a.date||''));
    const showRows = state.ui.showAllTx ? rows : rows.slice(0,2);
    el.transactions.innerHTML = `
      <div class="panel-header">
        <div>
          <div class="hgroup"><button class="info" data-help="transactions">i</button><div class="section-title">آخرین تراکنش‌ها</div></div>
          <div class="section-sub">دو ثبت آخر</div>
        </div>
        <div class="right">
          ${rows.length>2 ? `<button class="more-btn" id="toggleMoreTx">${state.ui.showAllTx?'بستن':'بیشتر'}</button>`:''}
          <button class="ghost-btn" id="allTxAdd">ثبت</button>
        </div>
      </div>
      <div class="tx-list">
        ${showRows.length ? showRows.map(t=>{
          const icon = t.type==='income'?'↘':'↗';
          const acc = findAccount(t.accountId)?.name || 'حساب';
          return `<div class="tx-item"><div class="tx-main"><div class="tx-icon">${icon}</div><div class="tx-text"><div class="name">${t.note || t.category}</div><div class="tx-meta"><span>${t.date}</span><span>${t.category}</span><span>${acc}</span></div></div></div><div class="tx-side"><div class="tx-amount ${t.type==='income'?'income':'expense'}">${t.type==='income'?'+':'-'}${fmt(t.amount)}</div><div class="tx-actions"><button class="mini-btn edit" data-edit-tx="${t.id}">ویرایش</button><button class="mini-btn delete" data-del-tx="${t.id}">حذف</button></div></div></div>`;
        }).join('') : `<div class="empty">هنوز تراکنشی ثبت نشده است.</div>`}
      </div>`;
    $('#toggleMoreTx')?.addEventListener('click', ()=>{ state.ui.showAllTx = !state.ui.showAllTx; save(); });
    $('#allTxAdd')?.addEventListener('click', ()=>openTransactionSheet());
    $$('[data-edit-tx]', el.transactions).forEach(b=> b.addEventListener('click', ()=>openTransactionSheet(state.transactions.find(t=>t.id===b.dataset.editTx))));
    $$('[data-del-tx]', el.transactions).forEach(b=> b.addEventListener('click', ()=>{ if(confirm('این تراکنش حذف شود؟')){ state.transactions = state.transactions.filter(t=>t.id!==b.dataset.delTx); save(); } }));
    $$('[data-help]', el.transactions).forEach(b=> b.addEventListener('click', ()=>showHelp(b.dataset.help)));
  }

  function renderBudgets(){
    const month = monthNow();
    const items = budgetItems(month);
    el.budgets.innerHTML = `
      <div class="panel-header">
        <div>
          <div class="hgroup"><button class="info" data-help="budgets">i</button><div class="section-title">بودجه ماه ${month}</div></div>
          <div class="section-sub">هر دسته به‌صورت کشویی؛ مبلغ را کم‌وزیاد کن یا دسته جدید بساز</div>
        </div>
        <div class="right">
          <button class="ghost-btn" id="autoBudget">پیشنهاد</button>
          <button class="chipbtn primary" id="addBudgetBtn">بودجه جدید</button>
        </div>
      </div>
      <div class="accordion">
        ${items.length ? items.map((b,i)=>{
          const spent = budgetSpent(b.name, month);
          const remain = b.planned - spent;
          const pct = b.planned ? Math.round(spent/b.planned*100) : 0;
          return `<details class="acc" ${i===0?'open':''}><summary><div><div class="acc-title">${b.name}</div><div class="acc-desc">خرج ${fmt(spent)} • باقی‌مانده ${fmt(remain)}</div></div><div class="acc-total">${fmt(b.planned)}</div><div class="acc-caret">⌄</div></summary><div class="acc-body"><div class="budget-row"><div><label>عنوان بودجه</label><input data-budget-name="${b.id}" value="${b.name}"></div><div><label>درصد مصرف</label><div class="helper">${pct}%</div></div></div><div class="budget-row"><div><label>مبلغ بودجه</label><div class="stepper"><button data-step="-500000" data-id="${b.id}">−</button><input data-budget-amount="${b.id}" value="${b.planned}"><button data-step="500000" data-id="${b.id}">+</button></div></div><div class="right"><button class="mini-btn edit" data-save-budget="${b.id}">ذخیره</button><button class="mini-btn delete" data-del-budget="${b.id}">حذف</button></div></div></div></details>`;
        }).join('') : `<div class="empty">بودجه‌ای ثبت نشده است. از «بودجه جدید» استفاده کن.</div>`}
      </div>`;
    $('#addBudgetBtn')?.addEventListener('click', ()=>openBudgetSheet());
    $('#autoBudget')?.addEventListener('click', autoBudget);
    $$('[data-step]', el.budgets).forEach(b=> b.addEventListener('click', ()=>{
      const input = $(`[data-budget-amount="${b.dataset.id}"]`, el.budgets); input.value = Math.max(0, toNum(input.value)+toNum(b.dataset.step));
    }));
    $$('[data-save-budget]', el.budgets).forEach(b=> b.addEventListener('click', ()=>{
      const item = state.budgets.find(x=>x.id===b.dataset.saveBudget); if(!item) return;
      const name = $(`[data-budget-name="${item.id}"]`, el.budgets).value.trim();
      const amount = toNum($(`[data-budget-amount="${item.id}"]`, el.budgets).value);
      if(!name || !amount) return alert('عنوان و مبلغ معتبر وارد کن.');
      item.name = name; item.planned = amount; save();
    }));
    $$('[data-del-budget]', el.budgets).forEach(b=> b.addEventListener('click', ()=>{ if(confirm('این بودجه حذف شود؟')){ state.budgets = state.budgets.filter(x=>x.id!==b.dataset.delBudget); save(); } }));
    $$('[data-help]', el.budgets).forEach(b=> b.addEventListener('click', ()=>showHelp(b.dataset.help)));
  }

  function renderFunds(){
    el.funds.innerHTML = `
      <div class="panel-header">
        <div>
          <div class="hgroup"><button class="info" data-help="funds">i</button><div class="section-title">صندوق‌ها و اقساط</div></div>
          <div class="section-sub">هر مورد کشویی است تا فقط جزئیات لازم دیده شود</div>
        </div>
        <div class="right"><button class="ghost-btn" id="addFund">صندوق جدید</button><button class="chipbtn primary" id="addInst">قسط جدید</button></div>
      </div>
      <div class="accordion">
        <details class="acc" open>
          <summary><div><div class="acc-title">صندوق‌های هدف‌دار</div><div class="acc-desc">${state.funds.length} مورد فعال</div></div><div class="acc-total">${fmt(state.funds.reduce((s,f)=>s+toNum(f.savedAmount),0))}</div><div class="acc-caret">⌄</div></summary>
          <div class="acc-body">
            ${state.funds.length ? state.funds.map(f=>`<details class="acc"><summary><div><div class="acc-title">${f.title}</div><div class="acc-desc">هدف ${fmt(f.targetAmount)} • ذخیره ${fmt(f.savedAmount)}</div></div><div class="acc-total">${fmt(f.monthlyTarget||0)}</div><div class="acc-caret">⌄</div></summary><div class="acc-body"><div class="field-grid"><div><label>عنوان</label><input data-f-title="${f.id}" value="${f.title}"></div><div><label>موعد</label><input data-f-date="${f.id}" value="${f.dueDate||''}"></div><div><label>هدف کل</label><input data-f-target="${f.id}" value="${f.targetAmount||0}"></div><div><label>ذخیره فعلی</label><input data-f-saved="${f.id}" value="${f.savedAmount||0}"></div><div><label>نیاز ماهانه</label><input data-f-month="${f.id}" value="${f.monthlyTarget||0}"></div></div><div class="sheet-foot"><button class="mini-btn edit" data-save-fund="${f.id}">ذخیره</button><button class="mini-btn delete" data-del-fund="${f.id}">حذف</button></div></div></details>`).join('') : `<div class="empty">هنوز صندوقی ثبت نشده است.</div>`}
          </div>
        </details>
        <details class="acc">
          <summary><div><div class="acc-title">اقساط</div><div class="acc-desc">${state.installments.length} مورد فعال</div></div><div class="acc-total">${fmt(state.installments.reduce((s,f)=>s+toNum(f.monthlyAmount),0))}</div><div class="acc-caret">⌄</div></summary>
          <div class="acc-body">
            ${state.installments.length ? state.installments.map(f=>`<details class="acc"><summary><div><div class="acc-title">${f.title}</div><div class="acc-desc">سررسید ${f.dueDate||'-'} • مانده ${fmt(f.remainingBalance||0)}</div></div><div class="acc-total">${fmt(f.monthlyAmount||0)}</div><div class="acc-caret">⌄</div></summary><div class="acc-body"><div class="field-grid"><div><label>عنوان</label><input data-i-title="${f.id}" value="${f.title}"></div><div><label>سررسید</label><input data-i-date="${f.id}" value="${f.dueDate||''}"></div><div><label>مبلغ ماهانه</label><input data-i-month="${f.id}" value="${f.monthlyAmount||0}"></div><div><label>مانده</label><input data-i-rem="${f.id}" value="${f.remainingBalance||0}"></div></div><div class="sheet-foot"><button class="mini-btn edit" data-save-inst="${f.id}">ذخیره</button><button class="mini-btn delete" data-del-inst="${f.id}">حذف</button></div></div></details>`).join('') : `<div class="empty">هنوز قسطی ثبت نشده است.</div>`}
          </div>
        </details>
      </div>`;
    $('#addFund')?.addEventListener('click', ()=>openFundSheet());
    $('#addInst')?.addEventListener('click', ()=>openInstallmentSheet());
    $$('[data-save-fund]', el.funds).forEach(b=> b.addEventListener('click', ()=>saveFundInline(b.dataset.saveFund)));
    $$('[data-del-fund]', el.funds).forEach(b=> b.addEventListener('click', ()=>{ if(confirm('صندوق حذف شود؟')){ state.funds = state.funds.filter(x=>x.id!==b.dataset.delFund); save(); } }));
    $$('[data-save-inst]', el.funds).forEach(b=> b.addEventListener('click', ()=>saveInstallmentInline(b.dataset.saveInst)));
    $$('[data-del-inst]', el.funds).forEach(b=> b.addEventListener('click', ()=>{ if(confirm('قسط حذف شود؟')){ state.installments = state.installments.filter(x=>x.id!==b.dataset.delInst); save(); } }));
    $$('[data-help]', el.funds).forEach(b=> b.addEventListener('click', ()=>showHelp(b.dataset.help)));
  }

  function renderReports(){
    const usage = budgetUsage();
    const forecast = forecast30();
    const freq = frequentTemplates();
    el.reports.innerHTML = `
      <div class="panel-header">
        <div>
          <div class="hgroup"><button class="info" data-help="reports">i</button><div class="section-title">گزارش خلاصه</div></div>
          <div class="section-sub">فقط خروجی‌هایی که به تصمیم کمک می‌کنند</div>
        </div>
      </div>
      <div class="overview-grid">
        <div class="overview-card"><div class="t">نرخ مصرف بودجه</div><div class="n">${usage.percent}٪</div></div>
        <div class="overview-card"><div class="t">پیش‌بینی ۳۰ روزه</div><div class="n" style="color:${forecast>=0?'var(--income)':'#ffd2da'}">${fmt(forecast)}</div></div>
        <div class="overview-card"><div class="t">مانده فعلی</div><div class="n">${fmt(balance())}</div></div>
      </div>
      <div class="divider"></div>
      <div class="section-title">پرتکرارترین ثبت‌ها</div>
      <div class="tx-list" style="margin-top:10px">${freq.length ? freq.slice(0,4).map(t=>`<div class="tx-item"><div class="tx-main"><div class="tx-icon">•</div><div class="tx-text"><div class="name">${t.note}</div><div class="tx-meta"><span>${t.category}</span><span>${t.type==='income'?'درآمد':'هزینه'}</span><span>${t.count} بار</span></div></div></div><div class="tx-side"><div class="tx-amount ${t.type==='income'?'income':'expense'}">${fmt(t.amount)}</div><div class="tx-actions"><button class="mini-btn edit" data-run-template="${encodeURIComponent(JSON.stringify(t))}">ثبت سریع</button></div></div></div>`).join('') : `<div class="empty">برای گزارش هوشمند، چند تراکنش ثبت کن.</div>`}</div>`;
    $$('[data-run-template]', el.reports).forEach(b=> b.addEventListener('click', ()=> quickTemplate(JSON.parse(decodeURIComponent(b.dataset.runTemplate)))));
    $$('[data-help]', el.reports).forEach(b=> b.addEventListener('click', ()=>showHelp(b.dataset.help)));
  }

  function renderSettings(){
    const fs = Number(state.ui?.fontScale || 1);
    const label = fs < 0.93 ? 'کوچک' : fs > 1.07 ? 'بزرگ' : 'متوسط';
    el.settings.innerHTML = `
      <div class="panel-header">
        <div>
          <div class="hgroup"><button class="info" data-help="settings">i</button><div class="section-title">تنظیمات</div></div>
          <div class="section-sub">کنترل ظاهر و اندازه‌ها</div>
        </div>
      </div>
      <div class="settings-grid">
        <div class="settings-stack">
          <div class="settings-card">
            <div class="settings-row">
              <div>
                <div class="section-title">ظاهر و داده</div>
                <div class="section-sub">قالب و داده نمونه</div>
              </div>
              <div class="settings-actions">
                <button class="chipbtn tonal" id="settingsThemeBtn">${state.theme==='dark' ? '☀️ روشن' : '🌙 تیره'}</button>
                <button class="chipbtn primary" id="settingsSeedBtn">نمونه ✨</button>
              </div>
            </div>
          </div>
          <div class="settings-card">
            <div class="section-title">اندازه فونت و اجزای رابط</div>
            <div class="section-sub">با تغییر این اسلایدر، متن‌ها و دکمه‌های اصلی هم‌زمان تنظیم می‌شوند</div>
            <div class="range-wrap" style="margin-top:12px">
              <input type="range" min="0.85" max="1.25" step="0.05" value="${fs}" id="fontScaleRange">
              <div class="settings-row">
                <div class="tiny">۹۰٪</div>
                <div class="helper" id="fontScaleValue">${Math.round(fs*100)}٪ • ${label}</div>
                <div class="tiny">۱۱۵٪</div>
              </div>
            </div>
          </div>
        </div>
        <div class="settings-card">
          <div class="section-title">پیش‌نمایش</div>
          <div class="section-sub">نمونه زنده از متن و دکمه در اندازه فعلی</div>
          <div class="font-preview" style="margin-top:12px">
            <div class="preview-line">ثبت سریع باید خوانا و فشرده بماند.</div>
            <button class="btn primary">دکمه نمونه</button>
            <button class="mini-btn edit">ویرایش</button>
          </div>
        </div>
      </div>`;
    $('#settingsThemeBtn')?.addEventListener('click', toggleTheme);
    $('#settingsSeedBtn')?.addEventListener('click', seedDemo);
    $('#fontScaleRange')?.addEventListener('input', e => {
      state.ui.fontScale = Number(e.target.value);
      localStorage.setItem(STORAGE, JSON.stringify(state));
      document.documentElement.style.setProperty('--fontScale', String(state.ui.fontScale || 1));
      $('#fontScaleValue') && ($('#fontScaleValue').textContent = `${Math.round(state.ui.fontScale*100)}٪ • ${state.ui.fontScale < 0.93 ? 'کوچک' : state.ui.fontScale > 1.12 ? 'بزرگ' : 'متوسط'}`);
    });
    $('#fontScaleRange')?.addEventListener('change', ()=> save());
    $$('[data-help]', el.settings).forEach(b=> b.addEventListener('click', ()=>showHelp(b.dataset.help)));
  }

  function drawRing(canvas, usage, breakdown){
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const w=canvas.width,h=canvas.height,cx=w/2,cy=h/2,r=86,lw=22;
    ctx.clearRect(0,0,w,h);
    ctx.lineCap='round';
    ctx.strokeStyle='rgba(131,160,216,.16)';
    ctx.lineWidth=lw;
    ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.stroke();
    const total = breakdown.reduce((s,b)=>s+b.value,0) || 1;
    let start = -Math.PI/2;
    breakdown.forEach((b,i)=>{
      const angle = Math.PI*2*(b.value/total);
      ctx.strokeStyle = COLORS[i%COLORS.length];
      ctx.beginPath(); ctx.arc(cx,cy,r,start,start+angle); ctx.stroke();
      start += angle;
    });
    if(!breakdown.length && usage.percent){
      ctx.strokeStyle = getCSS('--primary');
      ctx.beginPath(); ctx.arc(cx,cy,r,-Math.PI/2,-Math.PI/2 + Math.PI*2*(usage.percent/100)); ctx.stroke();
    }
    ctx.lineWidth=1.5;
    ctx.strokeStyle='rgba(131,160,216,.12)';
    ctx.beginPath(); ctx.arc(cx,cy,r+19,0,Math.PI*2); ctx.stroke();
  }
  function getCSS(name){ return getComputedStyle(document.body).getPropertyValue(name).trim(); }

  function openSheet(title, sub, bodyHTML, afterRender){
    el.sheetTitle.textContent = title;
    el.sheetSub.textContent = sub;
    el.sheetBody.innerHTML = bodyHTML;
    el.backdrop.classList.remove('closing');
    el.backdrop.classList.add('open');
    afterRender?.();
  }
  function closeSheet(){
    if(!el.backdrop.classList.contains('open')) return;
    el.backdrop.classList.add('closing');
    setTimeout(()=> el.backdrop.classList.remove('open','closing'), 180);
  }
  function showHelp(key){
    el.infoTitle.textContent = 'راهنما';
    el.infoBody.textContent = helpText[key] || 'راهنمایی ثبت نشده است.';
    el.infoDialog.classList.remove('closing');
    el.infoDialog.classList.add('open');
  }
  function closeInfoDialog(){
    if(!el.infoDialog.classList.contains('open')) return;
    el.infoDialog.classList.add('closing');
    setTimeout(()=> el.infoDialog.classList.remove('open','closing'), 170);
  }

  function openTransactionSheet(tx=null){
    const editing = !!tx;
    const body = `
      <div class="field-grid">
        <div><label>نوع</label><select id="formType"><option value="expense" ${tx?.type==='expense'?'selected':''}>هزینه</option><option value="income" ${tx?.type==='income'?'selected':''}>درآمد</option><option value="transfer" ${tx?.type==='transfer'?'selected':''}>انتقال</option></select></div>
        <div><label>حساب</label><select id="formAccount">${state.accounts.map(a=>`<option value="${a.id}" ${tx?.accountId===a.id?'selected':''}>${a.name}</option>`).join('')}</select></div>
        <div><label>عنوان</label><input id="formNote" value="${tx?.note||''}" placeholder="مثلاً سوپرمارکت"></div>
        <div><label>دسته</label><input id="formCategory" value="${tx?.category||''}" placeholder="مثلاً خوراک"></div>
        <div><label>مبلغ</label><input id="formAmount" inputmode="numeric" value="${tx?.amount||''}"></div>
        <div><label>تاریخ</label><input id="formDate" value="${tx?.date||today()}"></div>
      </div>
      <div class="sheet-foot"><button class="btn primary" id="saveTxBtn">${editing?'ذخیره تغییرات':'ثبت تراکنش'}</button>${editing?'<button class="btn danger" id="deleteTxBtn">حذف</button>':''}<button class="btn secondary" id="cancelTxBtn">بستن</button></div>`;
    openSheet(editing?'ویرایش تراکنش':'ثبت تراکنش','فرم کامل فقط برای مواقع ضروری',body,()=>{
      $('#cancelTxBtn').onclick = closeSheet;
      $('#saveTxBtn').onclick = () => {
        const payload = {
          id: tx?.id || uid(),
          type: $('#formType').value,
          accountId: $('#formAccount').value,
          note: $('#formNote').value.trim(),
          category: $('#formCategory').value.trim() || 'سایر',
          amount: toNum($('#formAmount').value),
          date: $('#formDate').value || today()
        };
        if(!payload.amount) return alert('مبلغ معتبر نیست.');
        if(editing) state.transactions = state.transactions.map(x=> x.id===tx.id ? payload : x); else state.transactions.push(payload);
        closeSheet(); save();
      };
      $('#deleteTxBtn')?.addEventListener('click', ()=>{ if(confirm('این تراکنش حذف شود؟')){ state.transactions = state.transactions.filter(x=>x.id!==tx.id); closeSheet(); save(); } });
    });
  }

  function openBudgetSheet(){
    openSheet('بودجه جدید','دسته دلخواه و مبلغ ماهانه را ثبت کن',`
      <div class="field-grid"><div><label>عنوان بودجه</label><input id="budgetName" placeholder="مثلاً مدرسه"></div><div><label>مبلغ</label><input id="budgetAmount" inputmode="numeric" placeholder="مثلاً 3000000"></div></div>
      <div class="sheet-foot"><button class="btn primary" id="saveBudgetNew">افزودن بودجه</button><button class="btn secondary" id="cancelBudgetNew">بستن</button></div>`,()=>{
      $('#cancelBudgetNew').onclick = closeSheet;
      $('#saveBudgetNew').onclick = ()=>{
        const name = $('#budgetName').value.trim(); const planned = toNum($('#budgetAmount').value);
        if(!name || !planned) return alert('عنوان و مبلغ الزامی است.');
        state.budgets.push({id:uid(), month:monthNow(), name, planned}); closeSheet(); state.activeTab='budgets'; save();
      };
    });
  }
  function autoBudget(){
    const cats = expenseByCategory().map(x=>x.name);
    cats.forEach(name=>{
      if(!state.budgets.find(b=>b.month===monthNow() && b.name===name)){
        state.budgets.push({id:uid(), month:monthNow(), name, planned:Math.max(1000000, Math.round(budgetSpent(name)/500000)*500000)});
      }
    });
    save();
  }
  function openFundSheet(fund=null){
    const editing = !!fund;
    openSheet(editing?'ویرایش صندوق':'صندوق جدید','ذخیره هدف‌دار برای هزینه‌های آینده',`
      <div class="field-grid"><div><label>عنوان</label><input id="fundTitle" value="${fund?.title||''}"></div><div><label>موعد</label><input id="fundDate" value="${fund?.dueDate||''}" placeholder="1405/05/01"></div><div><label>هدف کل</label><input id="fundTarget" value="${fund?.targetAmount||''}"></div><div><label>ذخیره فعلی</label><input id="fundSaved" value="${fund?.savedAmount||''}"></div><div><label>نیاز ماهانه</label><input id="fundMonth" value="${fund?.monthlyTarget||''}"></div></div>
      <div class="sheet-foot"><button class="btn primary" id="saveFundBtn">${editing?'ذخیره':'ثبت صندوق'}</button><button class="btn secondary" id="cancelFundBtn">بستن</button></div>`,()=>{
      $('#cancelFundBtn').onclick = closeSheet;
      $('#saveFundBtn').onclick = ()=>{
        const payload = {id: fund?.id || uid(), title:$('#fundTitle').value.trim(), dueDate:$('#fundDate').value.trim(), targetAmount:toNum($('#fundTarget').value), savedAmount:toNum($('#fundSaved').value), monthlyTarget:toNum($('#fundMonth').value), active:true};
        if(!payload.title) return alert('عنوان لازم است.');
        if(editing) state.funds = state.funds.map(x=>x.id===fund.id?payload:x); else state.funds.push(payload);
        closeSheet(); state.activeTab='funds'; save();
      };
    });
  }
  function openInstallmentSheet(item=null){
    const editing = !!item;
    openSheet(editing?'ویرایش قسط':'قسط جدید','برای سررسیدهای تکرارشونده',`
      <div class="field-grid"><div><label>عنوان</label><input id="instTitle" value="${item?.title||''}"></div><div><label>سررسید</label><input id="instDate" value="${item?.dueDate||''}"></div><div><label>مبلغ ماهانه</label><input id="instMonth" value="${item?.monthlyAmount||''}"></div><div><label>مانده</label><input id="instRem" value="${item?.remainingBalance||''}"></div></div>
      <div class="sheet-foot"><button class="btn primary" id="saveInstBtn">${editing?'ذخیره':'ثبت قسط'}</button><button class="btn secondary" id="cancelInstBtn">بستن</button></div>`,()=>{
      $('#cancelInstBtn').onclick = closeSheet;
      $('#saveInstBtn').onclick = ()=>{
        const payload = {id:item?.id||uid(), title:$('#instTitle').value.trim(), dueDate:$('#instDate').value.trim(), monthlyAmount:toNum($('#instMonth').value), remainingBalance:toNum($('#instRem').value), active:true};
        if(!payload.title) return alert('عنوان لازم است.');
        if(editing) state.installments = state.installments.map(x=>x.id===item.id?payload:x); else state.installments.push(payload);
        closeSheet(); state.activeTab='funds'; save();
      };
    });
  }
  function openFundQuick(fund){
    if(!fund) return openFundSheet();
    openSheet(`واریز به ${fund.title}`,'ثبت سریع برای صندوق هدف‌دار',`
      <div class="field-grid"><div><label>مبلغ واریز</label><input id="fundQuickAmount" value="${fund.monthlyTarget||''}"></div><div><label>یادداشت</label><input id="fundQuickNote" value="واریز صندوق"></div></div>
      <div class="sheet-foot"><button class="btn primary" id="saveFundQuick">ثبت</button><button class="btn secondary" id="cancelFundQuick">بستن</button></div>`,()=>{
      $('#cancelFundQuick').onclick = closeSheet;
      $('#saveFundQuick').onclick = ()=>{
        const amount = toNum($('#fundQuickAmount').value); if(!amount) return alert('مبلغ معتبر نیست.');
        fund.savedAmount = toNum(fund.savedAmount)+amount;
        state.transactions.push({id:uid(), type:'expense', amount, category:'پس‌انداز', note:`صندوق: ${fund.title}`, accountId:inferAccount(), date:today()});
        closeSheet(); save();
      };
    });
  }
  function openInstallmentQuick(item){
    if(!item) return openInstallmentSheet();
    openSheet(`ثبت ${item.title}`,'قسط آماده ثبت',`
      <div class="field-grid"><div><label>مبلغ</label><input id="instQuickAmount" value="${item.monthlyAmount||''}"></div><div><label>یادداشت</label><input id="instQuickNote" value="${item.title}"></div></div>
      <div class="sheet-foot"><button class="btn primary" id="saveInstQuick">ثبت</button><button class="btn secondary" id="cancelInstQuick">بستن</button></div>`,()=>{
      $('#cancelInstQuick').onclick = closeSheet;
      $('#saveInstQuick').onclick = ()=>{
        const amount = toNum($('#instQuickAmount').value); if(!amount) return alert('مبلغ معتبر نیست.');
        item.remainingBalance = Math.max(0, toNum(item.remainingBalance)-amount);
        state.transactions.push({id:uid(), type:'expense', amount, category:'بدهی', note:$('#instQuickNote').value.trim()||item.title, accountId:inferAccount(), date:today()});
        closeSheet(); save();
      };
    });
  }
  function saveFundInline(id){
    const f = state.funds.find(x=>x.id===id); if(!f) return;
    f.title = $(`[data-f-title="${id}"]`, el.funds).value.trim();
    f.dueDate = $(`[data-f-date="${id}"]`, el.funds).value.trim();
    f.targetAmount = toNum($(`[data-f-target="${id}"]`, el.funds).value);
    f.savedAmount = toNum($(`[data-f-saved="${id}"]`, el.funds).value);
    f.monthlyTarget = toNum($(`[data-f-month="${id}"]`, el.funds).value);
    save();
  }
  function saveInstallmentInline(id){
    const f = state.installments.find(x=>x.id===id); if(!f) return;
    f.title = $(`[data-i-title="${id}"]`, el.funds).value.trim();
    f.dueDate = $(`[data-i-date="${id}"]`, el.funds).value.trim();
    f.monthlyAmount = toNum($(`[data-i-month="${id}"]`, el.funds).value);
    f.remainingBalance = toNum($(`[data-i-rem="${id}"]`, el.funds).value);
    save();
  }

  function quickTemplate(t){
    if(!t) return;
    state.transactions.push({id:uid(), type:t.type, amount:t.amount, category:t.category, note:t.note, accountId:t.accountId || inferAccount(), date:today()});
    save();
  }
  function saveSmartInput(){
    const type = $('#quickTypeSeg .active')?.dataset.type || 'expense';
    const parsed = parseSmart(el.smartInput.value, type);
    if(!parsed.amount) return alert('حداقل مبلغ را وارد کن.');
    state.transactions.push({...parsed, id:uid()});
    el.smartInput.value='';
    save();
  }
  function toggleTheme(){ state.theme = state.theme==='dark' ? 'light' : 'dark'; save(); }

  function seedDemo(){
    state.accounts = [
      {id:uid(),name:'بانک ملت',type:'bank',openingBalance:22000000},
      {id:uid(),name:'نقد',type:'cash',openingBalance:1800000}
    ];
    const a0 = state.accounts[0].id, a1 = state.accounts[1].id;
    const m = monthNow();
    state.transactions = [
      {id:uid(),type:'income',amount:85000000,category:'درآمد',note:'حقوق ماه',accountId:a0,date:`${m}/01`},
      {id:uid(),type:'expense',amount:24000000,category:'مسکن',note:'اجاره خانه',accountId:a0,date:`${m}/02`},
      {id:uid(),type:'expense',amount:4200000,category:'خوراک',note:'سوپرمارکت',accountId:a0,date:`${m}/05`},
      {id:uid(),type:'expense',amount:1800000,category:'حمل‌ونقل',note:'بنزین',accountId:a1,date:`${m}/08`},
      {id:uid(),type:'expense',amount:950000,category:'درمان',note:'دارو',accountId:a0,date:`${m}/12`},
      {id:uid(),type:'expense',amount:1450000,category:'ارتباطات',note:'اینترنت',accountId:a0,date:`${m}/15`}
    ];
    state.budgets = [
      {id:uid(),month:m,name:'مسکن',planned:30000000},
      {id:uid(),month:m,name:'خوراک',planned:7000000},
      {id:uid(),month:m,name:'حمل‌ونقل',planned:3000000},
      {id:uid(),month:m,name:'درمان',planned:2000000},
      {id:uid(),month:m,name:'ارتباطات',planned:2000000}
    ];
    state.funds = [
      {id:uid(),title:'بیمه خودرو',targetAmount:30000000,savedAmount:12000000,monthlyTarget:3000000,dueDate:'1405/06/01',active:true},
      {id:uid(),title:'سفر تابستان',targetAmount:45000000,savedAmount:9000000,monthlyTarget:5000000,dueDate:'1405/05/10',active:true}
    ];
    state.installments = [
      {id:uid(),title:'قسط خودرو',monthlyAmount:8500000,remainingBalance:187000000,dueDate:`${m}/18`,active:true}
    ];
    state.activeTab='dashboard';
    state.ui.showAllTx=false;
    save();
  }
})();