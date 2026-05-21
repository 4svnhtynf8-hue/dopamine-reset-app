/* ═══════════════════════════════════════════════════════
   DATA & DEFAULTS
   ═══════════════════════════════════════════════════════ */
var DEFAULT_TASKS = [
  {name:'Ngủ đủ 6 tiếng', sub:'Ngủ trước 23h — không thương lượng'},
  {name:'Lên kế hoạch 3 khung giờ', sub:'9h, 3h chiều, sau 22h — viết ra trước'},
  {name:'Tập gym hoặc đi bộ 20 phút', sub:'Thay thế dopamine tự nhiên'},
  {name:'Không cần sa hôm nay', sub:'Khi cơn lên: mở tab Khẩn cấp ngay'}
];
var STATE_LABELS = ['🌪️ Bão thôi thúc','🌫️ Mơ hồ','☁️ Bình thường','☀️ Tỉnh táo'];
var BRAIN_MILESTONES = [
  {day:1,  label:'Não đang phản kháng'},
  {day:3,  label:'Cơn thèm thường mạnh nhất'},
  {day:5,  label:'Não bắt đầu thích nghi'},
  {day:7,  label:'Tập trung bắt đầu cải thiện'},
  {day:14, label:'Ham muốn bốc đồng giảm dần'},
  {day:21, label:'Chu kỳ reset đầu tiên hoàn thành'}
];
var ALT_ACTIONS = {
  'Một mình':            {icon:'🚶', text:'Ra khỏi phòng 5 phút'},
  'Thức khuya':          {icon:'💧', text:'Đặt điện thoại xa giường + uống nước'},
  'Không có kế hoạch':   {icon:'🚶', text:'Đi bộ hoặc dọn phòng 10 phút'},
  'Bấm điện thoại':      {icon:'📵', text:'Khóa màn hình 10 phút'},
  'Cô đơn':              {icon:'💬', text:'Nhắn cho ai đó hoặc ra ngoài'},
  'Căng thẳng':          {icon:'🌬️', text:'Thở thêm 90 giây'},
  'Chán':                {icon:'🚶', text:'Đi bộ 10 phút thay vì ngồi yên'},
  'Trên giường':         {icon:'⬆️', text:'Đứng dậy ngay, ra khỏi phòng ngủ'},
};

var DATA = JSON.parse(localStorage.getItem('reset21_v7') || 'null');
if (!DATA) {
  DATA = {
    streak:1, startDate:null, energy:50, tasks:{},
    triggers:{}, state:-1, relapses:[], lastDate:null,
    customTasks:null, history:{}, cravingHistory:[], dayClosingHistory:[],
    bestStreak:1, totalCleanDays:0, survivedCount:0, relapseCount:0,
    todayCommit:false, brainMilestoneSeen:0,
    dailyJournal:[], cravingToday:0, dailyCravingHistory:[]
  };
}
if (!DATA.customTasks)       DATA.customTasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
if (!DATA.history)           DATA.history = {};
if (!DATA.triggers)          DATA.triggers = {};
if (!DATA.relapses)          DATA.relapses = [];
if (!DATA.cravingHistory)    DATA.cravingHistory = [];
if (!DATA.dayClosingHistory) DATA.dayClosingHistory = [];
if (!DATA.bestStreak)        DATA.bestStreak = DATA.streak || 1;
if (!DATA.totalCleanDays)    DATA.totalCleanDays = 0;
if (!DATA.survivedCount)     DATA.survivedCount = 0;
if (!DATA.relapseCount)      DATA.relapseCount = 0;
if (DATA.todayCommit === undefined) DATA.todayCommit = false;
if (!DATA.dailyJournal)      DATA.dailyJournal = [];
if (DATA.cravingToday === undefined) DATA.cravingToday = 0;
if (!DATA.dailyCravingHistory) DATA.dailyCravingHistory = [];
if (DATA.notificationEnabled === undefined) DATA.notificationEnabled = false;
if (!DATA.seenMilestones) {
  DATA.seenMilestones = DATA.brainMilestoneSeen
    ? BRAIN_MILESTONES.filter(function(m){return m.day<=DATA.brainMilestoneSeen;}).map(function(m){return m.day;})
    : [];
}

var timerInterval = null;
var selectedChips = {};
var currentCraving = {};

/* ═══════════════════════════════════════════════════════
   UTILS
   ═══════════════════════════════════════════════════════ */
