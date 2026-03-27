// ─── Task State ──────────────────────────────────────────────
let searchTimeout;

// ─── Load Tasks ──────────────────────────────────────────────
async function loadTasks() {
  const status   = document.getElementById('filter-status').value;
  const priority = document.getElementById('filter-priority').value;
  const sort     = document.getElementById('filter-sort').value;
  const search   = document.getElementById('search-input').value.trim();

  // Build query string
  const params = new URLSearchParams();
  if (status !== 'all')   params.append('status', status);
  if (priority !== 'all') params.append('priority', priority);
  if (sort)               params.append('sort', sort);
  if (search)             params.append('search', search);

  const list = document.getElementById('tasks-list');
  list.innerHTML = '<div class="empty-state"><div class="empty-icon">⏳</div><h3>Loading...</h3></div>';

  try {
    const data = await apiFetch(`/tasks?${params.toString()}`);
    if (!data) return;

    updateStats(data.stats || {});
    renderTasks(data.tasks || []);
  } catch (err) {
    list.innerHTML = `<div class="empty-state"><div class="empty-icon">❌</div><h3>Failed to load tasks</h3><p>${err.message}</p></div>`;
  }
}

// ─── Handle Search (debounced) ───────────────────────────────
function handleSearch() {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(loadTasks, 400);
}

