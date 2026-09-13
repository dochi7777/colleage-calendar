const today = new Date();
const dateKey = localDate(today);
const defaultPlans = [
  { id: 1, type: '수업', title: '서비스 디자인', date: dateKey, time: '09:00', note: '새빛관 302호', day: 1, start: 1, span: 2, tone: 'blue' },
  { id: 2, type: '수업', title: '마케팅 원론', date: dateKey, time: '13:00', note: '경영관 B101', day: 1, start: 5, span: 2, tone: 'pink' },
  { id: 3, type: '동아리', title: '사진 동아리 정기모임', date: dateKey, time: '18:30', note: '학생회관 2층' },
  { id: 4, type: '과제', title: 'UX 리서치 보고서', date: offsetDate(1), time: '23:59', note: '서비스 디자인', done: false },
  { id: 5, type: '과제', title: '영문 에세이 초안', date: offsetDate(3), time: '18:00', note: '대학영어', done: false },
  { id: 6, type: '과제', title: '팀플 발표자료', date: offsetDate(6), time: '20:00', note: '마케팅 원론', done: true },
  { id: 7, type: '대외활동', title: '그린 캠퍼스 서포터즈', date: offsetDate(5), time: '14:00', note: '온라인 면접', status: '지원 완료' },
  { id: 8, type: '대외활동', title: '청년 디자인 공모전', date: offsetDate(12), time: '18:00', note: '포트폴리오 제출', status: '준비 중' },
  { id: 9, type: '동아리', title: '출사 장소 답사', date: offsetDate(4), time: '16:00', note: '서울숲 정문' },
  { id: 10, type: '수업', title: '대학영어', date: offsetDate(2), time: '11:00', note: '인문관 204호', day: 3, start: 3, span: 2, tone: 'yellow' },
  { id: 11, type: '수업', title: '데이터 리터러시', date: offsetDate(4), time: '15:00', note: '미래관 505호', day: 5, start: 7, span: 2, tone: 'mint' }
];

let plans = JSON.parse(localStorage.getItem('monglePlans') || 'null') || defaultPlans;
const modal = document.getElementById('modalBackdrop');
const form = document.getElementById('planForm');
const typeSelect = document.getElementById('planType');

function localDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function offsetDate(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return localDate(d);
}

function prettyDate(value, withWeekday = false) {
  const d = new Date(`${value}T00:00:00`);
  return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', ...(withWeekday ? { weekday: 'short' } : {}) }).format(d);
}

function save() { localStorage.setItem('monglePlans', JSON.stringify(plans)); }

function goTo(viewId) {
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === viewId));
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === viewId));
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.querySelectorAll('.nav-item').forEach(button => button.addEventListener('click', () => goTo(button.dataset.view)));
document.querySelectorAll('[data-go]').forEach(button => button.addEventListener('click', () => goTo(button.dataset.go)));

function updateClassFields() {
  document.getElementById('classFields').hidden = typeSelect.value !== '수업';
}

function openModal(type, planId = null) {
  form.reset();
  const plan = planId === null ? null : plans.find(item => item.id === Number(planId));
  document.getElementById('editId').value = plan ? plan.id : '';
  document.getElementById('modalLabel').textContent = plan ? 'EDIT PLAN' : 'NEW PLAN';
  document.getElementById('modalTitle').textContent = plan ? '일정 수정' : '새 일정 추가';
  document.querySelector('.submit-button').textContent = plan ? '수정 내용 저장하기' : '일정 저장하기';
  typeSelect.value = plan?.type || type || '수업';
  document.getElementById('planTitle').value = plan?.title || '';
  document.getElementById('planDate').value = plan?.date || dateKey;
  document.getElementById('planTime').value = plan?.time || '12:00';
  document.getElementById('planNote').value = plan?.note === '메모 없음' ? '' : plan?.note || '';
  document.getElementById('planDay').value = String(plan?.day || 1);
  document.getElementById('planDuration').value = String(plan?.span || 2);
  updateClassFields();
  modal.hidden = false;
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('planTitle').focus(), 40);
}

function closeModal() {
  modal.hidden = true;
  document.body.style.overflow = '';
  form.reset();
  document.getElementById('editId').value = '';
}

document.querySelectorAll('[data-open-modal]').forEach(button => button.addEventListener('click', () => openModal(button.dataset.type)));
typeSelect.addEventListener('change', updateClassFields);
document.getElementById('modalClose').addEventListener('click', closeModal);
modal.addEventListener('click', event => { if (event.target === modal) closeModal(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && !modal.hidden) closeModal(); });