function todayKey() {
  var d = new Date();
  return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
}
function nowTime() {
  var d = new Date();
  return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
}
function saveData() { localStorage.setItem('reset21_v7', JSON.stringify(DATA)); }
function escHtml(s) {
  if (!s) return '';
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function fires(n) { var s=''; for(var i=0;i<Math.min(n,10);i++) s+='🔥'; return s; }

/* ═══════════════════════════════════════════════════════
   SNAPSHOT
   ═══════════════════════════════════════════════════════ */
function snapshotToday() {
  var today = todayKey();
  var tasksDone = Object.keys(DATA.tasks).filter(function(k){return DATA.tasks[k];}).length;
  var todayCravings = DATA.cravingHistory.filter(function(c){return c.date===today;});
  DATA.history[today] = {
    state:DATA.state, energy:DATA.energy,
    tasksDone:tasksDone, totalTasks:DATA.customTasks.length,
    tasks:JSON.parse(JSON.stringify(DATA.tasks)),
    taskNames:DATA.customTasks.map(function(t){return t.name;}),
    relapse:DATA.relapses.indexOf(today)>=0,
    streak:DATA.streak, cravings:todayCravings.length
  };
  saveData();
}

function initDay() {
  var today = todayKey();
  if (DATA.lastDate !== today) {
    if (DATA.lastDate) {
      // Count clean day if no relapse
      if (DATA.relapses.indexOf(DATA.lastDate) < 0) DATA.totalCleanDays++;
      snapshotToday();
    }
    if (!DATA.startDate) { DATA.startDate=today; DATA.streak=1; }
    else {
      var diff = Math.round((new Date(today)-new Date(DATA.lastDate))/(1000*60*60*24));
      if (diff===1) DATA.streak++;
      else if (diff>1) { DATA.streak=1; DATA.startDate=today; }
    }
    if (DATA.streak > DATA.bestStreak) DATA.bestStreak = DATA.streak;
    DATA.lastDate = today;
    DATA.tasks = {};
    DATA.state = -1;
    DATA.energy = 50;
    DATA.todayCommit = false;
    DATA.cravingToday = 0;
    saveData();
  }
}

/* ═══════════════════════════════════════════════════════
   BRAIN RECOVERY
   ═══════════════════════════════════════════════════════ */
function getCurrentMilestone() {
  var ms = null;
  BRAIN_MILESTONES.forEach(function(m){ if(DATA.streak >= m.day) ms=m; });
  return ms;
}
function renderBrainRecovery() {
  var pct = Math.min(DATA.streak / 21 * 100, 100);
  var barEl = document.getElementById('brain-bar');
  if (barEl) {
    // Reset to 0 first so transition plays each time progress tab opens
    barEl.style.transition = 'none';
    barEl.style.width = '0%';
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        barEl.style.transition = '';
        barEl.style.width = pct + '%';
      });
    });
  }

  var daysEl = document.getElementById('brain-days');
  if (daysEl) daysEl.textContent = DATA.streak + ' / 21 ngày';

  var ms = getCurrentMilestone();
  var statusEl = document.getElementById('brain-status');
  var msEl = document.getElementById('brain-milestone');
  if (statusEl) statusEl.textContent = DATA.streak >= 21 ? 'Chu kỳ đầu hoàn thành 🧠' : 'Não đang hồi phục';
  if (msEl) {
    if (ms) {
      msEl.style.display = 'block';
      msEl.textContent = 'Ngày ' + ms.day + ' — ' + ms.label;
    } else {
      msEl.style.display = 'none';
    }
  }

  // Check if new milestone unlocked
  if (ms && DATA.seenMilestones.indexOf(ms.day) < 0) {
    DATA.seenMilestones.push(ms.day);
    saveData();
    showBrainPopup(ms);
  }
}
function showBrainPopup(ms) {
  document.getElementById('brain-popup-day').textContent = 'Ngày ' + ms.day;
  document.getElementById('brain-popup-text').textContent = ms.label;
  document.getElementById('brain-popup').style.display = 'flex';
}
function closeBrainPopup() {
  document.getElementById('brain-popup').style.display = 'none';
}

/* ═══════════════════════════════════════════════════════
   COMMIT
   ═══════════════════════════════════════════════════════ */
function doCommit() {
  DATA.todayCommit = true; saveData();
  var btn = document.getElementById('commit-btn');
  if (btn) {
    btn.textContent = '✓ Đã cam kết hôm nay';
    btn.classList.add('done');
    btn.disabled = true;
    btn.classList.add('flash');
    setTimeout(function(){ btn.classList.remove('flash'); }, 200);
  }
}
function renderCommit() {
  var btn = document.getElementById('commit-btn');
  if (!btn) return;
  if (DATA.todayCommit) { btn.textContent = '✓ Đã cam kết hôm nay'; btn.classList.add('done'); btn.disabled = true; }
  else { btn.textContent = 'TÔI CAM KẾT'; btn.classList.remove('done'); btn.disabled = false; }
}

/* ═══════════════════════════════════════════════════════
   HOME
   ═══════════════════════════════════════════════════════ */
function renderHome() {
  document.getElementById('streak-num').textContent = DATA.streak;
  var phases = {1:'NGÀY ĐẦU TIÊN — KHÓ NHẤT',2:'NGÀY THỨ 2 — NÃO VẪN KHÁNG',3:'NGÀY THỨ 3 — ĐỈNH WITHDRAWAL',7:'TUẦN ĐẦU HOÀN THÀNH',14:'NỬA CHẶNG ĐƯỜNG',21:'HOÀN THÀNH 21 NGÀY'};
  document.getElementById('streak-phase').textContent = phases[DATA.streak]||(DATA.streak<=7?'TUẦN ĐẦU — GIỮ VỮNG':DATA.streak<=14?'TUẦN 2 — ĐANG REWIRE':'TUẦN 3 — GẦN XONG');
  document.getElementById('energy-slider').value = DATA.energy||50;
  document.getElementById('energy-val').textContent = DATA.energy||50;
  if (DATA.state>=0) {
    document.querySelectorAll('.state-chip').forEach(function(c,i){c.classList.toggle('selected',i===DATA.state);});
    renderStateMsg(DATA.state);
  }
  renderCommit();
  renderTaskList();
  updateRealtimeUI();
}
function renderStateMsg(i) {
  var msgs=['Nguy hiểm. Đừng tin giọng nói trong đầu — đó chỉ là hóa học. Mở Khẩn cấp ngay khi cơn lên.','Mơ hồ. Đừng để khoảng trống tự lấp đầy. Lên kế hoạch 30 phút tới.','Bình thường. Giữ giao thức. Không chủ quan.','Tỉnh táo. Dùng năng lượng này — đây là lúc xây thói quen mới.'];
  document.getElementById('state-msg').textContent = msgs[i];
}
function selectState(i) {
  DATA.state=i; saveData();
  document.querySelectorAll('.state-chip').forEach(function(c,idx){c.classList.toggle('selected',idx===i);});
  renderStateMsg(i);
}
function renderTaskList() {
  var c = document.getElementById('task-list'); c.innerHTML='';
  DATA.customTasks.forEach(function(t,i){
    var done=!!DATA.tasks['t'+i];
    var el=document.createElement('div'); el.className='task-card'+(done?' done':''); el.id='task-'+i;
    el.onclick=(function(idx){return function(){toggleTask(idx);};})(i);
    el.innerHTML='<div class="task-check"><svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"/></svg></div>'+
      '<div class="task-info"><div class="task-name">'+escHtml(t.name)+'</div>'+(t.sub?'<div class="task-sub">'+escHtml(t.sub)+'</div>':'')+' </div>';
    c.appendChild(el);
  });
}
function toggleTask(n) {
  DATA.tasks['t'+n]=!DATA.tasks['t'+n]; saveData();
  var el=document.getElementById('task-'+n); if(el) el.classList.toggle('done',DATA.tasks['t'+n]);
  snapshotToday();
}
function updateEnergy(v) {
  DATA.energy=parseInt(v); document.getElementById('energy-val').textContent=v; snapshotToday();
}

