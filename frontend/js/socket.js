// frontend/js/socket.js
let socket = null;

function connectSocket(token) {
    if (socket) return socket;
    
    const SOCKET_URL = 'https://codealpha-taskora.onrender.com';
    // أو localhost للتطوير: 'http://localhost:5001'
    
    socket = io(SOCKET_URL, {
        auth: { token }
    });

    socket.on('connect', () => {
        console.log('🔌 Connected to WebSocket');
    });

    socket.on('task-created', (data) => {
        console.log('📋 New task created:', data);
        if (typeof loadKanbanData === 'function') {
            loadKanbanData();
        }
    });

    socket.on('task-updated', (data) => {
        console.log('📋 Task updated:', data);
        if (typeof loadKanbanData === 'function') {
            loadKanbanData();
        }
    });

    socket.on('task-status-changed', (data) => {
        console.log('📋 Task status changed:', data);
        if (typeof loadKanbanData === 'function') {
            loadKanbanData();
        }
    });

    socket.on('comment-added', (data) => {
        console.log('💬 New comment:', data);
        if (typeof loadTaskComments === 'function') {
            loadTaskComments(data.taskId);
        }
    });

    socket.on('disconnect', () => {
        console.log('🔌 Disconnected from WebSocket');
    });

    return socket;
}

function joinProject(projectId) {
    if (socket) {
        socket.emit('join-project', projectId);
    }
}

function leaveProject(projectId) {
    if (socket) {
        socket.emit('leave-project', projectId);
    }
}

function emitTaskCreated(data) {
    if (socket) {
        socket.emit('task-created', data);
    }
}

function emitTaskUpdated(data) {
    if (socket) {
        socket.emit('task-updated', data);
    }
}

function emitTaskStatusChanged(data) {
    if (socket) {
        socket.emit('task-status-changed', data);
    }
}

function emitCommentAdded(data) {
    if (socket) {
        socket.emit('comment-added', data);
    }
}

function emitMemberAdded(data) {
    if (socket) {
        socket.emit('member-added', data);
    }
}

// Export
window.TaskoraSocket = {
    connectSocket,
    joinProject,
    leaveProject,
    emitTaskCreated,
    emitTaskUpdated,
    emitTaskStatusChanged,
    emitCommentAdded,
    emitMemberAdded
};