form.addEventListener('submit', event => {
  event.preventDefault();
  const editId = Number(document.getElementById('editId').value);
  const existing = plans.find(item => item.id === editId);
  const type = typeSelect.value;
  const time = document.getElementById('planTime').value;
  const duration = Number(document.getElementById('planDuration').value || 2);
  const start = Math.max(1, Math.min(10, Number(time.slice(0, 2)) - 8));
  const updated = {
    ...(existing || {}),
    id: existing?.id || Date.now(),
    type,
    title: document.getElementById('planTitle').value.trim(),
    date: document.getElementById('planDate').value,
    time,
    note: document.getElementById('planNote').value.trim() || '메모 없음',
    done: existing?.done || false,
    status: type === '대외활동' ? existing?.status || '준비 중' : undefined
  };
  if (type === '수업') {
    updated.day = Number(document.getElementById('planDay').value);
    updated.start = start;
    updated.span = Math.min(duration, 11 - start);
    updated.tone = existing?.tone || ['blue', 'pink', 'yellow', 'mint'][plans.filter(item => item.type === '수업').length % 4];
  } else {
    delete updated.day; delete updated.start; delete updated.span; delete updated.tone;
  }
  if (existing) plans = plans.map(item => item.id === editId ? updated : item);
  else plans.push(updated);
  save(); renderAll(); closeModal(); showToast(existing ? '일정을 수정했어요!' : '일정을 저장했어요!');
});

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
}

function setDates() {
  const format = new Intl.DateTimeFormat('ko-KR', { year:'numeric', month:'long', day:'numeric', weekday:'long' });
  document.getElementById('todayDate').textContent = format.format(today);
  document.getElementById('dateChip').textContent = new Intl.DateTimeFormat('ko-KR', { month:'long', day:'numeric', weekday:'short' }).format(today);
  const hour = today.getHours();
  document.getElementById('greeting').textContent = hour < 12 ? '좋은 아침!' : hour < 18 ? '포근한 오후예요!' : '오늘도 수고했어요!';
}

function actionButtons(planId, compact = false) {
  return `<span class="item-actions${compact ? ' class-actions' : ''}"><button class="icon-button" type="button" data-edit="${planId}" aria-label="수정">수</button><button class="icon-button delete" type="button" data-delete="${planId}" aria-label="삭제">삭</button></span>`;
}

function renderToday() {
  const todays = plans.filter(plan => plan.date === dateKey && ['수업','동아리','대외활동'].includes(plan.type)).sort((a,b) => a.time.localeCompare(b.time));
  document.getElementById('todayTimeline').innerHTML = todays.length ? todays.map(plan => `
    <div class="timeline-item"><span class="timeline-time">${plan.time}</span><span class="timeline-line"></span><div class="timeline-content"><strong>${escapeHtml(plan.title)}</strong><span>${escapeHtml(plan.note)} · ${plan.type}</span></div>${actionButtons(plan.id)}</div>`).join('') : '<p class="empty-copy">오늘은 등록된 일정이 없어요. 천천히 하루를 채워보세요.</p>';
  const upcoming = plans.filter(plan => plan.type === '과제').sort((a,b) => a.date.localeCompare(b.date)).slice(0, 3);
  document.getElementById('assignmentPreview').innerHTML = upcoming.length ? upcoming.map(plan => `
    <div class="assignment-item ${plan.done ? 'done' : ''}"><input id="preview-${plan.id}" type="checkbox" data-toggle="${plan.id}" ${plan.done ? 'checked' : ''} aria-label="${escapeHtml(plan.title)} 완료"/><label for="preview-${plan.id}"><strong>${escapeHtml(plan.title)}</strong><small>${escapeHtml(plan.note)}</small></label><span class="due">${plan.done ? '완료' : prettyDate(plan.date)}</span>${actionButtons(plan.id)}</div>`).join('') : '<p class="empty-copy">등록된 과제가 없어요!</p>';
}

function renderSchedule() {
  const days = ['시간','월','화','수','목','금'];
  let html = days.map(day => `<div class="schedule-head">${day}</div>`).join('');
  for (let hour=9; hour<19; hour++) html += `<div class="time-cell" style="grid-column:1;grid-row:${hour-7}">${String(hour).padStart(2,'0')}:00</div>`;
  for (let row=2; row<=11; row++) for (let col=2; col<=6; col++) html += `<div class="schedule-cell" style="grid-column:${col};grid-row:${row}"></div>`;
  html += plans.filter(plan => plan.type === '수업').map((plan,index) => {
    const day = plan.day || ((index % 5) + 1);
    const start = plan.start || Math.max(1, Math.min(10, Number(plan.time?.slice(0,2) || 9) - 8));
    const span = plan.span || 2;
    const tone = plan.tone || ['blue','pink','yellow','mint'][index%4];
    return `<div class="class-block tone-${tone}" style="grid-column:${day+1};grid-row:${start+1}/span ${span}"><strong>${escapeHtml(plan.title)}</strong>${escapeHtml(plan.note)}${actionButtons(plan.id, true)}</div>`;
  }).join('');
  document.getElementById('scheduleGrid').innerHTML = html;
}