/* ═══════════════════════════════════════════════════════
   TASK EDITOR
   ═══════════════════════════════════════════════════════ */
function openTaskEditor() {
  var list=document.getElementById('editor-task-list'); list.innerHTML='';
  DATA.customTasks.forEach(function(t){ appendEditorRow(list,t.name,t.sub||''); });
  document.getElementById('task-editor').style.display='block';
}
function appendEditorRow(list,name,sub) {
  var row=document.createElement('div'); row.className='editor-row';
  row.innerHTML='<div class="editor-task-row"><input class="editor-task-input" type="text" placeholder="Tên nhiệm vụ" value="'+escHtml(name)+'"><button class="del-task-btn" onclick="this.closest(\'.editor-row\').remove()">×</button></div><input class="editor-task-sub" type="text" placeholder="Mô tả (tuỳ chọn)" value="'+escHtml(sub)+'">';
  list.appendChild(row);
}
function addNewTask() {
  var list=document.getElementById('editor-task-list');
  appendEditorRow(list,'',''); list.lastChild.querySelector('input').focus();
}
function saveTaskEditor() {
  var rows=document.getElementById('editor-task-list').querySelectorAll('.editor-row');
  var newTasks=[];
  rows.forEach(function(row){
    var inputs=row.querySelectorAll('input');
    var name=inputs[0]?inputs[0].value.trim():'';
    var sub=inputs[1]?inputs[1].value.trim():'';
    if(name) newTasks.push({name:name,sub:sub});
  });
  if(!newTasks.length) return;
  DATA.customTasks=newTasks; DATA.tasks={}; saveData(); closeTaskEditor(); renderTaskList();
}
function closeTaskEditor() { document.getElementById('task-editor').style.display='none'; }

/* ═══════════════════════════════════════════════════════
   PROGRESS
   ═══════════════════════════════════════════════════════ */
function renderProgress() {
  // Stats
  document.getElementById('stat-best').textContent     = DATA.bestStreak||0;
  document.getElementById('stat-total').textContent    = DATA.totalCleanDays||0;
  document.getElementById('stat-survived').textContent = DATA.survivedCount||0;
  document.getElementById('stat-relapse').textContent  = DATA.relapseCount||0;

  renderBrainRecovery();
  renderCravingToday();
  renderJournalRecent();
  renderCalendar();
  renderCravingHistory();
  renderTriggerList();
  renderNotifCard();
}
function renderCravingToday() {
  var n = DATA.cravingToday || 0;
  var numEl = document.getElementById('craving-today-num');
  var msgEl = document.getElementById('craving-today-msg');
  if (!numEl) return;
  numEl.textContent = n === 0 ? '—' : '🔥 ' + n + ' lần';
  if (n === 0) { msgEl.textContent = 'Chưa ghi nhận'; }
  else if (n >= 8) { msgEl.textContent = 'Hôm nay là ngày nguy hiểm'; }
  else if (n >= 5) { msgEl.textContent = 'Hôm nay hơi khó'; }
  else { msgEl.textContent = ''; }
}
function renderJournalRecent() {
  var container = document.getElementById('journal-recent-list');
  if (!container) return;
  var list = (DATA.dailyJournal||[]).slice().reverse().slice(0,3);
  if (!list.length) { container.innerHTML='<div style="color:var(--gray);font-size:13px">Chưa có ghi chép.</div>'; return; }
  container.innerHTML = '';
  list.forEach(function(j) {
    var parts = j.date.split('-');
    var label = parts[2]+'/'+parts[1];
    var el = document.createElement('div');
    el.style.cssText = 'padding:10px 0;border-bottom:1px solid rgba(255,255,255,.05)';
    el.innerHTML = '<div style="font-family:\'Be Vietnam Pro\',sans-serif;font-size:11px;font-weight:700;color:var(--gray);margin-bottom:4px">'+label+'</div>'+
      '<div style="font-size:13px;color:var(--cream);font-family:\'Cormorant Garamond\',serif;font-style:italic;line-height:1.5">"'+escHtml(j.text)+'"</div>';
    container.appendChild(el);
  });
}
function renderCalendar() {
  var grid=document.getElementById('cal-grid'); grid.innerHTML='';
  var start=DATA.startDate?new Date(DATA.startDate):new Date();
  var today=todayKey();
  for(var i=0;i<21;i++){
    var d=new Date(start); d.setDate(d.getDate()+i);
    var dk=d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate();
    var el=document.createElement('div'); el.className='cal-day'; el.textContent=i+1;
    var snap=DATA.history[dk]; var isRelapse=DATA.relapses.indexOf(dk)>=0;
    if(isRelapse) el.classList.add('relapse');
    else if(dk<today&&snap) el.classList.add('clean');
    else if(dk===today) el.classList.add('today');
    if(snap||dk===today){ el.classList.add('has-data'); el.onclick=(function(key,dn){return function(){openDayDetail(key,dn);};})(dk,i+1); }
    grid.appendChild(el);
  }
}
function renderCravingHistory() {
  var container=document.getElementById('craving-history-list');
  var list=DATA.cravingHistory.slice().reverse().slice(0,7);
  if(!list.length){ container.innerHTML='<div style="color:var(--gray);font-size:13px">Chưa có dữ liệu.</div>'; return; }
  container.innerHTML='';
  list.forEach(function(c){
    var el=document.createElement('div'); el.className='craving-item';
    var resultHtml=c.result==='Đã vượt qua'?'<span class="craving-result-ok">✓ Đã vượt qua</span>':'<span class="craving-result-fail">⚠ Vẫn còn thôi thúc</span>';
    var trigHtml=c.triggers&&c.triggers.length?c.triggers.map(escHtml).join(' · '):'—';
    el.innerHTML='<div class="craving-top"><span class="craving-time">'+escHtml(c.time)+' · '+escHtml(c.date)+'</span>'+resultHtml+'</div>'+
      '<div class="craving-intensity">'+fires(c.intensity)+' <span style="font-family:\'Be Vietnam Pro\',sans-serif;font-weight:700;color:var(--gold)">'+c.intensity+'/10</span></div>'+
      '<div class="craving-triggers">'+trigHtml+'</div>';
    container.appendChild(el);
  });
}
function renderTriggerList() {
  var tlist=document.getElementById('trigger-list');
  var entries=Object.entries(DATA.triggers||{}).sort(function(a,b){return b[1]-a[1];});
  if(!entries.length){ tlist.innerHTML='<div style="color:var(--gray);font-size:13px">Dùng tab Khẩn cấp để ghi nhận trigger.</div>'; return; }
  tlist.innerHTML='';
  entries.slice(0,8).forEach(function(e){
    var f=fires(Math.min(e[1],3));
    var el=document.createElement('div'); el.className='trigger-item';
    el.innerHTML='<div class="trigger-left"><span>'+f+'</span><span>'+escHtml(e[0])+'</span></div><span class="trigger-count">'+e[1]+'</span>';
    tlist.appendChild(el);
  });
}

