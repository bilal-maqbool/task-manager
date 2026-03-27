// ─── Configuration ──────────────────────────────────────────
const API_BASE = 'http://localhost:5000/api'; // Change this to your backend URL

// ─── Auth Guard ──────────────────────────────────────────────
const token = localStorage.getItem('token');
const user  = JSON.parse(localStorage.getItem('user') || 'null');

if (!token || !user) {
  window.location.href = 'index.html';
}

// ─── Theme ───────────────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  const current = html.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  document.getElementById('theme-icon').textContent = next === 'dark' ? '☀️' : '🌙';
}

function initTheme() {
  const saved = localStorage.getItem('theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  document.getElementById('theme-icon').textContent = saved === 'dark' ? '☀️' : '🌙';
}

// ─── Sidebar (Mobile) ────────────────────────────────────────
function openSidebar() {
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('sidebar-overlay').classList.add('open');
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebar-overlay').classList.remove('open');
}

// ─── Toast Notification ──────────────────────────────────────
let toastTimeout;
function showToast(msg, type = 'success') {
  const toast = document.getElementById('toast');
  const icon  = document.getElementById('toast-icon');
  const text  = document.getElementById('toast-msg');

  icon.textContent = type === 'success' ? '✅' : '❌';
  text.textContent = msg;
  toast.className  = `toast ${type} show`;

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => { toast.className = 'toast'; }, 3000);
}

// ─── Update Stats Cards ──────────────────────────────────────
function updateStats(stats) {
  document.getElementById('stat-total').textContent   = stats.total    || 0;
  document.getElementById('stat-pending').textContent = stats.pending  || 0;
  document.getElementById('stat-progress').textContent = stats.inProgress || 0;
  document.getElementById('stat-done').textContent    = stats.completed || 0;
}

// ─── Filter by Status from Sidebar ───────────────────────────
function filterByStatus(status) {
  document.getElementById('filter-status').value = status;
  loadTasks();
  closeSidebar();
  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  event.currentTarget.classList.add('active');
}

function showSection(section) {
  document.getElementById('filter-status').value = 'all';
  loadTasks();
  closeSidebar();
}

// ─── Logout ──────────────────────────────────────────────────
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// ─── Fetch Wrapper with Auth ─────────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  });

  // If unauthorized, redirect to login
  if (res.status === 401) {
    logout();
    return;
  }

  return res.json();
}

// ─── Initialize Dashboard ────────────────────────────────────
function initDashboard() {
  initTheme();

  // Fill user info in sidebar
  if (user) {
    document.getElementById('sidebar-name').textContent  = user.name;
    document.getElementById('sidebar-email').textContent = user.email;
    document.getElementById('sidebar-avatar').textContent = user.name.charAt(0).toUpperCase();
  }

  // Set date subtitle
  const now  = new Date();
  const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  document.getElementById('page-date').textContent = now.toLocaleDateString('en-US', opts);

  // Load tasks
  loadTasks();
}

initDashboard();
