// frontend/js/ai.js

async function getAISuggestion(description) {
    const token = localStorage.getItem('token');
    
    try {
        const response = await fetch('http://localhost:5001/api/ai/suggest-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ description })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Failed to get suggestion');
        }

        return data.data;
    } catch (error) {
        console.error('AI Suggestion Error:', error);
        throw error;
    }
}

window.TaskoraAI = {
    getAISuggestion
};