function renderCards() {
  const activities = plans.filter(plan => plan.type === '대외활동').sort((a,b) => a.date.localeCompare(b.date));
  document.getElementById('activityGrid').innerHTML = activities.map(plan => activityCard(plan, '대외활동')).join('') + emptyCard('새로운 도전을 기록해보세요');
  const clubs = plans.filter(plan => plan.type === '동아리').sort((a,b) => a.date.localeCompare(b.date));
  document.getElementById('clubGrid').innerHTML = clubs.map(plan => activityCard(plan, '동아리')).join('') + emptyCard('다음 동아리 일정을 추가해보세요');
}

function activityCard(plan, type) {
  return `<article class="panel activity-card"><span class="tag">${type}</span><h2>${escapeHtml(plan.title)}</h2><p>${escapeHtml(plan.note)}</p><div class="activity-meta"><span>${prettyDate(plan.date,true)} · ${plan.time}</span><span>${plan.status || '예정'}</span></div>${actionButtons(plan.id)}<span class="sewn-button ${type === '동아리' ? 'pink-button' : 'sky-button'}" aria-hidden="true"></span></article>`;
}

function emptyCard(text) { return `<button class="panel empty-card" data-empty-add><span>＋<br />${text}</span></button>`; }

function renderAssignments() {
  const tasks = plans.filter(plan => plan.type === '과제').sort((a,b) => a.date.localeCompare(b.date));
  const done = tasks.filter(plan => plan.done).length;
  const percent = tasks.length ? Math.round(done / tasks.length * 100) : 0;
  document.getElementById('remainingCount').textContent = tasks.length - done;
  document.getElementById('donePercent').textContent = `${percent}%`;
  document.getElementById('taskProgress').style.width = `${percent}%`;
  document.getElementById('assignmentBoard').innerHTML = `<div class="task-group"><h3>진행 중</h3>${taskRows(tasks.filter(plan => !plan.done)) || '<p>모든 과제를 마쳤어요!</p>'}</div><div class="task-group"><h3>완료</h3>${taskRows(tasks.filter(plan => plan.done)) || '<p>아직 완료한 과제가 없어요.</p>'}</div>`;
}

function taskRows(items) {
  return items.map(plan => `<div class="task-row ${plan.done ? 'done' : ''}"><input id="task-${plan.id}" type="checkbox" data-toggle="${plan.id}" ${plan.done ? 'checked' : ''} aria-label="${escapeHtml(plan.title)} 완료"/><label for="task-${plan.id}"><strong>${escapeHtml(plan.title)}</strong></label><span>${escapeHtml(plan.note)} · ${prettyDate(plan.date)}</span>${actionButtons(plan.id)}</div>`).join('');
}

function deletePlan(planId) {
  const plan = plans.find(item => item.id === Number(planId));
  if (!plan || !window.confirm(`‘${plan.title}’ 일정을 삭제할까요?`)) return;
  plans = plans.filter(item => item.id !== Number(planId));
  save(); renderAll(); showToast('일정을 삭제했어요.');
}

function bindDynamicEvents() {
  document.querySelectorAll('[data-toggle]').forEach(input => input.addEventListener('change', () => {
    const item = plans.find(plan => plan.id === Number(input.dataset.toggle));
    if (item) item.done = input.checked;
    save(); renderAll(); showToast(input.checked ? '과제를 완료했어요!' : '다시 진행 중으로 옮겼어요.');
  }));
  document.querySelectorAll('[data-edit]').forEach(button => button.addEventListener('click', () => openModal(null, button.dataset.edit)));
  document.querySelectorAll('[data-delete]').forEach(button => button.addEventListener('click', () => deletePlan(button.dataset.delete)));
  document.querySelectorAll('[data-empty-add]').forEach(button => button.addEventListener('click', () => openModal(button.closest('#clubGrid') ? '동아리' : '대외활동')));
}

function escapeHtml(str = '') {
  return String(str).replace(/[&<>'"]/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' }[character]));
}

function renderAll() { renderToday(); renderSchedule(); renderCards(); renderAssignments(); bindDynamicEvents(); }

document.getElementById('clubMemo').value = localStorage.getItem('clubMemo') || '';
document.getElementById('clubMemo').addEventListener('input', event => localStorage.setItem('clubMemo', event.target.value));
document.getElementById('settingsButton').addEventListener('click', () => { document.body.classList.toggle('cozy'); showToast('카드 모양을 바꿨어요.'); });

setDates(); renderAll();
