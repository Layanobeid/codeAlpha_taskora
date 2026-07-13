// frontend/js/dashboard.js
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Update user info
    if (user.name) {
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`;
    }

    loadDashboardData();

    // ===== LOGOUT =====
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
        });
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

    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    // ===== NOTIFICATIONS =====
    loadNotifications();

    const notifBtn = document.getElementById('notificationBtn');
    const notifDropdown = document.getElementById('notificationDropdown');
    
    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            notifDropdown.classList.toggle('show');
            if (notifDropdown.classList.contains('show')) {
                loadNotifications();
            }
        });

        document.addEventListener('click', function(e) {
            if (!notifBtn.contains(e.target) && !notifDropdown.contains(e.target)) {
                notifDropdown.classList.remove('show');
            }
        });
    }

    const markAllBtn = document.getElementById('markAllRead');
    if (markAllBtn) {
        markAllBtn.addEventListener('click', async function() {
            const token = localStorage.getItem('token');
            try {
                await fetch('https://codealpha-taskora.onrender.com/api/notifications/read-all', {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                loadNotifications();
            } catch (error) {
                console.error('Error marking all as read:', error);
            }
        });
    }

    // Refresh notifications every 30 seconds
    setInterval(loadNotifications, 30000);
});

// ===== LOAD DASHBOARD DATA =====
async function loadDashboardData() {
    const token = localStorage.getItem('token');
    
    try {
        // Get projects
        const projectsData = await window.TaskoraAPI.getProjects(token);
        const projects = projectsData.data || [];

        // Get tasks - USE DIFFERENT VARIABLE NAME
        const tasksData = await window.TaskoraAPI.getTasks(token);
        const tasks = tasksData.data || [];  // ← هنا كان الخطأ

        // Update stats
        const totalProjects = projects.length;
        const completedTasks = tasks.filter(t => t.status === 'Done').length;
        const pendingTasks = tasks.filter(t => t.status !== 'Done').length;
        
        // Count unique members
        const members = new Set();
        projects.forEach(p => {
            p.members?.forEach(m => members.add(m.user?._id || m.user));
        });
        const totalMembers = members.size;

        document.getElementById('totalProjects').textContent = totalProjects;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('totalMembers').textContent = totalMembers || 0;

        // Show recent projects (last 3)
        const recentProjects = projects.slice(0, 3);
        const projectsContainer = document.getElementById('recentProjects');
        if (recentProjects.length === 0) {
            projectsContainer.innerHTML = `
                <div class="empty-state">
                    <p>No projects yet. <a href="projects.html">Create your first project</a></p>
                </div>
            `;
        } else {
            projectsContainer.innerHTML = recentProjects.map(p => `
                <div class="project-card">
                    <h3>${p.title}</h3>
                    <p>${p.description || 'No description'}</p>
                    <div class="project-meta">
                        <span class="project-status ${p.status?.toLowerCase()}">${p.status || 'Active'}</span>
                        <span>${p.members?.length || 1} members</span>
                    </div>
                </div>
            `).join('');
        }

        // Show recent tasks (last 5)
        const recentTasks = tasks.slice(0, 5);
        const tasksContainer = document.getElementById('recentTasks');
        if (recentTasks.length === 0) {
            tasksContainer.innerHTML = `
                <div class="empty-state">
                    <p>No tasks yet. <a href="kanban.html">Create your first task</a></p>
                </div>
            `;
        } else {
            tasksContainer.innerHTML = recentTasks.map(t => `
                <div class="task-item">
                    <div class="task-info">
                        <h4>${t.title}</h4>
                        <p>${t.description || 'No description'}</p>
                    </div>
                    <div class="task-meta">
                        <span class="task-priority ${t.priority?.toLowerCase()}">${t.priority || 'Medium'}</span>
                        <span style="font-size: 13px; color: var(--gray-500);">${t.status || 'To Do'}</span>
                    </div>
                </div>
            `).join('');
        }

    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

// ===== NOTIFICATIONS =====
let notificationInterval = null;

async function loadNotifications() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('https://codealpha-taskora.onrender.com/api/notifications', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();
        
        if (result.success) {
            const notifications = result.data || [];
            const unreadCount = result.unreadCount || 0;

            const badge = document.getElementById('notificationBadge');
            if (badge) {
                badge.textContent = unreadCount;
                badge.style.display = unreadCount > 0 ? 'block' : 'none';
            }

            const list = document.getElementById('notificationList');
            if (list) {
                if (notifications.length === 0) {
                    list.innerHTML = `<p style="text-align: center; color: var(--gray-400); padding: 20px;">✨ No notifications yet</p>`;
                    return;
                }

                list.innerHTML = notifications.map(n => `
                    <div class="notification-item ${n.isRead ? '' : 'unread'}" data-id="${n._id}">
                        <div class="notif-icon">
                            <i class="fas ${getNotificationIcon(n.type)}"></i>
                        </div>
                        <div class="notif-content">
                            <p>${n.message}</p>
                            <span class="notif-time">${timeAgo(n.createdAt)}</span>
                        </div>
                    </div>
                `).join('');

                list.querySelectorAll('.notification-item').forEach(item => {
                    item.addEventListener('click', async function() {
                        const id = this.dataset.id;
                        try {
                            await fetch(`https://codealpha-taskora.onrender.com/api/notifications/${id}/read`, {
                                method: 'PUT',
                                headers: {
                                    'Authorization': `Bearer ${token}`
                                }
                            });
                            this.classList.remove('unread');
                            loadNotifications();
                        } catch (error) {
                            console.error('Error marking notification as read:', error);
                        }
                    });
                });
            }
        }
    } catch (error) {
        console.error('Error loading notifications:', error);
    }
}

function getNotificationIcon(type) {
    const icons = {
        'task_assigned': 'fa-user-plus',
        'status_changed': 'fa-exchange-alt',
        'comment_added': 'fa-comment',
        'deadline_reminder': 'fa-clock'
    };
    return icons[type] || 'fa-bell';
}

function timeAgo(date) {
    const diff = Math.floor((new Date() - new Date(date)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    if (diff < 604800) return Math.floor(diff / 86400) + 'd ago';
    return new Date(date).toLocaleDateString();
}
