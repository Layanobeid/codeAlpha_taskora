// frontend/js/kanban.js
let currentProjectFilter = '';
let allProjects = [];

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Update user info
    const userNameEl = document.getElementById('userName');
    const userAvatarEl = document.getElementById('userAvatar');
    
    if (userNameEl && user.name) {
        userNameEl.textContent = user.name;
    }
    
    if (userAvatarEl && user.name) {
        userAvatarEl.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`;
    }

    // ===== DARK MODE =====
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);
            this.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        });
    }

    // Load saved theme
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    // Load projects and tasks
    loadProjectsForFilter();
    loadKanbanData();

    // Project filter - تأكد من وجود العنصر قبل إضافة الـ Listener
    const projectFilter = document.getElementById('projectFilter');
    if (projectFilter) {
        projectFilter.addEventListener('change', function() {
            currentProjectFilter = this.value;
            loadKanbanData();
        });
    }

    // Create Task Modal
    const modal = document.getElementById('taskModal');
    const createBtn = document.getElementById('createTaskBtn');
    const closeBtn = document.querySelector('.close');

    if (createBtn) {
        createBtn.addEventListener('click', function() {
            loadProjectsForSelect();
            if (modal) modal.classList.add('show');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            if (modal) modal.classList.remove('show');
        });
    }
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) modal.classList.remove('show');
        });
    }

    // Create Task Form
    const form = document.getElementById('createTaskForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const title = document.getElementById('taskTitle').value;
            const description = document.getElementById('taskDescription').value;
            const projectId = document.getElementById('taskProject').value;
            const priority = document.getElementById('taskPriority').value;
            const deadline = document.getElementById('taskDeadline').value;

            if (!title) {
                alert('Please enter a task title');
                return;
            }

            if (!projectId) {
                alert('Please select a project');
                return;
            }

            try {
                const response = await window.TaskoraAPI.createTask(token, {
                    title,
                    description,
                    projectId,
                    priority,
                    deadline
                });

                if (response.success) {
                    if (modal) modal.classList.remove('show');
                    form.reset();
                    loadKanbanData();
                }
            } catch (error) {
                alert('Error creating task: ' + error.message);
            }
        });
    }
});

async function loadProjectsForFilter() {
    const token = localStorage.getItem('token');
    const select = document.getElementById('projectFilter');

    // إذا ما في عنصر filter، اخرج من الدالة
    if (!select) {
        console.log('Project filter not found, skipping...');
        return;
    }

    try {
        const response = await window.TaskoraAPI.getProjects(token);
        allProjects = response.data || [];

        select.innerHTML = `<option value="">All Projects</option>` + 
            allProjects.map(p => `<option value="${p._id}">${p.title}</option>`).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}

async function loadProjectsForSelect() {
    const token = localStorage.getItem('token');
    const select = document.getElementById('taskProject');

    if (!select) return;

    try {
        const response = await window.TaskoraAPI.getProjects(token);
        const projects = response.data || [];

        select.innerHTML = projects.map(p => 
            `<option value="${p._id}">${p.title}</option>`
        ).join('');
    } catch (error) {
        console.error('Error loading projects:', error);
    }
}



async function loadKanbanData() {
    const token = localStorage.getItem('token');
    const filters = {};
    
    if (currentProjectFilter) {
        filters.projectId = currentProjectFilter;
    }

    try {
        const response = await window.TaskoraAPI.getTasks(token, filters);
        const tasks = response.data || [];

        // Group tasks by status
        const columns = {
            'To Do': [],
            'In Progress': [],
            'Review': [],
            'Done': []
        };

        tasks.forEach(task => {
            if (columns[task.status]) {
                columns[task.status].push(task);
            } else {
                columns['To Do'].push(task);
            }
        });

        // Render each column
        renderColumn('todoTasks', columns['To Do'], 'To Do');
        renderColumn('inProgressTasks', columns['In Progress'], 'In Progress');
        renderColumn('reviewTasks', columns['Review'], 'Review');
        renderColumn('doneTasks', columns['Done'], 'Done');

        // Update counts
        updateColumnCounts();

    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function renderColumn(containerId, tasks, status) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (tasks.length === 0) {
        container.innerHTML = `
            <div class="empty-column" style="text-align: center; color: var(--gray-400); padding: 20px; font-size: 14px;">
                <i class="fas fa-plus-circle" style="font-size: 24px; display: block; margin-bottom: 8px;"></i>
                No tasks
            </div>
        `;
        return;
    }

    container.innerHTML = tasks.map(task => `
        <div class="kanban-card" draggable="true" data-task-id="${task._id}">
            <h4>${task.title}</h4>
            <p style="font-size: 13px; color: var(--gray-500); margin-bottom: 8px;">${task.description || ''}</p>
            <div class="kanban-meta">
                <span class="kanban-priority" style="background: ${getPriorityColor(task.priority)}; color: white;">
                    ${task.priority || 'Medium'}
                </span>
                <span style="font-size: 12px; color: var(--gray-400);">
                    ${task.assignedTo?.length || 0} assigned
                </span>
                <button onclick="moveTask('${task._id}', '${status}')" style="background: none; border: none; cursor: pointer; color: var(--gray-400);">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
        </div>
    `).join('');

    // Add drag and drop listeners
    container.querySelectorAll('.kanban-card').forEach(card => {
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });

    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
}

function getPriorityColor(priority) {
    const colors = {
        'Low': '#6b7280',
        'Medium': '#f59e0b',
        'High': '#ef4444',
        'Urgent': '#b91c1c'
    };
    return colors[priority] || '#6b7280';
}

function updateColumnCounts() {
    document.querySelectorAll('.kanban-column').forEach(column => {
        const tasks = column.querySelectorAll('.kanban-card').length;
        const count = column.querySelector('.task-count');
        if (count) count.textContent = tasks;
    });
}

// Drag and Drop
let draggedTaskId = null;

function handleDragStart(e) {
    draggedTaskId = e.target.dataset.taskId;
    e.target.style.opacity = '0.5';
}

function handleDragEnd(e) {
    e.target.style.opacity = '1';
}

function handleDragOver(e) {
    e.preventDefault();
}

async function handleDrop(e) {
    e.preventDefault();
    const column = e.target.closest('.kanban-column');
    if (!column || !draggedTaskId) return;

    const newStatus = column.dataset.status;
    const token = localStorage.getItem('token');

    try {
        await window.TaskoraAPI.updateTaskStatus(token, draggedTaskId, newStatus);
        loadKanbanData(); // Reload
    } catch (error) {
        alert('Error moving task: ' + error.message);
    }
}

async function moveTask(taskId, currentStatus) {
    const statusOrder = ['To Do', 'In Progress', 'Review', 'Done'];
    const currentIndex = statusOrder.indexOf(currentStatus);
    const nextIndex = currentIndex + 1;

    if (nextIndex >= statusOrder.length) {
        alert('Task is already in Done status');
        return;
    }

    const newStatus = statusOrder[nextIndex];
    const token = localStorage.getItem('token');

    try {
        await window.TaskoraAPI.updateTaskStatus(token, taskId, newStatus);
        loadKanbanData(); // Reload
    } catch (error) {
        alert('Error moving task: ' + error.message);
    }
}
// ===== AI ASSISTANT =====
const aiSuggestBtn = document.getElementById('aiSuggestBtn');
if (aiSuggestBtn) {
    aiSuggestBtn.addEventListener('click', async function() {
        const description = document.getElementById('taskDescription').value;
        const resultDiv = document.getElementById('aiSuggestionResult');
        
        if (!description || description.length < 5) {
            alert('Please write at least 5 characters describing your task');
            return;
        }

        resultDiv.style.display = 'block';
        resultDiv.innerHTML = '<div class="ai-loading">🤖 AI is thinking...</div>';

        try {
            const suggestion = await window.TaskoraAI.getAISuggestion(description);
            
            resultDiv.innerHTML = `
                <div class="ai-result">
                    <div class="ai-field">
                        <strong>📝 Title:</strong> 
                        <input type="text" id="aiTitle" value="${suggestion.title}" style="width: 100%; padding: 6px 10px; border: 1px solid var(--gray-200); border-radius: 4px; margin-top: 4px;">
                    </div>
                    <div class="ai-field" style="margin-top: 8px;">
                        <strong>⚡ Priority:</strong> 
                        <select id="aiPriority" style="padding: 6px 10px; border: 1px solid var(--gray-200); border-radius: 4px; margin-top: 4px;">
                            <option value="Low" ${suggestion.priority === 'Low' ? 'selected' : ''}>Low</option>
                            <option value="Medium" ${suggestion.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                            <option value="High" ${suggestion.priority === 'High' ? 'selected' : ''}>High</option>
                            <option value="Urgent" ${suggestion.priority === 'Urgent' ? 'selected' : ''}>Urgent</option>
                        </select>
                    </div>
                    <div class="ai-field" style="margin-top: 8px;">
                        <strong>📅 Estimated Days:</strong> 
                        <input type="number" id="aiDays" value="${suggestion.estimatedDays || 3}" style="width: 80px; padding: 6px 10px; border: 1px solid var(--gray-200); border-radius: 4px; margin-top: 4px;">
                    </div>
                    <div class="ai-field" style="margin-top: 8px;">
                        <strong>📋 Subtasks:</strong>
                        <ul style="margin-top: 4px; padding-left: 20px;">
                            ${suggestion.subtasks.map(s => `<li>${s}</li>`).join('')}
                        </ul>
                    </div>
                    <div class="ai-field" style="margin-top: 8px;">
                        <strong>💡 Summary:</strong>
                        <p style="margin-top: 4px; color: var(--gray-600); font-size: 14px;">${suggestion.summary}</p>
                    </div>
                    <button type="button" id="applyAISuggestion" class="btn-primary" style="margin-top: 12px; width: auto; padding: 6px 20px; font-size: 13px;">
                        ✅ Apply Suggestion
                    </button>
                    <button type="button" id="dismissAISuggestion" class="btn-secondary" style="margin-top: 12px; width: auto; padding: 6px 20px; font-size: 13px;">
                        ❌ Dismiss
                    </button>
                </div>
            `;

            // Apply suggestion
            document.getElementById('applyAISuggestion')?.addEventListener('click', function() {
                const title = document.getElementById('aiTitle').value;
                const priority = document.getElementById('aiPriority').value;
                const days = parseInt(document.getElementById('aiDays').value) || 3;
                
                document.getElementById('taskTitle').value = title;
                document.getElementById('taskPriority').value = priority;
                
                const date = new Date();
                date.setDate(date.getDate() + days);
                document.getElementById('taskDeadline').value = date.toISOString().split('T')[0];
                
                resultDiv.style.display = 'none';
                resultDiv.innerHTML = '';
            });

            // Dismiss suggestion
            document.getElementById('dismissAISuggestion')?.addEventListener('click', function() {
                resultDiv.style.display = 'none';
                resultDiv.innerHTML = '';
            });

        } catch (error) {
            resultDiv.innerHTML = `
                <div style="color: var(--danger);">
                    ❌ Error: ${error.message}
                </div>
            `;
        }
    });
}