/* ═══════════════════════════════════════════════════════
   DAY DETAIL
   ═══════════════════════════════════════════════════════ */
function openDayDetail(dateKey,dayNum) {
  var snap=DATA.history[dateKey]; var isToday=dateKey===todayKey();
  var parts=dateKey.split('-');
  document.getElementById('day-detail-title').textContent='Ngày '+dayNum+' — '+parts[2]+'/'+parts[1]+'/'+parts[0];
  var stateHtml=snap&&snap.state>=0?STATE_LABELS[snap.state]:'<span style="color:var(--gray)">Không ghi nhận</span>';
  var energy=snap?snap.energy:(isToday?DATA.energy:'—');
  var tasksDone=snap?snap.tasksDone:Object.keys(DATA.tasks).filter(function(k){return DATA.tasks[k];}).length;
  var total=snap?snap.totalTasks:DATA.customTasks.length;
  var isRelapse=DATA.relapses.indexOf(dateKey)>=0;
  var todayCravings=DATA.cravingHistory.filter(function(c){return c.date===dateKey;});
  var tNames=snap?snap.taskNames:DATA.customTasks.map(function(t){return t.name;});
  var tData=snap?snap.tasks:DATA.tasks;
  var tasksHtml='';
  if(tNames&&tNames.length){
    tNames.forEach(function(name,i){
      var done=tData&&tData['t'+i];
      tasksHtml+='<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05)">'+
        '<div style="width:18px;height:18px;border-radius:5px;flex-shrink:0;'+(done?'background:var(--gold)':'border:1.5px solid var(--gray)')+'">'+
        (done?'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3D271A" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>':'')+
        '</div><span style="font-size:13px;color:'+(done?'var(--cream)':'var(--gray)')+'">'+escHtml(name)+'</span></div>';
    });
  }
  document.getElementById('day-detail-body').innerHTML=
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px">'+
      '<div style="background:rgba(255,255,255,.04);border-radius:12px;padding:12px"><div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--gray);margin-bottom:6px">TRẠNG THÁI</div><div style="font-size:13px">'+stateHtml+'</div></div>'+
      '<div style="background:rgba(255,255,255,.04);border-radius:12px;padding:12px"><div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--gray);margin-bottom:6px">NĂNG LƯỢNG</div><div style="font-family:\'Be Vietnam Pro\',sans-serif;font-size:22px;font-weight:700;color:var(--gold)">'+energy+'</div></div>'+
      '<div style="background:rgba(255,255,255,.04);border-radius:12px;padding:12px"><div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--gray);margin-bottom:6px">NHIỆM VỤ</div><div style="font-family:\'Be Vietnam Pro\',sans-serif;font-size:22px;font-weight:700;color:var(--gold)">'+tasksDone+'/'+total+'</div></div>'+
      '<div style="background:rgba(255,255,255,.04);border-radius:12px;padding:12px"><div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--gray);margin-bottom:6px">KẾT QUẢ</div>'+(isRelapse?'<span style="color:var(--soft-warn);font-size:13px">⚠ Tái phạm</span>':'<span style="color:var(--gold);font-size:13px">✓ Giữ vững</span>')+'</div>'+
    '</div>'+
    (todayCravings.length?'<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--gray);margin-bottom:8px">'+todayCravings.length+' CƠN THÈM</div>'+
      todayCravings.map(function(c){return '<div style="display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid rgba(255,255,255,.05)"><span style="font-size:12px;color:var(--cream)">'+escHtml(c.time)+'</span><span>'+fires(c.intensity)+' '+c.intensity+'/10</span><span style="font-size:11px;color:'+(c.result==='Đã vượt qua'?'var(--gold)':'var(--soft-warn)')+'">'+escHtml(c.result)+'</span></div>';}).join('')
    :'<div style="font-size:12px;color:var(--gray);margin-bottom:8px">0 cơn thèm hôm này</div>')+
    '<div style="font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:var(--gray);margin:12px 0 8px">CHI TIẾT NHIỆM VỤ</div>'+tasksHtml;
  document.getElementById('day-detail-modal').style.display='flex';
}
function closeDayDetail() { document.getElementById('day-detail-modal').style.display='none'; }

