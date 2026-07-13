// frontend/js/projects.js

// ===== MEMBERS MANAGEMENT =====
let projectMembers = [];

function renderMembersList() {
    const container = document.getElementById('membersList');
    if (!container) {
        console.log('membersList not found');
        return;
    }
    
    console.log('Rendering members:', projectMembers); // للتأكد
    
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

// ===== MAIN =====
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

    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        const toggle = document.getElementById('themeToggle');
        if (toggle) {
            toggle.innerHTML = '<i class="fas fa-sun"></i>';
        }
    }

    // ===== LOAD PROJECTS =====
    loadProjects();

    // ===== CREATE PROJECT MODAL =====
    const modal = document.getElementById('projectModal');
    const createBtn = document.getElementById('createProjectBtn');
    const closeBtn = document.querySelector('.close');

    if (createBtn) {
        createBtn.addEventListener('click', function() {
            projectMembers = [];
            renderMembersList();
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
            if (e.target === modal) {
                modal.classList.remove('show');
            }
        });
    }

    // ===== ADD MEMBER (Event Delegation) =====
    document.addEventListener('click', function(e) {
        // Check if the clicked element is the add button or inside it
        const addBtn = e.target.closest('.btn-add-member');
        if (addBtn) {
            console.log('Add member button clicked!');
            const input = addBtn.closest('.member-input-group').querySelector('.member-email');
            if (!input) {
                console.log('Input not found');
                return;
            }
            
            const email = input.value.trim();
            console.log('Email:', email);
            
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
            console.log('Members after add:', projectMembers);
            renderMembersList();
            input.value = '';
        }
    });

    // ===== REMOVE MEMBER =====
    document.addEventListener('click', function(e) {
        const removeBtn = e.target.closest('.remove-member');
        if (removeBtn) {
            const email = removeBtn.dataset.email;
            projectMembers = projectMembers.filter(m => m !== email);
            console.log('Members after remove:', projectMembers);
            renderMembersList();
        }
    });

    // ===== CREATE PROJECT FORM =====
    const form = document.getElementById('createProjectForm');
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const title = document.getElementById('projectTitle').value;
            const description = document.getElementById('projectDescription').value;
            const startDate = document.getElementById('projectStartDate').value;
            const endDate = document.getElementById('projectEndDate').value;
            const members = projectMembers;

            console.log('Creating project with members:', members);

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
                    members: members
                });

                if (response.success) {
                    alert('✅ Project created successfully!');
                    if (modal) modal.classList.remove('show');
                    form.reset();
                    projectMembers = [];
                    renderMembersList();
                    loadProjects();
                }
            } catch (error) {
                alert('❌ Error creating project: ' + error.message);
            }
        });
    }

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
});

// ===== LOAD PROJECTS =====
async function loadProjects() {
    const token = localStorage.getItem('token');
    const container = document.getElementById('projectsContainer');

    if (!container) return;

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

// ===== VIEW PROJECT =====
async function viewProject(projectId) {
    window.location.href = `kanban.html?project=${projectId}`;
}

// ===== DELETE PROJECT =====
async function deleteProject(projectId) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    const token = localStorage.getItem('token');
    try {
        await window.TaskoraAPI.deleteProject(token, projectId);
        loadProjects();
    } catch (error) {
        alert('Error deleting project: ' + error.message);
    }
}
