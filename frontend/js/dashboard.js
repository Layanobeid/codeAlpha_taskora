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
});
 // ===== LOGOUT =====
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Logging out...');
            
            // Clear local storage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // Redirect to login page
            window.location.href = 'index.html';
        });
    }

// frontend/js/dashboard.js
async function loadDashboardData() {
    const token = localStorage.getItem('token');
    
    try {
        // Get projects
        const projectsData = await window.TaskoraAPI.getProjects(token);
        const projects = projectsData.data || [];

        // Get tasks
        const tasksData = await window.TaskoraAPI.getTasks(token);
        const tasks = tasksData.data || [];

        // Update stats
        const totalProjects = projects.length;
        const completedTasks = tasks.filter(t => t.status === 'Done').length;
        const pendingTasks = tasks.filter(t => t.status !== 'Done').length;
        
        // Count unique members (MORE ACCURATE)
        const members = new Set();
        projects.forEach(p => {
            if (p.members && Array.isArray(p.members)) {
                p.members.forEach(m => {
                    // Check if m.user is populated (has _id)
                    if (m.user && m.user._id) {
                        members.add(m.user._id.toString());
                    } else if (m.user && typeof m.user === 'string') {
                        members.add(m.user);
                    }
                });
            }
            // Add owner as member
            if (p.owner && p.owner._id) {
                members.add(p.owner._id.toString());
            } else if (p.owner && typeof p.owner === 'string') {
                members.add(p.owner);
            }
        });
        
        const totalMembers = members.size;

        document.getElementById('totalProjects').textContent = totalProjects;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('totalMembers').textContent = totalMembers || 0;

        // Show recent projects (last 3) with members
        const recentProjects = projects.slice(0, 3);
        const projectsContainer = document.getElementById('recentProjects');
        if (recentProjects.length === 0) {
            projectsContainer.innerHTML = `
                <div class="empty-state">
                    <p>No projects yet. <a href="projects.html">Create your first project</a></p>
                </div>
            `;
        } else {
            projectsContainer.innerHTML = recentProjects.map(p => {
                const memberCount = p.members?.length || 1;
                return `
                    <div class="project-card">
                        <h3>${p.title}</h3>
                        <p>${p.description || 'No description'}</p>
                        <div class="project-meta">
                            <span class="project-status ${p.status?.toLowerCase()}">${p.status || 'Active'}</span>
                            <span>👥 ${memberCount} members</span>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // ... باقي الكود
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

async function showMembers(projectId) {
    const token = localStorage.getItem('token');
    try {
        const response = await window.TaskoraAPI.getProjectById(token, projectId);
        const project = response.data;
        
        if (!project.members || project.members.length === 0) {
            alert('No members in this project');
            return;
        }
        
        const memberList = project.members.map(m => {
            const name = m.user?.name || 'Unknown';
            const role = m.role || 'Member';
            return `- ${name} (${role})`;
        }).join('\n');
        
        alert(`👥 Members of "${project.title}":\n\n${memberList}`);
    } catch (error) {
        alert('Error loading members: ' + error.message);
    }
}