/* ═══════════════════════════════════════════════════════
   EMERGENCY / CRAVING
   ═══════════════════════════════════════════════════════ */
function startCheckin() {
  currentCraving = {time:nowTime(), date:todayKey(), triggers:[], intensity:5};
  document.getElementById('emg-main').style.display='none';
  document.getElementById('emg-checkin').classList.add('showing');
}
function cancelCheckin() { resetEmg(); }
function backToCheckin() {
  document.getElementById('emg-intensity').classList.remove('showing');
  document.getElementById('emg-checkin').classList.add('showing');
}
function toggleChip(el,cat) {
  el.classList.toggle('sel');
  if(!selectedChips[cat]) selectedChips[cat]=[];
  var txt=el.textContent.trim();
  var idx=selectedChips[cat].indexOf(txt);
  if(idx>=0) selectedChips[cat].splice(idx,1); else selectedChips[cat].push(txt);
  showPattern();
}
function showPattern() {
  var all = Object.values(selectedChips).flat();
  var top = Object.entries(DATA.triggers||{}).sort(function(a,b){return b[1]-a[1];}).slice(0,3);
  var sec = document.getElementById('pattern-section');
  if(!top.length && !all.length){ sec.style.display='none'; return; }
  sec.style.display='block';
  var items=document.getElementById('pattern-items'); items.innerHTML='';
  top.forEach(function(e){
    var d=document.createElement('div'); d.className='pattern-item';
    d.innerHTML='<span>'+fires(Math.min(e[1],3))+'</span><span>'+escHtml(e[0])+'</span>';
    items.appendChild(d);
  });
  // Alt actions based on currently selected chips
  var altEl=document.getElementById('alt-actions');
  var altItemsEl=document.getElementById('alt-action-items');
  var suggestions=[];
  all.forEach(function(t){
    // strip emoji prefix
    var key=t.replace(/^[\u{1F300}-\u{1FFFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\s]+/gu,'').trim();
    if(ALT_ACTIONS[key] && suggestions.length<2) suggestions.push(ALT_ACTIONS[key]);
  });
  if(suggestions.length){
    altEl.style.display='block';
    altItemsEl.innerHTML='';
    suggestions.forEach(function(s){
      var d=document.createElement('div'); d.className='alt-action-item';
      d.innerHTML='<span>'+s.icon+'</span><span>'+escHtml(s.text)+'</span>';
      altItemsEl.appendChild(d);
    });
  } else { altEl.style.display='none'; }
}
function goToIntensity() {
  var all=Object.values(selectedChips).flat();
  currentCraving.triggers=all;
  all.forEach(function(c){ DATA.triggers[c]=(DATA.triggers[c]||0)+1; });
  DATA.cravingToday = (DATA.cravingToday||0) + 1;
  saveData();
  document.getElementById('emg-checkin').classList.remove('showing');
  document.getElementById('emg-intensity').classList.add('showing');
  updateIntensityDisplay(document.getElementById('intensity-slider').value);
}
function updateIntensityDisplay(v) {
  v=parseInt(v);
  document.getElementById('intensity-val').textContent=v;
  document.getElementById('intensity-fires').textContent=fires(v);
  currentCraving.intensity=v;
}
function startBreathe() {
  currentCraving.intensity=parseInt(document.getElementById('intensity-slider').value);
  document.getElementById('emg-intensity').classList.remove('showing');
  var bs=document.getElementById('emg-breathe'); bs.classList.add('showing');
  var secs=90, stepIdx=0, stepAt=[18,36,54,72,90], phases=['Hít vào','Giữ lại','Thở ra'], pi=0, pc=0;
  timerInterval=setInterval(function(){
    secs--;
    document.getElementById('breathe-timer').textContent=secs;
    pc++; if(pc>=15){pc=0;pi=(pi+1)%3;document.getElementById('breathe-phase').textContent=phases[pi];}
    if(stepIdx<5&&secs<=stepAt[stepIdx]){document.getElementById('step-'+stepIdx).classList.add('done-step');stepIdx++;}
    if(secs<=0){clearInterval(timerInterval);timerInterval=null;bs.classList.remove('showing');document.getElementById('emg-result').classList.add('showing');}
  },1000);
}
function saveCraving(result) {
  currentCraving.result=result;
  DATA.cravingHistory.push(JSON.parse(JSON.stringify(currentCraving)));
  if(result==='Đã vượt qua') DATA.survivedCount++;
  saveData(); snapshotToday();
}
function chooseOk() { saveCraving('Đã vượt qua'); resetEmg(); gotoScreen('home'); }
function chooseStillWant() {
  saveCraving('Vẫn còn thôi thúc');
  document.getElementById('emg-result').classList.remove('showing');
  document.getElementById('still-want-modal').style.display='flex';
}
function retryBreathe() {
  document.getElementById('still-want-modal').style.display='none';
  // reset breathe step
  [0,1,2,3,4].forEach(function(i){document.getElementById('step-'+i).classList.remove('done-step');});
  document.getElementById('breathe-timer').textContent='90';
  document.getElementById('breathe-phase').textContent='Hít vào';
  startBreathe();
}
function stillWantRelapse() {
  document.getElementById('still-want-modal').style.display='none';
  resetEmg();
  confirmRelapse();
}
function resetEmg() {
  if(timerInterval){clearInterval(timerInterval);timerInterval=null;}
  selectedChips={}; currentCraving={};
  document.querySelectorAll('.chip').forEach(function(c){c.classList.remove('sel');});
  document.getElementById('emg-main').style.display='flex';
  ['emg-checkin','emg-intensity','emg-breathe','emg-result'].forEach(function(id){
    document.getElementById(id).classList.remove('showing');
  });
  document.getElementById('breathe-timer').textContent='90';
  document.getElementById('breathe-phase').textContent='Hít vào';
  document.getElementById('intensity-slider').value=5;
  [0,1,2,3,4].forEach(function(i){document.getElementById('step-'+i).classList.remove('done-step');});
  document.getElementById('pattern-section').style.display='none';
  document.getElementById('still-want-modal').style.display='none';
}

/* ═══════════════════════════════════════════════════════
   RELAPSE — SOFT RESET
   ═══════════════════════════════════════════════════════ */
function confirmRelapse() {
  if(confirm('Ghi nhận tái phạm hôm nay?\nStreak hiện tại sẽ reset về 0.\nKỷ lục và tổng ngày sạch vẫn giữ nguyên.')) {
    var today=todayKey();
    if(DATA.relapses.indexOf(today)<0) DATA.relapses.push(today);
    // Soft reset: only current streak
    DATA.streak=1; DATA.startDate=today;
    DATA.relapseCount++;
    snapshotToday(); saveData();
    var prog=document.getElementById('screen-progress');
    if(prog&&prog.classList.contains('active')) renderProgress();
  }
}

/* ═══════════════════════════════════════════════════════
   DAY CLOSE
   ═══════════════════════════════════════════════════════ */
function openDayClose() {
  snapshotToday();
  var today=todayKey();
  var tasksDone=Object.keys(DATA.tasks).filter(function(k){return DATA.tasks[k];}).length;
  var total=DATA.customTasks.length;
  var isRelapse=DATA.relapses.indexOf(today)>=0;
  var todayCravings=DATA.cravingHistory.filter(function(c){return c.date===today;});
  var won=todayCravings.filter(function(c){return c.result==='Đã vượt qua';}).length;
  var cravingCount=DATA.cravingToday||0;
  var sumEl=document.getElementById('day-close-summary'); sumEl.innerHTML='';
  [
    {icon:isRelapse?'⚠':'✓', text:isRelapse?'Có tái phạm':'Không tái phạm', ok:!isRelapse},
    {icon:'✓', text:'Nhiệm vụ: '+tasksDone+'/'+total, ok:tasksDone>=total},
    {icon:'✓', text:'Năng lượng: '+DATA.energy, ok:true},
    {icon:'✓', text:'Số cơn hôm nay: '+cravingCount, ok:true},
    {icon:'✓', text:'Vượt qua: '+won+(cravingCount?' / '+cravingCount:''), ok:true}
  ].forEach(function(it){
    var d=document.createElement('div'); d.className='dc-item';
    d.innerHTML='<span class="dc-icon" style="color:'+(it.ok?'var(--gold)':'var(--soft-warn)')+'">'+it.icon+'</span><span>'+escHtml(it.text)+'</span>';
    sumEl.appendChild(d);
  });
  // Prefill journal textarea
  var existing=(DATA.dailyJournal||[]).find(function(j){return j.date===today;});
  var ta=document.getElementById('day-journal-input');
  if(ta){ ta.value=existing?existing.text:''; updateJournalCount(); }
  var todayTriggers={};
  todayCravings.forEach(function(c){c.triggers.forEach(function(t){todayTriggers[t]=(todayTriggers[t]||0)+1;});});
  var topToday=Object.entries(todayTriggers).sort(function(a,b){return b[1]-a[1];}).slice(0,4);
  var patEl=document.getElementById('day-close-patterns');
  patEl.innerHTML=topToday.length?topToday.map(function(e){return fires(Math.min(e[1],3))+' '+escHtml(e[0]);}).join('<br>'):'<span style="color:var(--gray)">Hôm nay chưa đủ dữ liệu</span>';
  var tipEl=document.getElementById('day-close-tips'); tipEl.innerHTML='';
  generateTips(todayCravings,topToday,isRelapse).forEach(function(tip){
    var d=document.createElement('div'); d.className='dc-tip'; d.textContent=tip; tipEl.appendChild(d);
  });
  document.getElementById('day-close-modal').style.display='block';
}
function generateTips(cravings,topTriggers,isRelapse) {
  var tips=[];
  var names=topTriggers.map(function(e){return e[0];});
  if(names.some(function(t){return t.indexOf('khuya')>=0||t.indexOf('đêm')>=0;})) tips.push('22h là khung giờ nguy hiểm — chuẩn bị hoạt động thay thế từ 21h30');
  if(names.some(function(t){return t.indexOf('mình')>=0;})) tips.push('Đừng ở một mình quá lâu — lên kế hoạch ra ngoài hoặc gọi ai đó');
  if(names.some(function(t){return t.indexOf('rảnh')>=0||t.indexOf('kế hoạch')>=0;})) tips.push('Khoảng trống = nguy hiểm — điền lịch trước khi ngày bắt đầu');
  if(names.some(function(t){return t.indexOf('điện thoại')>=0;})) tips.push('Để điện thoại xa giường khi ngủ');
  if(cravings.length>=3) tips.push('Hôm nay nhiều cơn — ngủ sớm để reset não');
  if(isRelapse) tips.push('Tái phạm không có nghĩa là thất bại — quan trọng là ngày mai bắt đầu lại ngay');
  if(!tips.length) tips.push('Giữ đúng giao thức ngày mai');
  return tips.slice(0,2);
}
function closeDayFinal() {
  var today = todayKey();
  // Save journal
  var ta = document.getElementById('day-journal-input');
  var txt = ta ? ta.value.trim() : '';
  if (txt) {
    var existing = DATA.dailyJournal.findIndex(function(j){return j.date===today;});
    if (existing >= 0) DATA.dailyJournal[existing].text = txt;
    else DATA.dailyJournal.push({date:today, text:txt});
  }
  // Save daily craving count
  var existCraving = DATA.dailyCravingHistory.findIndex(function(d){return d.date===today;});
  if (existCraving >= 0) DATA.dailyCravingHistory[existCraving].count = DATA.cravingToday||0;
  else DATA.dailyCravingHistory.push({date:today, count:DATA.cravingToday||0});

  snapshotToday();
  DATA.dayClosingHistory.push({date:today, time:nowTime(), energy:DATA.energy, streak:DATA.streak});
  saveData();
  document.getElementById('day-close-modal').style.display='none';
}
function updateJournalCount() {
  var ta = document.getElementById('day-journal-input');
  var cc = document.getElementById('journal-char-count');
  if (ta && cc) cc.textContent = ta.value.length + ' / 120';
}
function handleCloseDayClick() {
  if (isAfterEndDayTime()) openDayClose();
}
function cancelDayClose() { document.getElementById('day-close-modal').style.display='none'; }

/* ═══════════════════════════════════════════════════════
   NAV
   ═══════════════════════════════════════════════════════ */
function gotoScreen(n) {
  document.querySelectorAll('.screen').forEach(function(s){s.classList.remove('active');});
  document.querySelectorAll('.nav-btn').forEach(function(b){b.classList.remove('active');});
  document.getElementById('screen-'+n).classList.add('active');
  document.getElementById('nav-'+n).classList.add('active');
  if(n==='home') renderHome();
  if(n==='progress') renderProgress();
  if(n==='emergency') resetEmg();
}

/* ═══════════════════════════════════════════════════════
   REALTIME SYSTEM
   ═══════════════════════════════════════════════════════ */
var DANGER_WINDOWS = [
  {start:900,  end:990,  name:'TRỐNG 3H CHIỀU',          msg:'Đừng để khoảng trống tự lấp đầy.'},
  {start:1260, end:1410, name:'SAU CA DẠY / VỀ NHÀ ĐÊM', msg:'Cơn thèm hay đến khi mệt và một mình.'},
  {start:1410, end:1560, name:'THỨC KHUYA NGUY HIỂM',     msg:'Não thiếu ngủ mất khả năng kháng cự.'}
];
var END_DAY_HOUR = 21;

function nowMinutes() {
  var d=new Date(); return d.getHours()*60+d.getMinutes();
}
function getCurrentTimeText() {
  var d=new Date();
  return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
}
function getDangerWindow() {
  var mins=nowMinutes();
  var minsAdj=mins<120?mins+1440:mins;
  for(var i=0;i<DANGER_WINDOWS.length;i++){
    var w=DANGER_WINDOWS[i];
    if(minsAdj>=w.start&&minsAdj<w.end) return w;
  }
  return null;
}
function isAfterEndDayTime() { return new Date().getHours()>=END_DAY_HOUR; }
function updateRealtimeUI() {
  var clockEl=document.getElementById('rt-clock');
  if(clockEl) clockEl.textContent=getCurrentTimeText();
  var dz=getDangerWindow();
  var dzCard=document.getElementById('danger-zone-card');
  if(dzCard){
    if(dz){
      document.getElementById('danger-zone-time').textContent=getCurrentTimeText();
      document.getElementById('danger-zone-name').textContent=dz.name;
      document.getElementById('danger-zone-msg').textContent=dz.msg;
      dzCard.style.display='block';
    } else { dzCard.style.display='none'; }
  }
  var cdBtn=document.getElementById('close-day-btn');
  var cdHint=document.getElementById('close-day-hint');
  if(cdBtn){
    var after21=isAfterEndDayTime();
    cdBtn.textContent=after21?'KẾT THÚC NGÀY':'🔒 KẾT THÚC NGÀY';
    cdBtn.style.opacity=after21?'1':'0.4';
    cdBtn.style.cursor=after21?'pointer':'default';
    cdBtn.style.pointerEvents=after21?'auto':'none';
    cdBtn.style.borderColor=after21?'rgba(255,255,255,.15)':'rgba(255,255,255,.08)';
    if(cdHint) cdHint.style.display=after21?'none':'block';
  }
}
function checkDateChange() {
  var today=todayKey();
  if(DATA.lastDate&&DATA.lastDate!==today){
    if(DATA.relapses.indexOf(DATA.lastDate)<0) DATA.totalCleanDays++;
    snapshotToday();
    var diff=Math.round((new Date(today)-new Date(DATA.lastDate))/(1000*60*60*24));
    if(!DATA.startDate){DATA.startDate=today;DATA.streak=1;}
    else if(diff===1) DATA.streak++;
    else {DATA.streak=1;DATA.startDate=today;}
    if(DATA.streak>DATA.bestStreak) DATA.bestStreak=DATA.streak;
    DATA.lastDate=today; DATA.tasks={}; DATA.state=-1; DATA.energy=50; DATA.todayCommit=false;
    saveData(); renderHome();
    var prog=document.getElementById('screen-progress');
    if(prog&&prog.classList.contains('active')) renderProgress();
  }
}
function startRealtimeTick() {
  updateRealtimeUI();
  setInterval(function(){
    checkDateChange();
    updateRealtimeUI();
    checkScheduledNotifications();
  }, 60000);
}
document.addEventListener('visibilitychange', function(){
  if(document.visibilityState==='visible'){
    checkDateChange(); updateRealtimeUI();
    var active=document.querySelector('.screen.active');
    if(active){
      if(active.id==='screen-home') renderHome();
      if(active.id==='screen-progress') renderProgress();
    }
  }
});

/* ═══════════════════════════════════════════════════════
   SERVICE WORKER
   ═══════════════════════════════════════════════════════ */
if('serviceWorker' in navigator){
  window.addEventListener('load',function(){navigator.serviceWorker.register('sw.js').catch(function(){});});
}

/* ═══════════════════════════════════════════════════════
   INIT
   ═══════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════
   NOTIFICATION SYSTEM
   Local-only. No backend. Graceful degradation.
   ═══════════════════════════════════════════════════════ */

var NOTIF_SCHEDULE = [
  {id:'morning',    h:7,  m:0,  title:'21D RESET',                  body:'Bắt đầu ngày. Kéo thanh năng lượng và cam kết hôm nay.'},
  {id:'trigger_15', h:15, m:0,  title:'Khung giờ nguy hiểm',         body:'Đừng để khoảng trống tự lấp đầy. Mở app nếu thấy cơn thèm lên.'},
  {id:'trigger_21', h:21, m:0,  title:'Sau ca dạy / về nhà đêm',     body:'Đây là thời điểm dễ trượt. Chuẩn bị kết thúc ngày.'},
  {id:'evening',    h:22, m:30, title:'Kết thúc ngày',               body:'Ghi nhận cảm nghĩ, số cơn thèm và đóng ngày.'},
  {id:'latenight',  h:23, m:30, title:'Thức khuya nguy hiểm',        body:'Não thiếu ngủ dễ thương lượng. Đóng ngày và tránh màn hình.'}
];

function notifSupported() {
  return typeof Notification !== 'undefined';
}
function notifGranted() {
  return notifSupported() && Notification.permission === 'granted';
}

function sendLocalNotification(title, body) {
  if (!notifGranted()) return;
  try {
    new Notification(title, {
      body: body,
      icon: 'icons/icon-192.png',
      badge: 'icons/icon-192.png',
      silent: false
    });
  } catch(e) {}
}

function getSentNotifs() {
  try { return JSON.parse(localStorage.getItem('sentNotificationsByDate') || '{}'); } catch(e) { return {}; }
}
function saveSentNotifs(obj) {
  localStorage.setItem('sentNotificationsByDate', JSON.stringify(obj));
}

function checkScheduledNotifications() {
  if (!notifGranted()) return;
  var d = new Date();
  var today = todayKey();
  var h = d.getHours(), m = d.getMinutes();
  var sent = getSentNotifs();
  if (!sent[today]) sent[today] = [];

  NOTIF_SCHEDULE.forEach(function(n) {
    if (h === n.h && m === n.m && sent[today].indexOf(n.id) < 0) {
      sendLocalNotification(n.title, n.body);
      sent[today].push(n.id);
      saveSentNotifs(sent);
    }
  });

  // Prune old dates (keep only last 7 days)
  var keys = Object.keys(sent);
  if (keys.length > 7) {
    keys.sort();
    keys.slice(0, keys.length - 7).forEach(function(k){ delete sent[k]; });
    saveSentNotifs(sent);
  }
}

function handleNotifToggle() {
  if (!notifSupported()) return;
  if (notifGranted()) {
    // Already granted — toggle off in DATA
    DATA.notificationEnabled = false;
    saveData();
    renderNotifCard();
    return;
  }
  Notification.requestPermission().then(function(result) {
    DATA.notificationEnabled = result === 'granted';
    saveData();
    renderNotifCard();
  });
}

function renderNotifCard() {
  var btn  = document.getElementById('notif-toggle-btn');
  var txt  = document.getElementById('notif-status-text');
  var sched = document.getElementById('notif-schedule');
  if (!btn) return;

  if (!notifSupported()) {
    txt.textContent  = 'Thiết bị này chưa hỗ trợ thông báo PWA.';
    btn.style.display = 'none';
    return;
  }
  if (notifGranted() && DATA.notificationEnabled) {
    txt.textContent  = '✓ Đã bật thông báo';
    txt.style.color  = 'var(--gold)';
    btn.textContent  = 'Tắt thông báo';
    btn.style.color  = 'var(--gray)';
    if (sched) sched.style.display = 'block';
  } else if (Notification.permission === 'denied') {
    txt.textContent = 'Bạn đã từ chối thông báo. Có thể bật lại trong cài đặt trình duyệt / iPhone.';
    txt.style.color = 'var(--gray)';
    btn.style.display = 'none';
    if (sched) sched.style.display = 'none';
  } else {
    txt.textContent = 'Nhận nhắc nhở vào đầu ngày, cuối ngày và khung giờ nguy hiểm.';
    txt.style.color = 'var(--gray)';
    btn.textContent = 'BẬT THÔNG BÁO';
    btn.style.color = '';
    btn.style.display = '';
    if (sched) sched.style.display = 'none';
  }
}

initDay();
renderHome();
startRealtimeTick();
renderNotifCard();
