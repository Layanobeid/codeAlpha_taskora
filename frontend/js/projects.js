// frontend/js/projects.js
document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    // Update user info
    if (user.name) {
        document.getElementById('userName').textContent = user.name;
        document.getElementById('userAvatar').src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=4f46e5&color=fff`;
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

    loadProjects();

    // Create Project Modal
    const modal = document.getElementById('projectModal');
    const createBtn = document.getElementById('createProjectBtn');
    const closeBtn = document.querySelector('.close');

    createBtn?.addEventListener('click', () => modal.classList.add('show'));
    closeBtn?.addEventListener('click', () => modal.classList.remove('show'));
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
    });

    // Create Project Form
    const form = document.getElementById('createProjectForm');
    form?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('projectTitle').value;
        const description = document.getElementById('projectDescription').value;
        const startDate = document.getElementById('projectStartDate').value;
        const endDate = document.getElementById('projectEndDate').value;

        try {
            const response = await window.TaskoraAPI.createProject(token, {
                title,
                description,
                startDate,
                endDate
            });

            if (response.success) {
                modal.classList.remove('show');
                form.reset();
                loadProjects();
            }
        } catch (error) {
            alert('Error creating project: ' + error.message);
        }
    });
});

// frontend/js/projects.js

// ===== MEMBERS MANAGEMENT =====
let projectMembers = [];

// Add member button
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('btn-add-member')) {
        const input = e.target.closest('.member-input-group').querySelector('.member-email');
        const email = input.value.trim();
        
        if (!email) {
            alert('Please enter an email address');
            return;
        }
        
        if (!email.includes('@')) {
            alert('Please enter a valid email address');
            return;
        }
        
        if (projectMembers.includes(email)) {
            alert('This member is already added');
            return;
        }
        
        projectMembers.push(email);
        renderMembersList();
        input.value = '';
    }
});

// Remove member
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('remove-member')) {
        const email = e.target.dataset.email;
        projectMembers = projectMembers.filter(m => m !== email);
        renderMembersList();
    }
});

function renderMembersList() {
    const container = document.getElementById('membersList');
    if (!container) return;
    
    if (projectMembers.length === 0) {
        container.innerHTML = '';
        return;
    }
    
    container.innerHTML = projectMembers.map(email => `
        <span class="member-tag">
            ${email}
            <span class="remove-member" data-email="${email}">×</span>
        </span>
    `).join('');
}

// ===== CREATE PROJECT =====
// عدل دالة create project
const form = document.getElementById('createProjectForm');
form?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const title = document.getElementById('projectTitle').value;
    const description = document.getElementById('projectDescription').value;
    const startDate = document.getElementById('projectStartDate').value;
    const endDate = document.getElementById('projectEndDate').value;
    const members = projectMembers; // ← get members

    if (!title) {
        alert('Please enter a project title');
        return;
    }

    try {
        const response = await window.TaskoraAPI.createProject(token, {
            title,
            description,
            startDate,
            endDate,
            members: members  // ← send members to backend
        });

        if (response.success) {
            alert('✅ Project created successfully!');
            modal.classList.remove('show');
            form.reset();
            projectMembers = []; // Clear members
            renderMembersList();
            loadProjects();
        }
    } catch (error) {
        alert('❌ Error creating project: ' + error.message);
    }
});

    // Create Project Modal
    const modal = document.getElementById('projectModal');
    const createBtn = document.getElementById('createProjectBtn');
    const closeBtn = document.querySelector('.close');

    createBtn?.addEventListener('click', () => modal.classList.add('show'));
    closeBtn?.addEventListener('click', () => modal.classList.remove('show'));
    modal?.addEventListener('click', (e) => {
        if (e.target === modal) modal.classList.remove('show');
    });

    // Create Project Form
    const form = document.getElementById('createProjectForm');
    form?.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const title = document.getElementById('projectTitle').value;
        const description = document.getElementById('projectDescription').value;
        const startDate = document.getElementById('projectStartDate').value;
        const endDate = document.getElementById('projectEndDate').value;

        try {
            const response = await window.TaskoraAPI.createProject(token, {
                title,
                description,
                startDate,
                endDate
            });

            if (response.success) {
                modal.classList.remove('show');
                form.reset();
                loadProjects(); // Reload projects
            }
        } catch (error) {
            alert('Error creating project: ' + error.message);
        }
    });


// frontend/js/projects.js
async function loadProjects() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('projectsContainer');

    try {
        const response = await window.TaskoraAPI.getProjects(token);
        const projects = response.data || [];

        if (projects.length === 0) {
            container.innerHTML = `
                <div class="empty-state" style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
                    <i class="fas fa-folder-open" style="font-size: 48px; color: var(--gray-300); margin-bottom: 16px;"></i>
                    <h3 style="color: var(--gray-600);">No projects yet</h3>
                    <p style="color: var(--gray-400);">Click "New Project" to create your first project</p>
                </div>
            `;
            return;
        }

        container.innerHTML = projects.map(p => {
            // Get member names
            const memberNames = p.members?.map(m => {
                if (m.user && m.user.name) return m.user.name;
                return 'Unknown';
            }) || [];
            
            const memberList = memberNames.length > 0 
                ? memberNames.join(', ') 
                : 'No members';

            return `
                <div class="project-card">
                    <h3>${p.title}</h3>
                    <p>${p.description || 'No description'}</p>
                    <div class="project-meta">
                        <span class="project-status ${p.status?.toLowerCase()}">${p.status || 'Active'}</span>
                        <span>👥 ${p.members?.length || 1} members</span>
                        <span style="font-size: 12px;">${new Date(p.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div style="margin-top: 8px; font-size: 13px; color: var(--gray-500);">
                        <strong>Team:</strong> ${memberList}
                    </div>
                    <div style="margin-top: 12px; display: flex; gap: 8px;">
                        <button onclick="viewProject('${p._id}')" class="btn-secondary" style="padding: 4px 12px; font-size: 12px;">View</button>
                        <button onclick="deleteProject('${p._id}')" class="btn-secondary" style="padding: 4px 12px; font-size: 12px; color: #ef4444;">Delete</button>
                    </div>
                </div>
            `;
        }).join('');

    } catch (error) {
        console.error('Error loading projects:', error);
        container.innerHTML = `<p style="color: red;">Error loading projects: ${error.message}</p>`;
    }
}

async function viewProject(projectId) {
    window.location.href = `kanban.html?project=${projectId}`;
}

async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    const token = localStorage.getItem('token');
    try {
        await window.TaskoraAPI.deleteProject(token, projectId);
        loadProjects(); // Reload
    } catch (error) {
        alert('Error deleting project: ' + error.message);
    }
}
