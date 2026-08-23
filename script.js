'use strict';

/* ─── CONSTANTS ─────────────────────────────────── */
const STORAGE_KEY = 'taskflow_tasks';
const THEME_KEY   = 'taskflow_theme';

/* ─── STATE ──────────────────────────────────────── */
let tasks      = [];
let filter     = 'all';
let searchQ    = '';
let sortMode   = 'newest';
let editingId  = null;

/* ─── INIT ───────────────────────────────────────── */
function init() {
  loadTasks();
  loadTheme();
  setDateChip();
  setDefaultDueDate();
  bindEvents();
  render();
}

/* ─── STORAGE ────────────────────────────────────── */
function loadTasks() {
  try {
    tasks = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch { tasks = []; }
  // Add some sample tasks if empty
  if (!tasks.length) {
    tasks = [
      { id: uid(), text: 'Finish JavaScript To-Do App project', cat: 'Work', priority: 'high', due: todayStr(), done: false, created: Date.now() },
      { id: uid(), text: 'Upload Portfolio to GitHub Pages', cat: 'Study', priority: 'high', due: todayStr(), done: false, created: Date.now()-1000 },
      { id: uid(), text: 'Review HTML5 & CSS3 concepts', cat: 'Study', priority: 'medium', due: '', done: true, created: Date.now()-2000 },
    ];
    saveTasks();
  }
}
function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function todayStr() { return new Date().toISOString().split('T')[0]; }

/* ─── THEME ──────────────────────────────────────── */
function loadTheme() {
  const saved = localStorage.getItem(THEME_KEY) || 'light';
  document.documentElement.dataset.theme = saved;
  document.getElementById('themeBtn').textContent = saved === 'dark' ? '☀️' : '🌙';
}
document.getElementById('themeBtn').addEventListener('click', () => {
  const isDark = document.documentElement.dataset.theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'light' : 'dark';
  document.getElementById('themeBtn').textContent = isDark ? '🌙' : '☀️';
  localStorage.setItem(THEME_KEY, document.documentElement.dataset.theme);
});

/* ─── DATE CHIP ──────────────────────────────────── */
function setDateChip() {
  const d = new Date();
  document.getElementById('dateChip').textContent =
    d.toLocaleDateString('en-US', { weekday:'short', month:'short', day:'numeric', year:'numeric' });
}
function setDefaultDueDate() {
  document.getElementById('dueDate').value = todayStr();
}

/* ─── BIND EVENTS ────────────────────────────────── */
function bindEvents() {
  // Add
  document.getElementById('addBtn').addEventListener('click', addTask);
  document.getElementById('taskInput').addEventListener('keydown', e => { if (e.key === 'Enter') addTask(); });

  // Filter
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filter = btn.dataset.filter;
      render();
    });
  });

  // Search
  document.getElementById('searchInput').addEventListener('input', e => {
    searchQ = e.target.value.toLowerCase();
    render();
  });

  // Sort
  document.getElementById('sortSelect').addEventListener('change', e => {
    sortMode = e.target.value;
    render();
  });

  // Clear done
  document.getElementById('clearDoneBtn').addEventListener('click', () => {
    const before = tasks.length;
    tasks = tasks.filter(t => !t.done);
    saveTasks();
    render();
    toast(`🗑 Cleared ${before - tasks.length} completed tasks`, 'info');
  });

  // Edit modal close
  document.getElementById('modalClose').addEventListener('click', closeModal);
  document.getElementById('cancelEdit').addEventListener('click', closeModal);
  document.getElementById('saveEdit').addEventListener('click', saveEdit);
  document.getElementById('editModal').addEventListener('click', e => {
    if (e.target === document.getElementById('editModal')) closeModal();
  });
  document.getElementById('editInput').addEventListener('keydown', e => { if (e.key === 'Enter') saveEdit(); });
}

/* ─── ADD TASK ───────────────────────────────────── */
function addTask() {
  const text = document.getElementById('taskInput').value.trim();
  if (!text) { toast('Please enter a task!', 'error'); document.getElementById('taskInput').focus(); return; }
  const task = {
    id:       uid(),
    text,
    cat:      document.getElementById('catSelect').value,
    priority: document.getElementById('prioritySelect').value,
    due:      document.getElementById('dueDate').value,
    done:     false,
    created:  Date.now(),
  };
  tasks.unshift(task);
  saveTasks();
  document.getElementById('taskInput').value = '';
  render();
  toast(`✅ Task added: "${text.slice(0,30)}${text.length>30?'...':''}"`, 'success');
}

/* ─── TOGGLE DONE ────────────────────────────────── */
function toggleDone(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks();
  render();
  toast(task.done ? '🎉 Task completed!' : '↩️ Task marked as pending', task.done ? 'success' : 'info');
}

/* ─── DELETE TASK ────────────────────────────────── */
function deleteTask(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  if (!confirm(`Delete "${task.text}"?`)) return;
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
  toast('🗑 Task deleted', 'error');
}

/* ─── EDIT MODAL ─────────────────────────────────── */
function openEdit(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingId = id;
  document.getElementById('editInput').value      = task.text;
  document.getElementById('editCat').value        = task.cat;
  document.getElementById('editPriority').value   = task.priority;
  document.getElementById('editDue').value        = task.due;
  document.getElementById('editModal').classList.add('open');
  document.getElementById('editInput').focus();
}
function closeModal() {
  document.getElementById('editModal').classList.remove('open');
  editingId = null;
}
function saveEdit() {
  if (!editingId) return;
  const text = document.getElementById('editInput').value.trim();
  if (!text) { toast('Task cannot be empty!', 'error'); return; }
  const task = tasks.find(t => t.id === editingId);
  if (!task) return;
  task.text     = text;
  task.cat      = document.getElementById('editCat').value;
  task.priority = document.getElementById('editPriority').value;
  task.due      = document.getElementById('editDue').value;
  saveTasks();
  closeModal();
  render();
  toast('✏️ Task updated!', 'success');
}