// ─── Render Tasks ────────────────────────────────────────────
function renderTasks(tasks) {
  const list = document.getElementById('tasks-list');

  if (!tasks.length) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📭</div>
        <h3>No tasks found</h3>
        <p>Add a new task or change your filters</p>
      </div>`;
    return;
  }

  list.innerHTML = tasks.map(task => createTaskCard(task)).join('');
}

// ─── Create Task Card HTML ────────────────────────────────────
function createTaskCard(task) {
  const isCompleted = task.status === 'completed';
  const checkIcon   = isCompleted ? '✓' : '';
  const checkClass  = isCompleted ? 'checked' : '';
  const cardClass   = isCompleted ? 'completed-card' : '';

  // Due date formatting
  let dueHtml = '';
  if (task.dueDate) {
    const due     = new Date(task.dueDate);
    const today   = new Date();
    const isOver  = due < today && !isCompleted;
    const dueStr  = due.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    dueHtml = `<span class="task-due ${isOver ? 'overdue' : ''}">📅 ${isOver ? '⚠ ' : ''}${dueStr}</span>`;
  }

  return `
    <div class="task-card ${cardClass}" id="task-${task._id}">
      <div class="task-checkbox ${checkClass}" onclick="toggleComplete('${task._id}')" title="Mark complete">
        ${checkIcon ? `<span style="color:white;font-size:13px;font-weight:bold;">${checkIcon}</span>` : ''}
      </div>
      <div class="task-body">
        <div class="task-title">${escapeHtml(task.title)}</div>
        ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ''}
        <div class="task-meta">
          <span class="badge badge-priority-${task.priority}">${task.priority}</span>
          <span class="badge badge-status-${task.status}">${task.status}</span>
          <span class="badge badge-cat">${task.category}</span>
          ${dueHtml}
        </div>
      </div>
      <div class="task-actions">
        <button class="btn-icon" onclick="openEditModal('${task._id}')" title="Edit">✏️</button>
        <button class="btn-icon delete" onclick="deleteTask('${task._id}')" title="Delete">🗑️</button>
      </div>
    </div>`;
}

// ─── Escape HTML (security) ───────────────────────────────────
function escapeHtml(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str || ''));
  return div.innerHTML;
}

// ─── Toggle Complete ──────────────────────────────────────────
async function toggleComplete(taskId) {
  try {
    const data = await apiFetch(`/tasks/${taskId}/complete`, { method: 'PATCH' });
    if (data && data.success) {
      showToast(data.task.status === 'completed' ? 'Task completed! 🎉' : 'Task marked pending');
      loadTasks();
    }
  } catch (err) {
    showToast('Failed to update task', 'error');
  }
}

// ─── Delete Task ─────────────────────────────────────────────
async function deleteTask(taskId) {
  if (!confirm('Delete this task? This cannot be undone.')) return;
  try {
    const data = await apiFetch(`/tasks/${taskId}`, { method: 'DELETE' });
    if (data && data.success) {
      showToast('Task deleted');
      loadTasks();
    }
  } catch (err) {
    showToast('Failed to delete task', 'error');
  }
}

// ─── Add Modal ────────────────────────────────────────────────
function openAddModal() {
  document.getElementById('modal-title').textContent     = 'Add New Task';
  document.getElementById('modal-submit-btn').textContent = 'Add Task';
  document.getElementById('task-id').value    = '';
  document.getElementById('task-title').value  = '';
  document.getElementById('task-desc').value   = '';
  document.getElementById('task-priority').value = 'medium';
  document.getElementById('task-category').value = 'other';
  document.getElementById('task-due').value    = '';
  document.getElementById('status-group').style.display = 'none';
  document.getElementById('task-modal').classList.add('open');
}

// ─── Edit Modal ───────────────────────────────────────────────
async function openEditModal(taskId) {
  try {
    const data = await apiFetch(`/tasks/${taskId}`);
    if (!data || !data.task) return;

    const task = data.task;
    document.getElementById('modal-title').textContent      = 'Edit Task';
    document.getElementById('modal-submit-btn').textContent = 'Save Changes';
    document.getElementById('task-id').value       = task._id;
    document.getElementById('task-title').value    = task.title;
    document.getElementById('task-desc').value     = task.description || '';
    document.getElementById('task-priority').value = task.priority;
    document.getElementById('task-category').value = task.category;
    document.getElementById('task-status').value   = task.status;
    document.getElementById('status-group').style.display = 'block';

    if (task.dueDate) {
      document.getElementById('task-due').value = new Date(task.dueDate).toISOString().split('T')[0];
    } else {
      document.getElementById('task-due').value = '';
    }

    document.getElementById('task-modal').classList.add('open');
  } catch (err) {
    showToast('Failed to load task', 'error');
  }
}

// ─── Close Modal ─────────────────────────────────────────────
function closeModal() {
  document.getElementById('task-modal').classList.remove('open');
}

// Close modal on overlay click
document.getElementById('task-modal').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// ─── Submit Task (Add or Edit) ───────────────────────────────
async function handleTaskSubmit(event) {
  event.preventDefault();

  const taskId   = document.getElementById('task-id').value;
  const isEdit   = !!taskId;
  const submitBtn = document.getElementById('modal-submit-btn');

  submitBtn.disabled    = true;
  submitBtn.textContent = isEdit ? 'Saving...' : 'Adding...';

  const payload = {
    title:       document.getElementById('task-title').value.trim(),
    description: document.getElementById('task-desc').value.trim(),
    priority:    document.getElementById('task-priority').value,
    category:    document.getElementById('task-category').value,
    dueDate:     document.getElementById('task-due').value || null,
  };

  if (isEdit) {
    payload.status = document.getElementById('task-status').value;
  }

  try {
    const endpoint = isEdit ? `/tasks/${taskId}` : '/tasks';
    const method   = isEdit ? 'PUT' : 'POST';

    const data = await apiFetch(endpoint, {
      method,
      body: JSON.stringify(payload)
    });

    if (data && data.success) {
      showToast(isEdit ? 'Task updated! ✏️' : 'Task added! ✅');
      closeModal();
      loadTasks();
    } else {
      showToast(data?.message || 'Something went wrong', 'error');
    }
  } catch (err) {
    showToast('Failed to save task', 'error');
  } finally {
    submitBtn.disabled    = false;
    submitBtn.textContent = isEdit ? 'Save Changes' : 'Add Task';
  }
}
