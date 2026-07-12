// frontend/js/api.js
const API_BASE = 'http://localhost:5001/api';

// Helper function for API calls
async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const options = {
        method,
        headers,
        body: body ? JSON.stringify(body) : null,
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, options);
        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Something went wrong');
        }

        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Auth Functions
async function register(name, email, password) {
    return apiRequest('/auth/register', 'POST', { name, email, password });
}

async function login(email, password) {
    return apiRequest('/auth/login', 'POST', { email, password });
}

async function getMe(token) {
    return apiRequest('/auth/me', 'GET', null, token);
}

// Project Functions
async function getProjects(token) {
    return apiRequest('/projects', 'GET', null, token);
}

async function createProject(token, projectData) {
    return apiRequest('/projects', 'POST', projectData, token);
}

async function getProjectById(token, projectId) {
    return apiRequest(`/projects/${projectId}`, 'GET', null, token);
}

async function updateProject(token, projectId, projectData) {
    return apiRequest(`/projects/${projectId}`, 'PUT', projectData, token);
}

async function deleteProject(token, projectId) {
    return apiRequest(`/projects/${projectId}`, 'DELETE', null, token);
}

async function addProjectMember(token, projectId, email, role = 'Member') {
    return apiRequest(`/projects/${projectId}/members`, 'POST', { email, role }, token);
}

// Task Functions
async function getTasks(token, filters = {}) {
    const query = new URLSearchParams(filters).toString();
    return apiRequest(`/tasks?${query}`, 'GET', null, token);
}

async function createTask(token, taskData) {
    return apiRequest('/tasks', 'POST', taskData, token);
}

async function getTaskById(token, taskId) {
    return apiRequest(`/tasks/${taskId}`, 'GET', null, token);
}

async function updateTask(token, taskId, taskData) {
    return apiRequest(`/tasks/${taskId}`, 'PUT', taskData, token);
}

async function deleteTask(token, taskId) {
    return apiRequest(`/tasks/${taskId}`, 'DELETE', null, token);
}

async function updateTaskStatus(token, taskId, status) {
    return apiRequest(`/tasks/${taskId}/status`, 'PUT', { status }, token);
}

async function assignTask(token, taskId, userIds) {
    return apiRequest(`/tasks/${taskId}/assign`, 'PUT', { userIds }, token);
}

async function getTaskComments(token, taskId) {
    return apiRequest(`/tasks/${taskId}/comments`, 'GET', null, token);
}

async function addTaskComment(token, taskId, content) {
    return apiRequest(`/tasks/${taskId}/comments`, 'POST', { content }, token);
}

// Export functions for use in other files
window.TaskoraAPI = {
    register,
    login,
    getMe,
    getProjects,
    createProject,
    getProjectById,
    updateProject,
    deleteProject,
    addProjectMember,
    getTasks,
    createTask,
    getTaskById,
    updateTask,
    deleteTask,
    updateTaskStatus,
    assignTask,
    getTaskComments,
    addTaskComment
};