/* ─── FILTER & SORT ──────────────────────────────── */
function getFiltered() {
  let arr = [...tasks];
  const today = todayStr();

  if (filter === 'pending') arr = arr.filter(t => !t.done);
  if (filter === 'done')    arr = arr.filter(t => t.done);
  if (filter === 'high')    arr = arr.filter(t => t.priority === 'high');
  if (filter === 'today')   arr = arr.filter(t => t.due === today);

  if (searchQ) arr = arr.filter(t =>
    t.text.toLowerCase().includes(searchQ) ||
    t.cat.toLowerCase().includes(searchQ)
  );

  const pOrder = { high:0, medium:1, low:2 };
  if (sortMode === 'newest')   arr.sort((a,b) => b.created - a.created);
  if (sortMode === 'oldest')   arr.sort((a,b) => a.created - b.created);
  if (sortMode === 'priority') arr.sort((a,b) => pOrder[a.priority] - pOrder[b.priority]);
  if (sortMode === 'due')      arr.sort((a,b) => (a.due||'z').localeCompare(b.due||'z'));
  if (sortMode === 'alpha')    arr.sort((a,b) => a.text.localeCompare(b.text));

  return arr;
}

/* ─── RENDER ─────────────────────────────────────── */
function render() {
  updateStats();
  updateProgress();
  renderTasks();
}

function updateStats() {
  const total   = tasks.length;
  const done    = tasks.filter(t => t.done).length;
  const pending = total - done;
  const high    = tasks.filter(t => t.priority === 'high' && !t.done).length;
  document.getElementById('statTotal').textContent   = total;
  document.getElementById('statPending').textContent = pending;
  document.getElementById('statDone').textContent    = done;
  document.getElementById('statHigh').textContent    = high;
}

function updateProgress() {
  const total = tasks.length;
  const done  = tasks.filter(t => t.done).length;
  const pct   = total ? Math.round((done/total)*100) : 0;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressPct').textContent  = pct + '%';
}

function renderTasks() {
  const wrap = document.getElementById('taskListWrap');
  const arr  = getFiltered();
  const today = todayStr();

  if (!arr.length) {
    wrap.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">${searchQ ? '🔍' : filter === 'done' ? '🎉' : '📋'}</div>
        <h3>${searchQ ? 'No matching tasks' : filter === 'done' ? 'No completed tasks yet' : 'No tasks here!'}</h3>
        <p>${searchQ ? 'Try a different search term.' : filter === 'done' ? 'Complete a task to see it here.' : 'Add a task above to get started.'}</p>
      </div>`;
    return;
  }

  const pending   = arr.filter(t => !t.done);
  const completed = arr.filter(t => t.done);

  let html = '';

  if (pending.length) {
    html += `<div class="section-head">Pending (${pending.length})</div>`;
    html += `<div class="tasks-list">${pending.map(t => taskHTML(t, today)).join('')}</div>`;
  }
  if (completed.length) {
    html += `<div class="section-head" style="margin-top:24px">Completed (${completed.length})</div>`;
    html += `<div class="tasks-list">${completed.map(t => taskHTML(t, today)).join('')}</div>`;
  }

  wrap.innerHTML = html;

  // Bind task events
  wrap.querySelectorAll('.task-check').forEach(el => {
    el.addEventListener('click', () => toggleDone(el.dataset.id));
  });
  wrap.querySelectorAll('.btn-edit').forEach(el => {
    el.addEventListener('click', () => openEdit(el.dataset.id));
  });
  wrap.querySelectorAll('.btn-del').forEach(el => {
    el.addEventListener('click', () => deleteTask(el.dataset.id));
  });
}

function taskHTML(t, today) {
  const isOverdue = t.due && t.due < today && !t.done;
  const dueTxt    = t.due ? formatDate(t.due) : '';
  const pBadge    = `<span class="priority-badge badge-${t.priority}">${t.priority.charAt(0).toUpperCase() + t.priority.slice(1)}</span>`;
  return `
    <div class="task-item priority-${t.priority} ${t.done ? 'done' : ''}">
      <div class="task-check ${t.done ? 'checked' : ''}" data-id="${t.id}"></div>
      <div class="task-body">
        <div class="task-text">${escHtml(t.text)}</div>
        <div class="task-meta">
          <span class="task-cat">${t.cat}</span>
          ${pBadge}
          ${dueTxt ? `<span class="task-due ${isOverdue ? 'overdue' : ''}">📅 ${dueTxt}${isOverdue ? ' (Overdue!)' : ''}</span>` : ''}
        </div>
      </div>
      <div class="task-actions">
        <button class="action-btn btn-edit" data-id="${t.id}" title="Edit">✏️</button>
        <button class="action-btn btn-del" data-id="${t.id}" title="Delete">🗑</button>
      </div>
    </div>`;
}

function formatDate(str) {
  const d = new Date(str + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}
function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

/* ─── TOAST ──────────────────────────────────────── */
function toast(msg, type = 'success') {
  const icons = { success:'✅', error:'❌', info:'ℹ️' };
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `<span>${icons[type]||'ℹ️'}</span> <span>${msg}</span>`;
  document.getElementById('toastWrap').appendChild(el);
  setTimeout(() => {
    el.style.animation = 'toastOut 0.3s ease forwards';
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

/* ─── START ──────────────────────────────────────── */
init();