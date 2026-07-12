// backend/src/services/openaiService.js

/**
 * Suggest task details based on description (Mock Version - No API Key Needed)
 */
async function suggestTask(description) {
  console.log('🤖 AI Assistant processing:', description);
  
  // استخرج كلمات من الوصف
  const words = description.split(' ');
  const titleWords = words.slice(0, 5);
  const title = titleWords.join(' ') + (words.length > 5 ? '...' : '');
  
  // تحديد الأولوية بناءً على الكلمات المفتاحية
  let priority = 'Medium';
  const lowerDesc = description.toLowerCase();
  
  if (lowerDesc.includes('urgent') || lowerDesc.includes('critical') || 
      lowerDesc.includes('emergency') || lowerDesc.includes('immediate') ||
      lowerDesc.includes('important')) {
    priority = 'High';
  }
  
  if (lowerDesc.includes('bug') || lowerDesc.includes('error') || 
      lowerDesc.includes('issue') || lowerDesc.includes('problem')) {
    priority = 'Urgent';
  }
  
  if (lowerDesc.includes('simple') || lowerDesc.includes('easy') || 
      lowerDesc.includes('quick') || lowerDesc.includes('minor')) {
    priority = 'Low';
  }
  
  // تقدير الأيام
  let days = 3;
  if (priority === 'Urgent') days = 1;
  else if (priority === 'High') days = 2;
  else if (priority === 'Low') days = 5;
  
  // Subtasks حسب نوع المهمة
  let subtasks = [
    '📋 Gather requirements and analyze the task',
    '📝 Plan the implementation approach',
    '💻 Develop and test the solution',
    '✅ Review and finalize delivery'
  ];
  
  if (lowerDesc.includes('design')) {
    subtasks = [
      '🎨 Research design patterns and best practices',
      '📐 Create wireframes and mockups',
      '👥 Review design with stakeholders',
      '✨ Finalize and implement design'
    ];
  } else if (lowerDesc.includes('api') || lowerDesc.includes('backend')) {
    subtasks = [
      '🔧 Define API endpoints and data models',
      '⚙️ Implement API logic and validation',
      '🧪 Write API tests',
      '📚 Document API usage'
    ];
  } else if (lowerDesc.includes('frontend') || lowerDesc.includes('ui') || lowerDesc.includes('page')) {
    subtasks = [
      '🖌️ Create UI components and layout',
      '🎯 Implement user interactions and logic',
      '📱 Ensure responsive design',
      '🧪 Test across different browsers'
    ];
  } else if (lowerDesc.includes('database') || lowerDesc.includes('data')) {
    subtasks = [
      '🗄️ Design database schema and models',
      '📊 Create indexes and optimize queries',
      '🔗 Implement data access layer',
      '🔄 Test data integrity and performance'
    ];
  }
  
  return {
    title: title || 'New Task',
    priority: priority,
    estimatedDays: days,
    subtasks: subtasks,
    summary: `📌 This task involves ${description.slice(0, 60)}... Priority: ${priority}, Estimated: ${days} days.`
  };
}

module.exports = { suggestTask };